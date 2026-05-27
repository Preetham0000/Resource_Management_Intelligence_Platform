from fastapi import APIRouter, HTTPException
import mysql.connector
import pandas as pd

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])

def get_mysql_connection():
    try:
        return mysql.connector.connect(
            host="localhost",
            user="root",
            password="root123", 
            database="project_intelligence"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MySQL link failure: {str(e)}")

@router.get("/sprint-velocity")
def get_sprint_velocity_trends():
    db = get_mysql_connection()
    query = "SELECT name, velocity FROM sprints WHERE status = 'COMPLETED' ORDER BY end_date ASC"
    
    df = pd.read_sql(query, db)
    db.close()
    return df.to_dict(orient="records")

@router.get("/at-risk-projects")
def get_at_risk_projects():
    db = get_mysql_connection()
    query = "SELECT name, delay_risk_score FROM projects WHERE delay_risk_score > 50 ORDER BY delay_risk_score DESC"
    
    df = pd.read_sql(query, db)
    db.close()
    return df.to_dict(orient="records")

@router.get("/developer-utilization")
def get_developer_utilization_heatmap():
    db = get_mysql_connection()
    query = """
        SELECT u.username as developer_name, SUM(t.story_points) as active_story_points
        FROM tasks t
        JOIN users u ON t.assigned_to = u.id
        WHERE t.status != 'DONE'
        GROUP BY u.username
    """
    df = pd.read_sql(query, db)
    db.close()
    return df.to_dict(orient="records")