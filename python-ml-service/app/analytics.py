from fastapi import APIRouter, HTTPException
import mysql.connector
import pandas as pd
import os

router = APIRouter(prefix="/analytics", tags=["Dashboard Analytics"])

def get_mysql_connection():
    """Establishes an on-demand database link to the shared MySQL instance."""
    try:
        return mysql.connector.connect(
            host="localhost",       
            user="root",         
            password="root123",
            database="project_intelligence"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MySQL connection failure: {str(e)}")

@router.get("/sprint-velocity")
def get_sprint_velocity_trends():
    """Fetches completed sprint metrics to drive frontend velocity trend lines."""
    db = get_mysql_connection()
    query = "SELECT sprint_name, velocity FROM sprints WHERE status = 'COMPLETED' ORDER BY end_date ASC"
    df = pd.read_sql(query, db)
    db.close()
    
    return df.to_dict(orient="records")

@router.get("/at-risk-projects")
def get_at_risk_projects():
    """Extracts vulnerable system profiles that cross high risk indices."""
    db = get_mysql_connection()
    query = "SELECT name, delay_risk_score FROM projects WHERE delay_risk_score > 50 ORDER BY delay_risk_score DESC"
    
    df = pd.read_sql(query, db)
    db.close()
    
    return df.to_dict(orient="records")

@router.get("/developer-utilization")
def get_developer_utilization_heatmap():
    """Aggregates active human resource metrics to fuel capacity dashboards."""
    db = get_mysql_connection()
    query = """
        SELECT u.name as developer_name, r.utilization_pct 
        FROM resources r
        JOIN users u ON r.user_id = u.id
    """
    df = pd.read_sql(query, db)
    db.close()
    
    return df.to_dict(orient="records")