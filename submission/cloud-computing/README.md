# Cloud Computing Submission Package

## Problem and approach

ProjectSpace requires a secure way to serve a frontend, API, relational data, and optional image assets. The current working configuration is local and zero-cost. The repository supplies a cloud-ready AWS design without falsely claiming a deployment.

## Cloud design

The proposed architecture separates React static delivery, FastAPI compute, relational persistence, private object storage, secrets, IAM, health monitoring, and logs. `infra/aws/` contains the reference CloudFormation templates; `ARCHITECTURE.md` and `docs/zero-cost-cloud-plan.md` explain selection and constraints.

## Evidence

- Architecture/security/cost matrix: `../../CLOUD_50_MARKS.md`
- Deployment and recovery: `../../DEPLOYMENT_GUIDE.md`
- Load results: `../../TEST_RESULTS.md`
- Presentation: `../../FINAL_PRESENTATION_SCRIPT.md`
- Viva: `../../CLOUD_VIVA_QUESTIONS.md`

## Honest status

Implemented locally: Docker, environment configuration, S3-aware validated routes, health checks, logs, load tests, and a backup/migration procedure.

Cloud-ready: private S3 and IAM policies, container/database/network/log templates.

Actually deployed: **none**. AWS eligibility and explicit zero-cost approval are pending.
