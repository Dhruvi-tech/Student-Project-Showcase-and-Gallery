# Multi-Stage Production Dockerfile for Student Project Showcase API
# CS3452 Cloud Platforms and Service Models

# Stage 1: Dependency Builder
FROM python:3.11-slim AS builder

WORKDIR /install

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime Image (Slim & Non-Root)
FROM python:3.11-slim

WORKDIR /app

# Install runtime PostgreSQL client library & curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Create non-root application user for cloud security best practices
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Copy application source code
COPY app/ ./app/
COPY seed_data.py .
COPY .env.example .env

# Grant ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

# Cloud liveness and readiness probe
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
