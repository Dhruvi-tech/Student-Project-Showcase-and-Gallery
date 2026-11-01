# Web Application — Verified 50-Mark Evidence Matrix

| Criterion | Implementation | Evidence / test | Verified status |
|---|---|---|---|
| Frontend & UX — 10 | React gallery, responsive cards/modals, search, 20 domain filters, sort, detail, publish, profiles, saved/recommended views, loading/error/empty states | `frontend/src/App.jsx`, `components/`, production build | Strong local evidence |
| Authentication & authorization — 10 | PBKDF2 password hashing, signed HttpOnly sessions, CSRF, authenticated owner guards | `backend/app/routers/auth.py`, tests 22–26 | Passed |
| REST API & business logic — 10 | Project CRUD, list/detail, comments, up/down votes, duplicate prevention, Swagger | `routers/projects.py`, `project_service.py`, `/docs`, tests 1–29 | Passed |
| Database & persistence — 10 | SQLite/SQLAlchemy models, foreign keys/unique constraints, additive migration, preserved data checkpoint | `models/`, `database.py`, migration test, checkpoint count | Passed |
| Integration & testing — 10 | API tests, frontend build, isolated 10/25/50 benchmark | `TEST_RESULTS.md`, JSON report | Passed locally |

Suggested evidence score: demonstrate each row live and let the evaluator assign marks. The matrix records evidence, not a self-awarded score.
