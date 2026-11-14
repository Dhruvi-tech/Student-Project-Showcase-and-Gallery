# Comprehensive Testing & Verification Report

**Course:** CS3302 — Development of Web Services  
**Project:** Student Project Showcase and Peer Gallery Platform  
**Testing Framework:** pytest 9.1.1, pytest-asyncio 1.4.0, httpx 0.36.2, Vite 5.4.21  
**Execution Timestamp:** 2026-11-14  
**Overall Result:** **34 PASSED / 34 RUN (100% PASS RATE)**  

---

## 1. Executive Summary

| Test Suite | Total Tests | Passed | Failed | Skipped | Execution Time |
|---|:---:|:---:|:---:|:---:|:---:|
| **Backend REST API (`tests/test_api.py`)** | 33 | 33 | 0 | 0 | 2.65s |
| **Database Migrations (`tests/test_migrations.py`)** | 1 | 1 | 0 | 0 | 0.20s |
| **Frontend Production Build (`npm run build`)** | 1,972 modules | 1,972 | 0 | 0 | 4.37s |
| **Total Test Operations** | **34 Tests** | **34 Passed** | **0** | **0** | **7.22s** |

---

## 2. Complete Test Execution Log & Matrix

| # | Test Function | Module / Category | Test Description | Status |
|:---:|---|---|---|:---:|
| 1 | `test_01_health_check` | Health & Monitoring | Verify `/health` returns 200, status `healthy`, database connected, and 12-factor cloud metrics | **PASSED** |
| 2 | `test_02_publish_project_success` | CRUD (Create) | Verify `POST /api/v1/projects` creates project, returns `201 Created` with valid `prj_` ID schema | **PASSED** |
| 3 | `test_03_invalid_project_input_rejected` | Input Validation | Verify empty/whitespace title is rejected with `422 Unprocessable Content` | **PASSED** |
| 4 | `test_04_list_projects_json_structure` | CRUD (Read) | Verify `GET /api/v1/projects` returns valid collection structure (`data`, `total`, `sort`) | **PASSED** |
| 5 | `test_05_sorting_by_upvotes` | Query (Sorting) | Verify descending sorting order by atomic `upvote_count` counter | **PASSED** |
| 6 | `test_06_filter_by_tech_stack` | Query (Filtering) | Verify JSON array filtering by technology badge (`tech_stack=React`) | **PASSED** |
| 7 | `test_07_upvote_project_success` | Business Logic | Verify upvoting increments `upvote_count` by 1 and records user vote | **PASSED** |
| 8 | `test_08_duplicate_upvote_prevented` | Relational Constraint | Verify idempotency / duplicate vote prevention per user | **PASSED** |
| 9 | `test_09_get_project_by_id_success` | CRUD (Read) | Verify `GET /api/v1/projects/{id}` returns complete project entity with comment list | **PASSED** |
| 10 | `test_10_get_project_by_id_not_found` | Error Handling | Verify non-existent project ID returns structured `404 Not Found` | **PASSED** |
| 11 | `test_11_invalid_comment_rejected` | Input Validation | Verify empty comment payload is rejected with `422 Unprocessable Content` | **PASSED** |
| 12 | `test_12_dislike_project_increments_downvote_count` | Voting Engine | Verify `POST /api/v1/projects/{id}/downvote` increments atomic `downvote_count` | **PASSED** |
| 13 | `test_13_switching_like_to_dislike_adjusts_both_counters` | Voting Engine | Verify atomic transition from like to dislike decrements like and increments dislike | **PASSED** |
| 14 | `test_14_duplicate_dislike_is_noop` | Idempotency | Verify duplicate downvote is treated idempotently without double-decrementing | **PASSED** |
| 15 | `test_15_remove_vote_clears_active_vote` | Voting Engine | Verify `DELETE /api/v1/projects/{id}/vote` clears active vote and resets atomic counters | **PASSED** |
| 16 | `test_16_project_detail_exposes_user_vote_state` | Personalization | Verify project details reflect active user's vote state (`has_voted`, `user_vote`) | **PASSED** |
| 17 | `test_17_search_by_title_and_description` | Query (Search) | Verify full-text search matching across title and description | **PASSED** |
| 18 | `test_18_search_case_insensitive_and_empty_handling` | Query (Search) | Verify case-insensitivity and graceful handling of empty search strings | **PASSED** |
| 19 | `test_19_pagination_limit_and_offset` | Query (Pagination) | Verify pagination slicing (`limit`, `offset`) and total count accuracy | **PASSED** |
| 20 | `test_20_primary_domain_filter_and_category_response` | Query (Filtering) | Verify 20-domain category taxonomy filtering (`category=Cybersecurity`) | **PASSED** |
| 21 | `test_21_search_matches_technology_stack_and_combines_with_category` | Query (Compound) | Verify multi-parameter query combining keyword search with domain category filter | **PASSED** |
| 22 | `test_22_account_registration_login_and_logout` | Authentication | Verify user registration, PBKDF2 password hashing, cookie/CSRF, login, and logout | **PASSED** |
| 23 | `test_23_project_edit_and_delete_are_owner_checked` | Authorization | Verify owner validation on `PUT` and `DELETE` (non-owners receive `403 Forbidden`) | **PASSED** |
| 24 | `test_24_production_mode_rejects_demo_identity` | Security Guard | Verify production environment (`DEMO_MODE=false`) rejects unauthenticated spoofed identities | **PASSED** |
| 25 | `test_25_image_upload_validates_signature_and_requires_bucket` | Security Guard | Verify magic-byte signature check for images (JPEG, PNG, WebP) and 5MB size limit | **PASSED** |
| 26 | `test_26_authenticated_project_ownership_cannot_be_spoofed` | Security Guard | Verify authenticated JWT identity overrides any spoofed request header | **PASSED** |
| 27 | `test_27_discovery_catalog_search_assistant_and_metadata` | Discovery | Verify AI-assisted description generator and category metadata endpoints | **PASSED** |
| 28 | `test_28_bookmarks_are_persistent_and_idempotent` | Personalization | Verify bookmark addition, idempotency, listing (`/my/bookmarks`), and removal | **PASSED** |
| 29 | `test_29_single_vote_constraint_spans_like_and_dislike` | Database Constraint | Verify database-level `UNIQUE(project_id, student_id)` constraint raises IntegrityError | **PASSED** |
| 30 | `test_30_patch_project_partial_update` | CRUD (Patch) | Verify `PATCH /api/v1/projects/{id}` allows partial field updates with owner verification | **PASSED** |
| 31 | `test_31_delete_comment_author_authorization` | CRUD (Delete) | Verify `DELETE /api/v1/projects/{id}/comments/{comment_id}` requires comment author or owner | **PASSED** |
| 32 | `test_32_jwt_bearer_token_authentication` | Security (JWT) | Verify JWT Bearer token generation, `Authorization: Bearer` validation, and 401 on invalid token | **PASSED** |
| 33 | `test_33_openapi_and_docs_endpoints` | Documentation | Verify `/openapi.json` includes `BearerAuth` security scheme, and `/docs` & `/redoc` return 200 | **PASSED** |
| 34 | `test_migrations.py` | Migrations & ORM | Verify additive schema migration on legacy fixtures preserves all rows and foreign keys | **PASSED** |

