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

def load_ml_model():
    global model
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            print(f"Successfully loaded ML model binary from {MODEL_PATH}")
        except Exception as exc:
            print(f"WARNING: Unable to load model from {MODEL_PATH}: {exc}")
    else:
        print("WARNING: model.pkl not found! Automatically falling back to rule-based evaluation.")

load_ml_model()


class PredictionInput(BaseModel):
    sprint_velocity: int = Field(..., ge=0, description="Sprint-wise velocity (story points completed)")
    task_completion_rate: int = Field(..., ge=0, le=100, description="Percentage of tasks completed in current sprint")
    team_utilization: int = Field(..., ge=0, le=200, description="Average team resource utilization percentage")
    days_remaining: int = Field(..., ge=0, description="Days remaining in the sprint")

class ModeConfiguration(BaseModel):
    mode: str


def evaluate_rules(data: PredictionInput):
    """Deterministic manual risk analysis based on project performance thresholds."""
    v = data.sprint_velocity
    c = data.task_completion_rate
    u = data.team_utilization

    if v >= 50 and c >= 85 and u <= 85:
        return {"delay_probability": 12, "status": "On Track — Maintain Pace"}
    elif 30 <= v < 50 or 60 <= c < 85 or 85 < u <= 95:
        return {"delay_probability": 48, "status": "Moderate Risk — Monitor Closely"}
    else:
        return {"delay_probability": 82, "status": "At Risk — Review Sprint Plan"}


def predict_with_model(data: PredictionInput):
    global model
    
    # Reload model if it was trained since server start
    if model is None:
        load_ml_model()
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
            status = "At Risk — Review Sprint Plan"
        elif delay_probability_percent > 35:
            status = "Moderate Risk — Monitor Closely"
        else:
            status = "On Track — Maintain Pace"

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
async def predict_delay_risk_for_project(project_id: int, data: Optional[dict] = None):
    """Make a delay risk prediction for a specific project.
    
    If request body (data) is not provided or incomplete, this endpoint will dynamically load
    the project's latest sprint metrics from sprint_velocity.csv.
    """
    prediction_input = None
    if data:
        try:
            prediction_input = PredictionInput(**data)
        except Exception:
            # Lacks required fields or invalid; we will attempt to load from CSV instead
            prediction_input = None
            
    if prediction_input is None:
        csv_path = os.path.join("datasets", "sprint_velocity.csv")
        if os.path.exists(csv_path):
            try:
                df = pd.read_csv(csv_path)
                proj_df = df[df["project_id"] == project_id]
                if not proj_df.empty:
                    # Prefer active sprint, otherwise latest sprint by sprint_id
                    active_sprints = proj_df[proj_df["status"] == "ACTIVE"]
                    if not active_sprints.empty:
                        sprint_row = active_sprints.iloc[-1]
                    else:
                        sprint_row = proj_df.sort_values("sprint_id").iloc[-1]
                    
                    prediction_input = PredictionInput(
                        sprint_velocity=int(sprint_row["velocity"]),
                        task_completion_rate=int(sprint_row["completion_rate"]),
                        team_utilization=int(sprint_row["team_utilization"]),
                        days_remaining=int(sprint_row["days_remaining"])
                    )
            except Exception as e:
                print(f"Error loading project details from csv for prediction: {e}")
                
        if prediction_input is None:
            raise HTTPException(
                status_code=404,
                detail=f"Project with ID {project_id} has no metrics in sprint_velocity.csv. Please upload sprint data or provide details in the request body."
            )
            
    result = predict_with_model(prediction_input) if PREDICTION_MODE == "ML" else evaluate_rules(prediction_input)
    result["project_id"] = project_id
    return result


@app.post("/etl/process")
async def process_bulk_csv_upload(file: UploadFile = File(...)):
    """Process CSV upload, extract analytics, and save cleaned/transformed datasets locally."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid format. Only CSV uploads are supported.")
        
    try:
        df = pd.read_csv(file.file)
        
        # Check required columns
        required_cols = {"sprint_id", "task_id", "story_points", "status", "priority", "assignee_id"}
        missing_cols = required_cols - set(df.columns)
        if missing_cols:
            # If not a standard task_completion CSV, try generic loading
            df = df.dropna()
        else:
            df = df.dropna(subset=["sprint_id", "task_id"])
            df["story_points"] = pd.to_numeric(df["story_points"], errors='coerce').fillna(1).astype(int)
            df["status"] = df["status"].fillna("TO_DO").str.upper()
            df["priority"] = df["priority"].fillna("MEDIUM").str.upper()
        
        total_tasks = len(df)
        completed_tasks = len(df[df["status"] == "DONE"]) if "status" in df.columns else 0
        completion_rate = int((completed_tasks / total_tasks) * 100) if total_tasks > 0 else 0
        
        total_story_points = int(df["story_points"].sum()) if "story_points" in df.columns else 0
        
        bottleneck_developers = []
        if "assignee_id" in df.columns and "story_points" in df.columns:
            developer_workloads = df.groupby("assignee_id")["story_points"].sum().to_dict()
            bottleneck_developers = [
                int(dev_id) for dev_id, points in developer_workloads.items() if points > 12
            ]
        
        # Save processed analytics locally
        processed_dir = os.path.join("datasets", "processed")
        os.makedirs(processed_dir, exist_ok=True)
        
        cleaned_path = os.path.join(processed_dir, f"cleaned_{file.filename}")
        df.to_csv(cleaned_path, index=False)
        
        # Append to reporting summary table
        summary_path = os.path.join(processed_dir, "reporting_summary.csv")
        summary_data = {
            "timestamp": [pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")],
            "file_name": [file.filename],
            "records_processed": [total_tasks],
            "completion_rate": [completion_rate],
            "total_story_points": [total_story_points],
            "bottlenecks_count": [len(bottleneck_developers)]
        }
        summary_df = pd.DataFrame(summary_data)
        if os.path.exists(summary_path):
            existing_df = pd.read_csv(summary_path)
            summary_df = pd.concat([existing_df, summary_df], ignore_index=True)
        summary_df.to_csv(summary_path, index=False)
        
        return {
            "status": "ETL Pipeline Executed Successfully",
            "file_name": file.filename,
            "processed_analytics": {
                "records_processed": total_tasks,
                "overall_task_completion_rate": completion_rate,
                "total_story_points_allocated": total_story_points,
                "detected_bottleneck_assignee_ids": bottleneck_developers,
                "saved_cleaned_dataset": cleaned_path,
                "reporting_summary_updated": summary_path
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