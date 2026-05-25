from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Project Intelligence AI Engine")

class PredictionInput(BaseModel):
    sprint_velocity: int
    task_completion_rate: int
    team_utilization: int
    days_remaining: int

@app.get("/")
def read_root():
    return {"status": "Python ML Service is Online"}

@app.post("/predict")
async def predict_delay_risk(data: PredictionInput):
    return {
        "delay_probability": 72,
        "status": "At Risk - Review Sprint Plan"
    }