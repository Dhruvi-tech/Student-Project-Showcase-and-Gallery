# System Architecture & Technical Specifications

**Course:** CS3302 — Development of Web Services  
**Project:** Student Project Showcase and Peer Gallery Platform  
**System Architecture Standard:** 3-Tier Cloud-Native Architecture with RESTful Services  

---

## 1. High-Level System Architecture

The platform follows a decoupled, multi-tier Service-Oriented Architecture (SOA) optimized for cloud deployment and high-concurrency read operations.

```mermaid
flowchart TD
    subgraph PresentationTier ["1. Presentation Tier (Client Layer)"]
        Browser["Modern Web Browser (Desktop / Mobile)"]
        SPA["React 18 Single Page Application (Vite 5)"]
        State["Client State & Auth Store (JWT / LocalStorage)"]
        Browser --> SPA --> State
    end

    subgraph IngressTier ["2. Ingress & Edge Routing Tier"]
        CloudCDN["Cloud CDN / Edge Delivery (HTTPS)"]
        ReverseProxy["Reverse Proxy / Nginx Ingress"]
        CORS["CORS & Origin Filtering Guard"]
        CloudCDN --> ReverseProxy --> CORS
    end

    subgraph ApplicationTier ["3. Application Tier (Web Service Layer)"]
        FastAPI["FastAPI ASGI Application (Python 3.11/3.13)"]
        subgraph Middlewares ["Middleware Pipeline"]
            ReqLog["Structured JSON Request Logger (X-Request-Id)"]
            RateLimit["Sliding Window Rate Limiter (IP-based)"]
            AuthGuard["JWT Bearer Token / Session Validator"]
        end
        subgraph Routers ["Modular API Routers (/api/v1)"]
            AuthRouter["Auth Router (/auth)"]
            ProjectRouter["Project Router (/projects)"]
            DiscoveryRouter["Discovery Router (/catalog, /preferences)"]
            GitHubRouter["GitHub Integration Router (/github)"]
            HealthRouter["Health & Monitoring Probe (/health)"]
        end
        subgraph ServiceLayer ["Business Logic & Validation"]
            Pydantic["Pydantic v2 Schema Validator"]
            ProjectService["Project & Anti-Duplicate Vote Engine"]
        end
        FastAPI --> Middlewares --> Routers --> ServiceLayer
    end

    subgraph PersistenceTier ["4. Persistence Tier (Data Layer)"]
        SQLAlchemy["SQLAlchemy 2.0 ORM (Connection Pool)"]
        Alembic["Alembic Migration Engine"]
        subgraph RelationalDB ["Relational Database Storage"]
            Postgres[("Managed PostgreSQL 15 (Production)")]
            SQLite[("SQLite 3 (Local Development)")]
        end
        ServiceLayer --> SQLAlchemy
        Alembic --> RelationalDB
        SQLAlchemy --> Postgres
        SQLAlchemy --> SQLite
    end

    SPA -->|HTTPS / REST / JSON| CloudCDN
    CORS --> FastAPI
```

---

## 2. Multi-Tier Layer Decomposition

### 2.1 Presentation Tier (React 18 SPA)
- Built with React 18, Vite 5, Lucide React, and modern CSS Variables.
- Communicates exclusively through asynchronous JSON HTTP calls using standard REST endpoints.
- Maintains dual authentication resilience:
  - **Bearer Token**: Transmitted in the standard `Authorization: Bearer <token>` header for cross-origin and API-driven operations.
  - **HttpOnly Cookies**: Double-submit CSRF secured cookies for browser session persistence.
- Client-side routing with comprehensive fallback states (loading spinners, empty catalog notifications, error toasts, and field-level form validation).

### 2.2 Application Tier (FastAPI Web Service)
- High-performance, asynchronous REST web service leveraging ASGI (Uvicorn).
- Modular architecture cleanly dividing routers, schemas, models, and service business logic.
- Built-in OpenAPI 3.0 specification auto-generator exposing interactive Swagger UI (`/docs`) and ReDoc (`/redoc`).
- Structured logging pipeline emitting CloudWatch/Render-compatible JSON payloads with distributed request tracing (`X-Request-Id`).
- Lifespan context manager guaranteeing safe database initialization and non-destructive additive seed checks.

### 2.3 Persistence Tier (SQLAlchemy ORM & PostgreSQL / SQLite)
- Object-Relational Mapping (ORM) using SQLAlchemy 2.0 declarative models.
- Environment-driven database connection:
  - **Local Development**: Embedded SQLite (`sqlite:///./showcase.db`) with zero external dependency.
  - **Production Deployment**: Cloud-managed PostgreSQL 15 via `psycopg2-binary` connection pooling (`pool_pre_ping=True`, `pool_size=10`, `max_overflow=20`).
- Schema versioning managed via Alembic database migrations (`alembic/versions/`).

---

## 3. Database Schema & Entity Relationship Diagram (ERD)

The database schema enforces referential integrity, unique constraints, cascading deletions, and indexed lookups:

