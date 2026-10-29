"""Personalized discovery endpoints using deterministic, explainable local signals."""
from datetime import datetime, timezone
import re
from typing import List

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.catalog import CATEGORIES, normalize_category
from app.config import settings
from app.database import get_db
from app.models.followed_category import FollowedCategory
from app.models.project import Project
from app.models.saved_project import SavedProject
from app.models.student import Student
from app.routers.auth import get_session_user, require_csrf
from app.services.project_service import get_project_by_id

router = APIRouter(prefix="/api/v1", tags=["Discovery"])


def actor_id(request: Request, db: Session, requested_id: str | None) -> str:
    user = get_session_user(request, db)
    if user:
        if request.method not in {"GET", "HEAD"}:
            require_csrf(request)
        return user.id
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=401, detail="Sign in required")
    candidate = requested_id or request.headers.get("X-Student-Id")
    if candidate and db.query(Student.id).filter(Student.id == candidate).first():
        return candidate
    demo = db.query(Student.id).order_by(Student.created_at.asc()).first()
    if not demo:
        raise HTTPException(status_code=401, detail="No demo profile is available")
    return demo[0]


class CategoryPreferences(BaseModel):
    categories: List[str] = Field(default_factory=list, max_length=20)


class InterestPreferences(BaseModel):
    interests: List[str] = Field(default_factory=list, max_length=30)


class DescriptionAssistRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str = Field(default="", max_length=2000)
    tech_stacks: List[str] = Field(default_factory=list, max_length=30)


@router.get("/catalog/categories")
def list_categories():
    return {"data": CATEGORIES}


@router.get("/catalog/technologies")
def list_technologies(db: Session = Depends(get_db)):
    counts: dict[str, int] = {}
    for stacks, in db.query(Project.tech_stacks).all():
        for technology in stacks or []:
            counts[technology] = counts.get(technology, 0) + 1
    return {"data": [{"name": name, "project_count": count} for name, count in sorted(counts.items(), key=lambda item: item[0].casefold())]}


@router.get("/preferences/categories")
def get_followed_categories(request: Request, x_student_id: str | None = Header(None), db: Session = Depends(get_db)):
    owner = actor_id(request, db, x_student_id)
    categories = db.query(FollowedCategory.category).filter(FollowedCategory.student_id == owner).order_by(FollowedCategory.category).all()
    return {"data": [category for category, in categories]}


@router.put("/preferences/categories")
def replace_followed_categories(body: CategoryPreferences, request: Request, x_student_id: str | None = Header(None), db: Session = Depends(get_db)):
    owner = actor_id(request, db, x_student_id)
    normalized = list(dict.fromkeys(normalize_category(category) for category in body.categories))
    invalid = [category for category in normalized if category not in CATEGORIES]
    if invalid:
        raise HTTPException(status_code=422, detail=f"Unsupported categories: {', '.join(invalid)}")
    db.query(FollowedCategory).filter(FollowedCategory.student_id == owner).delete(synchronize_session=False)
    db.add_all(FollowedCategory(student_id=owner, category=category) for category in normalized)
    db.commit()
    return {"data": normalized}


@router.get("/preferences/interests")
def get_interests(request: Request, x_student_id: str | None = Header(None), db: Session = Depends(get_db)):
    owner = actor_id(request, db, x_student_id)
    user = db.query(Student).filter(Student.id == owner).first()
    return {"data": user.interests or []}


@router.put("/preferences/interests")
def replace_interests(body: InterestPreferences, request: Request, x_student_id: str | None = Header(None), db: Session = Depends(get_db)):
    owner = actor_id(request, db, x_student_id)
    cleaned = list(dict.fromkeys(value.strip()[:60] for value in body.interests if value.strip()))
    user = db.query(Student).filter(Student.id == owner).first()
    user.interests = cleaned
    db.commit()
    return {"data": cleaned}


@router.post("/projects/{project_id}/bookmark", status_code=status.HTTP_201_CREATED)
def save_project(project_id: str, request: Request, x_student_id: str | None = Header(None), db: Session = Depends(get_db)):
    owner = actor_id(request, db, x_student_id)
    if not db.query(Project.id).filter(Project.id == project_id).first():
        raise HTTPException(status_code=404, detail="Project not found")
    existing = db.query(SavedProject).filter_by(project_id=project_id, student_id=owner).first()
    if existing:
        return {"project_id": project_id, "saved": True}
    db.add(SavedProject(project_id=project_id, student_id=owner))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        if not db.query(SavedProject.id).filter_by(project_id=project_id, student_id=owner).first():
            raise
    return {"project_id": project_id, "saved": True}


@router.delete("/projects/{project_id}/bookmark")
def unsave_project(project_id: str, request: Request, x_student_id: str | None = Header(None), db: Session = Depends(get_db)):
    owner = actor_id(request, db, x_student_id)
    db.query(SavedProject).filter_by(project_id=project_id, student_id=owner).delete(synchronize_session=False)
    db.commit()
    return {"project_id": project_id, "saved": False}


