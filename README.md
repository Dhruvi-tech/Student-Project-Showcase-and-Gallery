# Student Project Showcase & Peer Gallery

A full-stack project gallery for discovering student work and open-source projects, exploring projects across technical domains, and sharing constructive feedback.

## What the app includes

- **120 catalog projects** across **20 domains**, including Cybersecurity, Cloud Computing & DevOps, Generative AI & AI Agents, and Open Source & Developer Utilities.
- **Domain filters** to browse every category, plus a project search field.
- **Complete gallery view** loads the full 120-project catalog at once, without a load-more button.
- **Project search** across project titles, descriptions, and technology stacks.
- **Project cards and detail views** with descriptions, difficulty, technology stacks, source repositories, and available project websites.
- **Accounts and profiles** with registration, login, signed sessions, profile editing, and project ownership checks.
- **Community features** including likes/dislikes, comments, saved projects, followed domains, and personalized recommendations.
- **Responsive interface** with light and dark themes and a larger account creation form.
- **FastAPI backend** with a local SQLite configuration, PostgreSQL support, Docker Compose configuration, and optional AWS infrastructure templates.

The catalog contains 30 attributed open-source projects and 90 clearly identified community catalog entries. No fabricated repository or website links are added to those entries.

## Technology stack

| Area | Technology |
|---|---|
| Frontend | React 18, Vite, Lucide React, CSS |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite locally; PostgreSQL supported |
| Deployment options | Docker Compose; AWS templates under `infra/aws/` |

## Run locally

Requirements: Python 3.10+, Node.js 18+, and npm.

### 1. Start the API

From the repository root, create a virtual environment, install dependencies, then start FastAPI:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend --reload
```

The API uses `backend/.env` when present. The default local configuration uses SQLite. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Start the frontend

In a second terminal:

```powershell
npm install --prefix frontend
npm run dev --prefix frontend
```

Open `http://localhost:5173/`.

### Docker Compose

When Docker Desktop is available, start the configured PostgreSQL, API, and frontend services with:

```powershell
docker compose up --build
```

Stop the services with `Ctrl+C`; use `docker compose down` to remove the containers while retaining the named database volume.

## Build and API checks

Build the frontend for production:

```powershell
npm run build --prefix frontend
```

Run the backend API suite:

```powershell
python -m pytest backend/tests/test_api.py -v
```

A separate additive migration check is available in `backend/tests/test_migrations.py`.

## Project structure

```text
backend/       FastAPI application, models, services, and tests
frontend/      React/Vite application and styles
docs/          Requirements, architecture, deployment, and evaluation notes
infra/aws/     AWS infrastructure templates (not deployed)
loadtests/     Locust and standalone load-test scripts
```

## Cloud deployment status

The AWS templates describe a possible deployment using CloudFront/S3, ECS Fargate, an Application Load Balancer, RDS PostgreSQL, and optional object storage. These resources are **not deployed or verified**. Review [the deployment notes](docs/aws-deployment.md) before preparing a cloud rollout. The project also includes a [50:50 completion matrix](docs/50-50-completion-matrix.md) and [architecture notes](docs/architecture.md).

## Configuration

Use environment variables or `backend/.env` for settings such as `DATABASE_URL`, `AUTH_SECRET`, `CORS_ORIGINS`, and optional AWS storage values. Set a unique secret and production-appropriate CORS origins before any production deployment. See `backend/.env.example` for the available configuration keys.

## License

No repository license is currently specified. Add a `LICENSE` file before redistributing the project under an open-source license.
