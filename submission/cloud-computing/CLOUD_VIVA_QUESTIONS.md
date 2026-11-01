# 25 Cloud Computing Viva Questions

1. **What is deployed?** Local React, FastAPI, and SQLite only; no AWS resource.
2. **Why no AWS deployment?** ₹0 requires verified eligibility and approval before charge risk.
3. **What is cloud-ready?** Docker, config, S3-aware API, IAM policy, health, logs, templates.
4. **What is IaaS?** Virtualized infrastructure such as a VM, with more operational responsibility.
5. **What is PaaS/CaaS?** Managed runtime/container platforms that reduce server operations.
6. **What is SaaS here?** GitHub provides managed source collaboration.
7. **Why use environment variables?** They separate deploy-time configuration from source code.
8. **Why avoid access keys in code?** They are long-lived secrets and can be leaked.
9. **What is an IAM role?** A temporary assumable identity for a service/workload.
10. **What is least privilege?** Only the minimum required actions and resources are allowed.
11. **Which S3 actions are needed?** Put/GetObject only under the application's `projects/*` prefix.
12. **Why private S3 objects?** They avoid public exposure of uploaded student files.
13. **How are downloads protected?** A short-lived presigned URL is generated after key validation.
14. **Why validate file signatures?** MIME declarations alone can be falsified.
15. **Why cap upload size?** It limits resource abuse and unexpected storage cost.
16. **What happens without S3?** The API returns a safe 503 rather than pretending storage works.
17. **What is a health check?** A lightweight endpoint used to confirm service/database availability.
18. **What logs are emitted?** Safe structured request method/path/status/duration records.
19. **What is not logged?** Bodies, cookies, query strings, passwords, tokens, and secrets.
20. **What is CloudWatch here?** Future compatible logging/dashboard evidence; not provisioned.
21. **Why use a disposable load database?** Tests write engagement data and must not alter preserved records.
22. **What did Locust prove?** Local behavior at 10, 25, and 50 users with zero reported failures.
23. **Why is Locust not AWS evidence?** It ran on a local machine, not managed cloud infrastructure.
24. **How would migration be safe?** Backup, test-copy import, count/ID/link comparison, workflow verification, approval.
25. **What can introduce charges?** S3 usage, CloudWatch ingestion, compute, databases, ingress, network, and data transfer.


