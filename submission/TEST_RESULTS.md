# Actual Test Results

## Automated API and migration tests

Command: `python -m pytest backend/tests`

Result: **30 passed** in 2.17 seconds on the final verification run. Two Starlette deprecation warnings were emitted for HTTP 422 naming; there were no test failures.

Coverage includes health, CRUD, validation, list/search/filter/sort, comments, duplicate-vote prevention, vote direction changes, account registration/login/logout, CSRF, owner-only update/delete, production identity protection, asset validation, bookmarks, recommendations, and additive database migration.

## Frontend production build

Command: `npm run build` from `frontend/`.

Result: **passed** using Vite 5.4.21. The production bundle was generated successfully.

## Local performance benchmark

Target: disposable database copy at `http://127.0.0.1:8010`; this was not an AWS service and did not modify the primary database.

| Virtual users | Requests | Throughput | P50 | P95 | P99 | Success | Errors |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 10 | 40 | 23.0 req/s | 172.60 ms | 1140.07 ms | 1244.53 ms | 100% | 0 |
| 25 | 100 | 23.9 req/s | 140.40 ms | 3647.17 ms | 4068.37 ms | 100% | 0 |
| 50 | 200 | 24.1 req/s | 1361.88 ms | 4653.66 ms | 6064.27 ms | 100% | 0 |

The 50-user latency shows the expected limits of a single local Python/SQLite demonstration process. The result is not presented as a cloud performance claim. Machine-readable evidence: `artifacts/load-tests/local-benchmark.json`.

## Locust load stages

Short headless Locust stages were also executed against the same disposable database copy. CSV evidence is in `artifacts/load-tests/locust-10_stats.csv`, `locust-25_stats.csv`, and `locust-50_stats.csv`.

| Virtual users | Requests | Failures | Median | Average | Throughput |
|---:|---:|---:|---:|---:|---:|
| 10 | 44 | 0 | 120 ms | 214.05 ms | 6.88 req/s |
| 25 | 91 | 0 | 340 ms | 569.25 ms | 15.01 req/s |
| 50 | 138 | 0 | 1100 ms | 1255.62 ms | 22.73 req/s |

These runs include mixed browsing, filtering, health, recommendation, bookmark, vote, comment, and preference requests. They are local laptop results, not cloud-hosted performance evidence.

## Test-data safety

`python test_data.py cleanup --confirm` was run against the disposable benchmark database after testing. It removed exactly 60 marker-prefixed test projects and 25 marker-prefixed test users. The primary `showcase.db` was not targeted and its hash remained unchanged during cleanup.

## Data preservation check

After final startup verification, the current primary database was compared against the pre-implementation checkpoint. Both contain 320 projects, 120 students, 110 comments, 374 votes, and 20 categories. There are zero missing/new project IDs, zero missing student IDs, and zero missing GitHub links. The database file hash changed because the application's existing additive startup migration writes schema/index metadata; the record-level comparison above confirmed preservation.
