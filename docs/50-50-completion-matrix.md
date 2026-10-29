# ProjectSpace 50:50 Completion Matrix

Audit date: 2026-10-29. Each track has five criteria worth 10 points apiece. Scores reflect code and tests actually inspected or run in this workspace. A passing local test does not count as an AWS deployment.

## Track A — Web Services and Full-Stack Application (50 points)

| Criterion | Requirements | Implementation | Tests performed and actual result | Status | Score / 10 | Remaining issues |
|---|---|---|---|---|---:|---|
| A1. Frontend and user experience | Responsive gallery, navigation, filters, sorting, 20 domains, discovery, loading/error/empty states, project/profile details | `frontend/src/App.jsx`; `frontend/src/components/`; `frontend/src/constants/catalog.js`; `frontend/src/styles/App.css` | `npm run build` passed: Vite 5.4.21 transformed 1,967 modules. Manual desktop browser inspection showed API Active, live 120-project count, 20 domains, technology filters, attribution and project cards. Mobile, keyboard, and screen-reader audits were not run. | IMPLEMENTED — NOT VERIFIED | 8 | Responsive behavior and accessibility still need targeted QA. Dedicated category landing pages are represented by filters/discovery views. |
| A2. Authentication and authorization | Registration, login/logout, hashed passwords, signed sessions, CSRF, profile, owner-protected mutations | `backend/app/routers/auth.py`; `backend/app/routers/projects.py`; `backend/app/models/student.py`; `frontend/src/components/AuthModal.jsx`; `frontend/src/components/ProfileEditModal.jsx` | API tests verify registration/login/logout, PBKDF2 password hashing, CSRF profile update, production rejection of demo identity, and owner-only edit/delete. Included in the passing 30-test API suite. | IMPLEMENTED — NOT VERIFIED | 8 | No account recovery/email verification or automated real-browser auth workflow; production still requires a unique secret and exact CORS configuration. |
| A3. REST API and business logic | Compatible project routes, CRUD, search/filter/sort, metadata, comments, recommendations, preferences, bookmarks, unique vote constraint | `backend/app/routers/`; `backend/app/services/project_service.py`; `backend/app/catalog.py`; `backend/app/models/project_vote.py` | `python -m pytest backend/tests/test_api.py -q`: 29 passed, 2 Starlette deprecation warnings. Covers core API, auth/ownership, 20-category catalog, metadata/search/recommendations/assistant, bookmarks, and vote uniqueness. | VERIFIED | 9 | No rate limiting; legacy endpoints still support demo identity when demo mode is enabled. |
| A4. Database and persistence | Existing data preservation, relationships, uniqueness, additive upgrades, persistent records | `backend/app/models/`; `backend/app/database.py`; `backend/tests/test_migrations.py`; local `showcase.db` | `python -m pytest backend/tests/test_migrations.py -q`: 1 passed; migration ran twice on a legacy SQLite fixture and preserved project/link/vote rows. Existing local DB comparison preserved 30 original project IDs/links, 110 student IDs, 374 legacy likes, and 110 comments; current DB has 120 projects and 120 students. | VERIFIED | 8 | No Alembic revision history; local DB is SQLite; PostgreSQL and restart persistence against an actual running deployment were not verified. |
| A5. Integration and testing | Frontend build, backend suite, migration test, startup, database and representative workflows | `frontend/src/services/api.js`; `backend/tests/`; `backend/seed_data.py`; `loadtests/` | Final `npm run build` passed; combined pytest run passed 30 tests; `python -m compileall -q backend` passed. Previous local API and Vite health/list checks returned HTTP 200. Locust was not run. | IMPLEMENTED — NOT VERIFIED | 8 | Automated browser-to-database end-to-end test, restart persistence, Docker Compose, and load measurements remain unverified. |
| **Track A total** | **50 points available** | **Single integrated ProjectSpace app** | **Verified local implementation; limitations above remain** | **IN PROGRESS** | **41 / 50** | **82%** |

## Track B — AWS Cloud Implementation (50 points)

