from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


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
    upvote_count: int = Field(default=0, json_schema_extra={"example": 0})
    downvote_count: int = Field(default=0, json_schema_extra={"example": 0})
    created_at: datetime = Field(..., json_schema_extra={"example": "2026-08-10T12:51:16Z"})


class ProjectItem(BaseModel):
    """Item inside the project list matching Section 5.2 while empowering the React UI"""
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., json_schema_extra={"example": "prj_9f8d7c6b"})
    title: str = Field(..., json_schema_extra={"example": "AI Study Assistant"})
    description: Optional[str] = ""
    github_link: Optional[str] = None
    demo_url: Optional[str] = None
    tech_stacks: List[str] = Field(default_factory=list)
    upvote_count: int = Field(..., json_schema_extra={"example": 42})
    downvote_count: int = Field(default=0)
    comment_count: int = Field(default=0)
    created_at: datetime
    student_name: Optional[str] = None
    has_voted: Optional[bool] = False
    has_liked: Optional[bool] = False
    has_disliked: Optional[bool] = False
    user_vote: Optional[str] = None


class ProjectListResponse(BaseModel):
    """Response strictly matching Section 5.2: 200 OK"""
    data: List[ProjectItem]
    total: int = 0
    sort: str = "upvotes"


class ProjectDetailResponse(ProjectItem):
    """Full detail view including student profile and comments list"""
    comments: List[dict] = Field(default_factory=list)
