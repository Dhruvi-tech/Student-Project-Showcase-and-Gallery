# Web Services Viva Questions and Answers

1. **What problem does ProjectSpace solve?** It gives students one place to publish projects, discover peers' work, and exchange constructive feedback.
2. **Why React?** React makes stateful, reusable gallery, modal, form, and profile components practical.
3. **Why FastAPI?** It provides typed request validation, automatic OpenAPI documentation, and concise REST endpoints.
4. **What is REST in this project?** Resources such as projects, comments, votes, and accounts are accessed through HTTP methods and JSON.
5. **How are projects listed?** `GET /api/v1/projects` supports sorting, search, category, technology, limit, and offset.
6. **How is input validated?** Pydantic schemas validate request fields, limits, types, and URLs before business logic runs.
7. **How are passwords stored?** Passwords use PBKDF2-SHA256 with a random salt and 310,000 iterations; plaintext passwords are not stored.
8. **How does login persist?** The API issues a signed, HttpOnly session cookie with an expiry and session version.
9. **Why is CSRF protection needed?** It prevents another site from making state-changing requests through a signed-in browser session.
10. **How is ownership enforced?** Update/delete resolve the signed-in server session and compare it to the project owner; a client header cannot override it in production.
11. **How are duplicate votes prevented?** `project_votes` has a unique `(project_id, student_id)` constraint and service-level conflict handling.
12. **How are comments related to projects?** Each comment has a project foreign key and optional student foreign key.
13. **What is SQLAlchemy's role?** It maps Python models to relational tables and manages safe database sessions/queries.
14. **What data persists after restart?** SQLite persists projects, accounts, votes, comments, bookmarks, and followed categories on disk.
15. **How are all 320 projects loaded?** The frontend fetches API pages in chunks until it reaches the returned total.
16. **How is search implemented?** The service checks title, description, category, owner name, and technology stack with normalized terms.
17. **What does Swagger provide?** `/docs` renders the API contract, schemas, parameters, and interactive requests from FastAPI OpenAPI metadata.
18. **How are errors handled?** Invalid data gives 422, missing resources 404, unauthenticated protected actions 401, forbidden ownership 403, and duplicate votes 409.
19. **How was the app tested?** Pytest covers API, auth, CRUD, permissions, votes, comments, discovery, and migration; Vite validates the production build.
20. **What is a limitation?** SQLite is excellent for the local demonstration but not intended for concurrent multi-instance production hosting.
