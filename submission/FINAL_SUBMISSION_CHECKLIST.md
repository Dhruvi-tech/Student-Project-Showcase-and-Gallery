# Final Submission Checklist

## Web Services package

- [x] React gallery, 320-project data, 20-domain discovery, search, sort, details, publishing, profiles, saved projects, and recommendations.
- [x] Account registration/login/logout, PBKDF2 password hashing, signed sessions, CSRF, validation, and owner-only edits/deletes.
- [x] FastAPI CRUD, votes, comments, OpenAPI/Swagger, health endpoint, and persistence.
- [x] Backend verification: 30 passed.
- [x] Frontend production build passed.

## Cloud Computing package

- [x] Docker, Docker Compose, AWS reference templates, S3-ready validated asset routes, health checks, logging, IAM design, migration/backup plan.
- [x] Actual local async benchmark and Locust 10/25/50-user evidence.
- [x] Strict zero-cost assessment and truthful AWS deployment status.
- [ ] AWS account/free-tier eligibility verification — blocked because the configured `projectspace` profile is not visible in this session.
- [ ] AWS deployment — intentionally not attempted; no cloud resource exists.

## Safety and release

- [x] Final database backup created at `artifacts/checkpoints/2026-11-01-final-submission/` (ignored by Git).
- [x] Primary data count verified: 320 projects, 120 users, 110 comments, 374 votes, 20 categories.
- [x] No database, `.env`, credential, or load-test artifact is staged for release.
- [x] Release branch: `main`; do not force-push.

## Live presentation

1. Start backend: `./scripts/start-backend.ps1`.
2. Start frontend in a second PowerShell window: `./scripts/start-frontend.ps1`.
3. Open `http://127.0.0.1:5173`; Swagger is `http://127.0.0.1:8000/docs`.
4. Follow [FINAL_PRESENTATION_SCRIPT.md](FINAL_PRESENTATION_SCRIPT.md).


