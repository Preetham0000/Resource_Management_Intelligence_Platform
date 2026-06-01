# Core Platform API

## Project: AI-Powered Project & Resource Management Intelligence Platform

### Module: Enterprise Backend API (Spring Boot)

---

## Overview

This repository contains the core Spring Boot backend microservice for the enterprise platform. Operating as the central nervous system of the architecture, this service manages the primary business logic, database transactions, and secure user authentication.

It handles all CRUD operations for projects, sprints, tasks, and resources while acting as the primary orchestration layer. It seamlessly integrates with the Python ML Service (for generating AI-driven project delay risks and analytics) and the Node.js Notification Service (for broadcasting real-time updates to the React client via webhooks).

---

## Technology Stack

- **Language:** Java 21
- **Framework:** Spring Boot 3.5.0
- **Database:** MySQL
- **ORM:** Spring Data JPA / Hibernate
- **Security:** Spring Security + JSON Web Tokens (JWT)
- **Data Processing:** Apache Commons CSV
- **API Client:** Spring RestClient (for cross-service communication)

---

#  Day-by-Day Execution Plan

## Day 1: Foundation & Security Setup

- Initialized the Spring Boot environment with Java 21 and Maven.
- Configured the MySQL database connection and JPA entity mappings.
- Implemented Spring Security with a custom `JwtAuthenticationFilter` and `CustomUserDetailsService`.
- Created the `/api/auth/register` and `/api/auth/login` endpoints to generate and validate JWT tokens.

---

## Day 2: Core Business Logic & CRUD APIs

### Database Modeling

Modeled core database entities:

- User
- Project
- Sprint
- Task
- Resource
- Feedback

### Backend Development

- Developed Data Access Layer (Repositories) using Spring Data JPA.
- Engineered Service classes and RESTful Controllers for full CRUD lifecycle management of:
  - Projects
  - Sprints
  - Tasks
- Implemented robust Global Exception Handling for standardizing API error responses.

---

## Day 3: Cross-Service Integration

### External Service Communication

- Integrated the modern Spring `RestClient` to handle synchronous communication with external microservices.
- Built the `PredictionService` to forward project metrics to the Python FastAPI ML engine.
- Engineered HTTP webhook triggers to send system events (such as task updates and ML risk predictions) securely to the Node.js Socket.IO server using internal API keys.

---

## Day 4: Data Engineering & Analytics Preparation

### CSV Processing

- Integrated `commons-csv` to build a `CsvIngestionService` allowing admins to upload and process batch data.

### Data Validation

- Created specialized DTOs (Data Transfer Objects) to strictly format and validate incoming/outgoing JSON requests.

### AI Analytics Storage

- Prepared entity schemas to store predicted delay risk scores persistently alongside project data.

---

## Day 5: Finalization & Cloud Deployment Preparation

### Testing

- Conducted End-to-End API testing using Postman.

### Documentation

- Finalized Swagger UI configuration for API documentation.

### Environment Configuration

- Configured dynamic environment variables in `application.properties` to support AWS EC2 private IP routing.
- Dynamically linked:
  - Database Service
  - ML Service
  - Node.js Notification Service

### Packaging

- Packaged the application using the Maven Wrapper for deployment.

---

#  Local Setup & Installation

## 1. Clone the Repository

```bash
git clone <repository-url>
cd platform
```

---

## 2. Configure Environment Variables

Update your `src/main/resources/application.properties` file:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/projectdb
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Secret
app.jwt.secret=mySuperSecretKeyForJwtAuthentication123456

# External Microservices
app.ml.base-url=http://localhost:8000
app.node.base-url=http://localhost:5000
app.node.api-key=capstone_secret_key_2026
```

---

## 3. Build and Run (Windows)

This project uses the Maven Wrapper, so a global Maven installation is not required.

### Package Application

```bash
mvnw.cmd -DskipTests package
```

### Run Application

```bash
mvnw.cmd spring-boot:run
```

---

## 4. Access Swagger Documentation

Once the application is running:

```text
http://localhost:8080/swagger-ui/index.html
```

---

# API Reference

## Authentication Header

All endpoints except Authentication require:

```http
Authorization: Bearer <Your_JWT_Token>
```

---

## 1. Authentication

### Register User

```http
POST /api/auth/register
```

Registers a new user (Admin, Manager, or Developer).

### Login

```http
POST /api/auth/login
```

Authenticates a user and returns a JWT token.

---

## 2. Project Management

### Get All Projects

```http
GET /api/projects
```

### Create Project

```http
POST /api/projects
```

### Update Project

```http
PUT /api/projects/{id}
```

### Delete / Archive Project

```http
DELETE /api/projects/{id}
```

---

## 3. Sprint & Task Management

### Get All Sprints

```http
GET /api/sprints
```

### Create Sprint

```http
POST /api/sprints
```

### Get Tasks

```http
GET /api/tasks
```

Supports Kanban board rendering.

### Create Task

```http
POST /api/tasks
```

Assigns a new task and triggers a Node.js notification.

### Update Task Status

```http
PUT /api/tasks/{id}
```

---

## 4. Resource & Feedback Management

### Fetch Resources

```http
GET /api/resources
```

Returns developer utilization and availability.

### Allocate Resources

```http
POST /api/resources
```

### Submit Feedback

```http
POST /api/feedback
```

Stores review notes for developers.

---

## 5. Intelligence / Prediction

### Predict Project Delay Risk

```http
POST /api/predict/{projectId}
```

### Project Work structure 
1. Gathers project metrics.
2. Sends metrics to the Python ML service.
3. Receives delay probability predictions.
4. Stores the resulting `delay_probability` in the MySQL database.
5. Triggers an alert via the Node.js Notification Service.

---

## Architecture Flow

```text
React Frontend
      │
      ▼
Spring Boot API
      │
 ┌────┴────┐
 ▼         ▼
MySQL    Python ML Service
Database      │
              ▼
      Delay Risk Prediction
              │
              ▼
     Node.js Notification Service
              │
              ▼
      Real-Time Client Updates
```

---

## Deployment 

When deploying to AWS:

- Use EC2 private IPs for internal service communication.
- Store secrets in environment variables.
- Configure MySQL security groups appropriately.
- Enable Swagger only for development environments.
- Use JWT authentication for all protected routes.

---
