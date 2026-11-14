# CS3302 — Development of Web Services: Course Syllabus & Outcome Mapping

## Academic Course Specification
- **Course Code:** CS3302
- **Course Title:** Development of Web Services
- **Program:** B.Sc (Hons) Computer Science
- **Semester:** V
- **Teaching Scheme:** L:T:P = 1:1:2 (Total 60 Hours: 15L + 15T + 30P)
- **Application:** Student Project Showcase and Peer Gallery RESTful Platform

---

## 1. Course Outcomes (CO) Attainment Matrix

| Course Outcome | Description | Project Implementation & Proof Points | Status |
|---|---|---|:---:|
| **CO1** | Explain the fundamental principles and architecture of web services and API-based systems. | 3-tier client-server architecture, Service-Oriented Architecture (SOA) principles, HTTP/1.1 & HTTP/2 standards, request/response cycle, statelessness, status code hierarchy, and JSON payload contracts. Documented in [`docs/ARCHITECTURE.md`](file:///docs/ARCHITECTURE.md) and [`README.md`](file:///README.md). | **VERIFIED & ATTAINED** |
| **CO2** | Design and implement RESTful APIs to handle client requests using standard HTTP methods and data formats. | Standard REST API with full HTTP verb coverage (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) across `/api/v1/projects`, `/api/v1/projects/{id}`, `/api/v1/projects/{id}/comments`, `/api/v1/projects/{id}/upvote`, `/api/v1/projects/{id}/downvote`, `/api/v1/catalog/*`, and `/api/v1/preferences/*`. Standard JSON schema validation with Pydantic v2. Interactive OpenAPI/Swagger UI at `/docs`. | **VERIFIED & ATTAINED** |
| **CO3** | Develop secure web services by integrating databases and implementing authentication mechanisms. | Dual database persistence (SQLite locally, managed PostgreSQL in production) via SQLAlchemy ORM. Cryptographic PBKDF2-SHA256 password hashing (310,000 rounds). Token-based authentication using HS256 JSON Web Tokens (JWT) with Bearer token validation and HTTP-only session cookies. Double-submit CSRF protection and per-IP sliding rate limiting. | **VERIFIED & ATTAINED** |
| **CO4** | Deploy and demonstrate a working web service application in a cloud environment. | Multi-stage Docker containerization (`backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`). Render PaaS cloud deployment specification (`render.yaml`) with persistent PostgreSQL and FastAPI web service. Live public deployment on GitHub Pages (`https://dhruvi-tech.github.io/Student-Project-Showcase-and-Gallery/`). | **VERIFIED & ATTAINED** |

---

## 2. Module-by-Module Curriculum Alignment

### Module 1: Fundamentals of Web Services
- **Evolution of Web Applications:** Documented transition from static HTML documents to dynamic multi-tier web applications and API-driven single-page applications (React SPA + FastAPI backend).
- **Distributed Systems & Multi-Tier Architecture:** Explicit separation of Presentation Tier (React 18), Application Tier (FastAPI REST service), and Persistence Tier (PostgreSQL/SQLite).
- **Web Service Concepts & Components:** Implementation of Service Provider (FastAPI at `/api/v1`), Service Consumer (React Gallery client and external HTTP consumers), and Service Registry / Discovery (Interactive OpenAPI catalog at `/docs` and discovery endpoints at `/api/v1/discovery`).
- **SOA Principles:** Loose coupling, service contract abstraction, reusability, statelessness, and composability.
- **HTTP Protocol Fundamentals:** Proper request/response headers (`Content-Type: application/json`, `Authorization: Bearer <token>`, `X-Request-Id`, `X-CSRF-Token`), HTTP status codes (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Content`, `429 Too Many Requests`, `500 Internal Server Error`, `503 Service Unavailable`).
- **SOAP vs. REST:** Architectural comparison documenting REST's lightweight JSON serialization, statelessness, HTTP verb alignment, and lower latency compared to XML-heavy SOAP contracts.

### Module 2: RESTful Web Service Design
- **REST Architectural Constraints:** Stateless communication (no server-side memory dependencies), client-server separation, layered system architecture, and uniform interface.
- **Resource Identification & URI Design:** Resource-oriented URI paths utilizing plural nouns and hierarchical identifiers:
  - Collection: `/api/v1/projects`
  - Singular resource: `/api/v1/projects/{id}`
  - Sub-resources: `/api/v1/projects/{id}/comments`, `/api/v1/projects/{id}/upvote`
- **HTTP Methods Implementation:**
  - `GET /api/v1/projects`: Retrieve paginated project collection.
  - `POST /api/v1/projects`: Create project (`201 Created`).
  - `PUT /api/v1/projects/{id}`: Replace project resource (`200 OK`).
  - `PATCH /api/v1/projects/{id}`: Partially update project resource (`200 OK`).
  - `DELETE /api/v1/projects/{id}`: Delete project resource (`204 No Content`).
  - `DELETE /api/v1/projects/{id}/comments/{comment_id}`: Delete comment (`204 No Content`).
- **Query Parameters (Search, Filtering, Sorting, Pagination):**
  - Search: `?search=FastAPI` across title, description, category, and stack.
  - Filtering: `?category=Cloud+Computing&difficulty=Intermediate&tech_stack=Docker`
  - Sorting: `?sort=upvotes`, `?sort=newest`, `?sort=oldest`, `?sort=alphabetical`
  - Pagination: `?limit=20&offset=40` with metadata total counts.
- **OpenAPI & Swagger Documentation:** Auto-generated interactive documentation available at `/docs` (Swagger UI), `/redoc` (ReDoc), and `/openapi.json` with security definitions and schema contracts.
- **API Versioning:** URI path versioning standard `/api/v1` ensuring backward compatibility.

### Module 3: Web Service Development
- **FastAPI Framework:** Asynchronous ASGI web framework with modular `APIRouter` structure:
  - `app/routers/auth.py`: Authentication, profiles, session management.
  - `app/routers/projects.py`: CRUD operations, image asset uploads, votes, comments.
  - `app/routers/discovery.py`: Recommendations, category filters, tech catalog.
  - `app/routers/github.py`: Real-time GitHub metadata integration.
  - `app/routers/health.py`: Liveness and readiness monitoring.
- **Input Validation & Pydantic v2:** Rigid data validation using typed schemas (`ProjectCreate`, `ProjectPatch`, `RegisterBody`, `LoginBody`, `CommentCreate`) with regex validations, bounds checking, and custom field validators.
- **Structured Error Handling:** Centralized exception handlers converting validation errors to standardized JSON format with field-level diagnostics.
- **Logging & Request Tracing:** Structured JSON request logging middleware with unique `X-Request-Id` generation, duration telemetry (`duration_ms`), and status code auditing without sensitive token leakage.
- **Lifecycle Management:** FastAPI `lifespan` context manager handling graceful database initialization, connection pooling, and additive seed checks on startup and shutdown.

### Module 4: Data Integration and Security
- **Database Connectivity & ORM:** SQLAlchemy 2.0 ORM with declarative mapping (`Base = declarative_base()`) and connection pooling (`pool_pre_ping=True`, `pool_size=10`, `max_overflow=20`, `pool_recycle=1800`).
- **Relational Integrity & Schema Design:**
  - Foreign key constraints with cascading deletes (`ondelete="CASCADE"`).
  - Unique composite constraints spanning votes (`UNIQUE(project_id, student_id)`).
  - Explicit database indexes on queried columns (`title`, `category`, `created_at`, `email`, `username`).
- **Alembic Migrations:** Production-ready schema revision management (`alembic/versions/dde564b102d1_initial_schema.py`) supporting seamless transitions from SQLite to PostgreSQL.
- **Authentication & JWT:** Cryptographic token issuance (`alg: HS256`, `typ: JWT`) containing user claims (`sub`, `ver`, `iat`, `exp`), dual-supported via `Authorization: Bearer <token>` and HTTP-only session cookies.
- **Password Security:** PBKDF2-SHA256 hashing with 310,000 iterations and 16-byte random salt.
- **Authorization & Access Control:** Server-side ownership verification (`resolve_actor()`) preventing unauthorized project modifications or deletions (`403 Forbidden`).
- **API Security:**
  - Strict CORS origin allowlist (rejecting wildcard `*` for credentialed routes).
  - Double-submit CSRF verification for cookie sessions.
  - In-memory sliding rate limiting on sensitive routes (`429 Too Many Requests`).
  - Sensitive credential stripping from logging channels.

### Module 5: Microservices and Deployment of Web Services
- **Monolithic vs. Microservices Trade-offs:** Well-modularized service design demonstrating service boundaries without distributed latency overhead.
- **Containerization & Docker:**
  - `backend/Dockerfile`: Multi-stage build (Python 3.11 slim, non-root user, health checks).
  - `frontend/Dockerfile`: Multi-stage build (Node 20 builder -> Nginx alpine runtime).
  - `docker-compose.yml`: Full orchestration connecting PostgreSQL container, backend service, and frontend client over dedicated bridge network `showcase_net`.
- **Cloud PaaS Deployment (Render):** `render.yaml` Blueprint provisioning:
  - Managed PostgreSQL 15 database service (`student-project-showcase-db`).
  - Python Web Service (`student-project-showcase-api`) with dynamic `$PORT` binding.
  - React Static Site (`student-project-showcase-ui`) with SPA rewrite routing.
- **Continuous Deployment (GitHub Pages):** Automatic build and deployment to `gh-pages` branch, providing public access at `https://dhruvi-tech.github.io/Student-Project-Showcase-and-Gallery/`.
- **Monitoring & Telemetry:** `/health` endpoint returning database connection state, latency in milliseconds, engine dialect, and 12-factor cloud readiness metrics.

---

## 3. Lab Curriculum Verification (Parts A & B)

| Lab Exercise | Topic | Implemented Component | Verification Status |
|---|---|---|:---:|
| **Lab 1** | Problem Domain & API Resource Modeling | Identification of student project entity graph (`students`, `projects`, `comments`, `project_votes`, `saved_projects`). | **VERIFIED** |
| **Lab 2** | Web Service Endpoint & Static JSON Responses | Discovery catalog endpoints returning structured JSON taxonomy (`/api/v1/catalog/categories`, `/api/v1/catalog/technologies`). | **VERIFIED** |
| **Lab 3** | GET & POST Endpoints with HTTP Methods | `GET /api/v1/projects` (collection query), `POST /api/v1/projects` (`201 Created` resource publication). | **VERIFIED** |
| **Lab 4** | PUT, PATCH & DELETE Full CRUD Operations | `PUT /api/v1/projects/{id}` (full update), `PATCH /api/v1/projects/{id}` (partial update), `DELETE /api/v1/projects/{id}` (`204 No Content`). | **VERIFIED** |
| **Lab 5** | Database Persistence & SQLAlchemy ORM | SQLAlchemy models mapping tables, relationships, and foreign keys; persistent storage across SQLite and PostgreSQL. | **VERIFIED** |
| **Lab 6** | Input Validation, Error Handling, Search & Filters | Pydantic v2 schemas, query filtering by domain/difficulty/stack, pagination with offset/limit, search terms matching. | **VERIFIED** |
| **Lab 7** | Authentication, JWT, Access Control & Testing | PBKDF2 password hashing, JWT Bearer tokens, ownership authorization, 34 automated unit/integration tests (`pytest`). | **VERIFIED** |
| **Lab 8** | Containerization, Docker & Cloud Deployment | Multi-stage Dockerfiles, Docker Compose, Render Blueprint (`render.yaml`), and GitHub Pages deployment. | **VERIFIED** |
