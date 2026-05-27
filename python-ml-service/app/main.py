# app/main.py
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
import os
from app.analytics import router as analytics_router

app = FastAPI(title="Project Intelligence AI Engine")

PREDICTION_MODE = "ML"

MODEL_PATH = os.path.join("app", "model.pkl")
model = None

if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print("Successfully loaded ML model binary from app/model.pkl")
else:
    print("WARNING: model.pkl not found! Automatically falling back to rule-based evaluation.")


class PredictionInput(BaseModel):
    sprint_velocity: int
    task_completion_rate: int
    team_utilization: int
    days_remaining: int

class ModeConfiguration(BaseModel):
    mode: str  # Expects "RULE_BASED" or "ML"

def evaluate_rules(data: PredictionInput):
    """Deterministic manual risk analysis based on project document thresholds."""
    v = data.sprint_velocity
    c = data.task_completion_rate
    u = data.team_utilization
    
    if v > 50 and c > 80 and u < 85:
        return {"delay_probability": 15, "status": "On Track"}
    elif 30 <= v <= 50 or 60 <= c <= 80 or 85 <= u <= 95:
        return {"delay_probability": 50, "status": "Moderate Risk"}
    else:
        return {"delay_probability": 90, "status": "High Risk / Delayed"}


@app.get("/")
def read_root():
    return {
        "status": "Python ML Service is Online",
        "current_mode": PREDICTION_MODE,
        "model_loaded": model is not None
    }

@app.post("/predict")
async def predict_delay_risk(data: PredictionInput):
    """
    Exposes unified entry point for calculation routing[cite: 153].
    Evaluates risk metrics using either the rule engine or Random Forest[cite: 121].
    """
    if PREDICTION_MODE == "RULE_BASED":
        return evaluate_rules(data)
        
    elif PREDICTION_MODE == "ML":
        if model is None:
            return evaluate_rules(data)
            
        try:
            input_vector = np.array([[
                data.sprint_velocity, 
                data.task_completion_rate, 
                data.team_utilization, 
                data.days_remaining
            ]])
            
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
                "status": status
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Inference processing failure: {str(e)}")

@app.post("/etl/process")
async def process_bulk_csv_upload(file: UploadFile = File(...)):
    """
    Ingests project tracking CSV streams triggered from Spring Boot API.
    Cleans structural formats and extracts system dashboard analytics via Pandas.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid format. Only structural CSVs are supported.")
        
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