# 🚀 ProjectSpace

<p align="center">
  <strong>A modern, full-stack student project showcase and peer-feedback platform.</strong><br>
  Built with React 18, Vite, FastAPI, and SQLAlchemy.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%205-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React & Vite" />
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Language-Python%203.11%2B%20%7C%203.13-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Database-SQLite%20%2F%20PostgreSQL--Ready-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="Database" />
  <img src="https://img.shields.io/badge/Tests-30%20Passed%20(100%25)-brightgreen?style=for-the-badge&logo=pytest&logoColor=white" alt="Pytest" />
  <img src="https://img.shields.io/badge/Cloud%20Policy-%E2%82%B90%20Strict-blueviolet?style=for-the-badge" alt="Zero Cost Policy" />
</p>

---

## 📌 Executive Summary

**ProjectSpace** enables engineering students to publish capstone projects, explore an active gallery across **20 technical domains**, discover peer work, save bookmarks, follow topics, exchange feedback, and upvote innovative solutions.

The platform comes pre-loaded with a curated catalog of **320 real engineering projects**, **120 student profiles**, **374 peer votes**, and **110 constructive comments**, all preserved in a verified local SQLite database (`showcase.db`).

> 💡 **Cloud Status & Strict ₹0 Policy:** The application is 100% operational for local demonstration. Cloud architectures (AWS ECS, RDS, S3, CloudFormation, IAM, CloudWatch) are fully designed, documented, and templated for zero-cost compliance without incurring billable cloud expenses.

---

## 📑 Table of Contents

