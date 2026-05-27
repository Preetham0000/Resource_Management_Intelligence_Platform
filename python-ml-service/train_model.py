import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle
import os

def train_risk_model():
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    csv_path = os.path.join(SCRIPT_DIR, "datasets", "sprint_velocity.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Could not find dataset at {csv_path}. Please run generate_mock_data.py first!")
        
    df = pd.read_csv(csv_path)
    
    X = df[["sprint_velocity", "task_completion_rate", "team_utilization", "days_remaining"]]
    y = df["is_delayed"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100, 
        max_depth=5,           
        min_samples_leaf=4, 
        random_state=42
    ) 
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model trained successfully! Baseline Testing Accuracy: {accuracy * 100:.2f}%")
    
    TARGET_DIR = os.path.join(SCRIPT_DIR, "app")
    os.makedirs(TARGET_DIR, exist_ok=True)
    
    MODEL_SAVE_PATH = os.path.join(TARGET_DIR, "model.pkl")
    
    with open(MODEL_SAVE_PATH, "wb") as f:
        pickle.dump(model, f)
        
    print(f"Model saved successfully via absolute path at: {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train_risk_model()