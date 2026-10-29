import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from app.database import Base


class SavedProject(Base):
    __tablename__ = "saved_projects"

    id = Column(String(36), primary_key=True, default=lambda: f"sav_{uuid.uuid4().hex[:12]}")
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    __table_args__ = (UniqueConstraint("project_id", "student_id", name="uq_saved_project_student"),)
