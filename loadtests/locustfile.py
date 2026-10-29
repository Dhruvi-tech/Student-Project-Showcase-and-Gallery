"""
Locust Load Testing Suite for Student Project Showcase API
Simulates concurrent student visitors, project browsing, upvoting, and commenting.

Usage:
  locust -f loadtests/locustfile.py --host=http://localhost:8000
Or headless:
  locust -f loadtests/locustfile.py --host=http://localhost:8000 --headless -u 25 -r 5 --run-time 30s
"""
import random
import uuid
import os
from locust import HttpUser, task, between, events


class StudentShowcaseUser(HttpUser):
    # Simulated think time between student actions (1 to 3 seconds)
    wait_time = between(1.0, 3.0)

    def on_start(self):
        """Initializes a unique virtual student persona for this user session."""
        self.student_id = f"stu_load_{uuid.uuid4().hex[:8]}"
        self.headers = {
            "Content-Type": "application/json",
            "X-Student-Id": self.student_id,
        }
        self.known_project_ids = []

        # Set both variables to an existing disposable local test account to exercise auth.
        # Do not point this write-capable user at production or a shared live database.
        identifier = os.getenv("PROJECTSPACE_LOADTEST_USER")
        password = os.getenv("PROJECTSPACE_LOADTEST_PASSWORD")
        if identifier and password:
            with self.client.post("/api/v1/auth/login", json={"identifier": identifier, "password": password}, name="POST /api/v1/auth/login", catch_response=True) as response:
                if response.status_code == 200:
                    csrf = self.client.get("/api/v1/auth/csrf", name="GET /api/v1/auth/csrf").json().get("csrf_token")
                    if csrf:
                        self.headers["X-CSRF-Token"] = csrf
                    response.success()
                else:
                    response.failure(f"Login failed with {response.status_code}")

        # Bootstrap: Fetch initial projects list to obtain valid project IDs
        response = self.client.get("/api/v1/projects?sort=upvotes&limit=20", headers=self.headers)
        if response.status_code == 200:
            data = response.json().get("data", [])
            self.known_project_ids = [p["id"] for p in data]

    @task(5)
    def browse_gallery_ranked(self):
        """High-frequency read: Browse projects gallery ranked by upvotes."""
        with self.client.get(
            "/api/v1/projects?sort=upvotes",
            headers=self.headers,
            catch_response=True,
            name="GET /api/v1/projects?sort=upvotes",
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status code {response.status_code}")

    @task(3)
    def browse_gallery_filtered(self):
        """Medium-frequency read: Filter by tech stack."""
        stack = random.choice(["FastAPI", "React", "Python", "Docker", "AWS"])
        self.client.get(
            f"/api/v1/projects?tech_stack={stack}",
            headers=self.headers,
            name="GET /api/v1/projects?tech_stack=[stack]",
        )

    @task(2)
    def search_projects(self):
        query = random.choice(["phishing detection", "image classification", "data visualization", "chatbot"])
        self.client.get("/api/v1/projects", params={"search": query}, headers=self.headers, name="GET /api/v1/projects?search=[intent]")

    @task(1)
    def view_recommendations(self):
        self.client.get("/api/v1/recommendations?limit=20", headers=self.headers, name="GET /api/v1/recommendations")

    @task(1)
    def browse_technology_catalog(self):
        self.client.get("/api/v1/catalog/technologies", name="GET /api/v1/catalog/technologies")

    @task(1)
    def follow_interest_category(self):
        response = self.client.get("/api/v1/preferences/categories", headers=self.headers, name="GET /api/v1/preferences/categories")
        if response.status_code == 200:
            followed = response.json().get("data", [])
            category = random.choice(["AI & Machine Learning", "Data Science & Analytics", "Cybersecurity", "Computer Vision"])
            next_categories = list(dict.fromkeys([*followed, category]))[:20]
            self.client.put("/api/v1/preferences/categories", json={"categories": next_categories}, headers=self.headers, name="PUT /api/v1/preferences/categories")

    @task(1)
    def bookmark_project(self):
        if self.known_project_ids:
            project_id = random.choice(self.known_project_ids)
            response = self.client.post(f"/api/v1/projects/{project_id}/bookmark", headers=self.headers, name="POST /api/v1/projects/[id]/bookmark")
            if response.status_code == 201:
                self.client.delete(f"/api/v1/projects/{project_id}/bookmark", headers=self.headers, name="DELETE /api/v1/projects/[id]/bookmark")

    @task(1)
    def request_local_writing_suggestions(self):
        self.client.post("/api/v1/assist/project-description", json={
            "title": "Phishing email classifier", "description": "Explore phishing messages with a text classifier.", "tech_stacks": ["Python"],
        }, name="POST /api/v1/assist/project-description")

    @task(3)
    def view_project_details(self):
        """View detailed page and comments of a specific project."""
        if self.known_project_ids:
            proj_id = random.choice(self.known_project_ids)
            self.client.get(
                f"/api/v1/projects/{proj_id}",
                headers=self.headers,
                name="GET /api/v1/projects/[id]",
            )

    @task(2)
    def check_health(self):
        """Liveness probe: verifies load balancer health check."""
        self.client.get("/health", headers=self.headers, name="GET /health")

    @task(1)
    def upvote_project(self):
        """Controlled write: Upvote a project.
        Under the single-vote rule:
        - First vote from this virtual student succeeds (200 OK).
        - Subsequent votes on the same project return 409 Conflict, which is EXPECTED and validated!
        """
        if self.known_project_ids:
            proj_id = random.choice(self.known_project_ids)
            with self.client.post(
                f"/api/v1/projects/{proj_id}/upvote",
                json={"student_id": self.student_id},
                headers=self.headers,
                catch_response=True,
                name="POST /api/v1/projects/[id]/upvote",
            ) as response:
                if response.status_code == 200:
                    response.success()
                elif response.status_code == 409:
                    # Expected conflict when student already upvoted
                    response.success()
                else:
                    response.failure(f"Unexpected status: {response.status_code}")

    @task(1)
    def submit_peer_feedback(self):
        """Controlled write: Post a constructive peer comment."""
        if self.known_project_ids:
            proj_id = random.choice(self.known_project_ids)
            payload = {
                "content": f"Load test evaluation comment from virtual peer {self.student_id}",
                "student_id": self.student_id,
                "author_name": f"Peer {self.student_id[-4:]}",
            }
            with self.client.post(
                f"/api/v1/projects/{proj_id}/comments",
                json=payload,
                headers=self.headers,
                catch_response=True,
                name="POST /api/v1/projects/[id]/comments",
            ) as response:
                if response.status_code == 201:
                    response.success()
                else:
                    response.failure(f"Failed to post comment: {response.status_code}")
