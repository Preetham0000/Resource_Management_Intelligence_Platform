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

```bash
python train_model.py --algorithm random_forest
```

## Run the service

```bash
uvicorn app.main:app --reload
```

## API Endpoints

- `GET /` health + current mode
- `POST /predict` ML or rule-based prediction
- `POST /predict/{project_id}` prediction with project context
- `POST /etl/process` CSV upload or optional S3 ingestion
- `GET /analytics/sprint-velocity`
- `GET /analytics/at-risk-projects`
- `GET /analytics/top-performers`
- `GET /analytics/developer-utilization`
- `GET /analytics/delay-trends`
- `POST /config/mode` switch between `RULE_BASED` and `ML`
- `GET /config/mode`

## Notes

- The service supports PostgreSQL by default.
- S3 ingestion is optional and will require `boto3`.
- Model inference falls back to rule-based logic when a saved model is unavailable.
