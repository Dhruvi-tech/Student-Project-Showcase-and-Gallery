# Cloud Computing Submission Package

## Problem and Approach

ProjectSpace requires a secure way to serve a frontend, API, relational data, and optional image assets. The current working configuration is local and zero-cost. The repository supplies a cloud-ready AWS design without falsely claiming an active deployment.

## Cloud Design

The proposed architecture separates React static delivery, FastAPI compute, relational persistence, private object storage, secrets, IAM, health monitoring, and logs. `infra/aws/` contains reference CloudFormation templates; `docs/architecture.md` and `docs/zero-cost-cloud-plan.md` explain selection and constraints.

## Evidence & Materials

- **Architecture, Security & Cost Matrix (50 Marks):** [./CLOUD_50_MARKS.md](./CLOUD_50_MARKS.md)
- **Deployment and Recovery Guide:** [../../docs/aws-deployment.md](../../docs/aws-deployment.md)
- **Zero-Cost Cloud Plan:** [./ZERO_COST_ANALYSIS.md](./ZERO_COST_ANALYSIS.md)
- **AWS Services Breakdown:** [./AWS_SERVICES_EXPLANATION.md](./AWS_SERVICES_EXPLANATION.md)
- **Cloud Architecture & Data Flow:** [./CLOUD_ARCHITECTURE.md](./CLOUD_ARCHITECTURE.md)
- **IAM Security Implementation:** [./IAM_SECURITY.md](./IAM_SECURITY.md)
- **S3 Storage Implementation:** [./S3_IMPLEMENTATION.md](./S3_IMPLEMENTATION.md)
- **Docker & Deployment Readiness:** [./DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
- **CloudWatch Monitoring:** [./CLOUDWATCH_MONITORING.md](./CLOUDWATCH_MONITORING.md)
- **Cloud Viva Questions & Answers:** [./CLOUD_VIVA_QUESTIONS.md](./CLOUD_VIVA_QUESTIONS.md)
- **Demonstration Script:** [./DEMONSTRATION_SCRIPT.md](./DEMONSTRATION_SCRIPT.md)
- **Load & Test Evidence:** [../TEST_RESULTS.md](../TEST_RESULTS.md)

## Honest Cloud Status

- **Implemented locally:** Dockerfiles, environment configuration, S3-aware validated routes, health checks, safe structured logging, local load tests, and backup procedures.
- **Cloud-ready:** Private S3 and IAM policies, container/database/network/log CloudFormation templates.
- **Actually deployed:** **None** (strict ₹0 policy; AWS eligibility and explicit zero-cost approval are pending).
