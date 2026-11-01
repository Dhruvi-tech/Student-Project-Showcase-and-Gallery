# Monitoring, Logging, and Troubleshooting

FastAPI now emits structured JSON-compatible request completion events with request ID, method, path, status code, and duration. It never logs request bodies, cookies, query strings, passwords, session tokens, or AWS credentials. Unhandled failures are logged with the same safe request context.

The existing `/health` endpoint is the local readiness/liveness check. `infra/aws/cloudwatch-dashboard.json` is a non-deployed dashboard template with placeholders; importing it or creating alarms requires separate approval because CloudWatch use can incur charges.

Troubleshoot locally: inspect stdout logs, call `/health`, verify `DATABASE_URL`, confirm `S3_BUCKET_NAME` is intentionally empty for local runs, and use `/docs` for contract checks. CloudWatch logs do not currently exist.


