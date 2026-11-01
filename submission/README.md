# ProjectSpace Academic Submission Evidence

## Verified baseline

The preserved local SQLite database checkpoint contains 320 projects, 20 domains, 120 users, 110 comments, and 374 votes. The checkpoint is stored outside source code in `artifacts/checkpoints/2026-11-01-pre-implementation/` and was SHA-256 verified before implementation work.

## Web Application assessment matrix — 50 marks

| Area | Evidence in project | Verification | Status |
|---|---|---|---|
| Frontend and UX (10) | `frontend/src/App.jsx`, `components/`, responsive CSS | Vite production build | Verified locally |
| Authentication and authorization (10) | `backend/app/routers/auth.py`, ownership guards in `projects.py` | API tests 22–26 | Verified locally |
| REST API/business logic (10) | `backend/app/routers/projects.py`, `services/project_service.py` | API tests 1–29; Swagger at `/docs` | Verified locally |
| Persistence (10) | SQLAlchemy models, additive startup migration, `seed_data.py` | migration test; data inventory | Verified locally |
| Integration/testing (10) | Pytest, Vite, benchmark/Locust tools | Test/build results and local load report | In progress: load report |

## Cloud Computing assessment matrix — 50 marks

| Area | Evidence in project | Current truthful state |
|---|---|---|
| Architecture (10) | `docs/architecture.md`, `docs/zero-cost-cloud-plan.md`, `infra/aws/` | Prepared and compared; no AWS resources claimed |
| Hosting/deployment (10) | Dockerfiles, Amplify eligibility plan | Local working fallback; AWS deployment pending account/explicit approval |
| Storage/database (10) | S3 asset routes, environment config, safe local SQLite | S3 integration prepared, not activated |
| Security/reliability (10) | sessions, CSRF, password hashing, health endpoint, private S3 template | Verified locally; cloud controls unprovisioned |
| Monitoring/load/cost (10) | Locust, benchmark JSON reports, zero-cost plan | Local results only; no AWS metrics claimed |

## Capture checklist

1. Gallery showing the 320-project count and the 20 domain controls.
2. Search/filter results for separate AI & ML and Data Science & Analytics categories.
3. Registration, login, profile, publish, detail, comment, and ownership-denied screens.
4. Swagger `/docs` API endpoint list and health response.
5. Terminal output for `python -m pytest backend/tests` and `npm run build`.
6. `artifacts/load-tests/local-benchmark.json` plus terminal benchmark output.
7. AWS Billing Free Tier/Credits page and Amplify eligibility page only after the correct profile/account is accessible.

No screenshot should imply AWS deployment, S3 storage, CloudWatch, or a managed database unless those resources are actually provisioned and independently verified.


