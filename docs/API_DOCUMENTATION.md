# RESTful API Reference Specification

**Base API Path:** `/api/v1`  
**OpenAPI Specification:** `/openapi.json`  
**Interactive Swagger UI:** `/docs`  
**ReDoc Reference:** `/redoc`  
**Data Communication Format:** JSON (`application/json`)  
**Security Standard:** HTTP Bearer Token (`Authorization: Bearer <jwt_token>`) & Double-Submit CSRF Cookie  

---

## 1. Complete RESTful Endpoints Directory

| Category | Method | Endpoint URL | Description | Auth Required | Status Code |
|---|---|---|---|:---:|:---:|
| **Health** | `GET` | `/health` | Application liveness and database connectivity probe | No | `200 OK`, `503 Unavailable` |
| **Auth** | `GET` | `/api/v1/auth/csrf` | Issue browser double-submit CSRF token | No | `200 OK` |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new student developer account and issue JWT | No | `201 Created`, `409 Conflict`, `422` |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate credentials and issue JWT Bearer token | No | `200 OK`, `401 Unauthorized` |
| **Auth** | `POST` | `/api/v1/auth/demo-login` | Quick one-click evaluator sign-in | No | `200 OK` |
| **Auth** | `POST` | `/api/v1/auth/logout` | Revoke session and invalidate active token | Yes | `200 OK` |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch authenticated student profile | Yes | `200 OK`, `401 Unauthorized` |
| **Auth** | `PATCH` | `/api/v1/auth/me` | Update authenticated student profile details | Yes | `200 OK`, `401 Unauthorized` |
| **Projects** | `GET` | `/api/v1/projects` | Query paginated, filtered, and sorted project catalog | No | `200 OK` |
| **Projects** | `POST` | `/api/v1/projects` | Publish a new student project into the showcase | Yes | `201 Created`, `401`, `422` |
| **Projects** | `GET` | `/api/v1/projects/{id}` | Retrieve comprehensive project details and reviews | No | `200 OK`, `404 Not Found` |
| **Projects** | `PUT` | `/api/v1/projects/{id}` | Replace an existing project (owner enforced) | Yes | `200 OK`, `403 Forbidden`, `404` |
| **Projects** | `PATCH` | `/api/v1/projects/{id}` | Partially update project fields (owner enforced) | Yes | `200 OK`, `403 Forbidden`, `404` |
| **Projects** | `DELETE` | `/api/v1/projects/{id}` | Delete a project and cascading children (owner enforced) | Yes | `204 No Content`, `403`, `404` |
| **Projects** | `GET` | `/api/v1/my/projects` | List projects published by the signed-in user | Yes | `200 OK`, `401 Unauthorized` |
| **Votes** | `POST` | `/api/v1/projects/{id}/upvote` | Cast or switch vote to an upvote | Yes | `200 OK`, `401 Unauthorized` |
| **Votes** | `POST` | `/api/v1/projects/{id}/downvote` | Cast or switch vote to a downvote | Yes | `200 OK`, `401 Unauthorized` |
| **Votes** | `DELETE` | `/api/v1/projects/{id}/vote` | Remove previously cast vote | Yes | `200 OK`, `401 Unauthorized` |
| **Comments** | `GET` | `/api/v1/projects/{id}/comments` | Retrieve peer comments and evaluation rubric scores | No | `200 OK`, `404 Not Found` |
| **Comments** | `POST` | `/api/v1/projects/{id}/comments` | Submit peer feedback and rubric ratings | Yes | `201 Created`, `401`, `422` |
| **Comments** | `DELETE` | `/api/v1/projects/{id}/comments/{comment_id}` | Delete a peer comment (author / project owner enforced) | Yes | `204 No Content`, `403`, `404` |
| **Bookmarks** | `GET` | `/api/v1/my/bookmarks` | Retrieve bookmarked projects for user | Yes | `200 OK`, `401 Unauthorized` |
| **Bookmarks** | `POST` | `/api/v1/projects/{id}/bookmark` | Bookmark a project for later reference | Yes | `201 Created`, `401 Unauthorized` |
| **Bookmarks** | `DELETE` | `/api/v1/projects/{id}/bookmark` | Remove a saved bookmark | Yes | `200 OK`, `401 Unauthorized` |
| **Discovery** | `GET` | `/api/v1/catalog/categories` | List 20 standardized technical domain categories | No | `200 OK` |
| **Discovery** | `GET` | `/api/v1/catalog/technologies` | List all unique technology badges with project counts | No | `200 OK` |
| **Discovery** | `GET` | `/api/v1/recommendations` | Get personalized project recommendations | No | `200 OK` |
| **Preferences**| `GET` | `/api/v1/preferences/categories` | Get followed categories for active user | Yes | `200 OK` |
| **Preferences**| `PUT` | `/api/v1/preferences/categories` | Update followed categories | Yes | `200 OK`, `422` |
| **Preferences**| `GET` | `/api/v1/preferences/interests` | Get user interest tags | Yes | `200 OK` |
| **Preferences**| `PUT` | `/api/v1/preferences/interests` | Update user interest tags | Yes | `200 OK` |
| **GitHub** | `GET` | `/api/v1/github/repo` | Fetch public metadata for a repository | No | `200 OK`, `400`, `404`, `429` |
| **GitHub** | `GET` | `/api/v1/github/user/{username}/repos` | Fetch public repositories for an author | No | `200 OK`, `502 Bad Gateway` |
| **GitHub** | `GET` | `/api/v1/github/search` | Search public repositories on GitHub | No | `200 OK`, `502 Bad Gateway` |

