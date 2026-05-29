# app/main.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import Optional
import pickle
import numpy as np
import pandas as pd
import os
from app.analytics import router as analytics_router

app = FastAPI(title="Project Intelligence AI Engine")

PREDICTION_MODE = os.getenv("PREDICTION_MODE", "ML").upper()
MODEL_PATH = os.getenv("MODEL_PATH", os.path.join("app", "model.pkl"))
model = None

if os.path.exists(MODEL_PATH):
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print(f"Successfully loaded ML model binary from {MODEL_PATH}")
    except Exception as exc:
        print(f"WARNING: Unable to load model from {MODEL_PATH}: {exc}")
else:
    print("WARNING: model.pkl not found! Automatically falling back to rule-based evaluation.")


class PredictionInput(BaseModel):
    sprint_velocity: int = Field(..., ge=0)
    task_completion_rate: int = Field(..., ge=0, le=100)
    team_utilization: int = Field(..., ge=0, le=200)
    days_remaining: int = Field(..., ge=0)

class ModeConfiguration(BaseModel):
    mode: str

def evaluate_rules(data: PredictionInput):
    """Deterministic manual risk analysis based on project performance thresholds."""
    v = data.sprint_velocity
    c = data.task_completion_rate
    u = data.team_utilization

    if v >= 50 and c >= 85 and u <= 85:
        return {"delay_probability": 12, "status": "On Track"}
    elif 30 <= v < 50 or 60 <= c < 85 or 85 < u <= 95:
        return {"delay_probability": 48, "status": "Moderate Risk"}
    else:
        return {"delay_probability": 82, "status": "High Risk / Delayed"}


def predict_with_model(data: PredictionInput):
    global model
    
    if model is None:
        return evaluate_rules(data)

    input_vector = np.array([[
        data.sprint_velocity,
        data.task_completion_rate,
        data.team_utilization,
        data.days_remaining,
    ]])

    try:
        probabilities = model.predict_proba(input_vector)[0]
        delay_probability_percent = int(probabilities[1] * 100)

        if delay_probability_percent > 70:
            status = "High Risk / Delayed"
        elif delay_probability_percent > 35:
            status = "Moderate Risk"
        else:
            status = "On Track"

        return {
            "delay_probability": delay_probability_percent,
            "status": status,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference processing failure: {exc}")


@app.get("/")
def read_root():
    return {
        "status": "Python ML Service is Online",
        "current_mode": PREDICTION_MODE,
        "model_loaded": model is not None
    }

@app.post("/predict")
async def predict_delay_risk(data: PredictionInput):
    """Make a delay risk prediction using ML or rule-based model."""
    if PREDICTION_MODE == "RULE_BASED":
        return evaluate_rules(data)
    return predict_with_model(data)


@app.post("/predict/{project_id}")
async def predict_delay_risk_for_project(project_id: int, data: PredictionInput):
    """Make a prediction for a specific project."""
    result = predict_with_model(data) if PREDICTION_MODE == "ML" else evaluate_rules(data)
    result["project_id"] = project_id
    return result

@app.post("/etl/process")
async def process_bulk_csv_upload(file: UploadFile = File(...)):
    """Process CSV upload and extract analytics without database storage."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid format. Only CSV uploads are supported.")
        
    try:
        df = pd.read_csv(file.file)
        df = df.dropna(subset=["sprint_id", "task_id"])
        
        df["story_points"] = pd.to_numeric(df["story_points"], errors='coerce').fillna(1).astype(int)
        df["status"] = df["status"].fillna("TO_DO").str.upper()
        df["priority"] = df["priority"].fillna("MEDIUM").str.upper()
        
        total_tasks = len(df)
        completed_tasks = len(df[df["status"] == "DONE"])
        completion_rate = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
        
        developer_workloads = df.groupby("assignee_id")["story_points"].sum().to_dict()
        bottleneck_developers = [
            int(dev_id) for dev_id, points in developer_workloads.items() if points > 12
        ]
        
        return {
            "status": "ETL Pipeline Executed Successfully",
            "file_name": file.filename,
            "processed_analytics": {
                "records_processed": total_tasks,
                "overall_task_completion_rate": completion_rate,
                "total_story_points_allocated": int(df["story_points"].sum()),
                "detected_bottleneck_assignee_ids": bottleneck_developers
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pandas ETL pipeline failure: {str(e)}")

@app.post("/config/mode")
async def update_prediction_mode(config: ModeConfiguration):
    """Allows administrators to dynamically toggle prediction methodologies."""
    global PREDICTION_MODE
    target_mode = config.mode.upper()
    
    if target_mode not in ["RULE_BASED", "ML"]:
        raise HTTPException(status_code=400, detail="Invalid mode. Choose 'RULE_BASED' or 'ML'.")
        
    PREDICTION_MODE = target_mode
    return {
        "status": "System configuration updated successfully",
        "current_prediction_mode": PREDICTION_MODE
    }

@app.get("/config/mode")
async def get_prediction_mode():
    return {"current_prediction_mode": PREDICTION_MODE}

app.include_router(analytics_router)