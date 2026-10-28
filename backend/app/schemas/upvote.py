from typing import Optional
from pydantic import BaseModel, Field


class UpvoteRequest(BaseModel):
    student_id: str = Field(
        ...,
        description="Student identifier casting the vote",
        json_schema_extra={"example": "stu_demo01"},
    )


class UpvoteResponse(BaseModel):
    """Response strictly matching Section 5.3: 200 OK"""
    project_id: str = Field(..., json_schema_extra={"example": "prj_9f8d7c6b"})
    upvote_count: int = Field(..., json_schema_extra={"example": 43})
    downvote_count: Optional[int] = Field(default=0)
    user_vote: Optional[str] = Field(default="up")
    voted: bool = Field(..., json_schema_extra={"example": True})
    message: str = Field(default="Upvote recorded successfully")


class DownvoteResponse(BaseModel):
    project_id: str = Field(..., json_schema_extra={"example": "prj_9f8d7c6b"})
    upvote_count: int = Field(..., json_schema_extra={"example": 43})
    downvote_count: int = Field(..., json_schema_extra={"example": 2})
    user_vote: Optional[str] = Field(default="down")
    voted: bool = Field(..., json_schema_extra={"example": True})
    message: str = Field(default="Dislike recorded successfully")
