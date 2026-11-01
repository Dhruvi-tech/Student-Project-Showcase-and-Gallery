# Presentation Guide

## Suggested 8-minute flow

1. Open the gallery and show the 320-project total, search, sorting, and 20 domain filters.
2. Filter **AI & Machine Learning** and then **Data Science & Analytics** to show that they are distinct.
3. Open a project detail view, follow its repository link, save it, vote, and add a feedback comment.
4. Register a new account, log in, publish a project, then show that only its owner can edit/delete it.
5. Open `/docs` and demonstrate REST endpoints plus `/health`.
6. Show terminal proof in `TEST_RESULTS.md` and the load report in `artifacts/load-tests/local-benchmark.json`.
7. Present the zero-cost cloud diagram and explain that no AWS resources were created because account eligibility and billable-risk approval are pending.

## Honest cloud statement

The application is cloud-ready, with Docker, S3-compatible asset routes, IAM/scoped-storage infrastructure templates, and a zero-cost Amplify investigation. It is **not AWS-deployed**. The working presentation configuration is local React + FastAPI + SQLite; it must not be described as an AWS-hosted backend.

## Evidence to open

- `ARCHITECTURE.md`
- `DEPLOYMENT_GUIDE.md`
- `WEB_50_MARKS.md`
- `CLOUD_50_MARKS.md`
- `SCREENSHOT_CHECKLIST.md`