---

## 2. Detailed Resource Contracts & Examples

### 2.1 Authentication Endpoints

#### `POST /api/v1/auth/register`
- **Purpose:** Registers a new student account, hashes the password with PBKDF2-SHA256, and returns a signed JWT Bearer access token.
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Alex Rivera",
  "username": "alex_rivera",
  "email": "alex.rivera@student.edu",
  "password": "SecurePassword123!"
}
```
- **Response `201 Created`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "stu_8f3a9b1c",
    "name": "Alex Rivera",
    "username": "alex_rivera",
    "email": "alex.rivera@student.edu",
    "bio": null,
    "interests": [],
    "created_at": "2026-11-14T10:15:00Z"
  },
  "csrf_token": "a1b2c3d4..."
}
```
- **Error `409 Conflict`:**
```json
{
  "detail": "Email or username is already registered"
}
```

#### `POST /api/v1/auth/login`
- **Purpose:** Verifies identifier (username or email) and password, issuing a JWT access token.
- **Request Body:**
```json
{
  "identifier": "alex_rivera",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`:** Returns access token and user profile.
- **Error `401 Unauthorized`:**
```json
{
  "detail": "Invalid username/email or password"
}
```

---

### 2.2 Project Management Endpoints

#### `GET /api/v1/projects`
- **Purpose:** Retrieves paginated project catalogue with comprehensive filtering and sorting.
- **Query Parameters:**
  - `sort`: `upvotes` (default), `newest`, `oldest`, `alphabetical`
  - `category`: Domain name or comma-separated list (e.g. `Cloud Computing & DevOps`)
  - `difficulty`: `Beginner`, `Intermediate`, `Advanced`
  - `tech_stack`: Single badge filter (e.g. `FastAPI`, `React`)
  - `search`: Keyword string matching title, description, stack, or author
  - `limit`: Page size limit (1 to 500, default `100`)
  - `offset`: Pagination offset (default `0`)
