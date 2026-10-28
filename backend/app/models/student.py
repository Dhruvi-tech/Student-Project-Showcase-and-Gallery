from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


def generate_student_id() -> str:
    return f"stu_{uuid.uuid4().hex[:8]}"


class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=generate_student_id)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    roll_number = Column(String(50), nullable=True)
    avatar_seed = Column(String(50), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    upvotes = relationship("Upvote", back_populates="student", cascade="all, delete-orphan")
    downvotes = relationship("Downvote", back_populates="student", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="student", cascade="all, delete-orphan")
