# Student Project Showcase and Gallery

A cloud-ready full-stack web application for sharing student software projects. Students can publish a project with its description, technology stack, source repository, and live demo; browse and filter the gallery; react with Like or Dislike; and leave project-specific Positive or Improvement feedback. The interface is built for students, faculty, and reviewers who need one place to discover work and provide constructive feedback.

> **Project status:** This repository contains a locally runnable academic project demonstrating a cloud-oriented architecture. It is not currently deployed as a public cloud service. The included profiles, votes, and existing comments are sample/demo content. Authentication and production cloud storage are future work.

## Features

- Responsive project gallery with keyword search, technology filters, and popularity/date sorting.
- Featured project, project detail view, source and demo links, and technology tags.
- Project publishing form with preset and custom technology stacks.
- Like and Dislike reactions with counts; a reaction can be switched or removed by double-clicking the active button.
- Project comments that can be categorized as Positive or Improvement.
- FastAPI REST API with request validation, generated Swagger/ReDoc documentation, and a database health endpoint.
- SQLAlchemy persistence with PostgreSQL support and SQLite as a lightweight local fallback.
- Docker Compose setup for the frontend, API, and PostgreSQL database.
- Pytest API tests and optional Locust/async load-test scripts.

## Architecture

```mermaid
flowchart LR
    Browser[React + Vite browser app] -->|HTTP / JSON| API[FastAPI REST API]
    API --> ORM[SQLAlchemy]
    ORM --> DB[(PostgreSQL or SQLite)]
    Compose[Docker Compose] -. runs .-> Browser
    Compose -. runs .-> API
    Compose -. runs .-> DB
```

The frontend, API, and database are separate components, so they can be deployed and scaled independently. For a cloud deployment, the intended mapping is static hosting/CDN for the React app, a container or managed application service for FastAPI, and a managed PostgreSQL service for persistent data. `/health` provides a service/database health check. Cloud hosting, autoscaling, production authentication, and object storage are deployment/future-phase work; the local Docker setup alone does not provide those cloud services.

## Technology

| Layer | Technology |
|---|---|
| User interface | React 18, Vite, JavaScript, CSS, Lucide React |
| API | Python, FastAPI, Pydantic, Uvicorn |
| Persistence | SQLAlchemy, PostgreSQL or SQLite |
| Local container orchestration | Docker Compose |
| API checks | Pytest, FastAPI TestClient |
| Optional load checks | Locust and `loadtests/benchmark.py` |

## Run locally

### Prerequisites

- Python 3.11 or later
- Node.js 18 or later and npm
- PostgreSQL is optional for local evaluation; the backend defaults to SQLite when `DATABASE_URL` is not set.
- Docker Desktop is optional if using the Compose setup.

### 1. Start the API

From the repository root, create a virtual environment and install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
```

Start the API from the repository root:

```powershell
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

The API creates its database tables on startup. With default settings, SQLite data is stored in `showcase.db` in the current working directory. To use PostgreSQL, set `DATABASE_URL` before starting the API, for example:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@localhost:5432/showcase_db"
```

### 2. Start the frontend

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The example frontend environment points to `http://localhost:8000`; adjust `VITE_API_BASE_URL` in `frontend/.env.local` if the API is hosted elsewhere.

### Docker Compose

From the repository root, run:

```bash
docker compose up --build
```

The frontend is available at `http://localhost:5173`, the API at `http://localhost:8000`, and interactive API documentation at `http://localhost:8000/docs`. Compose starts PostgreSQL and persists its data in the `postgres_data` volume. The credentials in the current Compose file are for local development only; replace them and configure secrets securely before any shared or production deployment.

## API overview

All project endpoints use the `/api/v1` prefix.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/projects` | List, search, sort, filter, and paginate projects |
| `POST` | `/api/v1/projects` | Publish a project |
| `GET` | `/api/v1/projects/{id}` | Retrieve project details and comments |
| `POST` | `/api/v1/projects/{id}/upvote` | Like a project or switch from Dislike to Like |
| `POST` | `/api/v1/projects/{id}/downvote` | Dislike a project or switch from Like to Dislike |
| `DELETE` | `/api/v1/projects/{id}/vote` | Remove the current student's reaction |
| `GET` | `/api/v1/projects/{id}/comments` | List project comments |
| `POST` | `/api/v1/projects/{id}/comments` | Add categorized feedback |
| `GET` | `/api/v1/students` | List development/demo identities |
| `GET` | `/health` | Check API and database health |

The project list accepts `sort` (`upvotes`, `newest`, or `oldest`), `search`, `tech_stack`, `limit`, and `offset` parameters. API schemas and example requests are available in Swagger UI at `/docs` and ReDoc at `/redoc`.

## Demo identity and data

Phase 1 uses development student identities to associate reactions and comments; it does not provide secure user authentication. The frontend selects a demo identity and the API also supports an `X-Student-Id` header. Do not treat this as an access-control mechanism. Integrate a trusted identity provider and authorize user actions before using the application with real student accounts. Existing sample records are provided for demonstration and must not be presented as verified community activity.

The optional seeder is `backend/seed_data.py`. **It resets the configured database before inserting sample data. Back up any data first and run it only against a disposable demo database.**

## Tests and load scripts

From the repository root, with dependencies installed:

```bash
python -m pytest backend/tests/test_api.py -q
```

Load-test examples are in `loadtests/`. Run them only against an environment where you have permission to generate traffic; they can create vote/comment data and affect measured performance.

## Repository layout

```text
backend/       FastAPI application, SQLAlchemy models, schemas, and API tests
frontend/      React/Vite user interface and Nginx container configuration
docs/          Requirements, architecture, and testing documentation
loadtests/     Optional Locust and async benchmark scripts
docker-compose.yml
```

## Course context

Academic mini-project for **CS3452 — Cloud Platforms and Service Models**, RV University, School of Computer Science and Engineering. It demonstrates a full-stack application and discusses how its independently deployable tiers could map to cloud hosting and managed database services.
