import logging
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.project import Project
from app.models.upvote import Upvote
from app.models.downvote import Downvote
from app.models.comment import Comment
from app.models.student import Student
from app.schemas.project import ProjectCreate
from app.schemas.comment import CommentCreate

logger = logging.getLogger("showcase.service")


def create_project(db: Session, project_in: ProjectCreate) -> Project:
    """Publishes a new student project into the database."""
    student_id = project_in.student_id
    if student_id:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            student = Student(id=student_id, name="Student Creator", email=f"{student_id}@student.edu")
            db.add(student)
            db.commit()

    db_project = Project(
        title=project_in.title,
        description=project_in.description,
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


def get_projects(
    db: Session,
    sort: str = "upvotes",
    tech_stack: Optional[str] = None,
    search: Optional[str] = None,
    student_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> Tuple[List[dict], int]:
    """Retrieves projects ranked by upvotes, creation date, or filter criteria."""
    query = db.query(Project)

    # Search filter
    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            func.lower(Project.title).like(term) | func.lower(Project.description).like(term)
        )

    # Sorting
    if sort == "upvotes":
        query = query.order_by(desc(Project.upvote_count), desc(Project.created_at))
    elif sort == "newest":
        query = query.order_by(desc(Project.created_at))
    elif sort == "oldest":
        query = query.order_by(asc(Project.created_at))
    else:
        query = query.order_by(desc(Project.upvote_count))

    all_matching = query.all()

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
    if student_id:
        upvoted_ids = set(
            row[0]
            for row in db.query(Upvote.project_id)
            .filter(Upvote.student_id == student_id)
            .all()
        )
        downvoted_ids = set(
            row[0]
            for row in db.query(Downvote.project_id)
            .filter(Downvote.student_id == student_id)
            .all()
        )

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
                "github_link": proj.github_link,
                "demo_url": proj.demo_url,
                "tech_stacks": proj.tech_stacks or [],
                "upvote_count": proj.upvote_count,
                "downvote_count": down_count,
                "comment_count": comment_count,
                "created_at": proj.created_at,
                "student_name": student_name,
                "has_voted": has_up,
                "has_liked": has_up,
                "has_disliked": has_down,
                "user_vote": "up" if has_up else ("down" if has_down else None),
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
        has_up = (
            db.query(Upvote)
            .filter(Upvote.project_id == project_id, Upvote.student_id == student_id)
            .first()
            is not None
        )
        has_down = (
            db.query(Downvote)
            .filter(Downvote.project_id == project_id, Downvote.student_id == student_id)
            .first()
            is not None
        )

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
        "github_link": proj.github_link,
        "demo_url": proj.demo_url,
        "tech_stacks": proj.tech_stacks or [],
        "upvote_count": proj.upvote_count,
        "downvote_count": getattr(proj, "downvote_count", 0) or 0,
        "comment_count": len(comments),
        "created_at": proj.created_at,
        "student_name": proj.student.name if proj.student else "Student Developer",
        "has_voted": has_up,
        "has_liked": has_up,
        "has_disliked": has_down,
        "user_vote": "up" if has_up else ("down" if has_down else None),
        "comments": formatted_comments,
    }


def upvote_project(
    db: Session, project_id: str, student_id: str
) -> Tuple[int, int, bool, str]:
    """
    Records an upvote (like) for a project with strict 1-student = 1-vote constraint.
    If the student had previously disliked the project, the dislike is switched to a like.
    """
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found",
        )

    # Ensure student exists in DB or create development identity
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        student = Student(
            id=student_id,
            name=f"Student {student_id.replace('stu_', '')}",
            email=f"{student_id}@student.edu",
        )
        db.add(student)
        db.commit()

    # Check if student already upvoted
    existing_upvote = (
        db.query(Upvote)
        .filter(Upvote.project_id == project_id, Upvote.student_id == student_id)
        .first()
    )
    if existing_upvote:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "Student has already upvoted this project. Each student can vote only once.",
                "project_id": project_id,
                "upvote_count": proj.upvote_count,
                "voted": False,
            },
        )

    # If student previously downvoted, remove downvote and decrement downvote_count
    existing_downvote = (
        db.query(Downvote)
        .filter(Downvote.project_id == project_id, Downvote.student_id == student_id)
        .first()
    )
    if existing_downvote:
        db.delete(existing_downvote)
        if proj.downvote_count > 0:
            proj.downvote_count = Project.downvote_count - 1

    # Record upvote with DB constraint safety
    upvote_record = Upvote(project_id=project_id, student_id=student_id)
    try:
        db.add(upvote_record)
        proj.upvote_count = Project.upvote_count + 1
        db.commit()
        db.refresh(proj)
        return proj.upvote_count, proj.downvote_count, True, "Like recorded successfully"
    except IntegrityError:
        db.rollback()
        current_count = (
            db.query(Project.upvote_count)
            .filter(Project.id == project_id)
            .scalar()
            or 0
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "Student has already upvoted this project. Each student can vote only once.",
                "project_id": project_id,
                "upvote_count": current_count,
                "downvote_count": db.query(Project.downvote_count).filter(Project.id == project_id).scalar() or 0,
                "voted": False,
            },
        )


def downvote_project(
    db: Session, project_id: str, student_id: str
) -> Tuple[int, int, bool, str]:
    """
    Records a downvote (dislike) for a project.
    If the student had previously liked the project, the like is switched to a dislike.
    """
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{project_id}' not found",
        )

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        student = Student(
            id=student_id,
            name=f"Student {student_id.replace('stu_', '')}",
            email=f"{student_id}@student.edu",
        )
        db.add(student)
        db.commit()

    # Check if student already downvoted
    existing_downvote = (
        db.query(Downvote)
        .filter(Downvote.project_id == project_id, Downvote.student_id == student_id)
        .first()
    )
    if existing_downvote:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "Student has already disliked this project. Each student can vote only once.",
                "project_id": project_id,
                "downvote_count": getattr(proj, "downvote_count", 0) or 0,
                "voted": False,
            },
        )

    # If student previously upvoted, remove upvote and decrement upvote_count
    existing_upvote = (
        db.query(Upvote)
        .filter(Upvote.project_id == project_id, Upvote.student_id == student_id)
        .first()
    )
    if existing_upvote:
        db.delete(existing_upvote)
        if proj.upvote_count > 0:
            proj.upvote_count = Project.upvote_count - 1

    # Record downvote with DB constraint safety
    downvote_record = Downvote(project_id=project_id, student_id=student_id)
    try:
        db.add(downvote_record)
        proj.downvote_count = Project.downvote_count + 1
        db.commit()
        db.refresh(proj)
        return proj.upvote_count, proj.downvote_count, True, "Dislike recorded successfully"
    except IntegrityError:
        db.rollback()
        current_down = (
            db.query(Project.downvote_count)
            .filter(Project.id == project_id)
            .scalar()
            or 0
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": "Student has already disliked this project. Each student can vote only once.",
                "project_id": project_id,
                "downvote_count": current_down,
                "voted": False,
            },
        )


def remove_project_vote(db: Session, project_id: str, student_id: str) -> Tuple[int, int]:
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project with ID '{project_id}' not found")
    up = db.query(Upvote).filter(Upvote.project_id == project_id, Upvote.student_id == student_id).first()
    down = db.query(Downvote).filter(Downvote.project_id == project_id, Downvote.student_id == student_id).first()
    if up:
        db.delete(up)
        if proj.upvote_count > 0:
            proj.upvote_count = Project.upvote_count - 1
    if down:
        db.delete(down)
        if proj.downvote_count > 0:
            proj.downvote_count = Project.downvote_count - 1
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
