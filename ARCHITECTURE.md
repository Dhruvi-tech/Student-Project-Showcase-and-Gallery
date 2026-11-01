# ProjectSpace Architecture

```mermaid
flowchart LR
  U[Student browser] --> F[React + Vite frontend]
  F -->|JSON /api/v1| A[FastAPI application]
  A --> O[SQLAlchemy ORM]
  O --> D[(SQLite local database)]
  A -. optional private asset storage .-> S[S3]
  A --> H[/health]
```

## Responsibility table

| Component | Responsibility |
|---|---|
| React/Vite | Responsive gallery, forms, client interaction, API requests |
| FastAPI | REST API, validation, authentication, authorization, business rules, OpenAPI |
| SQLAlchemy/SQLite | Accounts, projects, votes, comments, bookmarks, persistence |
| S3 integration | Optional validated private project-image objects; disabled until configured |
| AWS templates | Future ECR/ECS/RDS/S3/CloudFront reference architecture; intentionally unprovisioned under ₹0 policy |

The complete working data flow for the presentation is local. A frontend-only Amplify deployment would not make the laptop-local API publicly reachable, so it is not described as a full cloud deployment.


