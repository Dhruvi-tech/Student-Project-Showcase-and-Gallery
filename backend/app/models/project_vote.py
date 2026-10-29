import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, CheckConstraint
from app.database import Base


class ProjectVote(Base):
    """A single up/down vote row prevents cross-direction duplicate voting races."""
    __tablename__ = "project_votes"

    id = Column(String(36), primary_key=True, default=lambda: f"vte_{uuid.uuid4().hex[:12]}")
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    direction = Column(String(4), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    __table_args__ = (
        UniqueConstraint("project_id", "student_id", name="uq_project_vote_student"),
        CheckConstraint("direction IN ('up', 'down')", name="ck_project_vote_direction"),
    )
