from typing import List, Optional
from fastapi import APIRouter, Depends, Header, Query, status, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.student import Student
from app.schemas.project import (
    ProjectCreate,
    ProjectCreateResponse,
    ProjectListResponse,
    ProjectDetailResponse,
)
from app.schemas.upvote import UpvoteRequest, UpvoteResponse, DownvoteResponse
from app.schemas.comment import CommentCreate, CommentResponse
from app.services import project_service

router = APIRouter(prefix="/api/v1", tags=["Projects"])


@router.post(
    "/projects",
    response_model=ProjectCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Publish a new student project",
    description="Registers a new student project in the showcase with title, links, and technology stacks.",
)
def publish_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    x_student_id: Optional[str] = Header(None, description="Optional submitting student ID"),
):
    if not project_in.student_id and x_student_id:
        project_in.student_id = x_student_id
    project = project_service.create_project(db, project_in)
    return project


@router.get(
    "/projects",
    response_model=ProjectListResponse,
    status_code=status.HTTP_200_OK,
    summary="List projects ranked by upvotes or date",
    description="Returns a collection of projects. Supports sorting by 'upvotes' (default) or 'newest', filtering by tech stack, and keyword search.",
)
def list_projects(
    sort: str = Query("upvotes", description="Sort order: 'upvotes', 'newest', or 'oldest'"),
    tech_stack: Optional[str] = Query(None, description="Filter by technology stack (e.g. FastAPI, React)"),
    search: Optional[str] = Query(None, description="Search project title or description"),
    limit: int = Query(100, ge=1, le=200, description="Page size limit"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    x_student_id: Optional[str] = Header(None, description="Current student identifier for vote status tracking"),
    db: Session = Depends(get_db),
):
    projects_data, total_count = project_service.get_projects(
        db=db,
        sort=sort,
        tech_stack=tech_stack,
        search=search,
        student_id=x_student_id,
        limit=limit,
        offset=offset,
    )
    return {
        "data": projects_data,
        "total": total_count,
        "sort": sort,
    }


@router.get(
    "/projects/{id}",
    response_model=ProjectDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single project details and comments",
)
def get_project_details(
    id: str,
    x_student_id: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    return project_service.get_project_by_id(db, project_id=id, student_id=x_student_id)


@router.post(
    "/projects/{id}/upvote",
    response_model=UpvoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Upvote a project",
    description="Upvotes a student project. Enforces rule: each student can upvote a project only once.",
)
def upvote_project(
    id: str,
    body: Optional[UpvoteRequest] = None,
    x_student_id: Optional[str] = Header(None, description="Student ID casting the upvote"),
    db: Session = Depends(get_db),
):
    # Determine student ID: body param takes priority, followed by header, followed by stable test identity
    student_id = (body.student_id if body and body.student_id else None) or x_student_id
    if not student_id:
        student_id = "stu_dev_default"

    count, down_count, voted, message = project_service.upvote_project(
        db, project_id=id, student_id=student_id
    )
    return {
        "project_id": id,
        "upvote_count": count,
        "downvote_count": down_count,
        "voted": voted,
        "user_vote": "up",
        "message": message,
    }


@router.post(
    "/projects/{id}/downvote",
    response_model=DownvoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Dislike a project",
    description="Records one dislike per student and switches an existing like to a dislike.",
)
def downvote_project(
    id: str,
    body: Optional[UpvoteRequest] = None,
    x_student_id: Optional[str] = Header(None, description="Student ID casting the vote"),
    db: Session = Depends(get_db),
):
    student_id = (body.student_id if body and body.student_id else None) or x_student_id or "stu_dev_default"
    up_count, down_count, voted, message = project_service.downvote_project(
        db, project_id=id, student_id=student_id
    )
    return {
        "project_id": id,
        "upvote_count": up_count,
        "downvote_count": down_count,
        "voted": voted,
        "user_vote": "down",
        "message": message,
    }


@router.delete("/projects/{id}/vote", status_code=status.HTTP_200_OK, summary="Remove your project vote")
def remove_vote(
    id: str,
    body: Optional[UpvoteRequest] = None,
    x_student_id: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    student_id = (body.student_id if body and body.student_id else None) or x_student_id or "stu_dev_default"
    up_count, down_count = project_service.remove_project_vote(db, id, student_id)
    return {"project_id": id, "upvote_count": up_count, "downvote_count": down_count, "user_vote": None, "voted": False, "message": "Vote removed"}


@router.post(
    "/projects/{id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add peer feedback / comment",
    description="Adds constructive peer feedback or questions to a student project.",
)
def add_comment(
    id: str,
    comment_in: CommentCreate,
    x_student_id: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if not comment_in.student_id and x_student_id:
        comment_in.student_id = x_student_id
    comment = project_service.add_comment(db, project_id=id, comment_in=comment_in)
    return comment


@router.get(
    "/projects/{id}/comments",
    response_model=List[CommentResponse],
    status_code=status.HTTP_200_OK,
    summary="List comments for a project",
)
def list_comments(id: str, db: Session = Depends(get_db)):
    proj_details = project_service.get_project_by_id(db, project_id=id)
    return proj_details.get("comments", [])


@router.get(
    "/students",
    status_code=status.HTTP_200_OK,
    summary="List development student identities",
    description="Provides available development student profiles for the Phase 1 identity selector in the UI.",
)
def list_students(db: Session = Depends(get_db)):
    students = db.query(Student).order_by(Student.name.asc()).limit(50).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "roll_number": s.roll_number,
        }
        for s in students
    ]
