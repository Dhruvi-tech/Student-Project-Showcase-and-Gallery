from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


def generate_project_id() -> str:
    """Generates project ID matching specified format: prj_9f8d7c6b"""
    return f"prj_{uuid.uuid4().hex[:8]}"


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_project_id)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(80), nullable=False, default="Other", index=True)
    difficulty = Column(String(20), nullable=False, default="Intermediate")
    docs_url = Column(String(500), nullable=True)
    author_display_name = Column(String(120), nullable=True)
    author_profile_url = Column(String(500), nullable=True)
    thumbnail_key = Column(String(500), nullable=True)
    github_link = Column(String(500), nullable=True)
    demo_url = Column(String(500), nullable=True)
    tech_stacks = Column(JSON, nullable=False, default=list)
    upvote_count = Column(Integer, default=0, nullable=False, index=True)
    downvote_count = Column(Integer, default=0, nullable=False)
    student_id = Column(
        String(36),
        ForeignKey("students.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationships
    student = relationship("Student", back_populates="projects")
    upvotes = relationship("Upvote", back_populates="project", cascade="all, delete-orphan")
    downvotes = relationship("Downvote", back_populates="project", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="project", cascade="all, delete-orphan")