- **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": "prj_4c2a8f90",
      "title": "Cloud-Native API Gateway",
      "description": "High-throughput microservices reverse proxy with rate limiting and JWT validation.",
      "category": "Cloud Computing & DevOps",
      "difficulty": "Intermediate",
      "docs_url": "https://gateway-docs.internal",
      "author_display_name": "Alex Rivera",
      "author_profile_url": null,
      "github_link": "https://github.com/alex/cloud-gateway",
      "demo_url": "https://gateway.example.com",
      "tech_stacks": ["FastAPI", "Python", "Docker", "Redis"],
      "upvote_count": 18,
      "downvote_count": 0,
      "comment_count": 4,
      "created_at": "2026-11-10T08:30:00Z",
      "student_name": "Alex Rivera",
      "student_id": "stu_8f3a9b1c",
      "has_voted": false,
      "has_liked": false,
      "has_disliked": false,
      "user_vote": null,
      "is_saved": false
    }
  ],
  "total": 120,
  "sort": "upvotes"
}
```

#### `POST /api/v1/projects`
- **Purpose:** Publishes a new project.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "title": "Decentralized Voting DApp",
  "description": "Zero-knowledge cryptographic voting engine on Polygon testnet.",
  "category": "Blockchain & Web3",
  "difficulty": "Advanced",
  "github_link": "https://github.com/student/zk-voting",
  "demo_url": "https://zk-voting.vercel.app",
  "tech_stacks": ["Solidity", "React", "TypeScript", "Ethers.js"]
}
```
- **Response `201 Created`:** Returns project entity with generated `id: "prj_..."` and initial counters `upvote_count: 0`.

#### `PATCH /api/v1/projects/{id}`
- **Purpose:** Partially updates project fields without replacing entire payload. Enforces that only the creator/owner can edit.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "difficulty": "Advanced",
  "demo_url": "https://upgraded-demo.vercel.app"
}
```
- **Response `200 OK`:** Returns updated project entity.
- **Error `403 Forbidden`:**
```json
{
  "detail": "Only the project owner can edit this project"
}
```

#### `DELETE /api/v1/projects/{id}`
- **Purpose:** Permanently deletes a project and cascading comments and votes.
- **Headers:** `Authorization: Bearer <token>`
- **Response `204 No Content`:** Empty body.
- **Error `403 Forbidden`:** If requester is not the project owner.

---

### 2.3 Peer Review & Feedback Endpoints

#### `POST /api/v1/projects/{id}/comments`
- **Purpose:** Submits structured peer feedback with optional rubric ratings.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "content": "[Rubric: Code: 5★ | Innovation: 5★ | UI/UX: 4★ | Cloud: 5★ (Avg: 4.8★)]\n\nOutstanding API architecture, exceptionally clean separation of concerns and robust error handling.",
  "feedback_type": "positive"
}
```
- **Response `201 Created`:**
```json
{
  "id": "cmt_9d3a1f",
  "project_id": "prj_4c2a8f90",
  "content": "[Rubric: Code: 5★ | Innovation: 5★ | UI/UX: 4★ | Cloud: 5★ (Avg: 4.8★)]\n\nOutstanding API architecture...",
  "author_name": "Alex Rivera",
  "feedback_type": "positive",
  "created_at": "2026-11-14T10:20:00Z"
}
```

#### `DELETE /api/v1/projects/{id}/comments/{comment_id}`
- **Purpose:** Deletes a peer review. Permitted only for the comment author or project owner.
- **Headers:** `Authorization: Bearer <token>`
- **Response `204 No Content`**

---

### 2.4 Voting Endpoints (Anti-Duplicate Engine)

#### `POST /api/v1/projects/{id}/upvote`
- **Purpose:** Records an upvote. If previously downvoted, seamlessly flips vote to upvote.
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "project_id": "prj_4c2a8f90",
  "upvote_count": 19,
  "downvote_count": 0,
  "voted": true,
  "user_vote": "up",
  "message": "Upvoted project"
}
```

#### `DELETE /api/v1/projects/{id}/vote`
- **Purpose:** Removes active vote, decrementing relevant atomic counter.
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "project_id": "prj_4c2a8f90",
  "upvote_count": 18,
  "downvote_count": 0,
  "user_vote": null,
  "voted": false,
  "message": "Vote removed"
}
```

---

### 2.5 Health & Liveness Probe

#### `GET /health`
- **Purpose:** Cloud orchestrator and load balancer health verification.
- **Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "student-project-showcase-api",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2026-11-14T10:25:00.123456+00:00",
  "database": {
    "connected": true,
    "message": "Connected to PostgreSQL successfully",
    "latency_ms": 1.42,
    "engine": "postgresql"
  },
  "cloud_readiness": {
    "stateless": true,
    "twelve_factor_compliant": true,
    "probe_type": "liveness_and_readiness"
  }
}
```
- **Response `503 Service Unavailable`:** Returned if database query execution fails.