- [Highlights & Features](#-highlights--features)
- [System Architecture](#-system-architecture)
- [How to Run (Step-by-Step)](#-how-to-run-step-by-step)
  - [Prerequisites](#prerequisites)
  - [Step 1: Install Dependencies](#step-1-one-time-dependency-installation)
  - [Step 2: Start Backend API](#step-2-start-fastapi-backend)
  - [Step 3: Start Frontend Client](#step-3-start-react-frontend)
  - [Application URLs](#application-urls)
  - [Demo Accounts](#demo-accounts)
- [Supported Domains](#-supported-domains-20-categories)
- [Tech Stack](#-tech-stack)
- [Cloud Architecture & ₹0 Policy](#-cloud-readiness--strict-0-policy)
- [Academic Documentation & Evaluation](#-academic-documentation--evaluation)
- [Verification & Quality Assurance](#-verification--quality-assurance)
- [Repository Structure](#-repository-structure)

---

## ✨ Highlights & Features

- 🔍 **Discovery & Real-Time Filtering:** Instant keyword search and filtering across all 320 projects, with dedicated independent categories for **AI & Machine Learning** and **Data Science & Analytics**.
- 💬 **Peer Engagement:** Upvoting and downvoting with duplicate prevention, nested comments, and bookmarking.
- 🔐 **Robust Security:**
  - Password hashing using **PBKDF2-SHA256** (310,000 iterations + cryptographically secure salt).
  - Secure signed **HttpOnly** cookies for session persistence with session-version invalidation.
  - Double-Submit CSRF protection on state-mutating requests.
  - Server-side identity validation ensuring only authors can edit or delete their projects.
- 👤 **Student Dashboard:** Personal profiles, published work management, followed domains, and local AI-assisted description generator.
- 📖 **Interactive API Documentation:** Automatically generated OpenAPI/Swagger specifications at `/docs` and ReDoc at `/redoc`.
- 🩺 **Health & Monitoring:** Native `/health` probe for orchestration liveness and structured JSON request logging.

---

## 🏗 System Architecture

```mermaid
flowchart TD
  User([Student Browser]) -->|HTTP / JSON| Frontend[React 18 + Vite SPA<br/>Port 5173]
  Frontend -->|Proxy /api/v1| API[FastAPI Application<br/>Port 8000]
  
  subgraph Backend Service
    API --> Auth[Auth & Session Engine<br/>PBKDF2 / Signed Cookies]
    API --> Security[CSRF & Ownership Guards]
    API --> Validator[Pydantic v2 Schemas]
    API --> Health[/health Endpoint]
    API --> ORM[SQLAlchemy 2.0 ORM]
    API -. Fail-Safe .-> S3Service[Optional Private S3 Asset Service]
  end

  ORM --> DB[(SQLite Database<br/>showcase.db - 320 Projects)]
  S3Service -. S3_BUCKET_NAME empty .-> Fallback[Safe 503 HTTP Response]
```

---

## 💻 How to Run (Step-by-Step)

### Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.11+** (Tested on Python 3.13)
- **Node.js 20+** and **npm**

---

### Step 1: One-Time Dependency Installation

From the project root directory, install dependencies:

```powershell
# 1. Install backend dependencies
pip install -r backend/requirements.txt

# 2. Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 2: Start FastAPI Backend

Open a terminal in the project root:

**Windows PowerShell:**
```powershell
cd backend
$env:DATABASE_URL = "sqlite:///../showcase.db"
$env:ENVIRONMENT = "development"
$env:DEMO_MODE = "true"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**macOS / Linux Bash:**
```bash
cd backend
export DATABASE_URL="sqlite:///../showcase.db"
export ENVIRONMENT="development"
export DEMO_MODE="true"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### Step 3: Start React Frontend

Open a second terminal in the project root:

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

---

### 🌐 Application URLs

Once both servers are running:

| Service | URL | Description |
|---|---|---|
| **Web Application** | [http://127.0.0.1:5173](http://127.0.0.1:5173) | Main student portal & interactive project showcase |
| **Interactive API Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Swagger UI for exploring and testing REST endpoints |
| **Alternative API Docs** | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | ReDoc structured API specification |
| **Health Check** | [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) | Real-time JSON probe checking database connectivity |

---

### 🔑 Demo Accounts

The preserved database contains 120 student accounts. You can also register a new account on the UI in seconds.

| Role | Username / Email | Password | Capability |
|---|---|---|---|
| **Demo Student** | `demo@student.edu` | `DemoPass123!` | Create, upvote, comment, save projects |
| **New Registration** | *Any email* | *Min 8 chars* | Instantly creates profile with PBKDF2 hashing |

---

## 🏷 Supported Domains (20 Categories)

ProjectSpace organizes projects into 20 distinct technical tracks:

| Track 1 – 5 | Track 6 – 10 | Track 11 – 15 | Track 16 – 20 |
|---|---|---|---|
| 🤖 AI & Machine Learning | 📱 Mobile App Development | 🥽 AR/VR & Game Dev | 💬 Natural Language Processing |
| 📊 Data Science & Analytics | ⚙️ DevOps & Automation | 🏥 HealthTech | 🌐 Networking & Distributed Systems |
| 🛡️ Cybersecurity | 👁️ Computer Vision | 💳 FinTech | 🎨 UI/UX & Product Design |
| ☁️ Cloud Computing | 📡 Internet of Things (IoT) | 📚 EdTech | 🛠️ Open Source & Dev Utilities |
| 💻 Web & Full Stack Dev | ⛓️ Blockchain & Web3 | 🦾 Robotics & Embedded | 🌱 Sustainability & Social Impact |

---

## 🧰 Tech Stack

| Layer | Component | Details |
|---|---|---|
| **Frontend** | React 18, Vite 5, Vanilla CSS, Lucide Icons | Responsive UI, stateful modal dialogs, real-time search |
| **Backend API** | FastAPI 0.110+, Pydantic v2, Uvicorn | High-performance asynchronous REST endpoints |
| **Database & ORM** | SQLAlchemy 2.0, SQLite (PostgreSQL Ready) | Relational persistence with foreign keys & indexes |
| **Security** | PBKDF2-SHA256, ItsDangerous, CSRF, Owner Guards | Zero plaintext credentials, strict role isolation |
| **Cloud Readiness** | Docker, Docker Compose, AWS CloudFormation | Multi-stage builds, non-root users, health probes |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX, Locust | Unit, migration, integration, and load testing |

---

## ☁️ Cloud Readiness & Strict ₹0 Policy

ProjectSpace adopts an **honest academic cloud strategy**:
- **Why ₹0 Policy?** Provisioning continuous AWS infrastructure (such as ECS Fargate, Application Load Balancers, and RDS PostgreSQL) risks recurring billable charges. Under our strict ₹0 policy, no fee-generating AWS resource has been created.
- **Implemented Locally:** Multi-stage Dockerfiles, Docker Compose topology, private S3 routes with safe 503 fallback when unconfigured, health check endpoints, structured JSON request logging, and local Locust load simulations.
- **Cloud-Ready Templates:** Located in `infra/aws/` (least-privilege IAM task policy, CloudWatch dashboard templates, CloudFormation templates).

---

## 📚 Academic Documentation & Evaluation

Comprehensive architectural guides and assessment documentation are located in [`docs/`](docs/):

* 📐 [Detailed Architecture & Data Flow](docs/architecture.md)
* ☁️ [Cloud Deployment & Security Specification](docs/aws-deployment.md)
* 💰 [Zero-Cost Cloud Plan (Strict ₹0 Policy)](docs/zero-cost-cloud-plan.md)
* 📊 [50:50 Assessment & Evaluation Matrix](docs/50-50-completion-matrix.md)
* 🧪 [Testing Plan & Quality Assurance Strategy](docs/testing-plan.md)
* 📋 [Functional Requirements Specification](docs/requirements.md)

---

## 🧪 Verification & Quality Assurance

| Test Suite | Command | Result | Notes |
|---|---|---|---|
| **Backend API & Migrations** | `python -m pytest backend/tests` | **30 Passed** (100%) | Covers CRUD, auth, CSRF, voting, S3 fallback |
| **Frontend Production Build** | `npm run build` (in `frontend/`) | **Passed** (0 errors) | Bundle generated cleanly via Vite |
| **Load Testing (10 Users)** | Locust local run | **100% Success** | 0 failures, average latency < 15ms |
| **Load Testing (25 Users)** | Locust local run | **100% Success** | 0 failures, sustained throughput |
| **Load Testing (50 Users)** | Locust local run | **100% Success** | 0 failures, verified concurrency |

---

## 📁 Repository Structure

```text
Student-Project-Showcase-and-Gallery/
├── backend/                  # FastAPI backend application
│   ├── app/
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── routers/          # API endpoint routers (auth, projects, discovery, health)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic layer
│   │   ├── config.py         # Environment & application configuration
│   │   ├── database.py       # SQLAlchemy engine & session manager
│   │   └── main.py           # Application entrypoint & middleware setup
│   ├── tests/                # Automated Pytest suite (30 test cases)
│   ├── Dockerfile            # Multi-stage production container build
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React 18 + Vite frontend
│   ├── src/                  # Components, styles, context, and UI views
│   ├── public/               # Static web assets
│   ├── Dockerfile            # Multi-stage Nginx container build
│   ├── package.json          # Node dependencies and build scripts
│   └── vite.config.js        # Vite build & API proxy configuration
├── infra/                    # Infrastructure as Code
│   └── aws/                  # IAM policy and CloudWatch JSON templates
├── loadtests/                # Locust and async load-testing benchmark scripts
├── docs/                     # Core architectural, deployment & evaluation documentation
│   ├── architecture.md       # Detailed technical architecture
│   ├── aws-deployment.md     # AWS deployment specifications
│   ├── zero-cost-cloud-plan.md # Budget and ₹0 compliance plan
│   ├── 50-50-completion-matrix.md # 50:50 mark rubric
│   └── testing-plan.md       # Verification procedures
├── docker-compose.yml        # Multi-container local orchestration
├── showcase.db               # Preserved 320-project SQLite database
├── .gitignore                # Git ignore configuration
└── README.md                 # Project documentation & quickstart
```

---

<p align="center">
  Crafted for the <strong>CVPM CIE 3 Evaluation</strong> • Student Project Showcase Platform
</p>
