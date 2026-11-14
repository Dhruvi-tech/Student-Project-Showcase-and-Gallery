# Live Deployment Verification & Screenshot Evidence Report

**Verification Timestamp:** 2026-11-14 13:26:43 UTC
**Live REST API:** https://student-project-showcase-api.onrender.com
**Live Render UI:** https://student-project-showcase-ui.onrender.com
**Live GitHub Pages Mirror:** https://dhruvi-tech.github.io/Student-Project-Showcase-and-Gallery/

## 1. Live API End-to-End Test Results

| Test Name | Status | Details |
| :--- | :--- | :--- |
| Live Healthcheck & PostgreSQL Connection | **PASS** | PostgreSQL latency: 2.06ms, engine: postgresql |
| Live Projects Catalog & Pagination | **PASS** | Retrieved 100 items. Total catalog size: 320 |
| Live Search and Filtering | **PASS** | Search 'AI' returned 100 items |
| Live User Registration (POST /api/v1/auth/register) | **PASS** | User registered: username=qa_dc62321d, token_type=bearer |
| Live User Login & JWT Token Issue (POST /api/v1/auth/login) | **PASS** | JWT Bearer token issued (eyJhbGciOiJIUzI1Ni...) |
| Live Auth Verification (GET /api/v1/auth/me) | **PASS** | Verified active session: email=test_e2e_dc62321d@example.com, username=qa_dc62321d |
| Live Project Creation (POST /api/v1/projects) | **PASS** | Created project ID: prj_b79ec660, title='Live Autonomous Verification dc62321d' |
| Live Project Partial Update (PATCH /api/v1/projects/{id}) | **PASS** | Patched project title: 'Live Autonomous Verification [VERIFIED] dc62321d', difficulty='Advanced' |
| Live Peer Review Comment (POST /api/v1/projects/{id}/comments) | **PASS** | Added peer review comment ID: cmt_866bb8 |
| Live Project Upvote (POST /api/v1/projects/{id}/upvote) | **PASS** | Casted upvote. Total upvotes: 1, voted=True |
| Live Comment Deletion (DELETE /api/v1/projects/{id}/comments/{comment_id}) | **PASS** | Successfully deleted comment ID: cmt_866bb8 |
| Live Project Deletion (DELETE /api/v1/projects/{id}) | **PASS** | Successfully cleaned up test project ID: prj_b79ec660 |

**Total Tests:** 12 | **Passed:** 12 | **Failed:** 0

## 2. Captured Live Screenshots (Saved in Downloads)

| Screenshot Filename | File Size | Description |
| :--- | :--- | :--- |
| `01_live_health_postgresql.png` | 15.4 KB | Live Backend Health Check with PostgreSQL connection & latency metrics |
| `02_live_swagger_documentation.png` | 92.5 KB | Live Interactive Swagger UI documentation with BearerAuth & REST endpoints |
| `03_live_redoc_specification.png` | 106.8 KB | Live ReDoc OpenAPI 3.1.0 specification |
| `04_live_ui_homepage.png` | 387.6 KB | Live Frontend Homepage on Render showing 320 project showcase catalog |
| `05_live_ui_search_filter.png` | 202.2 KB | Live Search & Filter interaction on project catalogue |
| `06_live_ui_project_modal.png` | 245.2 KB | Live Project Details Modal showing overview, metrics, tabs, and peer reviews |
| `07_live_ui_auth_modal.png` | 263.8 KB | Live Authentication Modal (Sign In / Register) with clean product design |
| `08_live_ui_analytics_modal.png` | 144.3 KB | Live Analytics Modal with domain metrics & distribution charts |
| `09_live_ui_publish_modal.png` | 223.1 KB | Live Publish Project Modal with structured form fields and validation |
| `10_live_github_pages_mirror.png` | 389.4 KB | Live GitHub Pages deployment mirror |

All screenshots were captured live using 1080p full HD headless Chrome directly against the production deployment.
