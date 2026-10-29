<div align="center">

# 🎓 Student Project Showcase

### A home for student projects, thoughtful feedback, and open-source discovery.

[![React](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[Explore the app](http://localhost:5173/) · [API documentation](http://127.0.0.1:8000/docs) · [Architecture](docs/architecture.md)

</div>

---

## ✨ The project

A full-stack gallery where students can publish their work, browse projects across technical domains, and exchange constructive feedback. Search matches project titles, descriptions, and technology stacks. The gallery loads the complete **120-project catalog** in one view.

| **20 domains** | **120 projects** | **Community feedback** |
|:--:|:--:|:--:|
| From cybersecurity to robotics | Open-source projects and community entries | Likes, dislikes, and comments |

### Browse every domain

| | | | |
|:--|:--|:--|:--|
| AI & Machine Learning | Data Science & Analytics | Cybersecurity | Cloud Computing & DevOps |
| Web Development & Full Stack | Mobile App Development | Internet of Things | Blockchain & Web3 |
| Computer Vision | Natural Language Processing | Generative AI & AI Agents | Robotics & Automation |
| Data Engineering & Big Data | Software Engineering & Developer Tools | FinTech | HealthTech |
| EdTech | Game Development | AR/VR | Open Source & Developer Utilities |

The catalog includes **30 attributed open-source projects** and **90 clearly identified community entries**. Community entries have no invented repository or website links.

## 🧩 Features

- Search projects by title, description, or technology stack; filter by any of the 20 domains.
- View project details, difficulty, stack, source repository, and available website.
- Create an account, sign in, manage a profile, and edit your own projects.
- Like or dislike a project, comment, bookmark projects, and follow domains.
- Explore personalized recommendations and switch between light and dark themes.
- Use a responsive React interface backed by a FastAPI REST API.

## 🛠 Built with

| Frontend | Backend | Data & deployment |
|:--|:--|:--|
| React 18 · Vite · Lucide · CSS | Python · FastAPI · SQLAlchemy · Pydantic | SQLite · PostgreSQL · Docker Compose |

## 🚀 Run locally

**Requirements:** Python 3.10+, Node.js 18+, and npm.

### 1. Start the API

From the repository root, in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

API docs: <http://127.0.0.1:8000/docs>

### 2. Start the web app

In a second terminal:

```powershell
npm install --prefix frontend
npm run dev --prefix frontend
```

Open <http://localhost:5173/>.

### Or use Docker Compose

```powershell
docker compose up --build
```

Stop with `Ctrl+C`. Run `docker compose down` to remove the containers while retaining the named database volume.

## ✅ Build & checks

```powershell
npm run build --prefix frontend
python -m pytest backend/tests/test_api.py -v
```

The additive database migration check is in `backend/tests/test_migrations.py`.

## 🗂 Repository map

```text
backend/       FastAPI app, database models, services, and tests
frontend/      React app, components, and styles
docs/          Requirements, architecture, and deployment notes
infra/aws/     AWS infrastructure templates
loadtests/     Locust and standalone benchmark scripts
```

## ☁️ Deployment status

AWS templates are included for a possible CloudFront/S3, ECS Fargate, load balancer, and RDS deployment. **These resources have not been deployed or verified.** See the [deployment notes](docs/aws-deployment.md) and [project completion matrix](docs/50-50-completion-matrix.md) for current status and outstanding work.

Local settings can be configured with environment variables or `backend/.env`; see [`backend/.env.example`](backend/.env.example). Configure a unique `AUTH_SECRET` and production CORS origins before any production deployment.

---

<div align="center">

Made for sharing what you build — and learning from what others create.

</div>
