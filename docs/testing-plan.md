# Testing & Quality Assurance Plan (Session 43)
## Course: CS3452 — Cloud Platforms and Service Models
### Project: Student Project Showcase and Peer Gallery API

---

### 1. Test Strategy Overview

Quality assurance for the Showcase API is divided into three tiers:
1. **Unit & Integration Testing:** Automated Pytest suite verifying endpoint status codes, JSON payload schemas, database transactions, and constraint safety.
2. **End-to-End Workflow Testing:** Complete full-stack verification ensuring the React frontend communicates with the FastAPI backend without mocked arrays.
3. **Performance & Concurrency Load Testing:** Locust and concurrent Python benchmarks simulating gradual virtual student traffic (10, 25, 50 users).

---

### 2. Automated Test Matrix (29 API Scenarios + 1 Migration Test)

| Test ID | Test Scenario | Expected Status | Validation Logic |
|---|---|---|---|
| `test_01` | Cloud Health Probe | `200 OK` | Verifies `/health` returns healthy status, database connectivity flag, and latency metrics. |
| `test_02` | Project Creation Success | `201 Created` | Validates ID format `prj_...`, title, upvote_count=0, and ISO timestamp. |
| `test_03` | Invalid Project Input | `422 Unprocessable` | Rejects empty or whitespace-only project titles. |
| `test_04` | Project Listing Schema | `200 OK` | Verifies response contains `data` array, `total` count, and `sort` parameter. |
| `test_05` | Popularity Ranking Sort | `200 OK` | Verifies projects are sorted in strict descending order of `upvote_count`. |
| `test_06` | Newest Submissions Sort | `200 OK` | Verifies `sort=newest` orders records by creation timestamp descending. |
| `test_07` | Upvote Increment | `200 OK` | Confirms casting a vote increments `upvote_count` by 1 and returns `voted: true`. |
| `test_08` | Single-Vote Constraint | `409 Conflict` | Prevents the same student from upvoting the same project twice. |
| `test_09` | Multi-Student Upvotes | `200 OK` | Confirms distinct students can each successfully upvote the same project. |
| `test_10` | Add Comment Success | `201 Created` | Verifies ID format `cmt_...`, project association, and content persistence. |
| `test_11` | Invalid Comment Input | `422 Unprocessable` | Rejects empty or whitespace-only comments. |
| `test_12` | Nonexistent Project | `404 Not Found` | Rejects upvotes and comments on nonexistent project IDs. |
| `test_13` | Legacy vote table constraint | `IntegrityError` | Directly validates the legacy table's unique constraint during compatibility migration. |
| `test_14` | Tech Stack & Search | `200 OK` | Verifies query filters `tech_stack=React` and `search=...` return matching subsets. |
| `test_15` | Full Lifecycle E2E | `201` -> `200` | Verifies full workflow: Publish -> Browse -> Upvote -> Comment -> Read Details. |
| `test_16` | Persisted dislike status | `200 OK` | Confirms a dislike is stored and returned for the selected demo identity. |
| `test_17` | Switch vote direction | `200 OK` | Verifies switching like/dislike keeps counters consistent. |
| `test_18` | Duplicate dislike | `409 Conflict` | Rejects a second dislike by the same identity. |
| `test_19` | Remove vote and typed feedback | `200` / `201` | Removes the vote and persists a typed comment. |
| `test_20` | Domain filter and create response | `200` / `201` | Filters AI/ML and Data Science independently and returns category on creation. |
| `test_21` | Technology search and combined filters | `200 OK` | Searches a technology tag and combines it with a category and sort. |
| `test_22` | Account lifecycle | `201` / `200` / `401` | Registers an account, verifies password hashing, updates profile with CSRF, logs out, and validates login errors. |
| `test_23` | Demo project ownership | `403` / `200` / `204` | Restricts update/deletion to the owner in demo mode. |
| `test_24` | Production identity guard | `401` | Rejects spoofed demo identity when demo mode is disabled. |
| `test_25` | Image validation and storage configuration | `415` / `503` | Rejects false image signatures and reports unconfigured S3. |
| `test_26` | Authenticated ownership and identity spoofing | `201` / `403` | Ensures a signed-in account owns its project regardless of supplied student header. |
| `test_27` | 20-category catalog, metadata, intent search, recommendations, writing suggestions | `200` / `201` | Verifies distinct categories, persisted project metadata, local search expansion, explainable matching interests, and non-fabricating helper output. |
| `test_28` | Persistent idempotent bookmarks | `201` / `200` | Saves a project once, lists it, checks saved status, then removes it. |
| `test_29` | Cross-direction vote uniqueness | `IntegrityError` | A single database unique key rejects a second vote row even when its direction differs. |
| `test_migrations` | Additive migration and restart idempotency | pass | Runs startup migration twice on a temporary legacy SQLite DB, preserves project data, consolidates old like/dislike rows, and checks new persistence tables. |

---

### 3. Load Testing Methodology

* **Tooling:** Locust (`loadtests/locustfile.py`) and Async Benchmark (`loadtests/benchmark.py`).
* **Virtual User Behaviors:** gallery browse, technology filters, natural-language intent searches, project detail views, recommendations, category follows, bookmark add/remove, local description suggestions, health checks, votes, and comments. Login can be exercised against a disposable local account with `PROJECTSPACE_LOADTEST_USER` and `PROJECTSPACE_LOADTEST_PASSWORD`.
* The Locust script performs writes and creates persistent test activity; only run it against a disposable local/test database, never production.
* **Gradual Load Profiles:**
  * Stage 1: 10 concurrent virtual students.
  * Stage 2: 25 concurrent virtual students.
  * Stage 3: 50 concurrent virtual students.
* **Key Metrics Measured:**
  * Throughput (Requests per Second).
  * Latency Percentiles: P50 (Median), P95, and P99.
  * Error rate / Failure rate (target: < 0.5%).

Latest local run (2026-10-29): **29 API tests passed** with 2 Starlette deprecation warnings; **1 additive migration test passed**. The Vite production build passed and local frontend/backend endpoints responded with HTTP 200. Locust/benchmark scripts have not been executed; no load or performance results are claimed.