---

## 3. Frontend Production Build Verification

```
> student-project-showcase-frontend@1.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 1972 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.88 kB │ gzip:   0.49 kB
dist/assets/index-Ek8UymtL.css   73.07 kB │ gzip:  12.66 kB
dist/assets/index-CGUvdI1K.js   530.18 kB │ gzip: 119.94 kB
✓ built in 4.37s
```

- **Output Directory:** `frontend/dist/`
- **Single Page Application Fallback:** `dist/404.html` and `dist/.nojekyll` generated.
- **JavaScript Bundle:** `assets/index-CGUvdI1K.js` (cleanly minified with tree-shaking).
- **CSS Stylesheet:** `assets/index-Ek8UymtL.css` (custom design system and responsive grid).

---

## 4. Live Public Deployment Verification

### GitHub Pages Deployment:
- **Public URL:** [https://dhruvi-tech.github.io/Student-Project-Showcase-and-Gallery/](https://dhruvi-tech.github.io/Student-Project-Showcase-and-Gallery/)
- **HTTP Response:** `200 OK`
- **Verified Bundle:** Verified `index-CGUvdI1K.js` served live with JWT Bearer support.
- **Features Tested on Live Site:**
  1. Desktop and mobile responsive layout loads properly.
  2. Project catalog loads with 320 projects across 20 technical domains.
  3. Domain category filter bar accurately filters projects.
  4. Search input matches keywords across titles and descriptions.
  5. Interactive modals (Project Details, Evaluation Dossier, Citations, Export) function end-to-end.
  6. Demo login authenticates and displays active user session.
  7. Client-side voting increments and persists locally when offline.
