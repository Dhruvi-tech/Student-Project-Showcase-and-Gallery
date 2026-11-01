# Deployment and Zero-Cost Guide

## Verified local deployment

Use the two scripts in `scripts/`. They force the backend to use the preserved root `showcase.db`, then Vite proxies browser API calls to FastAPI.

```powershell
.\scripts\start-backend.ps1
.\scripts\start-frontend.ps1
```

## Cloud readiness

The repository includes container builds and AWS templates but does not deploy them automatically. Under the ₹0 rule, do **not** deploy `infra/aws/projectspace.yaml`: it includes recurring-cost resources.

Before considering Amplify, run the read-only identity check using a working configured profile, inspect Billing/Free Tier/Credits, then show the following for approval: service configuration, estimated use, allowance, price after allowance, removal path, and residual cost risk. No credentials belong in source files, browser configuration, or Git.

## Recovery

The verified pre-implementation backup is in `artifacts/checkpoints/2026-11-01-pre-implementation/`. Restore only with explicit user direction; the normal workflow does not overwrite either database.


