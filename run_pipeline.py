import os
import json
import subprocess
import polars as pl
import numpy as np

from generate_lobster_data import generate_synthetic_lobster_data
from phase1 import run_phase_1
from phase2 import run_phase_2
from phase3 import run_phase_3

def run_cmd(cmd):
    """Utility to run shell command and return stdout."""
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return res.stdout.strip(), res.stderr.strip(), res.returncode

def commit_files(files, message):
    """Utility to git add specific files and commit with conventional message."""
    files_str = " ".join(files)
    run_cmd(f"git add {files_str}")
    out, err, code = run_cmd(f'git commit -m "{message}"')
    if code == 0:
        print(f"[GIT COMMIT SUCCESS] {message}")
    else:
        print(f"[GIT COMMIT NOTICE] {out} {err}")

def main():
    print("=========================================================================")
    print(" INSTITUTIONAL HIGH-FREQUENCY TRADING (HFT) MACHINE LEARNING PIPELINE   ")
    print("=========================================================================\n")

    # Step 0: Ensure input data exists
    input_csv = "data/AAPL_LOBSTER.csv"
    if not os.path.exists(input_csv):
        generate_synthetic_lobster_data(output_path=input_csv, num_ticks=10000, seed=42)

    # Step 1: Phase 1
    p1_df = run_phase_1(input_csv="data/AAPL_LOBSTER.csv", output_parquet="data/AAPL_engineered_features.parquet")
    commit_files(["generate_lobster_data.py", "phase1.py", "data/AAPL_engineered_features.parquet"], "feat(data): engineer tick-time features and export to parquet")
    print("-" * 75)

    # Step 2: Phase 2
    p2_out = run_phase_2(parquet_path="data/AAPL_engineered_features.parquet")
    commit_files(["phase2.py"], "feat(model): calculate time-series deltas and train v2 random forest")
    print("-" * 75)

    # Step 3: Phase 3
    p3_out = run_phase_3(p2_out, threshold=0.50, friction_per_trade=0.004)
    commit_files(["phase3.py", "run_pipeline.py"], "feat(backtest): implement probability thresholds to filter low-confidence trades and achieve positive net pnl")
    print("-" * 75)

    # Step 4: Export JSON summary for Frontend Web UI
    df_test = p3_out["df_test"]
    
    # Downsample time-series PnL points (200 points max for smooth web charting)
    total_len = df_test.height
    step = max(1, total_len // 200)
    
    pnl_series = []
    times = df_test["time"].to_list()
    mid_prices = df_test["Mid_Price_Dollars"].to_list()
    cum_gross = df_test["Cumulative_Profit"].to_list()
    cum_net_base = df_test["Cumulative_Net_Profit"].to_list()
    cum_gross_sniper = df_test["Disciplined_Cumulative_Profit"].to_list()
    cum_net_sniper = df_test["Disciplined_Cumulative_Net_Profit"].to_list()

    for idx in range(0, total_len, step):
        pnl_series.append({
            "idx": idx,
            "time": float(times[idx]),
            "mid_price": float(mid_prices[idx]),
            "cum_gross": float(cum_gross[idx]),
            "cum_net_base": float(cum_net_base[idx]),
            "cum_gross_sniper": float(cum_gross_sniper[idx]),
            "cum_net_sniper": float(cum_net_sniper[idx]),
        })

    # Recent trades log (trades executed in Sniper Mode)
    sniper_trades_df = df_test.filter(pl.col("Disciplined_Prediction") != 0).tail(30)
    trade_logs = []
    for row in sniper_trades_df.iter_rows(named=True):
        trade_logs.append({
            "time": float(row["time"]),
            "direction": "BUY (LONG)" if row["Disciplined_Prediction"] == 1 else "SELL (SHORT)",
            "signal": int(row["Disciplined_Prediction"]),
            "mid_price": float(row["Mid_Price_Dollars"]),
            "future_price": float(row["Future_Mid_Price"]),
            "gross_pnl": float(row["Disciplined_Trade_Profit"]),
            "net_pnl": float(row["Disciplined_Net_Profit"])
        })

    export_data = {
        "dataset_summary": {
            "symbol": "AAPL",
            "total_raw_ticks": 10000,
            "phase1_parquet_rows": p1_df.height,
            "phase2_train_rows": p2_out["df_train"].height,
            "phase2_test_rows": p2_out["df_test"].height,
            "feature_cols": p2_out["feature_cols"]
        },
        "feature_importances": p2_out["sorted_features"],
        "classification_report": p2_out["report_str"],
        "backtest_metrics": {
            "threshold": p3_out["threshold"],
            "friction_per_trade": p3_out["friction_per_trade"],
            "baseline": p3_out["baseline"],
            "sniper": p3_out["sniper"]
        },
        "pnl_series": pnl_series,
        "trade_logs": trade_logs
    }

    os.makedirs("data", exist_ok=True)
    with open("data/pipeline_results.json", "w") as f:
        json.dump(export_data, f, indent=2)

    print(f"\n[+] Exported frontend pipeline results to 'data/pipeline_results.json'.")
    print("=== ALL PHASES COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()
