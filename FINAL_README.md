# ProjectSpace — Final Academic Build

ProjectSpace is a React + FastAPI student-project gallery for browsing, publishing, ranking, saving, and discussing projects. The preserved primary SQLite database contains **320 projects across 20 domains**, with accounts, votes, comments, and repository links retained.

## Run locally for the presentation

Open two PowerShell windows from the project root:

```powershell
.\scripts\start-backend.ps1
```

```powershell
.\scripts\start-frontend.ps1
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). API health is at [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health), and interactive Swagger documentation is at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## Verified result

- Pytest: **30 passed** (two third-party deprecation warnings).
- Frontend production build: **passed**.
- Local isolated load test: 10, 25, and 50 virtual users; **100% success rate** at each stage.
- AWS resources created by this work: **none**.

See `PRESENTATION_GUIDE.md`, `TEST_RESULTS.md`, `WEB_50_MARKS.md`, and `CLOUD_50_MARKS.md` for evidence rather than relying on unverified claims.


