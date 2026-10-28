# Requirements Analysis & Specifications (Session 35)
## Course: CS3452 — Cloud Platforms and Service Models
### Project: Student Project Showcase and Peer Gallery API

---

### 1. Problem Domain & Context
In tertiary education, students develop substantial software applications, research implementations, and cloud configurations across their academic semesters. However, these assets remain fragmented across private GitHub accounts, local drives, or ephemeral lab environments.

There exists no unified platform to:
1. **Showcase Projects:** Provide a central gallery indexing student engineering portfolios.
2. **Peer Review & Feedback:** Enable structured, constructive critique and Q&A between student peers.
3. **Merit-Based Recognition:** Surface popular, high-quality projects via community upvotes.
4. **Fair Democratic Ranking:** Prevent vote gaming and sybil voting by enforcing a strict **single-vote constraint per student**.

---

### 2. Stakeholder & Actor Profiles

| Actor | Role | Actions & Privileges |
|---|---|---|
| **Student Creator** | Author of academic project | Publishes projects with Title, Description, GitHub repo, live demo URL, and tech stacks. |
| **Student Peer / Reviewer** | Student evaluator | Browses projects gallery, searches, filters by tech stacks, upvotes projects once, and submits feedback comments. |
| **Recruiter / Faculty** | Academic evaluator / Talent scout | Discovers top-ranked student talent, reviews source repositories, and validates live demonstrations. |
| **Cloud Monitor** | Automated orchestrator / Load balancer | Probes `/health` to verify container liveness, database latency, and readiness for incoming traffic. |

---

### 3. Functional Requirements (FR)

* **FR-01: Publish Project (`POST /api/v1/projects`)**
  * Submits project metadata including `title`, `description`, `github_link`, `demo_url`, and `tech_stacks`.
  * Validates inputs (title minimum 2 characters; URL schemas).
  * Persists in PostgreSQL / database and returns `201 Created` with a unique ID prefixed with `prj_`.
* **FR-02: Ranked Gallery Listing (`GET /api/v1/projects?sort=upvotes`)**
  * Returns JSON collection of student projects.
  * Defaults to sorting by `upvote_count` descending (popularity ranking).
  * Supports alternative sort: `sort=newest` (creation date descending).
  * Supports filtering by `tech_stack` and text query search across title and description.
  * Supports pagination limits and offsets.
* **FR-03: Exclusive Like or Dislike (`POST /api/v1/projects/{id}/upvote` and `/downvote`)**
  * Allows an identified student to like or dislike a project.
  * **Strict Constraint:** A student has one current reaction per project; choosing the opposite reaction switches the choice and adjusts both counters.
  * Duplicate attempts for the already-selected reaction return `409 Conflict` with current counts.
  * Each reaction table has a database-level unique constraint on `(project_id, student_id)`.
* **FR-04: Peer Feedback / Comments (`POST /api/v1/projects/{id}/comments`)**
  * Accepts constructive feedback text (up to 1,000 characters).
  * Rejects empty or whitespace-only submissions.
  * Associates comments with target project and student author.
  * Stores whether new feedback is positive or an improvement suggestion.
  * Returns `201 Created` with unique ID prefixed with `cmt_`.
* **FR-05: Health & Observability Probe (`GET /health`)**
  * Returns `200 OK` when service and database are operational.
  * Reports database engine, connectivity state, and query latency in milliseconds.
* **FR-06: Interactive API Documentation**
  * Auto-generates OpenAPI 3.0 specification at `/docs` (Swagger UI) and `/redoc`.

---

### 4. Non-Functional Cloud Requirements (NFR)

* **NFR-01: Statelessness (12-Factor App)**
  * The API backend retains zero session state in local memory or temporary filesystem. All state is maintained in PostgreSQL.
* **NFR-02: Horizontal Scalability**
  * Multiple container replicas of the FastAPI application can run concurrently behind a cloud load balancer without race conditions on upvotes.
* **NFR-03: Data Consistency & Concurrency Protection**
  * Atomically updates vote counters and enforces unique composite keys at the database engine level.
* **NFR-04: Cloud Portability**
  * Configuration is strictly externalized via environment variables (`.env`), allowing identical execution on local workstations, Docker Compose, AWS App Runner, Azure App Service, or GCP Cloud Run.
