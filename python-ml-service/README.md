# Project Intelligence Python ML Service

A FastAPI microservice for project intelligence analytics, ETL processing, and delay risk prediction.

## Features
- ETL ingestion for CSV and optional AWS S3 sources
- PostgreSQL-backed analytics endpoints
- Rule-based and ML-based delay risk prediction
- Synthetic data generation for project, sprint, task, and utilization datasets
- Model training automation with Logistic Regression and Random Forest

## Setup

1. Create a virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables (optional):

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="project_intelligence"
$env:DB_USER="postgres"
$env:DB_PASSWORD="postgres"
$env:PREDICTION_MODE="ML"
$env:ETL_STORE_ENABLED="false"
```

## Generate synthetic datasets

```bash
python utils/generate_mock_data.py
```

## Train the model

Train the ML engine dynamically choosing between Random Forest and Logistic Regression:

```bash
# To train using Random Forest (Default, baseline accuracy: 92.5%)
python train_model.py --algorithm random_forest

# To train using Logistic Regression (Baseline accuracy: 80.0%)
python train_model.py --algorithm logistic_regression
```

## Run the service

```bash
uvicorn app.main:app --reload
```

## Run automated API tests

Run the complete endpoint verification test suite (starts a background uvicorn server, tests all 11 endpoints, and gracefully shuts down):

```bash
python test_endpoints.py
```

## API Endpoints

- `GET /` health + current mode
- `POST /predict` ML or rule-based prediction
- `POST /predict/{project_id}` prediction with project context. **Tip:** Omit or send empty body (`{}`) to automatically query the project's latest active sprint features from `sprint_velocity.csv`.
- `POST /etl/process` CSV upload (runs data cleaning/transformations and saves processed datasets and summaries locally under `datasets/processed/`)
- `GET /analytics/sprint-velocity` (with optional `project_id` query filter)
- `GET /analytics/at-risk-projects`
- `GET /analytics/top-performers`
- `GET /analytics/developer-utilization`
- `GET /analytics/delay-trends`
- `GET /analytics/manager-performance` (new manager performance metrics)
- `POST /config/mode` switch between `RULE_BASED` and `ML`
- `GET /config/mode`

## Notes

- This microservice is completely optimized to run locally without external cloud or database dependencies (PostgreSQL and AWS S3 are ignored, utilizing highly-performant local CSV datasets and file-based reporting summaries).
- Model inference falls back to rule-based logic when a saved model is unavailable.

