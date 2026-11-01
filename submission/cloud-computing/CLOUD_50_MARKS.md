# Cloud Computing — Verified 50-Mark Evidence Matrix

| Criterion | Implementation / evidence | Truthful current status |
|---|---|---|
| Architecture & service selection — 10 | `infra/aws/projectspace.yaml`, `infra/aws/ecr.yaml`, diagrams in `ARCHITECTURE.md` | Designed and inspected; not provisioned |
| Hosting & deployment — 10 | Dockerfiles, Compose, local startup scripts, Amplify zero-cost assessment | Local deployment verified; AWS deployment pending eligibility and approval |
| Storage & database — 10 | Optional S3 upload/download routes, private-bucket/IAM template, SQLite backup/migration procedure | Prepared; S3/RDS not created |
| Security & reliability — 10 | sessions, CSRF, hashing, CORS config, health check, private S3 policies, Secrets Manager template | Local controls verified; cloud controls unprovisioned |
| Monitoring, load & cost — 10 | health endpoint, structured benchmark, Locust script, ₹0 plan/cost gate | Local measurements verified; no CloudWatch metrics or AWS billing data available |

The evidence supports a cloud-ready academic implementation. Do not claim managed AWS hosting, S3 storage, CloudWatch monitoring, or free-tier eligibility until the correct AWS profile is available and approval is granted.
