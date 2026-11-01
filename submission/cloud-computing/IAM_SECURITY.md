# IAM Security

An IAM **user** represents a human or long-lived workload identity. An IAM **role** is assumed temporarily by an AWS service or federated identity. An IAM **policy** defines permitted actions/resources. Production containers should use a task role, not embedded access keys.

`infra/aws/iam-s3-task-policy.json` grants only `s3:PutObject` and `s3:GetObject` under `projects/*`; its bucket placeholder must be replaced only after approval. It intentionally grants no list, delete, bucket-policy, IAM, or administrator actions. Never commit access keys or attach `AdministratorAccess` for this app.
