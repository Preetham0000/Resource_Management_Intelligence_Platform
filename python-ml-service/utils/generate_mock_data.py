import pandas as pd
import random
import os

def generate_datasets():
    os.makedirs("datasets", exist_ok=True)
    
    records = []
    for i in range(1, 600):
        velocity = random.randint(15, 65)
        completion_rate = random.randint(40, 100)
        utilization = random.randint(50, 120)
        days_remaining = random.randint(1, 14)
        
        if velocity < 30 or completion_rate < 60 or utilization > 95:
            risk_label = 1
        else:
            risk_label = 0
        if random.random() < 0.10:  
            risk_label = 1 if risk_label == 0 else 0
            
        records.append([velocity, completion_rate, utilization, days_remaining, risk_label])
        
    df = pd.DataFrame(records, columns=[
        "sprint_velocity", "task_completion_rate", "team_utilization", "days_remaining", "is_delayed"
    ])
    
    df.to_csv("datasets/sprint_velocity.csv", index=False)
    print("Successfully compiled noisy real-world simulated dataset at: datasets/sprint_velocity.csv")

if __name__ == "__main__":
    generate_datasets()