```mermaid
erDiagram
    STUDENTS ||--o{ PROJECTS : "authors / publishes"
    STUDENTS ||--o{ PROJECT_VOTES : "casts vote"
    STUDENTS ||--o{ COMMENTS : "submits review"
    STUDENTS ||--o{ SAVED_PROJECTS : "bookmarks"
    STUDENTS ||--o{ FOLLOWED_CATEGORIES : "follows"

    PROJECTS ||--o{ PROJECT_VOTES : "receives vote"
    PROJECTS ||--o{ COMMENTS : "contains feedback"
    PROJECTS ||--o{ SAVED_PROJECTS : "bookmarked in"

    STUDENTS {
        string id PK "stu_xxxxxxxx"
        string name "Student / Developer Name"
        string username UK "Unique alphanumeric handle"
        string email UK "Indexed unique email"
        string password_hash "PBKDF2-SHA256 salted hash"
        string bio "Developer summary"
        json interests "Array of domain topics"
        int session_version "Version for session invalidation"
        timestamp created_at "Account creation timestamp"
    }

    PROJECTS {
        string id PK "prj_xxxxxxxx"
        string title "Project title (indexed)"
        string description "Detailed description"
        string category "Domain track (indexed)"
        string difficulty "Beginner | Intermediate | Advanced"
        string github_link "Repository URL"
        string demo_url "Live demo website URL"
        string docs_url "Documentation link"
        string author_display_name "Attributed author name"
        string author_profile_url "Author external profile URL"
        json tech_stacks "Array of technology badges"
        int upvote_count "Cached atomic vote counter"
        int downvote_count "Cached atomic vote counter"
        string student_id FK "Owning student reference"
        timestamp created_at "Publication timestamp (indexed)"
    }

    COMMENTS {
        string id PK "cmt_xxxxxx"
        string project_id FK "Target project reference (CASCADE)"
        string student_id FK "Author student reference (SET NULL)"
        string author_name "Author display name"
        string content "Comment text and rubric scores"
        string feedback_type "positive | improvement"
        timestamp created_at "Submission timestamp (indexed)"
    }

    PROJECT_VOTES {
        string id PK "vte_xxxxxxxxxxxx"
        string project_id FK "Target project reference (CASCADE)"
        string student_id FK "Voter student reference (CASCADE)"
        string direction "up | down"
        timestamp created_at "Vote timestamp"
    }

    SAVED_PROJECTS {
        string id PK "sav_xxxxxxxxxxxx"
        string project_id FK "Bookmarked project (CASCADE)"
        string student_id FK "Student reference (CASCADE)"
        timestamp created_at "Bookmark timestamp"
    }

    FOLLOWED_CATEGORIES {
        string id PK "fc_xxxxxxxxxxxx"
        string student_id FK "Student reference (CASCADE)"
        string category "Subscribed category name"
        timestamp created_at "Follow timestamp"
    }
```

### Relational Constraints Enforced:
1. **Unique Vote Constraint**: `UNIQUE(project_id, student_id)` on `project_votes` prevents any user from casting duplicate votes across both up and down directions.
2. **Cascading Deletions**: Deleting a project automatically cascades to clean up associated comments, votes, and bookmarks without orphaned database rows.
3. **Atomic Counter Invariant**: `upvote_count` and `downvote_count` on `projects` are kept strictly synchronized with actual stored row counts in `project_votes`.

---

## 4. Authentication & Security Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Client as Web Browser / API Consumer
    participant API as FastAPI Auth Router
    participant Sec as Cryptographic Security Layer
    participant DB as Relational Database (PostgreSQL/SQLite)

    Note over Client,DB: User Registration & Token Issuance
    Client->>API: POST /api/v1/auth/register (name, username, email, password)
    API->>Sec: Validate password strength (min 6 chars)
    API->>Sec: Hash password with PBKDF2-SHA256 (310,000 rounds + salt)
    API->>DB: Check unique email & username, insert Student record
    API->>Sec: Generate HS256 JWT Token (sub, ver, iat, exp)
    API-->>Client: HTTP 201 Created { access_token, token_type: "bearer", user, csrf_token }

    Note over Client,DB: Authenticated Protected Operation (e.g. Publish / Edit Project)
    Client->>API: POST /api/v1/projects [Authorization: Bearer <token>]
    API->>Sec: Verify JWT signature & expiration timestamp
    API->>DB: Query user by sub claim & verify session_version
    API->>DB: Execute authorized mutation
    API-->>Client: HTTP 201 Created { id: "prj_...", title: "..." }

    Note over Client,DB: Logout & Session Invalidation
    Client->>API: POST /api/v1/auth/logout [Authorization: Bearer <token>]
    API->>DB: Increment user.session_version (instant revocation across all devices)
    API-->>Client: HTTP 200 OK { message: "Logged out" }
```

---

## 5. Architectural Evaluation: Monolithic vs. Microservices

In alignment with **Module 5: Microservices and Deployment of Web Services**, this project deliberately evaluates architectural patterns:

| Criterion | Modular Monolith (Implemented) | Microservices Architecture | Rationale for Choice |
|---|---|---|---|
| **Service Decomposition** | Modular domain decomposition inside one process (`auth`, `projects`, `discovery`, `github`). | Independent services across network boundaries (Auth Service, Catalog Service, Notification Service). | Prevents network hop latency and unnecessary distributed complexity for academic capstone scale while keeping clean domain boundaries. |
| **Data Consistency** | ACID relational transactions across projects, votes, and comments in a single database. | Eventual consistency, distributed transactions (Saga pattern), dual-write challenges. | Guarantees atomic anti-duplicate vote constraints and immediate consistency without complex distributed transaction orchestrators. |
| **Operational Overhead** | Single container deployment, unified logging, simple CI/CD. | Multiple container images, Kubernetes, service meshes, distributed tracing. | Extremely cost-effective (strict ₹0 cloud tier compliant), zero operational fragility. |
| **Scaling Characteristics** | Horizontal replication of stateless FastAPI containers behind a load balancer. | Independent scaling of high-traffic endpoints. | The read-heavy catalog pattern scales cleanly via horizontal PaaS replicas and connection pooling. |
