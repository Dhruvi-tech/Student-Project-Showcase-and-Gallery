import logging
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func, case
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.project import Project
from app.models.comment import Comment
from app.models.student import Student
from app.schemas.project import ProjectCreate
from app.schemas.comment import CommentCreate
from app.models.saved_project import SavedProject
from app.models.project_vote import ProjectVote

logger = logging.getLogger("showcase.service")


def create_project(db: Session, project_in: ProjectCreate) -> Project:
    """Publishes a new student project into the database."""
    student_id = project_in.student_id
    if project_in.thumbnail_key and not project_in.thumbnail_key.startswith(f"projects/{student_id}/"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Thumbnail must belong to the project owner")
    if student_id:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            student = Student(id=student_id, name="Student Creator", email=f"{student_id}@student.edu")
            db.add(student)
            db.commit()

    db_project = Project(
        title=project_in.title,
        description=project_in.description,
        category=project_in.category,
        difficulty=project_in.difficulty,
        docs_url=project_in.docs_url,
        author_display_name=project_in.author_display_name,
        author_profile_url=project_in.author_profile_url,
        thumbnail_key=project_in.thumbnail_key,
        github_link=project_in.github_link,
        demo_url=project_in.demo_url,
        tech_stacks=project_in.tech_stacks,
        upvote_count=0,
        downvote_count=0,
        student_id=student_id,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(db: Session, project_id: str, owner_id: str, project_in: ProjectCreate) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project with ID '{project_id}' not found")
    if project.student_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the project owner can edit this project")
    if project_in.thumbnail_key and not project_in.thumbnail_key.startswith(f"projects/{owner_id}/"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Thumbnail must belong to the project owner")
    for field in ("title", "description", "category", "difficulty", "docs_url", "github_link", "demo_url", "tech_stacks", "thumbnail_key"):
        if field in {"thumbnail_key", "docs_url"} and field not in project_in.model_fields_set:
            continue
        setattr(project, field, getattr(project_in, field))
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: str, owner_id: str) -> None:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project with ID '{project_id}' not found")
    if project.student_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the project owner can delete this project")
    db.delete(project)
    db.commit()


def get_projects(
    db: Session,
    sort: str = "upvotes",
    tech_stack: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    student_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> Tuple[List[dict], int]:
    """Retrieves projects ranked by upvotes, creation date, or filter criteria."""
    query = db.query(Project)

    # Sorting
    if sort == "upvotes":
        query = query.order_by(desc(Project.upvote_count), desc(Project.created_at))
    elif sort == "newest":
        query = query.order_by(desc(Project.created_at))
    elif sort == "oldest":
        query = query.order_by(asc(Project.created_at))
    elif sort == "alphabetical":
        query = query.order_by(asc(Project.title))
    else:
        query = query.order_by(desc(Project.upvote_count))

    all_matching = query.all()

    if search and search.strip():
        from app.catalog import search_terms
        terms = search_terms(search)
        all_matching = [
            p for p in all_matching
            if any(term in " ".join((p.title or "", p.description or "", p.category or "", p.student.name if p.student else "", " ".join(p.tech_stacks or []))).casefold() for term in terms)
        ]

    if category and category.lower() != "all":
        all_matching = [p for p in all_matching if (p.category or "Other").lower() == category.strip().lower()]

    # Filter by tech stack (JSON array match)
    if tech_stack and tech_stack.lower() != "all":
        target_stack = tech_stack.strip().lower()
        all_matching = [
            p for p in all_matching
            if any(target_stack == s.lower() for s in (p.tech_stacks or []))
        ]

    total_count = len(all_matching)
    paginated = all_matching[offset : offset + limit]

    # Pre-fetch upvoted and downvoted project IDs for the current student
    upvoted_ids = set()
    downvoted_ids = set()
    saved_ids = set()
    if student_id:
        votes = db.query(ProjectVote.project_id, ProjectVote.direction).filter(ProjectVote.student_id == student_id).all()
        upvoted_ids = {project_id for project_id, direction in votes if direction == "up"}
        downvoted_ids = {project_id for project_id, direction in votes if direction == "down"}
        saved_ids = set(row[0] for row in db.query(SavedProject.project_id).filter(SavedProject.student_id == student_id).all())

    # Build response payload
    results = []
    for proj in paginated:
        comment_count = db.query(func.count(Comment.id)).filter(Comment.project_id == proj.id).scalar() or 0
        student_name = proj.student.name if proj.student else "Student Developer"
        down_count = getattr(proj, "downvote_count", 0) or 0
        has_up = proj.id in upvoted_ids
        has_down = proj.id in downvoted_ids
        results.append(
            {
                "id": proj.id,
                "title": proj.title,
                "description": proj.description or "",
                "category": proj.category or "Other",
                "difficulty": proj.difficulty or "Intermediate",
                "docs_url": proj.docs_url,
                "author_display_name": proj.author_display_name or (proj.student.name if proj.student else "Student Developer"),
                "author_profile_url": proj.author_profile_url,
                "thumbnail_url": f"/api/v1/assets/{proj.thumbnail_key}" if proj.thumbnail_key else None,
                "github_link": proj.github_link,
                "demo_url": proj.demo_url,
                "tech_stacks": proj.tech_stacks or [],
                "upvote_count": proj.upvote_count,
                "downvote_count": down_count,
                "comment_count": comment_count,
                "created_at": proj.created_at,
                "student_name": student_name,
                "student_id": proj.student_id,
                "has_voted": has_up,
                "has_liked": has_up,
                "has_disliked": has_down,
                "user_vote": "up" if has_up else ("down" if has_down else None),
                "is_saved": proj.id in saved_ids,
            }
        )

    return results, total_count


def get_project_by_id(
    db: Session, project_id: str, student_id: Optional[str] = None
) -> dict:
    """Retrieves full details of a single project including its comment history."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found",
        )

    has_up = False
    has_down = False
    if student_id:
        vote = db.query(ProjectVote.direction).filter(ProjectVote.project_id == project_id, ProjectVote.student_id == student_id).first()
        has_up = bool(vote and vote[0] == "up")
        has_down = bool(vote and vote[0] == "down")

    # Fetch comments sorted newest first
    comments = (
        db.query(Comment)
        .filter(Comment.project_id == project_id)
        .order_by(desc(Comment.created_at))
        .all()
    )

    formatted_comments = [
        {
            "id": c.id,
            "project_id": c.project_id,
            "author_name": c.author_name,
            "content": c.content,
            "feedback_type": c.feedback_type,
            "created_at": c.created_at,
            "student_id": c.student_id,
        }
        for c in comments
    ]

    return {
        "id": proj.id,
        "title": proj.title,
        "description": proj.description or "",
        "category": proj.category or "Other",
        "difficulty": proj.difficulty or "Intermediate",
        "docs_url": proj.docs_url,
        "author_display_name": proj.author_display_name or (proj.student.name if proj.student else "Student Developer"),
        "author_profile_url": proj.author_profile_url,
        "thumbnail_url": f"/api/v1/assets/{proj.thumbnail_key}" if proj.thumbnail_key else None,
        "github_link": proj.github_link,
        "demo_url": proj.demo_url,
        "tech_stacks": proj.tech_stacks or [],
        "upvote_count": proj.upvote_count,
        "downvote_count": getattr(proj, "downvote_count", 0) or 0,
        "comment_count": len(comments),
        "created_at": proj.created_at,
        "student_name": proj.student.name if proj.student else "Student Developer",
        "student_id": proj.student_id,
        "has_voted": has_up,
        "has_liked": has_up,
        "has_disliked": has_down,
        "user_vote": "up" if has_up else ("down" if has_down else None),
        "is_saved": bool(student_id and db.query(SavedProject.id).filter(SavedProject.project_id == project_id, SavedProject.student_id == student_id).first()),
        "comments": formatted_comments,
    }


def _cast_project_vote(db: Session, project_id: str, student_id: str, direction: str) -> Tuple[int, int, bool, str]:
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project with ID '{project_id}' not found")
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        student = Student(id=student_id, name=f"Student {student_id.replace('stu_', '')}", email=f"{student_id}@student.edu")
        db.add(student)
        db.commit()

    vote = db.query(ProjectVote).filter_by(project_id=project_id, student_id=student_id).first()
    if vote and vote.direction == direction:
        raise HTTPException(status_code=409, detail={
            "message": "Student has already voted this way. Each student can cast one vote per project.",
            "project_id": project_id, "upvote_count": proj.upvote_count,
            "downvote_count": proj.downvote_count, "voted": False,
        })
    previous = vote.direction if vote else None
    if vote:
        vote.direction = direction
    else:
        db.add(ProjectVote(project_id=project_id, student_id=student_id, direction=direction))

    changes = {}
    if direction == "up":
        changes["upvote_count"] = Project.upvote_count + 1
        if previous == "down":
            changes["downvote_count"] = case((Project.downvote_count > 0, Project.downvote_count - 1), else_=0)
    else:
        changes["downvote_count"] = Project.downvote_count + 1
        if previous == "up":
            changes["upvote_count"] = case((Project.upvote_count > 0, Project.upvote_count - 1), else_=0)
    db.query(Project).filter(Project.id == project_id).update(changes, synchronize_session=False)
    try:
        db.commit()
        db.refresh(proj)
        message = "Like recorded successfully" if direction == "up" else "Dislike recorded successfully"
        return proj.upvote_count, proj.downvote_count, True, message
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail={
            "message": "A vote from this student already exists for this project.",
            "project_id": project_id,
            "upvote_count": db.query(Project.upvote_count).filter(Project.id == project_id).scalar() or 0,
            "downvote_count": db.query(Project.downvote_count).filter(Project.id == project_id).scalar() or 0,
            "voted": False,
        })


def upvote_project(db: Session, project_id: str, student_id: str) -> Tuple[int, int, bool, str]:
    return _cast_project_vote(db, project_id, student_id, "up")


def downvote_project(db: Session, project_id: str, student_id: str) -> Tuple[int, int, bool, str]:
    return _cast_project_vote(db, project_id, student_id, "down")


def remove_project_vote(db: Session, project_id: str, student_id: str) -> Tuple[int, int]:
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project with ID '{project_id}' not found")
    vote = db.query(ProjectVote).filter_by(project_id=project_id, student_id=student_id).first()
    if vote:
        direction = vote.direction
        db.delete(vote)
        column = Project.upvote_count if direction == "up" else Project.downvote_count
        field = "upvote_count" if direction == "up" else "downvote_count"
        db.query(Project).filter(Project.id == project_id).update(
            {field: case((column > 0, column - 1), else_=0)}, synchronize_session=False
        )
    db.commit()
    db.refresh(proj)
    return proj.upvote_count, proj.downvote_count

def add_comment(
    db: Session, project_id: str, comment_in: CommentCreate
) -> Comment:
    """Adds a peer feedback comment to an existing project."""
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found",
        )

    student_id = comment_in.student_id
    author_name = comment_in.author_name or "Anonymous Peer"

    if student_id:
        student = db.query(Student).filter(Student.id == student_id).first()
        if student and not comment_in.author_name:
            author_name = student.name

    comment = Comment(
        project_id=project_id,
        student_id=student_id,
        author_name=author_name,
        content=comment_in.content,
        feedback_type=comment_in.feedback_type,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
