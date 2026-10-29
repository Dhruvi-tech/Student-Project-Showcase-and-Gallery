import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from app.database import Base


class FollowedCategory(Base):
    __tablename__ = "followed_categories"

    id = Column(String(36), primary_key=True, default=lambda: f"fol_{uuid.uuid4().hex[:12]}")
    category = Column(String(100), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    __table_args__ = (UniqueConstraint("category", "student_id", name="uq_followed_category_student"),)
