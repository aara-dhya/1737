import os
import json
from datetime import datetime
from backend.app.celery_app import celery_app
from backend.app.database import SessionLocal
from backend.app.models import BacktestJob
from generate_lobster_data import generate_synthetic_lobster_data
from phase1 import run_phase_1
from phase2 import run_phase_2
from phase3 import run_phase_3

@celery_app.task(bind=True)
def run_pipeline_task(self, job_id: str, symbol: str = "AAPL", dataset_name: str = "AAPL_LOBSTER.csv", confidence_threshold: float = 0.50, taker_friction: float = 0.004):
    """
    Celery Task: Executes Phase 1, Phase 2, and Phase 3 HFT ML Pipeline asynchronously.
    Updates PostgreSQL job status and saves pipeline_results.json.
    """
    db = SessionLocal()
    job = db.query(BacktestJob).filter(BacktestJob.id == job_id).first()
    
    if job:
        job.status = "RUNNING"
        db.commit()

    log_lines = []
    log_lines.append(f"=== [CELERY TASK {self.request.id}] Executing HFT ML Pipeline ===")
    log_lines.append(f"[+] Job ID: {job_id} | Symbol: {symbol} | Threshold: {confidence_threshold}")

    try:
        input_csv = os.path.join("data", dataset_name)
        if not os.path.exists(input_csv):
            log_lines.append(f"[+] Generating LOBSTER dataset at '{input_csv}'...")
            generate_synthetic_lobster_data(output_path=input_csv, num_ticks=10000, seed=42)

        # Phase 1
        log_lines.append("[+] Executing Phase 1: Vectorized LOBSTER price scaling & feature engineering...")
        p1_df = run_phase_1(input_csv=input_csv, output_parquet="data/AAPL_engineered_features.parquet")
        log_lines.append(f"[+] Phase 1 Complete: {p1_df.height} parquet rows exported.")

        # Phase 2
        log_lines.append("[+] Executing Phase 2: 10-tick deltas & strict chronological Random Forest training...")
        p2_out = run_phase_2(parquet_path="data/AAPL_engineered_features.parquet")
        log_lines.append("[+] Phase 2 Complete: Model trained on 80% morning set, evaluated on 20% afternoon set.")

        # Phase 3
        log_lines.append(f"[+] Executing Phase 3: Vectorized backtesting & Sniper Mode threshold ({confidence_threshold})...")
        p3_out = run_phase_3(p2_out, threshold=confidence_threshold, friction_per_trade=taker_friction)
        log_lines.append(f"[+] Phase 3 Complete: Sniper Net Profit = +${p3_out['sniper']['net_profit']:.2f}")

        # Update database job record
        if job:
            job.status = "COMPLETED"
            job.baseline_gross_pnl = float(p3_out["baseline"]["gross_profit"])
            job.baseline_net_pnl = float(p3_out["baseline"]["net_profit"])
            job.sniper_net_pnl = float(p3_out["sniper"]["net_profit"])
            job.total_trades = p3_out["sniper"]["total_trades"]
            job.result_json_path = "data/pipeline_results.json"
            job.log_output = "\n".join(log_lines)
            job.completed_at = datetime.utcnow()
            db.commit()

        return {
            "status": "COMPLETED",
            "job_id": job_id,
            "sniper_net_pnl": float(p3_out["sniper"]["net_profit"]),
            "total_trades": p3_out["sniper"]["total_trades"]
        }

    except Exception as e:
        error_msg = f"[!] Task Execution Error: {str(e)}"
        log_lines.append(error_msg)
        if job:
            job.status = "FAILED"
            job.log_output = "\n".join(log_lines)
            db.commit()
        raise e
    finally:
        db.close()
