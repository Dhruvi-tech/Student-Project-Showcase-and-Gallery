from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


def generate_comment_id() -> str:
    """Generates comment ID matching specified format: cmt_3e21a0"""
    return f"cmt_{uuid.uuid4().hex[:6]}"


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True, default=generate_comment_id)
    project_id = Column(
        String(36),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_id = Column(
        String(36),
        ForeignKey("students.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    author_name = Column(String(100), default="Anonymous Peer", nullable=False)
    content = Column(Text, nullable=False)
    feedback_type = Column(String(20), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationships
    project = relationship("Project", back_populates="comments")
    student = relationship("Student", back_populates="comments")
