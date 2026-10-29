from typing import List, Optional
import logging
import re
import uuid
from fastapi import APIRouter, Depends, File, Header, Query, status, HTTPException, Request, Response, UploadFile
from fastapi.responses import RedirectResponse
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
from app.config import settings
from app.routers.auth import get_session_user, require_csrf
from app.models.project import Project

router = APIRouter(prefix="/api/v1", tags=["Projects"])
logger = logging.getLogger("showcase.assets")


def resolve_actor(request: Request, db: Session, *demo_ids: Optional[str]) -> str:
    user = get_session_user(request, db)
    if user:
        require_csrf(request)
        return user.id
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required")
    return next((value for value in demo_ids if value), None) or "stu_dev_default"


@router.post(
    "/projects",
    response_model=ProjectCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Publish a new student project",
    description="Registers a new student project in the showcase with title, links, and technology stacks.",
)
def publish_project(
    project_in: ProjectCreate,
    request: Request,
    db: Session = Depends(get_db),
    x_student_id: Optional[str] = Header(None, description="Optional submitting student ID"),
):
    project_in.student_id = resolve_actor(request, db, project_in.student_id, x_student_id)
    user = get_session_user(request, db)
    student = db.query(Student).filter(Student.id == project_in.student_id).first()
    if user:
        project_in.author_display_name = user.name
        project_in.author_profile_url = f"/api/v1/students/{user.id}"
    elif student and not project_in.author_display_name:
        project_in.author_display_name = f"Demo profile · {student.name}"
    project = project_service.create_project(db, project_in)
    return project


