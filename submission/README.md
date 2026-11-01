# ProjectSpace Academic Submission Evidence & Presentation Package

## Verified Baseline

The preserved local SQLite database checkpoint contains **320 projects, 20 domains, 120 users, 110 comments, and 374 votes**. The checkpoint is stored outside source code in `artifacts/checkpoints/2026-11-01-pre-implementation/` and was SHA-256 verified before implementation work.

---

## Submission Packages

1. **[Web Services / Full Stack Submission Package](./web-services/README.md)**
   - [Web 50-Mark Evidence Matrix](./web-services/WEB_50_MARKS.md)
   - [Web Viva Questions & Answers](./web-services/WEB_VIVA_QUESTIONS.md)
   - OpenAPI / Swagger documentation (`/docs`)

2. **[Cloud Computing Submission Package](./cloud-computing/README.md)**
   - [Cloud 50-Mark Evidence Matrix](./cloud-computing/CLOUD_50_MARKS.md)
   - [Cloud Architecture & Data Flow](./cloud-computing/CLOUD_ARCHITECTURE.md)
   - [AWS Services Explanation](./cloud-computing/AWS_SERVICES_EXPLANATION.md)
   - [Strict ₹0 Cost Analysis](./cloud-computing/ZERO_COST_ANALYSIS.md)
   - [IAM Security](./cloud-computing/IAM_SECURITY.md)
   - [S3 Storage Implementation](./cloud-computing/S3_IMPLEMENTATION.md)
   - [Docker Deployment Readiness](./cloud-computing/DOCKER_DEPLOYMENT.md)
   - [CloudWatch Monitoring Plan](./cloud-computing/CLOUDWATCH_MONITORING.md)
   - [Cloud Viva Questions & Answers](./cloud-computing/CLOUD_VIVA_QUESTIONS.md)

3. **Presentation & Evaluation Guides**
   - [Presentation Guide](./PRESENTATION_GUIDE.md)
   - [Final Presentation Script](./FINAL_PRESENTATION_SCRIPT.md)
   - [Demonstration Script](./cloud-computing/DEMONSTRATION_SCRIPT.md)
   - [Final Submission Checklist](./FINAL_SUBMISSION_CHECKLIST.md)
   - [Screenshot Checklist](./SCREENSHOT_CHECKLIST.md)
   - [Load & Integration Test Results](./TEST_RESULTS.md)

---

## Web Application Assessment Matrix — 50 Marks

| Area | Evidence in Project | Verification | Status |
|---|---|---|---|
| Frontend and UX (10) | `frontend/src/App.jsx`, `components/`, responsive modern UI | Vite production build | Verified locally |
| Authentication and Authorization (10) | `backend/app/routers/auth.py`, ownership guards in `projects.py` | API tests 22–26 | Verified locally |
| REST API & Business Logic (10) | `backend/app/routers/projects.py`, `services/project_service.py` | API tests 1–29; Swagger at `/docs` | Verified locally |
| Persistence (10) | SQLAlchemy models, additive startup migration, `seed_data.py` | Migration test; data inventory | Verified locally |
| Integration & Testing (10) | Pytest, Vite build, benchmark/Locust tools | Test/build results & local load report | Verified locally |

---

## Cloud Computing Assessment Matrix — 50 Marks

| Area | Evidence in Project | Current Truthful State |
|---|---|---|
| Architecture (10) | `docs/architecture.md`, `docs/zero-cost-cloud-plan.md`, `infra/aws/` | Prepared and documented; no AWS resources claimed |
| Hosting & Deployment (10) | Multi-stage Dockerfiles, Amplify eligibility plan | Local working fallback; AWS deployment pending explicit approval |
| Storage & Database (10) | S3 asset routes, environment config, safe local SQLite | S3 integration prepared, fails safe with 503 when unconfigured |
| Security & Reliability (10) | Sessions, CSRF, PBKDF2 hashing, health endpoint, private S3 template | Verified locally; cloud controls unprovisioned |
| Monitoring, Load & Cost (10) | Locust, benchmark JSON reports, strict ₹0 policy | Local results only; no AWS metrics claimed |

---

## Capture Checklist

1. Gallery showing the 320-project count and the 20 domain controls.
2. Search/filter results for separate AI & ML and Data Science & Analytics categories.
3. Registration, login, profile, publish, detail, comment, and ownership-denied screens.
4. Swagger `/docs` API endpoint list and `/health` response.
5. Terminal output for `python -m pytest backend/tests` and `npm run build`.
6. `artifacts/load-tests/local-benchmark.json` plus terminal benchmark output.
7. AWS Billing Free Tier/Credits page and Amplify eligibility page only after the correct profile/account is accessible.

> **Note:** No screenshot should imply AWS deployment, S3 storage, CloudWatch, or a managed cloud database unless those resources are actually provisioned and independently verified.
