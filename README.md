# AI-Powered Project & Resource Management Intelligence Platform

A next-generation, enterprise-grade web application purpose-built to help software development teams efficiently manage complex project lifecycles, sprint planning, developer task allocation, and delivery timelines.

By seamlessly integrating predictive AI analytics, real-time WebSocket communication, and rich data visualizations, this platform transcends conventional task trackers. It acts as an intelligent, centralized hub that surfaces potential bottlenecks before they materialize, empowering managers to proactively rebalance workloads and mitigate delivery risk.

---

# Key Features

## Intelligent Sprint Planning

AI-assisted story-point estimation and team-capacity analysis.

## Delay Prediction Engine

Scikit-learn models trained on historical velocity data flag at-risk sprints in real time.

## Live Kanban Board

WebSocket-powered drag-and-drop board with instant multi-user synchronization.

## Role-Based Access Control (RBAC)

Admin, Manager, and Developer hierarchy with JWT-secured endpoints.

## Analytics Dashboard

Recharts-driven velocity, burn-down, and utilization graphs refreshed on every sprint update.

## Cloud-Native Deployment

Fully containerized via Docker Compose and deployed on AWS EC2 with S3-backed file storage.

---

#  Technology Stack

| Layer          | Technology                                 | Purpose                                                  |
| -------------- | ------------------------------------------ | -------------------------------------------------------- |
| Frontend       | React 18, Vite, Tailwind CSS, Recharts     | SPA, Interactive Kanban UI, Dashboards                   |
| Core Backend   | Spring Boot 3 (Java 21), Spring Security   | REST API, Business Logic, JWT Auth, RBAC                 |
| AI/ML Service  | Python 3.11, FastAPI, Pandas, Scikit-learn | Delay Prediction, ETL Pipelines, Data Analytics          |
| Real-Time      | Node.js, Socket.IO                         | WebSocket Notification Bus                               |
| Database       | Mysql 9.6.0                             | Relational Persistence & Data Integrity                  |
| Infrastructure | Docker Compose, AWS EC2, AWS S3            | Container Orchestration, Cloud Hosting, CSV File Storage |

---

# 📂 Repository Structure

The platform is built on a decoupled, microservices-oriented full-stack architecture. All services are contained within this monorepo.

```text
📦 project-root
┣ 📂 frontend/
┃ ┣ 📂 src/
┃ ┗ 📜 package.json
┣ 📂 platform/
┃ ┣ 📂 src/main/java/
┃ ┗ 📜 pom.xml
┣ 📂 python-ml-service/
┃ ┣ 📂 app/
┃ ┣ 📂 data/
┃ ┗ 📜 requirements.txt
┣ 📂 node-notification-service/
┃ ┣ 📜 server.js
┃ ┗ 📜 package.json
┣ 📜 compose.yml
┗ 📜 README.md
```

---

# ⚙️ Local Development Setup

The entire application ecosystem is containerized to guarantee environment parity between local development and production.

## Prerequisites

* Docker & Docker Compose
* Node.js (for local frontend/websocket development)
* Java 21 & Maven (for local Spring Boot development)
* Python 3.11 (for local ML service development)

---

## Running the Full Stack via Docker

You can spin up the entire application suite (Frontend, Spring Boot, FastAPI, Node.js, and PostgreSQL) using a single command from the root directory:

```bash
docker-compose up -d --build
```

---

## Accessing the Services

Once the containers are running, the services will be exposed on the following ports:

| Service               | URL                   |
| --------------------- | --------------------- |
| Frontend UI           | http://localhost:5173 |
| Spring Boot API       | http://localhost:8080 |
| Python ML Service     | http://localhost:8000 |
| Node WebSocket Server | http://localhost:3000 |

---

# 📡 Core API Endpoints

## Authentication & Users

| Method | Endpoint                 | Description                   |
| ------ | ------------------------ | ----------------------------- |
| POST   | `/api/auth/login`        | Authenticate and retrieve JWT |
| POST   | `/api/auth/register`     | Register a new user           |
| GET    | `/api/users/role/{role}` | Filter users by role (Admin)  |

---

## Projects & Sprints

| Method | Endpoint            | Description                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/api/projects`     | List all projects              |
| POST   | `/api/projects`     | Create a new project workspace |
| POST   | `/api/sprints`      | Create a new sprint            |
| PUT    | `/api/sprints/{id}` | Update sprint status           |

---

## Tasks & Resources

| Method | Endpoint                 | Description                           |
| ------ | ------------------------ | ------------------------------------- |
| GET    | `/api/tasks/sprint/{id}` | Retrieve all tasks for a sprint       |
| POST   | `/api/tasks`             | Create a Kanban task ticket           |
| PUT    | `/api/tasks/{id}`        | Update task status/assignee           |
| POST   | `/api/resources/upload`  | Upload resource utilization CSV to S3 |

---

## Analytics & AI Predictions

| Method | Endpoint                        | Description                  |
| ------ | ------------------------------- | ---------------------------- |
| GET    | `/api/predictions/sprint/{id}`  | Fetch delay prediction score |
| GET    | `/api/analytics/velocity/{pid}` | Fetch sprint velocity trends |

---

# 🏗️ Architecture Overview

```text
Frontend (React + Vite)
            │
            ▼
Spring Boot Backend
            │
   ┌────────┴────────┐
   ▼                 ▼
PostgreSQL      Python FastAPI
 Database         ML Service
                      │
                      ▼
              Delay Prediction
                      │
                      ▼
           Node.js + Socket.IO
             Notification Hub
                      │
                      ▼
              Real-Time Updates
```

---

# 🚀 Deployment Stack

* AWS EC2
* AWS S3
* Docker Compose
* PostgreSQL
* Spring Boot
* React
* FastAPI
* Node.js Socket.IO

---

# 👥 Team Contributions

## Preetham — Core Backend

* Initialized the Spring Boot 3 architecture.
* Engineered the JWT security layer (`JwtAuthenticationFilter`, `CustomUserDetailsService`).
* Designed the fully normalized PostgreSQL schema.
* Developed core CRUD REST APIs for Projects, Tasks, and User Management.
* Configured Spring Security RBAC with method-level `@PreAuthorize` annotations.

---

## Siddhi Pawar — Frontend Experience

* Architected the complete ReactJS frontend using Vite.
* Implemented routing, authentication context, and protected route guards.
* Built the interactive Kanban Task Board with drag-and-drop functionality.
* Integrated backend REST APIs.
* Designed the Recharts analytics dashboard.

---

## Vyapti Gupta — Python & Data Analytics

* Architected the containerized Python FastAPI microservice.
* Built the Pandas ETL pipeline.
* Performed feature engineering for sprint velocity and utilization datasets.
* Trained and tuned the Random Forest delay-prediction model.
* Exposed ML inference via the `/predict` endpoint.

---

## Nishanth — Real-Time Communications

* Designed and implemented the Node.js + Socket.IO notification broker.
* Integrated Spring Boot event emissions into the WebSocket layer.
* Enabled real-time task updates, sprint updates, and ML prediction notifications.
* Conducted load testing and implemented exponential backoff reconnection.
* Assisted with AWS EC2 and S3 infrastructure provisioning.

---

## Aastha — Cloud Infrastructure & Backend Contributor

* Collaborated on the Spring Boot backend architecture.
* Implemented Sprint CRUD APIs and sprint workflow business logic.
* Authored Dockerfiles and `compose.yml`.
* Configured bridge networks and volume mounts.
* Led AWS deployment strategy and S3 bucket configuration.