@router.get(
    "/projects",
    response_model=ProjectListResponse,
    status_code=status.HTTP_200_OK,
    summary="List projects ranked by upvotes or date",
    description="Returns projects with optional category/technology filters, search across title, description, stack, category, and owner, and pagination.",
)
def list_projects(
    request: Request,
    sort: str = Query("upvotes", description="Sort order: 'upvotes', 'newest', 'oldest', or 'alphabetical'"),
    tech_stack: Optional[str] = Query(None, description="Filter by technology stack (e.g. FastAPI, React)"),
    category: Optional[str] = Query(None, description="Filter by primary technology domain"),
    search: Optional[str] = Query(None, description="Search project title or description"),
    limit: int = Query(100, ge=1, le=500, description="Page size limit"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    x_student_id: Optional[str] = Header(None, description="Current student identifier for vote status tracking"),
    db: Session = Depends(get_db),
):
    session_user = get_session_user(request, db)
    projects_data, total_count = project_service.get_projects(
        db=db,
        sort=sort,
        tech_stack=tech_stack,
        category=category,
        search=search,
        student_id=session_user.id if session_user else (x_student_id if settings.DEMO_MODE else None),
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
    request: Request,
    x_student_id: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = get_session_user(request, db)
    student_id = user.id if user else (x_student_id if settings.DEMO_MODE else None)
    return project_service.get_project_by_id(db, project_id=id, student_id=student_id)


@router.get("/my/projects", status_code=status.HTTP_200_OK, summary="List the signed-in user's projects")
def list_my_projects(request: Request, db: Session = Depends(get_db)):
    user = get_session_user(request, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required")
    projects = db.query(Project).filter(Project.student_id == user.id).order_by(Project.created_at.desc()).all()
    return {"data": [project_service.get_project_by_id(db, project.id, user.id) for project in projects], "total": len(projects)}


@router.put("/projects/{id}", status_code=status.HTTP_200_OK, summary="Update a project you own")
def edit_project(id: str, project_in: ProjectCreate, request: Request, db: Session = Depends(get_db), x_student_id: Optional[str] = Header(None)):
    owner_id = resolve_actor(request, db, x_student_id)
    project_in.student_id = owner_id
    project = project_service.update_project(db, id, owner_id, project_in)
    return project


@router.delete("/projects/{id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a project you own")
def remove_project(id: str, request: Request, db: Session = Depends(get_db), x_student_id: Optional[str] = Header(None)):
    owner_id = resolve_actor(request, db, x_student_id)
    project_service.delete_project(db, id, owner_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/assets", status_code=status.HTTP_201_CREATED, summary="Upload a validated private project image")
async def upload_asset(
    request: Request,
    file: UploadFile = File(...),
    x_student_id: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    owner_id = resolve_actor(request, db, x_student_id)
    payload = await file.read(5 * 1024 * 1024 + 1)
    if len(payload) > 5 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Images must be 5 MiB or smaller")
    signatures = (
        ("image/jpeg", ".jpg", lambda b: b.startswith(b"\xff\xd8\xff")),
        ("image/png", ".png", lambda b: b.startswith(b"\x89PNG\r\n\x1a\n")),
        ("image/gif", ".gif", lambda b: b.startswith((b"GIF87a", b"GIF89a"))),
        ("image/webp", ".webp", lambda b: len(b) >= 12 and b[:4] == b"RIFF" and b[8:12] == b"WEBP"),
    )
    valid_signature = next(((mime, suffix) for mime, suffix, check in signatures if check(payload)), None)
    if not valid_signature:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Upload a valid JPEG, PNG, GIF, or WebP image")
    if not settings.S3_BUCKET_NAME:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Project image storage is not configured")
    import boto3

    mime, suffix = valid_signature
    asset_key = f"projects/{owner_id}/{uuid.uuid4().hex}{suffix}"
    try:
        client = boto3.client("s3", region_name=settings.AWS_REGION)
        client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=asset_key,
            Body=payload,
            ContentType=mime,
            ServerSideEncryption="AES256",
            CacheControl="private, max-age=300",
        )
        image_url = f"/api/v1/assets/{asset_key}"
        return {"thumbnail_key": asset_key, "thumbnail_url": image_url, "content_type": mime, "size": len(payload)}
    except Exception:
        logger.exception("S3 project image upload failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Project image could not be stored")


@router.get("/assets/{asset_key:path}", include_in_schema=True, summary="Retrieve a private project image")
def retrieve_asset(asset_key: str):
    if not re.fullmatch(r"projects/[A-Za-z0-9_-]+/[0-9a-f]{32}\.(jpg|png|gif|webp)", asset_key):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    if not settings.S3_BUCKET_NAME:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Project image storage is not configured")
    import boto3

    try:
        client = boto3.client("s3", region_name=settings.AWS_REGION)
        url = client.generate_presigned_url(
            "get_object", Params={"Bucket": settings.S3_BUCKET_NAME, "Key": asset_key}, ExpiresIn=300
        )
        return RedirectResponse(url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
    except Exception:
        logger.exception("S3 project image retrieval signing failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Project image could not be retrieved")


@router.post(
    "/projects/{id}/upvote",
    response_model=UpvoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Upvote a project",
    description="Upvotes a student project. Enforces rule: each student can upvote a project only once.",
)
def upvote_project(
    id: str,
    request: Request,
    body: Optional[UpvoteRequest] = None,
    x_student_id: Optional[str] = Header(None, description="Student ID casting the upvote"),
    db: Session = Depends(get_db),
):
    student_id = resolve_actor(request, db, body.student_id if body else None, x_student_id)

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
    request: Request,
    body: Optional[UpvoteRequest] = None,
    x_student_id: Optional[str] = Header(None, description="Student ID casting the vote"),
    db: Session = Depends(get_db),
):
    student_id = resolve_actor(request, db, body.student_id if body else None, x_student_id)
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
    request: Request,
    body: Optional[UpvoteRequest] = None,
    x_student_id: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    student_id = resolve_actor(request, db, body.student_id if body else None, x_student_id)
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
    request: Request,
    x_student_id: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    student_id = resolve_actor(request, db, comment_in.student_id, x_student_id)
    comment_in.student_id = student_id
    user = get_session_user(request, db)
    if user:
        comment_in.author_name = user.name
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
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
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


@router.get("/students/{student_id}", status_code=status.HTTP_200_OK, summary="Get a public author profile")
def get_student_profile(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    projects = db.query(Project).filter(Project.student_id == student_id).order_by(Project.created_at.desc()).limit(50).all()
    return {
        "id": student.id,
        "name": student.name,
        "username": student.username,
        "bio": student.bio,
        "interests": student.interests or [],
        "created_at": student.created_at,
        "projects": [
            {"id": project.id, "title": project.title, "category": project.category, "difficulty": project.difficulty,
             "github_link": project.github_link, "demo_url": project.demo_url}
            for project in projects
        ],
    }
