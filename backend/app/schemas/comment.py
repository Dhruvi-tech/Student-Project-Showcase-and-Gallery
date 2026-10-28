from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator


class CommentCreate(BaseModel):
    content: str = Field(
        ...,
        min_length=2,
        max_length=1000,
        json_schema_extra={"example": "Great UI! Which library did you use for styling?"},
    )
    student_id: Optional[str] = Field(default=None, json_schema_extra={"example": "stu_demo01"})
    author_name: Optional[str] = Field(default="Student Reviewer", json_schema_extra={"example": "Ananya Rao"})
    feedback_type: Literal["positive", "improvement"] = "positive"

    @field_validator("content")
    def validate_content_not_empty(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Comment content cannot be empty or only spaces")
        return clean


class CommentResponse(BaseModel):
    """Response strictly matching Section 5.4: 201 Created"""
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., json_schema_extra={"example": "cmt_3e21a0"})
    project_id: str = Field(..., json_schema_extra={"example": "prj_9f8d7c6b"})
    content: str = Field(..., json_schema_extra={"example": "Great UI! Which library did you use for styling?"})
    author_name: str = Field(default="Anonymous Peer")
    feedback_type: Optional[str] = None
    created_at: datetime
