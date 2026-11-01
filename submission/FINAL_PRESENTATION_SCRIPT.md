# Final Presentation Script

## Before the presentation

In PowerShell window 1:

```powershell
.\scripts\start-backend.ps1
```

In PowerShell window 2:

```powershell
.\scripts\start-frontend.ps1
```

Open `http://127.0.0.1:5173`. Do not use an existing account password; create a new presentation account through the registration form.

## 10-minute walkthrough

1. **Overview (1 min):** “ProjectSpace is a React and FastAPI platform for showcasing student projects and receiving peer feedback. The preserved catalog has 320 projects in 20 domains.”
2. **Discovery (2 min):** Search `phishing`, select Cybersecurity, then show AI & Machine Learning and Data Science & Analytics separately. Change sorting from popularity to newest.
3. **Project details (1 min):** Open a project, show description, author, category, repository link, votes, comments, and save action.
4. **Account security (1 min):** Register a fresh account, log in, and show profile editing. Explain PBKDF2 hashing, signed HttpOnly sessions, CSRF, and server-side ownership checks.
5. **Publishing (1 min):** Publish a short project with a valid repository URL; edit only that project. Explain that another user's project cannot be changed.
6. **REST API (1 min):** Open `http://127.0.0.1:8000/docs`, show `/health`, project CRUD, comments, and vote endpoints.
7. **Persistence/testing (1 min):** Refresh the gallery and show the item/comment remains. Open `TEST_RESULTS.md`: 30 tests passed, build passed, and isolated load tests had zero failures.
8. **Cloud (2 min):** Show `ARCHITECTURE.md` and `docs/zero-cost-cloud-plan.md`. State: “The app is cloud-ready with Docker, S3 integration, least-privilege IAM design, and AWS templates. No AWS resource is deployed because the requirement is ₹0 and account eligibility must be verified first.”

## Exact evidence files

- Web: `WEB_50_MARKS.md`, `TEST_RESULTS.md`, `WEB_VIVA_QUESTIONS.md`
- Cloud: `CLOUD_50_MARKS.md`, `ARCHITECTURE.md`, `DEPLOYMENT_GUIDE.md`, `CLOUD_VIVA_QUESTIONS.md`
- Screenshots: `SCREENSHOT_CHECKLIST.md`


