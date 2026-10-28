<div align="center">

# 🎓 Student Project Showcase & Gallery

### One place to publish student projects, explore how they are built, and exchange useful feedback.

[![React](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLite-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker Compose](https://img.shields.io/badge/Containers-Docker%20Compose-2496ed?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

**Academic mini-project · CS3452 Cloud Platforms and Service Models · RV University**

[Features](#-what-you-can-do) · [Architecture](#-how-it-works) · [Run locally](#-run-locally) · [API](#-api-reference) · [Testing](#-tests-and-load-testing) · [Cloud notes](#-cloud-deployment-notes)

</div>

---

## ✨ About

The Student Project Showcase is a full-stack web application for sharing student software projects. A student can publish a project with a description, technology stack, GitHub repository, and live demo. Other visitors can discover projects, browse the implementation details, react with **Like** or **Dislike**, and leave feedback marked **Positive** or **Improvement**. The goal is to make student work easier for classmates and faculty to find, review, and discuss.

> **Project status:** The app runs locally and includes a Docker Compose environment. It demonstrates a cloud-oriented, three-tier design but is **not currently deployed as a public cloud service**. The included profiles, votes, and comments are sample/demo data. Secure authentication and production cloud storage are future work.

## 🚀 What you can do

| Explore | Publish | Review |
|---|---|---|
| Search by project title or description; filter by technology; sort by popularity or date; open source and demo links. | Add a title, overview, links, and technology tags. Choose from common stacks or add a custom one. | Like or Dislike a project, switch reactions, or double-click the active reaction to clear it. Leave Positive or Improvement comments. |

Other interface details include a featured project, project detail dialogs, responsive layouts, light/dark themes, and an accessible API health status. Reactions and comments are associated with a development identity in this Phase 1 demo; the identity selector is hidden in the gallery.

## 🧱 How it works

```mermaid
flowchart LR
    Person[Student / Faculty Browser] --> UI[React + Vite Frontend]
    UI -->|HTTP + JSON| API[FastAPI REST API]
    API --> Schemas[Pydantic Validation]
    Schemas --> Services[Project and Feedback Services]
    Services --> ORM[SQLAlchemy ORM]
    ORM --> DB[(PostgreSQL or SQLite)]
    Compose[Docker Compose] -. local orchestration .-> UI
    Compose -. local orchestration .-> API
    Compose -. local orchestration .-> DB
```

- **Frontend:** React single-page application. It renders the gallery, dialogs, search and filtering controls, and sends API requests.
- **API:** FastAPI validates requests, applies project/reaction/comment rules, and exposes interactive OpenAPI documentation.
- **Data:** SQLAlchemy persists students, projects, reactions, and comments. PostgreSQL is used by the Compose setup; SQLite is the default for simple local runs.
- **Health:** `GET /health` reports API and database connectivity and latency for local checks or an orchestrator probe.

The tiers can be deployed independently: host the frontend as static assets/CDN content, run the API as a container or managed application, and use managed PostgreSQL for persistent cloud storage. This describes the deployment path; the repository does not provision cloud infrastructure or configure autoscaling, TLS, or production identity on its own.

## 🧰 Technology

| Area | Tools |
|---|---|
| UI | React 18, Vite, JavaScript, CSS, Lucide React |
| API | Python, FastAPI, Pydantic, Uvicorn |
| Persistence | SQLAlchemy, PostgreSQL, SQLite |
| Containers | Docker, Docker Compose, Nginx |
| Verification | Pytest, FastAPI TestClient, HTTPX |
| Optional load tools | Locust, async HTTPX benchmark |

## 💻 Run locally

### Requirements

- Python **3.11+** and pip
- Node.js **18+** and npm
- Docker Desktop only if using Docker Compose
- PostgreSQL is optional for local development; SQLite is used by default if `DATABASE_URL` is unset.

### 1. Install and start the API

Run these commands from the repository root. The API creates its tables at startup.

**Windows PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

SQLite creates `showcase.db` in the API process working directory. To use a local PostgreSQL instance, set `DATABASE_URL` before starting the backend. For example, in PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@localhost:5432/showcase_db"
```

### 2. Install and start the frontend

Open a second terminal in the repository root:

```bash
cd frontend
npm ci
npm run dev
```

The checked-in `frontend/.env.example` points to `http://localhost:8000`. To change the API origin, create `frontend/.env.local` with:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Open **http://localhost:5173**. The API docs are at **http://localhost:8000/docs** (Swagger UI) and **http://localhost:8000/redoc** (ReDoc).

### 🐳 Run with Docker Compose

From the repository root:

```bash
docker compose up --build
```

Compose starts PostgreSQL, the FastAPI API, and an Nginx-served frontend. Browse to `http://localhost:5173`; health and docs are available at `http://localhost:8000/health` and `http://localhost:8000/docs`. Stop the stack with `Ctrl+C`, or run `docker compose down` in another terminal. The named `postgres_data` volume keeps local database records between container restarts. `docker compose down -v` deletes that volume and its data.

> **Local credentials:** The Compose file currently contains example database credentials for local evaluation. Replace them with secret-managed values before any shared deployment; never commit real passwords, API keys, or `.env` files.

## 🔌 API reference

All project endpoints use `/api/v1`. The complete schemas and interactive “Try it out” interface are generated at `/docs`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/projects` | Browse, search, filter, sort, and paginate projects |
| `POST` | `/api/v1/projects` | Publish project metadata |
| `GET` | `/api/v1/projects/{id}` | Get project details and comments |
| `POST` | `/api/v1/projects/{id}/upvote` | Like, or switch from Dislike to Like |
| `POST` | `/api/v1/projects/{id}/downvote` | Dislike, or switch from Like to Dislike |
| `DELETE` | `/api/v1/projects/{id}/vote` | Remove the identified student's current reaction |
| `GET` | `/api/v1/projects/{id}/comments` | List a project's feedback |
| `POST` | `/api/v1/projects/{id}/comments` | Add a Positive or Improvement comment |
| `GET` | `/api/v1/students` | List development/demo identities |
| `GET` | `/health` | Check API and database health |

`GET /api/v1/projects` supports `sort=upvotes` (default), `sort=newest`, or `sort=oldest`, plus `search`, `tech_stack`, `limit`, and `offset`. The current student ID can be passed in a request body or the `X-Student-Id` header on relevant routes.

<details>
<summary><strong>Example: publish a project</strong></summary>

```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Campus Event Planner",
    "description": "A web app for organizing student events and sharing schedules.",
    "github_link": "https://github.com/example/campus-event-planner",
    "demo_url": "https://example.com",
    "tech_stacks": ["React", "FastAPI", "PostgreSQL"]
  }'
```

</details>

<details>
<summary><strong>Example: react and leave feedback</strong></summary>

```bash
curl -X POST http://localhost:8000/api/v1/projects/PROJECT_ID/upvote \
  -H 'Content-Type: application/json' \
  -d '{"student_id":"stu_demo01"}'

curl -X POST http://localhost:8000/api/v1/projects/PROJECT_ID/comments \
  -H 'Content-Type: application/json' \
  -d '{
    "student_id":"stu_demo01",
    "author_name":"Demo Student",
    "feedback_type":"improvement",
    "content":"The project flow is clear; adding keyboard navigation could improve accessibility."
  }'
```

Use `"feedback_type":"positive"` for a positive comment. Valid values are `positive` and `improvement`.

</details>

## ✅ Tests and load testing

Run API integration tests from the repository root after installing backend requirements:

```bash
python -m pytest backend/tests/test_api.py -q
```

The optional Locust profile can be run against a local API:

```bash
python -m locust -f loadtests/locustfile.py --host=http://127.0.0.1:8000
```

The async benchmark script targets `http://127.0.0.1:8000` and runs stages with 10, 25, and 50 simulated users:

```bash
python loadtests/benchmark.py
```

> **Load-test caution:** These scripts send requests that may create reaction or comment records. Use a disposable database or an environment where you are authorized to generate traffic.

## 🗂️ Repository map

```text
backend/
  app/                 FastAPI app, API routes, schemas, ORM models, services
  tests/               API integration tests
  seed_data.py         Optional demo-data seeder (resets its target database)
frontend/
  src/                 React app, components, styles, and API client
  Dockerfile           Production frontend image
  nginx.conf           Static app serving and API proxy configuration
docs/                  Requirements, architecture, and test plan
loadtests/             Locust profile and async benchmark
docker-compose.yml     Local API + frontend + PostgreSQL stack
```

### Sample data seeder

`python backend/seed_data.py` replaces the configured database contents before inserting demo data. **Back up important data first and only run it against a disposable demo database.** Do not describe seeded profiles, reactions, or comments as verified real community activity.

## ☁️ Cloud deployment notes

This project is intended to demonstrate the separation of presentation, application, and persistence layers for a cloud platform course. A production deployment would still need:

- Cloud hosting for the frontend and API, plus a managed PostgreSQL service.
- A secrets manager, HTTPS/TLS, restrictive CORS configuration, database backups, and monitoring.
- Real authentication and authorization; the current development student ID is not secure identity verification.
- A production migration workflow and review of database connection-pool settings for the selected host.
- Optional object storage for project images or attachments; S3 settings are preparation only and uploads are not implemented.

Do not deploy the example Compose credentials or expose the development identity scheme as production security.

## 🎓 Course context

**CS3452 — Cloud Platforms and Service Models**<br>
RV University · School of Computer Science and Engineering<br>
Academic mini-project demonstrating a full-stack student showcase and its path toward cloud hosting.

---

<div align="center">

Made for sharing student work and making project feedback more useful.

</div>
