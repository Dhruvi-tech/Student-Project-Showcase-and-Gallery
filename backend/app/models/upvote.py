from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


def generate_upvote_id() -> str:
    return f"upv_{uuid.uuid4().hex[:8]}"


class Upvote(Base):
    __tablename__ = "upvotes"

    id = Column(String(36), primary_key=True, default=generate_upvote_id)
    project_id = Column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_id = Column(
        String(36),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    project = relationship("Project", back_populates="upvotes")
    student = relationship("Student", back_populates="upvotes")

    # Enforce strict single-upvote rule per student per project at DB engine level
    __table_args__ = (
        UniqueConstraint("project_id", "student_id", name="uq_project_student_upvote"),
    )
