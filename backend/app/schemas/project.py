from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.catalog import CATEGORIES, normalize_category


class ProjectCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=2,
        max_length=200,
        json_schema_extra={"example": "AI Study Assistant"}
    )
    description: Optional[str] = Field(
        default="",
        max_length=2000,
        json_schema_extra={"example": "An intelligent peer-to-peer revision and flashcard assistant for university exams."}
    )
    category: str = Field(default="Other", min_length=2, max_length=80)
    difficulty: str = Field(default="Intermediate")
    docs_url: Optional[str] = Field(default=None, max_length=500)
    author_display_name: Optional[str] = Field(default=None, max_length=120)
    author_profile_url: Optional[str] = Field(default=None, max_length=500)
    thumbnail_key: Optional[str] = Field(default=None, max_length=500)
    github_link: Optional[str] = Field(
        default=None,
        json_schema_extra={"example": "https://github.com/student/ai-study-assistant"}
    )
    demo_url: Optional[str] = Field(
        default=None,
        json_schema_extra={"example": "https://ai-study-assistant.vercel.app"}
    )
    tech_stacks: List[str] = Field(
        default_factory=list,
        json_schema_extra={"example": ["FastAPI", "React", "Python"]}
    )
    student_id: Optional[str] = Field(
        default=None,
        json_schema_extra={"example": "stu_demo01"}
    )

    @field_validator("title")
    def validate_title_not_empty(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Project title cannot be whitespace only")
        return clean

    @field_validator("category")
    def validate_category(cls, v: str) -> str:
        clean = normalize_category(v)
        if clean not in CATEGORIES:
            raise ValueError("Choose one of the supported project categories")
        return clean

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: str) -> str:
        cleaned = value.strip().title()
        if cleaned not in {"Beginner", "Intermediate", "Advanced"}:
            raise ValueError("Difficulty must be Beginner, Intermediate, or Advanced")
        return cleaned

    @field_validator("docs_url", "author_profile_url")
    @classmethod
    def validate_optional_urls(cls, value: Optional[str]) -> Optional[str]:
        if value is None or not value.strip():
            return None
        cleaned = value.strip()
        if not cleaned.startswith(("https://", "http://")):
            raise ValueError("URLs must start with http:// or https://")
        return cleaned

    @field_validator("tech_stacks")
    def validate_tech_stacks(cls, v: List[str]) -> List[str]:
        seen = set()
        cleaned = []
        for stack in v:
            item = stack.strip()
            if item and item.lower() not in seen:
                seen.add(item.lower())
                cleaned.append(item)
        return cleaned


class ProjectCreateResponse(BaseModel):
    """Response strictly matching Section 5.1: 201 Created"""
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., json_schema_extra={"example": "prj_9f8d7c6b"})
    title: str = Field(..., json_schema_extra={"example": "AI Study Assistant"})
    category: str = "Other"
    difficulty: str = "Intermediate"
    docs_url: Optional[str] = None
    author_display_name: Optional[str] = None
    author_profile_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    upvote_count: int = Field(default=0, json_schema_extra={"example": 0})
    downvote_count: int = Field(default=0, json_schema_extra={"example": 0})
    created_at: datetime = Field(..., json_schema_extra={"example": "2026-08-10T12:51:16Z"})


class ProjectItem(BaseModel):
    """Item inside the project list matching Section 5.2 while empowering the React UI"""
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., json_schema_extra={"example": "prj_9f8d7c6b"})
    title: str = Field(..., json_schema_extra={"example": "AI Study Assistant"})
    description: Optional[str] = ""
    category: str = "Other"
    difficulty: str = "Intermediate"
    docs_url: Optional[str] = None
    author_display_name: Optional[str] = None
    author_profile_url: Optional[str] = None
    github_link: Optional[str] = None
    demo_url: Optional[str] = None
    tech_stacks: List[str] = Field(default_factory=list)
    upvote_count: int = Field(..., json_schema_extra={"example": 42})
    downvote_count: int = Field(default=0)
    comment_count: int = Field(default=0)
    created_at: datetime
    student_name: Optional[str] = None
    student_id: Optional[str] = None
    has_voted: Optional[bool] = False
    has_liked: Optional[bool] = False
    has_disliked: Optional[bool] = False
    user_vote: Optional[str] = None
    is_saved: bool = False


class ProjectListResponse(BaseModel):
    """Response strictly matching Section 5.2: 200 OK"""
    data: List[ProjectItem]
    total: int = 0
    sort: str = "upvotes"


class ProjectDetailResponse(ProjectItem):
    """Full detail view including student profile and comments list"""
    comments: List[dict] = Field(default_factory=list)
