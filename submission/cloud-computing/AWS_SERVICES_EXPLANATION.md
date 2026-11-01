# AWS Service Selection

| Service | Intended use | Cost risk | Current status |
|---|---|---|---|
| IAM | Role/policy access control | Standard IAM features have no separate charge | Policy evidence only |
| S3 | Private project image storage | Storage/request/transfer usage charges possible | API integration prepared; no bucket verified |
| CloudWatch | Container logs/metrics/dashboard | Ingestion, retention, metrics, alarms can cost | JSON/template only |
| Amplify | Static frontend hosting | Allowance/overage account dependent | Not deployed |
| ECS/Fargate | Backend containers | Billable runtime | Not provisioned |
| RDS | Managed PostgreSQL | Billable instance/storage/backup | Not provisioned |
| ALB | HTTPS API ingress | Billable hourly/LCU | Not provisioned |
| NAT Gateway | Private-subnet outbound traffic | Billable hourly/data | Not provisioned |

The large reference template remains academic evidence only; it must not be deployed under the strict ₹0 policy.
