# Docker and Deployment Readiness

The backend Dockerfile uses a multi-stage Python build, installs only runtime libraries in the final image, creates a non-root `appuser`, exposes port 8000, includes `/health` as a health check, and now copies the curated catalog required by the seed script. The frontend uses a Node build stage and Nginx runtime with SPA fallback and a health check.

`docker-compose.yml` supplies an optional local PostgreSQL/API/frontend topology with a persistent named database volume and isolated network. It is not an AWS deployment and its local example password must not be reused in production. Docker builds were not represented as cloud deployment evidence.


