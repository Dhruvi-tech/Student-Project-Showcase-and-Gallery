import pytest
from app.models.project import Project
from app.models.upvote import Upvote
from app.config import settings
from app.models.student import Student
from app.models.project_vote import ProjectVote
from app.models.saved_project import SavedProject
from app.catalog import CATEGORIES
from sqlalchemy.exc import IntegrityError


def test_01_health_check(client):
    """Test 1: Health check returns 200 OK and healthy service metrics"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert data["database"]["connected"] is True
    assert "cloud_readiness" in data


def test_02_publish_project_success(client):
    """Test 2: Project creation returns 201 Created and matching ID schema"""
    payload = {
        "title": "AI Study Assistant",
        "description": "An intelligent peer-to-peer revision assistant",
        "github_link": "https://github.com/student/ai-study-assistant",
        "demo_url": "https://ai-study-assistant.vercel.app",
        "tech_stacks": ["FastAPI", "React"],
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"].startswith("prj_")
    assert data["title"] == "AI Study Assistant"
    assert data["upvote_count"] == 0
    assert "created_at" in data


def test_03_invalid_project_input_rejected(client):
    """Test 3: Invalid project input (empty title) is rejected with 422"""
    payload = {
        "title": "   ",
        "github_link": "https://github.com/test",
        "tech_stacks": ["Python"],
    }
    response = client.post("/api/v1/projects", json=payload)
    assert response.status_code == 422


def test_04_list_projects_json_structure(client):
    """Test 4: Project listing returns the expected JSON data structure"""
    response = client.get("/api/v1/projects?sort=upvotes")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data
    assert "sort" in data
    assert isinstance(data["data"], list)


def test_05_sorting_by_upvotes(client, db_session):
    """Test 5: Verify sorting by upvote count in descending order"""
    p1 = Project(title="Low Upvotes", upvote_count=5, tech_stacks=["Python"])
    p2 = Project(title="Top Ranked", upvote_count=50, tech_stacks=["React"])
    p3 = Project(title="Mid Tier", upvote_count=20, tech_stacks=["Docker"])
    db_session.add_all([p1, p2, p3])
    db_session.commit()

    response = client.get("/api/v1/projects?sort=upvotes")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 3
    # Check descending order of upvote_count
    counts = [item["upvote_count"] for item in data]
    assert counts == sorted(counts, reverse=True)
    assert data[0]["title"] == "Top Ranked"


def test_06_sorting_by_creation_date(client, db_session):
    """Test 6: Sorting by newest creation date works correctly"""
    response = client.get("/api/v1/projects?sort=newest")
    assert response.status_code == 200
    assert response.json()["sort"] == "newest"


def test_07_upvote_increments_count(client, db_session):
    """Test 7: Upvoting increments the count correctly"""
    project = Project(title="Cloud Scaler", upvote_count=0, tech_stacks=["AWS"])
    db_session.add(project)
    db_session.commit()

    response = client.post(
        f"/api/v1/projects/{project.id}/upvote",
        json={"student_id": "stu_test_alpha"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == project.id
    assert data["upvote_count"] == 1
    assert data["voted"] is True


def test_08_single_vote_rule_rejects_duplicate(client, db_session):
    """Test 8: The same student cannot upvote the same project twice (409 Conflict)"""
    project = Project(title="Security Vault", upvote_count=0, tech_stacks=["Docker"])
    db_session.add(project)
    db_session.commit()

    # First vote from Alpha -> Succeeds
    r1 = client.post(
        f"/api/v1/projects/{project.id}/upvote",
        json={"student_id": "stu_test_alpha"},
    )
    assert r1.status_code == 200
    assert r1.json()["upvote_count"] == 1

    # Second vote from the same student Alpha -> 409 Conflict
    r2 = client.post(
        f"/api/v1/projects/{project.id}/upvote",
        json={"student_id": "stu_test_alpha"},
    )
    assert r2.status_code == 409


def test_09_different_students_can_upvote_same_project(client, db_session):
    """Test 9: Different students can both upvote the same project"""
    project = Project(title="Observability Hub", upvote_count=0, tech_stacks=["FastAPI"])
    db_session.add(project)
    db_session.commit()

    # Vote from Student Alpha
    r1 = client.post(
        f"/api/v1/projects/{project.id}/upvote",
        json={"student_id": "stu_test_alpha"},
    )
    assert r1.status_code == 200
    assert r1.json()["upvote_count"] == 1

    # Vote from Student Beta
    r2 = client.post(
        f"/api/v1/projects/{project.id}/upvote",
        json={"student_id": "stu_test_beta"},
    )
    assert r2.status_code == 200
    assert r2.json()["upvote_count"] == 2


def test_10_add_comment_success(client, db_session):
    """Test 10: Comments can be created successfully (201 Created)"""
    project = Project(title="Campus Market", upvote_count=0, tech_stacks=["React"])
    db_session.add(project)
    db_session.commit()

    comment_payload = {
        "content": "Great UI! Which library did you use for styling?",
        "student_id": "stu_test_alpha",
        "author_name": "Alpha Reviewer",
    }
    response = client.post(f"/api/v1/projects/{project.id}/comments", json=comment_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"].startswith("cmt_")
    assert data["project_id"] == project.id
    assert data["content"] == comment_payload["content"]
    assert "created_at" in data


def test_11_invalid_comment_rejected(client, db_session):
    """Test 11: Invalid comment (empty string or whitespace) is rejected"""
    project = Project(title="Code Reviewer", upvote_count=0, tech_stacks=["Python"])
    db_session.add(project)
    db_session.commit()

    response = client.post(
        f"/api/v1/projects/{project.id}/comments",
        json={"content": "    "},
    )
    assert response.status_code == 422


def test_12_nonexistent_project_returns_404(client):
    """Test 12: Requests for nonexistent projects return 404 Not Found"""
    fake_id = "prj_nonexistent_999"
    r_upvote = client.post(f"/api/v1/projects/{fake_id}/upvote", json={"student_id": "stu_test_alpha"})
    assert r_upvote.status_code == 404

    r_comment = client.post(f"/api/v1/projects/{fake_id}/comments", json={"content": "Nice!"})
    assert r_comment.status_code == 404


def test_13_database_unique_constraint_enforcement(db_session):
    """Test 13: Direct database unique constraint prevents duplicate upvotes"""
    project = Project(title="DB Constraint Test", upvote_count=0, tech_stacks=["SQL"])
    db_session.add(project)
    db_session.commit()

    v1 = Upvote(project_id=project.id, student_id="stu_test_alpha")
    db_session.add(v1)
    db_session.commit()

    # Second direct insert with same project_id and student_id must raise IntegrityError
    v2 = Upvote(project_id=project.id, student_id="stu_test_alpha")
    db_session.add(v2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_14_tech_stack_filter_and_search(client, db_session):
    """Test 14: Filtering by tech stack and keyword search"""
    p1 = Project(title="PyTorch Vision Net", description="Deep learning classifier", tech_stacks=["Python", "PyTorch"])
    p2 = Project(title="React Dashboard", description="Analytics web view", tech_stacks=["React", "JavaScript"])
    db_session.add_all([p1, p2])
    db_session.commit()

    # Filter by React
    r_stack = client.get("/api/v1/projects?tech_stack=React")
    assert r_stack.status_code == 200
    stacks = [p["tech_stacks"] for p in r_stack.json()["data"]]
    assert all("React" in s for s in stacks)

    # Search by keyword
    r_search = client.get("/api/v1/projects?search=classifier")
    assert r_search.status_code == 200
    assert any("PyTorch Vision Net" in p["title"] for p in r_search.json()["data"])


def test_15_full_student_showcase_workflow(client):
    """Test 15: Complete workflow: publish -> list -> upvote -> comment -> details"""
    # 1. Publish project
    new_proj = {
        "title": "Autonomous Drone Navigator",
        "description": "Obstacle avoidance system using edge computing",
        "github_link": "https://github.com/student/drone-nav",
        "demo_url": "https://drone.rvu.edu.in",
        "tech_stacks": ["Python", "FastAPI", "Docker"],
    }
    create_resp = client.post("/api/v1/projects", json=new_proj)
    assert create_resp.status_code == 201
    proj_id = create_resp.json()["id"]

    # 2. Check it appears in listing
    list_resp = client.get("/api/v1/projects?sort=upvotes")
    assert list_resp.status_code == 200
    assert any(p["id"] == proj_id for p in list_resp.json()["data"])

    # 3. Upvote it
    upvote_resp = client.post(
        f"/api/v1/projects/{proj_id}/upvote",
        json={"student_id": "stu_test_alpha"},
    )
    assert upvote_resp.status_code == 200
    assert upvote_resp.json()["upvote_count"] == 1

    # 4. Comment on it
    comment_resp = client.post(
        f"/api/v1/projects/{proj_id}/comments",
        json={"content": "Can this be run on Raspberry Pi?", "student_id": "stu_test_beta"},
    )
    assert comment_resp.status_code == 201

    # 5. Get full project details
    detail_resp = client.get(f"/api/v1/projects/{proj_id}")
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["id"] == proj_id
    assert detail_data["upvote_count"] == 1
    assert len(detail_data["comments"]) == 1
    assert detail_data["comments"][0]["content"] == "Can this be run on Raspberry Pi?"


def test_16_dislike_is_persisted_and_returned_for_current_student(client, db_session):
    project = Project(title="Peer Review Tool", upvote_count=2, downvote_count=0, tech_stacks=["React"])
    db_session.add(project)
    db_session.commit()

    response = client.post(
        f"/api/v1/projects/{project.id}/downvote",
        json={"student_id": "stu_test_alpha"},
    )
    assert response.status_code == 200
    assert response.json()["user_vote"] == "down"
    assert response.json()["upvote_count"] == 2
    assert response.json()["downvote_count"] == 1

    listing = client.get(
        "/api/v1/projects?search=Peer%20Review%20Tool",
        headers={"X-Student-Id": "stu_test_alpha"},
    ).json()["data"][0]
    assert listing["has_disliked"] is True
    assert listing["has_liked"] is False


def test_17_student_can_switch_like_and_dislike_without_double_counting(client, db_session):
    project = Project(title="Vote Switching", upvote_count=0, downvote_count=0, tech_stacks=[])
    db_session.add(project)
    db_session.commit()
    vote_url = f"/api/v1/projects/{project.id}"
    identity = {"student_id": "stu_test_alpha"}

    dislike = client.post(f"{vote_url}/downvote", json=identity)
    assert dislike.status_code == 200
    like = client.post(f"{vote_url}/upvote", json=identity)
    assert like.status_code == 200
    assert like.json()["user_vote"] == "up"
    assert like.json()["upvote_count"] == 1
    assert like.json()["downvote_count"] == 0

    dislike_again = client.post(f"{vote_url}/downvote", json=identity)
    assert dislike_again.status_code == 200
    assert dislike_again.json()["user_vote"] == "down"
    assert dislike_again.json()["upvote_count"] == 0
    assert dislike_again.json()["downvote_count"] == 1


def test_18_duplicate_dislike_is_rejected(client, db_session):
    project = Project(title="One Dislike", upvote_count=0, downvote_count=0, tech_stacks=[])
    db_session.add(project)
    db_session.commit()
    url = f"/api/v1/projects/{project.id}/downvote"
    payload = {"student_id": "stu_test_alpha"}

    assert client.post(url, json=payload).status_code == 200
    duplicate = client.post(url, json=payload)
    assert duplicate.status_code == 409
    assert duplicate.json()["detail"]["downvote_count"] == 1


def test_19_vote_can_be_removed_and_feedback_is_typed(client, db_session):
    project = Project(title="Feedback Project", upvote_count=0, downvote_count=0, tech_stacks=[])
    db_session.add(project)
    db_session.commit()
    base = f"/api/v1/projects/{project.id}"
    identity = {"student_id": "stu_test_alpha"}
    assert client.post(f"{base}/upvote", json=identity).status_code == 200
    removed = client.request("DELETE", f"{base}/vote", json=identity)
    assert removed.status_code == 200
    assert removed.json()["user_vote"] is None
    assert removed.json()["upvote_count"] == 0
    comment = client.post(f"{base}/comments", json={
        "content": "The navigation is clear, but add keyboard shortcuts.",
        "feedback_type": "improvement",
        "student_id": "stu_test_alpha",
    })
    assert comment.status_code == 201
    assert comment.json()["feedback_type"] == "improvement"


def test_20_primary_domain_filter_and_category_response(client, db_session):
    db_session.add_all([
        Project(title="Model Lab", description="Train classifiers", category="AI & Machine Learning", tech_stacks=["Python"]),
        Project(title="Research Charts", description="Explore a survey", category="Data Science & Analytics", tech_stacks=["Python"]),
    ])
    db_session.commit()

    ai = client.get("/api/v1/projects", params={"category": "AI & Machine Learning"})
    assert ai.status_code == 200
    assert [item["title"] for item in ai.json()["data"]] == ["Model Lab"]
    assert ai.json()["data"][0]["category"] == "AI & Machine Learning"

    data = client.get("/api/v1/projects", params={"category": "Data Science & Analytics"})
    assert [item["title"] for item in data.json()["data"]] == ["Research Charts"]

    created = client.post("/api/v1/projects", json={
        "title": "Secure Sensor Hub", "category": "Internet of Things", "tech_stacks": ["Python"],
    })
    assert created.status_code == 201
    assert created.json()["category"] == "Internet of Things"


def test_21_search_matches_technology_stack_and_combines_with_category(client, db_session):
    db_session.add_all([
        Project(title="Classifier", description="Image classification", category="AI & Machine Learning", tech_stacks=["PyTorch"]),
        Project(title="Charts", description="Survey results", category="Data Science & Analytics", tech_stacks=["PyTorch"]),
    ])
    db_session.commit()

    response = client.get("/api/v1/projects", params={
        "search": "pytorch", "category": "AI & Machine Learning", "sort": "alphabetical",
    })
    assert response.status_code == 200
    assert [item["title"] for item in response.json()["data"]] == ["Classifier"]


def test_22_account_registration_login_and_logout(client, db_session):
    payload = {
        "name": "Project Owner", "username": "project_owner", "email": "owner@example.edu",
        "password": "StrongPass123",
    }
    registered = client.post("/api/v1/auth/register", json=payload)
    assert registered.status_code == 201
    user_id = registered.json()["user"]["id"]
    stored = db_session.query(Student).filter(Student.id == user_id).first()
    assert stored.password_hash != payload["password"]
    assert stored.password_hash.startswith("pbkdf2_sha256$")
    assert client.get("/api/v1/auth/me").json()["user"]["username"] == "project_owner"
    csrf = client.get("/api/v1/auth/csrf").json()["csrf_token"]
    forbidden_profile_update = client.patch("/api/v1/auth/me", json={"bio": "Builder"})
    assert forbidden_profile_update.status_code == 403
    profile_update = client.patch("/api/v1/auth/me", headers={"X-CSRF-Token": csrf}, json={"bio": "Builder"})
    assert profile_update.status_code == 200
    assert profile_update.json()["user"]["bio"] == "Builder"

    client.post("/api/v1/auth/logout", headers={"X-CSRF-Token": csrf})
    assert client.get("/api/v1/auth/me").status_code == 401
    invalid = client.post("/api/v1/auth/login", json={"identifier": "project_owner", "password": "wrong-password"})
    assert invalid.status_code == 401
    login = client.post("/api/v1/auth/login", json={"identifier": "owner@example.edu", "password": payload["password"]})
    assert login.status_code == 200
    assert login.json()["user"]["id"] == user_id


def test_23_project_edit_and_delete_are_owner_checked(client, db_session):
    created = client.post("/api/v1/projects", headers={"X-Student-Id": "stu_project_owner"}, json={
        "title": "Owned project", "category": "Cloud Computing & DevOps", "tech_stacks": ["AWS"],
    })
    project_id = created.json()["id"]
    update_payload = {"title": "Renamed project", "category": "AI & Machine Learning", "tech_stacks": ["Python"]}
    denied = client.put(f"/api/v1/projects/{project_id}", headers={"X-Student-Id": "stu_other"}, json=update_payload)
    assert denied.status_code == 403
    updated = client.put(f"/api/v1/projects/{project_id}", headers={"X-Student-Id": "stu_project_owner"}, json=update_payload)
    assert updated.status_code == 200
    assert updated.json()["title"] == "Renamed project"
    assert client.delete(f"/api/v1/projects/{project_id}", headers={"X-Student-Id": "stu_other"}).status_code == 403
    assert client.delete(f"/api/v1/projects/{project_id}", headers={"X-Student-Id": "stu_project_owner"}).status_code == 204


def test_24_production_mode_rejects_demo_identity(client, monkeypatch):
    monkeypatch.setattr(settings, "DEMO_MODE", False)
    response = client.post("/api/v1/projects", headers={"X-Student-Id": "spoofed"}, json={"title": "Protected"})
    assert response.status_code == 401


def test_25_image_upload_validates_signature_and_requires_bucket(client, monkeypatch):
    monkeypatch.setattr(settings, "S3_BUCKET_NAME", "")
    invalid = client.post("/api/v1/assets", files={"file": ("fake.png", b"not-an-image", "image/png")})
    assert invalid.status_code == 415
    valid_png_header = b"\x89PNG\r\n\x1a\n" + b"\x00" * 16
    not_configured = client.post("/api/v1/assets", files={"file": ("tiny.png", valid_png_header, "image/png")})
    assert not_configured.status_code == 503


def test_26_authenticated_project_ownership_cannot_be_spoofed(client):
    first = client.post("/api/v1/auth/register", json={
        "name": "First Owner", "username": "FirstOwner", "email": "first-owner@example.edu", "password": "StrongPass123",
    }).json()["user"]
    assert first["username"] == "firstowner"
    csrf = client.get("/api/v1/auth/csrf").json()["csrf_token"]
    created = client.post("/api/v1/projects", headers={"X-CSRF-Token": csrf, "X-Student-Id": "spoofed-id"}, json={
        "title": "Account-owned project", "category": "Web Development",
    })
    assert created.status_code == 201
    project_id = created.json()["id"]
    assert client.get(f"/api/v1/projects/{project_id}").json()["student_id"] == first["id"]

    client.post("/api/v1/auth/logout", headers={"X-CSRF-Token": csrf})
    second = client.post("/api/v1/auth/register", json={
        "name": "Second Owner", "username": "secondowner", "email": "second-owner@example.edu", "password": "StrongPass123",
    })
    assert second.status_code == 201
    csrf = client.get("/api/v1/auth/csrf").json()["csrf_token"]
    denied = client.delete(f"/api/v1/projects/{project_id}", headers={"X-CSRF-Token": csrf, "X-Student-Id": first["id"]})
    assert denied.status_code == 403


def test_27_discovery_catalog_search_assistant_and_metadata(client, db_session):
    categories = client.get("/api/v1/catalog/categories")
    assert categories.status_code == 200
    assert categories.json()["data"] == CATEGORIES
    assert len(categories.json()["data"]) == 20

    created = client.post("/api/v1/projects", json={
        "title": "Phishing Mail Classifier", "description": "Detect phishing emails using text signals.",
        "category": "Cybersecurity", "difficulty": "Advanced", "docs_url": "https://docs.example.test/guide",
        "tech_stacks": ["Python", "scikit-learn"],
    })
    assert created.status_code == 201
    found = client.get("/api/v1/projects", params={"search": "phishing detection"})
    assert found.status_code == 200
    project = found.json()["data"][0]
    assert project["category"] == "Cybersecurity"
    assert project["difficulty"] == "Advanced"
    assert project["docs_url"] == "https://docs.example.test/guide"

    follow = client.put("/api/v1/preferences/categories", headers={"X-Student-Id": "stu_test_alpha"}, json={"categories": ["Cybersecurity"]})
    assert follow.status_code == 200
    interests = client.put("/api/v1/preferences/interests", headers={"X-Student-Id": "stu_test_alpha"}, json={"interests": ["Python"]})
    assert interests.status_code == 200
    recommendations = client.get("/api/v1/recommendations", headers={"X-Student-Id": "stu_test_alpha"})
    recommended = next(item for item in recommendations.json()["data"] if item["id"] == created.json()["id"])
    assert any("Cybersecurity" in reason for reason in recommended["recommendation_reasons"])
    assert any("Python" in reason for reason in recommended["recommendation_reasons"])

    suggestion = client.post("/api/v1/assist/project-description", json={
        "title": "Phishing Mail Classifier", "description": "Detect phishing emails.\n\n\n", "tech_stacks": ["Python"],
    })
    assert suggestion.status_code == 200
    assert suggestion.json()["category"] == "Cybersecurity"
    assert suggestion.json()["description"] == "Detect phishing emails."
    assert suggestion.json()["tech_stacks"] == ["Python", "scikit-learn"]


def test_28_bookmarks_are_persistent_and_idempotent(client, db_session):
    project = Project(title="Save this project", category="EdTech", tech_stacks=["Python"])
    db_session.add(project)
    db_session.commit()
    headers = {"X-Student-Id": "stu_test_alpha"}
    endpoint = f"/api/v1/projects/{project.id}/bookmark"
    assert client.post(endpoint, headers=headers).status_code == 201
    assert client.post(endpoint, headers=headers).json()["saved"] is True
    assert db_session.query(SavedProject).filter_by(project_id=project.id, student_id="stu_test_alpha").count() == 1
    saved = client.get("/api/v1/my/bookmarks", headers=headers)
    assert [item["id"] for item in saved.json()["data"]] == [project.id]
    assert saved.json()["data"][0]["is_saved"] is True
    assert client.delete(endpoint, headers=headers).json()["saved"] is False
    assert client.get("/api/v1/my/bookmarks", headers=headers).json()["total"] == 0


def test_29_single_vote_constraint_spans_like_and_dislike(client, db_session):
    project = Project(title="Unique cross-direction vote", tech_stacks=[])
    db_session.add(project)
    db_session.commit()
    db_session.add(ProjectVote(project_id=project.id, student_id="stu_test_alpha", direction="up"))
    db_session.commit()
    db_session.add(ProjectVote(project_id=project.id, student_id="stu_test_alpha", direction="down"))
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()
    assert db_session.query(ProjectVote).filter_by(project_id=project.id, student_id="stu_test_alpha").count() == 1
