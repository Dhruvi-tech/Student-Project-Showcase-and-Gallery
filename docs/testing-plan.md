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

### 2. Automated Test Matrix (15 Scenarios)

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
| `test_13` | DB Constraint Enforcement | `IntegrityError` | Directly validates the database-level unique constraint on `(project_id, student_id)`. |
| `test_14` | Tech Stack & Search | `200 OK` | Verifies query filters `tech_stack=React` and `search=...` return matching subsets. |
| `test_15` | Full Lifecycle E2E | `201` -> `200` | Verifies full workflow: Publish -> Browse -> Upvote -> Comment -> Read Details. |

---

### 3. Load Testing Methodology

* **Tooling:** Locust (`loadtests/locustfile.py`) and Async Benchmark (`loadtests/benchmark.py`).
* **Virtual User Behaviors:**
  * 50% Browsing gallery ranked by upvotes.
  * 30% Viewing specific project details and comments.
  * 10% Filtering by tech stack.
  * 5% Upvoting projects (exercising concurrency locks).
  * 5% Posting constructive peer feedback comments.
* **Gradual Load Profiles:**
  * Stage 1: 10 concurrent virtual students.
  * Stage 2: 25 concurrent virtual students.
  * Stage 3: 50 concurrent virtual students.
* **Key Metrics Measured:**
  * Throughput (Requests per Second).
  * Latency Percentiles: P50 (Median), P95, and P99.
  * Error rate / Failure rate (target: < 0.5%).
