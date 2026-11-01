# Cloud Architecture and Data Flow

```mermaid
flowchart LR
  B[Browser] --> F[React static frontend]
  F --> A[FastAPI REST API]
  A --> D[(SQLite locally / PostgreSQL after approved migration)]
  A -. optional private objects .-> S[S3]
  A --> L[Structured stdout logs]
  L -. after approved deployment .-> C[CloudWatch Logs]
```

Local implementation is React + FastAPI + SQLite. Cloud-ready components are Docker, environment configuration, health checks, private S3-capable routes, scoped IAM policy, and CloudWatch-compatible JSON logs. Actually deployed AWS components: none.