@router.get("/my/bookmarks")
def list_bookmarks(request: Request, x_student_id: str | None = Header(None), db: Session = Depends(get_db)):
    owner = actor_id(request, db, x_student_id)
    ids = db.query(SavedProject.project_id).filter(SavedProject.student_id == owner).order_by(SavedProject.created_at.desc()).all()
    return {"data": [get_project_by_id(db, project_id, owner) for project_id, in ids], "total": len(ids)}


@router.get("/recommendations")
def recommend_projects(request: Request, limit: int = 12, x_student_id: str | None = Header(None), db: Session = Depends(get_db)):
    owner = actor_id(request, db, x_student_id)
    user = db.query(Student).filter(Student.id == owner).first()
    followed = {category for category, in db.query(FollowedCategory.category).filter(FollowedCategory.student_id == owner).all()}
    interests = {value.casefold() for value in (user.interests or [])}
    saved = {project_id for project_id, in db.query(SavedProject.project_id).filter(SavedProject.student_id == owner).all()}
    now = datetime.now(timezone.utc)
    ranked = []
    for project in db.query(Project).all():
        if project.id in saved or project.student_id == owner:
            continue
        reasons = []
        score = 0.0
        category = project.category or "Open Source & Developer Utilities"
        stack_set = {tag.casefold() for tag in (project.tech_stacks or [])}
        if category in followed or category.casefold() in interests:
            score += 4.0
            reasons.append(f"Matches your interest in {category}")
        matching_tags = [tag for tag in (project.tech_stacks or []) if tag.casefold() in interests]
        if matching_tags:
            score += min(3.0, 1.5 * len(matching_tags))
            reasons.append(f"Uses technologies you selected: {', '.join(matching_tags[:3])}")
        votes = max(0, project.upvote_count or 0)
        if votes:
            score += min(1.5, votes / 20)
            reasons.append("Popular with the community")
        created = project.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        age_days = max(0, (now - created).days)
        if age_days <= 90:
            score += 0.5 * (1 - age_days / 90)
            reasons.append("Recently added")
        if not reasons:
            reasons.append("A popular project from the community" if votes else "Explore a project from the community")
        ranked.append((project, score, reasons))
    ranked.sort(key=lambda entry: (entry[1], entry[0].upvote_count or 0, entry[0].created_at), reverse=True)
    selected = []
    for project, score, reasons in ranked[:max(1, min(limit, 50))]:
        item = get_project_by_id(db, project.id, owner)
        item["recommendation_score"] = round(score, 3)
        item["recommendation_reasons"] = reasons
        selected.append(item)
    return {"data": selected, "total": len(ranked), "method": "category/tag interests + recency + stored vote counts"}


@router.post("/assist/project-description")
def assist_project_description(body: DescriptionAssistRequest):
    text = f"{body.title} {body.description}".casefold()
    category_hints = [
        (("phishing", "malware", "vulnerability", "encryption"), "Cybersecurity"),
        (("image", "vision", "object detection", "classification"), "Computer Vision"),
        (("llm", "generative", "agent", "prompt", "chatbot"), "Generative AI & AI Agents"),
        (("analytics", "visualization", "dataset", "forecast"), "Data Science & Analytics"),
        (("sensor", "raspberry", "iot", "microcontroller"), "Internet of Things"),
        (("robot", "automation", "arduino"), "Robotics & Automation"),
        (("mobile", "android", "ios"), "Mobile App Development"),
    ]
    suggested_category = next((category for keywords, category in category_hints if any(word in text for word in keywords)), None)
    known_tags = ("Python", "React", "FastAPI", "TypeScript", "PyTorch", "TensorFlow", "PostgreSQL", "Docker", "AWS", "OpenCV", "scikit-learn", "LangChain", "Arduino")
    suggested_tags = list(dict.fromkeys([*body.tech_stacks, *(tag for tag in known_tags if tag.casefold() in text)]))
    if "classifier" in text or "classification" in text or "machine learning" in text:
        suggested_tags = list(dict.fromkeys([*suggested_tags, "scikit-learn"]))
    if any(word in text for word in ("production", "distributed", "real-time", "multi-agent")):
        difficulty = "Advanced"
    elif any(word in text for word in ("tutorial", "beginner", "starter", "introductory")):
        difficulty = "Beginner"
    else:
        difficulty = "Intermediate"
    cleaned_description = re.sub(r"[ \t]+\n", "\n", body.description.strip())
    cleaned_description = re.sub(r"\n{3,}", "\n\n", cleaned_description)
    return {
        "description": cleaned_description,
        "category": suggested_category,
        "tech_stacks": suggested_tags,
        "difficulty": difficulty,
        "notes": "Local suggestions use only words you supplied. The description suggestion only trims surrounding and repeated whitespace; it adds no features or results.",
    }