| Criterion | Requirements | Implementation / AWS resources | Tests performed and actual result | Status | Score / 10 | Remaining issues |
|---|---|---|---|---|---:|---|
| B1. Compute and hosting | Deploy the actual app, container registry/compute, static hosting/CDN, HTTPS endpoints | `infra/aws/ecr.yaml`; `infra/aws/projectspace.yaml`; backend/frontend Dockerfiles; no deployed resources | `aws sts get-caller-identity` failed with `InvalidClientTokenId`. Template YAML parses locally, but CloudFormation validation and endpoint tests were not possible. | BLOCKED | 0 | Restore AWS role access, validate template and existing resources, prepare/review a numeric estimate, approve billable provisioning, then deploy and verify test environment. |
| B2. Object storage | Private S3 image storage, upload/retrieval, least-privilege IAM | API S3 integration plus private asset bucket and scoped task role defined in `infra/aws/projectspace.yaml`; resources not created | `test_25_image_upload_validates_signature_and_requires_bucket` passed invalid-image and missing-bucket checks. No real bucket or role exists. | IMPLEMENTED — NOT VERIFIED | 4 | Provision approved bucket and task role; verify upload, signed retrieval, and cleanup. |
| B3. Managed database | Private managed PostgreSQL, migrations, backups, persistence/recovery | SQLAlchemy app and private encrypted RDS, subnet group, secrets/backups defined in `infra/aws/projectspace.yaml`; no RDS resource | Local SQLite migration and API tests passed. AWS identity failure prevented RDS connectivity/backup checks. | IMPLEMENTED — NOT VERIFIED | 2 | Provision approved RDS and secret, apply schema safely, verify persistence and restore. |
| B4. Security and reliability | HTTPS, least-privilege IAM, secrets, restricted network, health checks, rate limits | Local auth/session/CSRF/health plus ALB TLS, scoped task IAM, private database security group, Secrets Manager, and task ingress defined in template; no cloud resource deployed | Local auth/ownership/health tests passed. Cloud security and HTTPS were not tested. | IMPLEMENTED — NOT VERIFIED | 3 | Deploy and verify networking, TLS/DNS, IAM, secret handling, rate limiting, and failure behavior. |
| B5. Monitoring and cost management | Logs/metrics/alarms, scaling, controlled load, inventory, backup/recovery/cost plan | `loadtests/`; `docs/aws-deployment.md`; template log retention and Container Insights; no CloudWatch alarms or autoscaling policy | Load scripts exist but were not executed. Resource inventory and cost assumptions are documented; no numeric calculator run or account inventory is available. | BLOCKED | 2 | Restore access; run a regional calculator estimate, configure alarms/autoscaling, run controlled load and recovery checks after approval. |
| **Track B total** | **50 points available** | **No AWS deployment** | **Cloud evidence is blocked; no AWS actions were taken** | **BLOCKED** | **11 / 50** | **22%** |

## Overall

| Web application | AWS/cloud | Overall |
|---:|---:|---:|
| **41 / 50** | **11 / 50** | **52 / 100** |

The target is not achieved. Points are not awarded for planned cloud resources. No deploy, production change, commit, or push occurred.

## Evidence

- `npm run build` — passed on 2026-10-29 (Vite 5.4.21; 1,967 modules).
- `python -m pytest backend/tests/test_api.py backend/tests/test_migrations.py -q` — **30 passed, 2 deprecation warnings**.
- `python -m compileall -q backend` — passed.
- `infra/aws/ecr.yaml` and `infra/aws/projectspace.yaml` — parsed as YAML locally; this is not CloudFormation validation and does not establish deployability.
- Existing local database before/after comparison: all 30 prior project IDs and GitHub links, all 110 prior student IDs, all 374 prior upvote rows, and all 110 prior comment IDs were preserved. Current catalog: 120 projects, 120 students, 20 populated categories. Added records are labeled fictional samples and have no invented repository/demo links.
- Previous local live smoke checks: backend `/health`, category catalog, technologies, project listing, recommendations, and Vite root returned HTTP 200. These were local checks, not AWS evidence.
- `aws sts get-caller-identity` — `InvalidClientTokenId`; no account identity or resources could be inspected.
- Docker Compose could not be exercised because the installed Docker CLI reports `docker compose` is unavailable.
- Locust and mobile/accessibility browser testing were not run; no performance measurements are claimed. Desktop UI was visually inspected in the local browser.
