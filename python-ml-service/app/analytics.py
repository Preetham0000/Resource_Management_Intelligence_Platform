from fastapi import APIRouter, HTTPException
from typing import List
import random

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])


@router.get("/sprint-velocity")
def get_sprint_velocity_trends() -> List[dict]:
    """Generate synthetic sprint velocity trends for dashboard."""
    trends = []
    for i in range(1, 11):
        trends.append({
            "sprint_id": i,
            "sprint_name": f"Sprint {i}",
            "velocity": random.randint(15, 65),
            "status": random.choice(["COMPLETED", "ACTIVE"]),
        })
    return trends


@router.get("/at-risk-projects")
def get_at_risk_projects() -> List[dict]:
    """Get projects with high delay risk."""
    projects = []
    for i in range(1, 6):
        projects.append({
            "project_id": i,
            "project_name": f"Project {i}",
            "delay_risk_score": random.randint(55, 95),
            "status": "AT_RISK",
        })
    return projects


@router.get("/top-performers")
def get_top_performers() -> List[dict]:
    """Get top-performing developers by completed story points."""
    performers = []
    for i in range(1, 11):
        performers.append({
            "developer_name": f"developer_{i}",
            "completed_task_count": random.randint(5, 25),
            "completed_story_points": random.randint(20, 120),
        })
    return performers


@router.get("/delay-trends")
def get_delay_trends() -> List[dict]:
    """Get delay risk trends across projects."""
    trends = []
    for i in range(1, 16):
        trends.append({
            "project_id": i,
            "project_name": f"Project {i}",
            "delay_risk_score": random.randint(10, 95),
            "status": random.choice(["ON_TRACK", "MODERATE_RISK", "HIGH_RISK"]),
        })
    return trends


@router.get("/developer-utilization")
def get_developer_utilization_heatmap() -> List[dict]:
    """Get current developer utilization levels."""
    utilization = []
    for i in range(1, 21):
        utilization.append({
            "developer_name": f"developer_{i}",
            "active_story_points": random.randint(0, 25),
            "utilization_pct": random.randint(45, 110),
            "bottleneck": random.random() > 0.85,
        })
    return utilization
