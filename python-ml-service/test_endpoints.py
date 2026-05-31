# test_endpoints.py
import subprocess
import time
import urllib.request
import urllib.error
import json
import os
import sys

PORT = 8011
BASE_URL = f"http://127.0.0.1:{PORT}"

def post_json(url, data):
    body = json.dumps(data).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Content-Length": str(len(body))
    }
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_json(url):
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def post_multipart(url, filename, file_content):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    parts = []
    parts.append(f"--{boundary}")
    parts.append(f'Content-Disposition: form-data; name="file"; filename="{filename}"')
    parts.append("Content-Type: text/csv")
    parts.append("")
    parts.append(file_content)
    parts.append(f"--{boundary}--")
    parts.append("")
    
    body = "\r\n".join(parts).encode("utf-8")
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Content-Length": str(len(body))
    }
    
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_tests():
    print("🚀 Starting FastAPI Service...")
    # Start the FastAPI server using uvicorn on port 8011 to avoid collision
    current_dir = os.path.dirname(os.path.abspath(__file__))
    server_process = subprocess.Popen(
        [".venv/bin/uvicorn", "app.main:app", "--port", str(PORT)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=current_dir
    )
    
    # Wait for the service to start up in a robust loop
    server_ready = False
    for i in range(20):
        if server_process.poll() is not None:
            break
        try:
            with urllib.request.urlopen(f"{BASE_URL}/", timeout=1.0) as resp:
                if resp.status == 200:
                    server_ready = True
                    break
        except Exception:
            time.sleep(0.5)
            
    # Check if the process died or failed to respond
    if not server_ready or server_process.poll() is not None:
        stdout, stderr = server_process.communicate()
        print(f"❌ Failed to start the server. Exit code: {server_process.returncode}")
        print(f"Stdout:\n{stdout.decode('utf-8')}")
        print(f"Stderr:\n{stderr.decode('utf-8')}")
        sys.exit(1)
        
    try:
        print("\n🧪 --- Starting API Endpoint Tests --- 🧪\n")
        
        # Test 1: GET / (Root Health Check)
        print("Test 1: GET / (Root Check)")
        root_resp = get_json(f"{BASE_URL}/")
        print(f"✓ Response: {root_resp}")
        assert "status" in root_resp, "Root check must return status"
        assert root_resp["model_loaded"] is True, "Model should be loaded successfully"
        print("✅ Passed!\n")
        
        # Test 2: POST /predict (Custom ML Inference)
        print("Test 2: POST /predict (ML Inference)")
        input_data = {
            "sprint_velocity": 45,
            "task_completion_rate": 80,
            "team_utilization": 90,
            "days_remaining": 5
        }
        pred_resp = post_json(f"{BASE_URL}/predict", input_data)
        print(f"✓ Response: {pred_resp}")
        assert "delay_probability" in pred_resp, "Inference response must contain delay_probability"
        assert "status" in pred_resp, "Inference response must contain status"
        print("✅ Passed!\n")
        
        # Test 3: POST /predict/{project_id} without a body (Automatic Data-fetching)
        print("Test 3: POST /predict/{project_id} (Dynamic CSV Querying)")
        # project_id 5 is expected to exist in datasets/sprint_velocity.csv
        proj_resp = post_json(f"{BASE_URL}/predict/5", {})
        print(f"✓ Response for project 5: {proj_resp}")
        assert proj_resp["project_id"] == 5, "Response should match the project_id"
        assert "delay_probability" in proj_resp, "Response should contain delay_probability"
        print("✅ Passed!\n")

        # Test 4: GET /analytics/sprint-velocity
        print("Test 4: GET /analytics/sprint-velocity")
        sprint_resp = get_json(f"{BASE_URL}/analytics/sprint-velocity")
        print(f"✓ Received {len(sprint_resp)} sprint records. Sample: {sprint_resp[0]}")
        assert len(sprint_resp) > 0, "Sprint velocity analytics list should not be empty"
        print("✅ Passed!\n")

        # Test 5: GET /analytics/at-risk-projects
        print("Test 5: GET /analytics/at-risk-projects")
        risk_resp = get_json(f"{BASE_URL}/analytics/at-risk-projects")
        print(f"✓ Received {len(risk_resp)} at-risk projects. Sample: {risk_resp[0]}")
        assert len(risk_resp) > 0, "At-risk projects list should not be empty"
        print("✅ Passed!\n")

        # Test 6: GET /analytics/top-performers
        print("Test 6: GET /analytics/top-performers")
        perf_resp = get_json(f"{BASE_URL}/analytics/top-performers")
        print(f"✓ Received {len(perf_resp)} top performers. Sample: {perf_resp[0]}")
        assert len(perf_resp) > 0, "Top performers list should not be empty"
        assert "completed_story_points" in perf_resp[0], "Should contain completed_story_points"
        print("✅ Passed!\n")

        # Test 7: GET /analytics/delay-trends
        print("Test 7: GET /analytics/delay-trends")
        trends_resp = get_json(f"{BASE_URL}/analytics/delay-trends")
        print(f"✓ Received {len(trends_resp)} delay trend records. Sample: {trends_resp[0]}")
        assert len(trends_resp) > 0, "Delay trends list should not be empty"
        print("✅ Passed!\n")

        # Test 8: GET /analytics/developer-utilization
        print("Test 8: GET /analytics/developer-utilization")
        util_resp = get_json(f"{BASE_URL}/analytics/developer-utilization")
        print(f"✓ Received {len(util_resp)} utilization records. Sample: {util_resp[0]}")
        assert len(util_resp) > 0, "Developer utilization list should not be empty"
        print("✅ Passed!\n")

        # Test 9: GET /analytics/manager-performance
        print("Test 9: GET /analytics/manager-performance")
        manager_resp = get_json(f"{BASE_URL}/analytics/manager-performance")
        print(f"✓ Received {len(manager_resp)} manager records. Sample: {manager_resp[0]}")
        assert len(manager_resp) > 0, "Manager performance list should not be empty"
        assert "performance_rating" in manager_resp[0], "Should contain performance_rating"
        print("✅ Passed!\n")

        # Test 10: GET/POST /config/mode (Dynamic prediction toggle)
        print("Test 10: GET/POST /config/mode (Dynamic config)")
        # Toggle to RULE_BASED
        mode_set_resp = post_json(f"{BASE_URL}/config/mode", {"mode": "RULE_BASED"})
        print(f"✓ Toggle Response: {mode_set_resp}")
        assert mode_set_resp["current_prediction_mode"] == "RULE_BASED", "Current mode should be RULE_BASED"
        
        mode_get_resp = get_json(f"{BASE_URL}/config/mode")
        print(f"✓ Get Mode Response: {mode_get_resp}")
        assert mode_get_resp["current_prediction_mode"] == "RULE_BASED", "Current mode should be RULE_BASED"
        
        # Set back to ML
        post_json(f"{BASE_URL}/config/mode", {"mode": "ML"})
        print("✅ Passed!\n")

        # Test 11: POST /etl/process (CSV Upload and pipeline run)
        print("Test 11: POST /etl/process (CSV Processing & Reporting Tables)")
        dummy_csv = "task_id,project_id,sprint_id,story_points,status,priority,assignee_id,assignee_name\n1,1,10,5,DONE,HIGH,3,developer_3\n2,1,10,8,TO_DO,MEDIUM,3,developer_3\n3,1,10,15,DONE,CRITICAL,4,developer_4"
        etl_resp = post_multipart(f"{BASE_URL}/etl/process", "uploaded_tasks.csv", dummy_csv)
        print(f"✓ Response: {etl_resp}")
        assert etl_resp["status"] == "ETL Pipeline Executed Successfully", "ETL should succeed"
        assert "processed_analytics" in etl_resp, "Response should contain analytics"
        
        # Verify local storage
        assert os.path.exists("datasets/processed/cleaned_uploaded_tasks.csv"), "Cleaned dataset should be saved"
        assert os.path.exists("datasets/processed/reporting_summary.csv"), "Reporting summary should be updated"
        print("✅ Passed!\n")

        print("🎉 All 11 endpoint tests PASSED successfully!")
        
    finally:
        print("🛑 Shutting down FastAPI Service...")
        server_process.terminate()
        server_process.wait()
        print("Done!")

if __name__ == "__main__":
    run_tests()
