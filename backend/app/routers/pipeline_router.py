import os
import json
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import BacktestJob
from backend.app.auth import get_current_user_or_api_key
from backend.app.tasks import run_pipeline_task
from backend.app.config import settings

router = APIRouter(prefix="/pipeline", tags=["HFT Pipeline"])

class PipelineRunRequest(BaseModel):
    symbol: str = "AAPL"
    dataset_name: str = "AAPL_LOBSTER.csv"
    confidence_threshold: float = 0.50
    taker_friction: float = 0.004

@router.post("/run")
def trigger_pipeline_run(
    req: PipelineRunRequest,
    user=Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    job_id = f"job_{uuid.uuid4().hex[:8]}"
    
    # Create DB record
    job = BacktestJob(
        id=job_id,
        status="PENDING",
        symbol=req.symbol,
        dataset_name=req.dataset_name,
        confidence_threshold=req.confidence_threshold,
        taker_friction=req.taker_friction,
        org_id=user["org_id"]
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # Submit Celery Task (or fallback execution)
    try:
        task = run_pipeline_task.delay(
            job_id=job.id,
            symbol=req.symbol,
            dataset_name=req.dataset_name,
            confidence_threshold=req.confidence_threshold,
            taker_friction=req.taker_friction
        )
        task_id = task.id
    except Exception:
        # Fallback inline synchronous execution if Redis Celery is not active locally
        task_id = "inline_sync"
        try:
            run_pipeline_task(
                job_id=job.id,
                symbol=req.symbol,
                dataset_name=req.dataset_name,
                confidence_threshold=req.confidence_threshold,
                taker_friction=req.taker_friction
            )
        except Exception as e:
            pass

    return {
        "job_id": job.id,
        "status": job.status,
        "task_id": task_id,
        "message": "HFT ML Pipeline task enqueued successfully."
    }

@router.get("/jobs")
def list_pipeline_jobs(
    user=Depends(get_current_user_or_api_key),
    db: Session = Depends(get_db)
):
    jobs = db.query(BacktestJob).order_by(BacktestJob.created_at.desc()).limit(20).all()
    return [{
        "id": j.id,
        "status": j.status,
        "symbol": j.symbol,
        "confidence_threshold": j.confidence_threshold,
        "baseline_net_pnl": j.baseline_net_pnl,
        "sniper_net_pnl": j.sniper_net_pnl,
        "total_trades": j.total_trades,
        "created_at": j.created_at
    } for j in jobs]

@router.get("/results")
def get_pipeline_results():
    results_path = os.path.join(settings.DATA_DIR, "pipeline_results.json")
    if not os.path.exists(results_path):
        raise HTTPException(status_code=404, detail="Pipeline results not found. Run pipeline first.")
    
    with open(results_path, "r") as f:
        data = json.load(f)
    return data

@router.post("/datasets/upload")
def upload_lob_dataset(
    file: UploadFile = File(...),
    user=Depends(get_current_user_or_api_key)
):
    if not file.filename.endswith((".csv", ".parquet")):
        raise HTTPException(status_code=400, detail="Only .csv or .parquet files permitted.")
    
    file_path = os.path.join(settings.DATA_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "filename": file.filename,
        "path": file_path,
        "message": "Dataset uploaded successfully and ready for feature engineering."
    }
