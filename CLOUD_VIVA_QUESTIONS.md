# Cloud Computing Viva Questions and Answers

1. **What is the current deployment status?** Local React + FastAPI + SQLite is verified; no AWS resource has been created or claimed.
2. **Why no AWS deployment?** The strict ₹0 requirement requires account-plan, credit, and overage verification before any billable-risk resource.
3. **What does cloud-ready mean here?** Dockerfiles, Compose, configuration through environment variables, S3-aware routes, AWS templates, health checks, and deployment documentation exist.
4. **What is IaaS in this context?** A self-managed VM such as EC2; it gives control but would add administration and possible cost.
5. **What is PaaS/CaaS here?** Managed container execution such as ECS/Fargate; it reduces operations but is not approved under ₹0.
6. **What is SaaS used for?** GitHub provides source hosting and collaboration as an external software service.
7. **Why was Amplify considered?** It can host a static React frontend, but the allowance and account eligibility must be confirmed first.
8. **Why cannot Amplify alone host the app?** A public frontend cannot reach a laptop's localhost FastAPI backend; it would not be a complete hosted system.
9. **What is S3 used for?** Optional private project-image storage with validated uploads and temporary presigned retrieval.
10. **How are uploads validated?** The API checks allowed image MIME/signature and size before sending an object to configured storage.
11. **How is S3 secured?** The intended bucket is private, encrypted, blocks public access, and grants a task role only object access under `projects/*`.
12. **What is IAM least privilege?** Giving each identity only the actions/resources it needs, rather than broad account permissions.
13. **Where should secrets be stored?** In local environment/profile configuration or a managed secret store, never in code, frontend bundles, or Git.
14. **What is the health endpoint?** `/health` checks API/database availability and supports monitoring or load-balancer probes.
15. **What logging exists?** Application/database logs go to standard output; the AWS template maps container logs to CloudWatch when provisioned.
16. **What did load testing show?** Isolated local Locust stages at 10, 25, and 50 users had zero reported failures; results are not cloud performance claims.
17. **Why use a disposable load-test database?** The load scripts write votes/comments, so isolation protects real catalog and user data.
18. **How would SQLite migrate safely?** Back up first, import a copy to a non-production PostgreSQL target, compare counts/IDs/links, test workflows, then obtain approval before cutover.
19. **What services would cost money?** ALB, Fargate, RDS, public IPv4, NAT, and related usage can incur ongoing charges.
20. **What is the recommended future architecture?** Private S3/CloudFront frontend, FastAPI containers, managed PostgreSQL, Secrets Manager, IAM roles, health checks, logs, and monitored budgets—only after cost approval.
