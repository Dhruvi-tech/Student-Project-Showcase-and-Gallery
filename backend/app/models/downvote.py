from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


def generate_downvote_id() -> str:
    return f"dnv_{uuid.uuid4().hex[:8]}"


class Downvote(Base):
    __tablename__ = "downvotes"

    id = Column(String(36), primary_key=True, default=generate_downvote_id)
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
    project = relationship("Project", back_populates="downvotes")
    student = relationship("Student", back_populates="downvotes")

    # Enforce strict single-downvote rule per student per project
    __table_args__ = (
        UniqueConstraint("project_id", "student_id", name="uq_project_student_downvote"),
    )
