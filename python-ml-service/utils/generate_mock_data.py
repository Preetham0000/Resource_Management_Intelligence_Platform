import pandas as pd
import random
import os
from datetime import datetime, timedelta

def generate_datasets():
    os.makedirs("datasets", exist_ok=True)
    
    # Dataset 1: project_data.csv (100 records)
    project_records = []
    for i in range(1, 101):
        project_records.append([
            i,
            f"Project_{i}",
            f"owner_{random.randint(1, 20)}",
            random.choice(["ACTIVE", "COMPLETED", "ON_HOLD"]),
            random.randint(10, 95),
            random.uniform(-20, 30),
            (datetime.now() - timedelta(days=random.randint(30, 180))).strftime("%Y-%m-%d"),
            (datetime.now() + timedelta(days=random.randint(10, 100))).strftime("%Y-%m-%d")
        ])
    
    df_projects = pd.DataFrame(project_records, columns=[
        "project_id", "project_name", "owner", "status", "delay_risk_score", 
        "budget_variance_pct", "start_date", "end_date"
    ])
    df_projects.to_csv("datasets/project_data.csv", index=False)
    print("✓ Generated: datasets/project_data.csv (100 records)")
    
    # Dataset 2: sprint_velocity.csv (200 records)
    sprint_records = []
    for i in range(1, 201):
        velocity = random.randint(15, 65)
        completion_rate = random.randint(40, 100)
        utilization = random.randint(50, 120)
        days_remaining = random.randint(1, 14)
        
        if velocity < 30 or completion_rate < 60 or utilization > 95:
            is_delayed = 1
        else:
            is_delayed = 0
        if random.random() < 0.10:
            is_delayed = 1 if is_delayed == 0 else 0
        
        sprint_records.append([
            i, random.randint(1, 100), f"Sprint_{i}", velocity, completion_rate,
            utilization, days_remaining, is_delayed, random.choice(["ACTIVE", "COMPLETED"])
        ])
    
    df_sprints = pd.DataFrame(sprint_records, columns=[
        "sprint_id", "project_id", "sprint_name", "velocity", "completion_rate",
        "team_utilization", "days_remaining", "is_delayed", "status"
    ])
    df_sprints.to_csv("datasets/sprint_velocity.csv", index=False)
    print("✓ Generated: datasets/sprint_velocity.csv (200 records)")
    
    # Dataset 3: task_completion.csv (1200 records)
    task_records = []
    for i in range(1, 1201):
        task_records.append([
            i,
            random.randint(1, 100),
            random.randint(1, 200),
            random.randint(1, 13),
            random.choice(["TO_DO", "IN_PROGRESS", "DONE", "BLOCKED"]),
            random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            random.randint(1, 50),
            f"developer_{random.randint(1, 50)}"
        ])
    
    df_tasks = pd.DataFrame(task_records, columns=[
        "task_id", "project_id", "sprint_id", "story_points", "status",
        "priority", "assignee_id", "assignee_name"
    ])
    df_tasks.to_csv("datasets/task_completion.csv", index=False)
    print("✓ Generated: datasets/task_completion.csv (1200 records)")
    
    # Dataset 4: resource_utilization.csv (600 records)
    utilization_records = []
    for i in range(1, 601):
        utilization_records.append([
            i % 52,
            random.randint(1, 50),
            f"developer_{random.randint(1, 50)}",
            random.randint(40, 120),
            random.randint(5, 50)
        ])
    
    df_utilization = pd.DataFrame(utilization_records, columns=[
        "week_number", "assignee_id", "assignee_name", "utilization_pct", "active_story_points"
    ])
    df_utilization.to_csv("datasets/resource_utilization.csv", index=False)
    print("✓ Generated: datasets/resource_utilization.csv (600 records)")
    
    print("\n✅ All datasets successfully compiled in datasets/")

if __name__ == "__main__":
    generate_datasets()