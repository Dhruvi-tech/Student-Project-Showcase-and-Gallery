<div align="center">

# 🚀 ProjectSpace
### Student Project Showcase & Peer-Feedback Platform

A full-stack web platform for engineering students to discover 320+ capstone projects across 20 technical domains, exchange constructive peer feedback, and showcase technical work.

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Pytest](https://img.shields.io/badge/Pytest-30%20Passed-brightgreen?style=for-the-badge&logo=pytest&logoColor=white)](backend/tests)

<br/>

`🟢 System: Verified & Operational` &nbsp;•&nbsp; `📦 Catalog: 320 Real Projects` &nbsp;•&nbsp; `🛡️ Policy: Strict ₹0 Cloud`

</div>

---

### 🖥️ Application Interface

```text
┌─── ProjectSpace Browser ────────────────────────────────────────────────────────┐
│  ● ● ●  http://localhost:5173                                  🔍 Search 320+   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   🏷️  [All]  [AI & ML]  [Data Science]  [Cybersecurity]  [Cloud]  [Web Dev]     │
│                                                                                 │
│   ┌───────────────────────────────┐     ┌───────────────────────────────┐       │
│   │ 🤖 Vision AI Pipeline         │     │ 🛡️ Sentinel Packet Guard      │       │
│   │ Track: Computer Vision        │     │ Track: Cybersecurity          │       │
│   │ ▲ 42 Upvotes • 12 Comments    │     │ ▲ 38 Upvotes • 9 Comments     │       │
│   │ [View Source ↗] [Details Modal│     │ [View Source ↗] [Details Modal│       │
│   └───────────────────────────────┘     └───────────────────────────────┘       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 📊 Platform Highlights

| 📦 Preserved Projects | 👥 Student Authors | 👍 Peer Votes | 💬 Review Comments | 🏷️ Technical Domains |
| :---: | :---: | :---: | :---: | :---: |
| **320** | **120** | **374** | **110** | **20** |

---

### 🏗️ Visual Architecture

```mermaid
flowchart LR
    subgraph Client ["Client Layer"]
        Browser["🖥️ Student Browser"] -->|SPA| ReactApp["⚛️ React 18 + Vite"]
    end

    subgraph Service ["API Service (Port 8000)"]
        ReactApp -->|JSON /api/v1| FastApiCore["⚡ FastAPI"]
        FastApiCore --> AuthGuard["🔐 PBKDF2 Auth & CSRF"]
        FastApiCore --> SQLAlchemy["🗄️ SQLAlchemy 2.0 ORM"]
    end

    subgraph Storage ["Persistent Storage"]
        SQLAlchemy --> SQLiteDB[("💾 SQLite: showcase.db<br/>(320 Projects, 120 Users)")]
    end

    classDef default fill:#18181b,stroke:#52525b,stroke-width:1px,color:#fff;
    classDef highlight fill:#0284c7,stroke:#38bdf8,stroke-width:1px,color:#fff;
    class FastApiCore,ReactApp highlight;
```

---

### ⚡ Quickstart

<details open>
<summary><b>▶️ Click to view Launch Instructions</b></summary>
<br/>

#### 1. Setup Dependencies
```bash
pip install -r backend/requirements.txt
npm --prefix frontend install
```

#### 2. Start FastAPI Backend (Port 8000)
```powershell
# Windows
cd backend
$env:DATABASE_URL = "sqlite:///../showcase.db"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
```bash
# macOS / Linux
cd backend
export DATABASE_URL="sqlite:///../showcase.db"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 3. Start React Frontend (Port 5173)
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

#### 🌐 Active Service Endpoints
* **Web UI:** `http://localhost:5173`
* **Swagger API Docs:** `http://localhost:8000/docs`
* **Health Endpoint:** `http://localhost:8000/health`

</details>

---

### 🏷️ 20 Engineering Tracks

<details>
<summary><b>📂 Click to view all 20 Supported Domains</b></summary>
<br/>

| Track 1 – 5 | Track 6 – 10 | Track 11 – 15 | Track 16 – 20 |
|---|---|---|---|
| 🤖 AI & Machine Learning | 📱 Mobile App Development | 🥽 AR/VR & Game Dev | 💬 Natural Language Processing |
| 📊 Data Science & Analytics | ⚙️ DevOps & Automation | 🏥 HealthTech | 🌐 Networking & Systems |
| 🛡️ Cybersecurity | 👁️ Computer Vision | 💳 FinTech | 🎨 UI/UX & Product Design |
| ☁️ Cloud Computing | 📡 Internet of Things | 📚 EdTech | 🛠️ Developer Utilities |
| 💻 Web & Full Stack Dev | ⛓️ Blockchain & Web3 | 🦾 Robotics & Embedded | 🌱 Sustainability & Impact |

</details>

---

### 🛡️ Security & Reliability

* 🔑 **Cryptographic Passwords:** PBKDF2-SHA256 with 310,000 rounds and unique salt.
* 🍪 **Signed HttpOnly Cookies:** Session tokens protected against XSS and tampering.
* 🛡️ **Double-Submit CSRF:** Protection across all state-mutating requests.
* 👤 **Ownership Enforcement:** Server-side author validation for project edit and delete actions.
* ☁️ **Honest ₹0 Cloud Strategy:** Local zero-cost demonstration; AWS architectures (IAM, ECS, RDS, S3) prepared as IaC templates without unapproved cloud billing.

---

### 📁 Clean Repository Structure

```text
Student-Project-Showcase-and-Gallery/
├── backend/          # FastAPI application, SQLAlchemy models, Pydantic schemas, 30 tests
├── frontend/         # React 18 single-page application and responsive UI styles
├── docs/             # Technical architecture, deployment specs, and ₹0 plan
├── infra/            # Reference AWS CloudFormation and least-privilege IAM policies
├── loadtests/        # Locust and async load benchmarking tools
├── docker-compose.yml# Container orchestration configuration
├── showcase.db       # Preserved 320-project catalog database
├── .gitignore        # Git exclusion rules
└── README.md         # Visual interactive documentation
```

---

<div align="center">
  <sub>Built with React, FastAPI & SQLAlchemy • Student Project Showcase Platform</sub>
</div>
