"""Create or remove clearly marked, disposable academic test data.

This tool never resets a database.  It only touches rows whose identifiers use
the ``test_`` prefix and cleanup requires an explicit confirmation flag.

Run from ``backend``:
    python test_data.py seed --users 25 --projects 60
    python test_data.py cleanup --confirm
"""
import argparse
from collections import defaultdict
from datetime import datetime, timezone
import random

from app.database import SessionLocal, init_db
from app.models.comment import Comment
from app.models.followed_category import FollowedCategory
from app.models.project import Project
from app.models.project_vote import ProjectVote
from app.models.saved_project import SavedProject
from app.models.student import Student
from app.routers.auth import _hash_password


MARKER = "test_"
PASSWORD = "ProjectSpaceTest2026"
CATEGORIES = [
    "AI & Machine Learning", "Data Science & Analytics", "Cybersecurity",
    "Cloud Computing", "Web Development & Full Stack", "Mobile App Development",
    "DevOps & Automation", "Internet of Things", "Blockchain & Web3", "Computer Vision",
]


def seed(users: int, projects: int) -> None:
    """Add idempotent fictional test accounts, projects, votes, and comments."""
    init_db()
    db = SessionLocal()
    try:
        existing_users = {row.id for row in db.query(Student.id).filter(Student.id.like(f"{MARKER}%")).all()}
        generated_users = []
        for index in range(1, users + 1):
            user_id = f"test_stu_{index:03d}"
            generated_users.append(user_id)
            if user_id not in existing_users:
                db.add(Student(
                    id=user_id,
                    name=f"Test Student {index:02d}",
                    email=f"test.student.{index:02d}@example.invalid",
                    username=f"teststudent{index:02d}",
                    password_hash=_hash_password(PASSWORD),
                    bio="Generated academic load-test account. Safe to remove with test_data.py.",
                    interests=[CATEGORIES[(index - 1) % len(CATEGORIES)]],
                    roll_number=f"TEST{index:03d}",
                    avatar_seed=f"test-{index:03d}",
                ))
        db.commit()

        existing_projects = {row.id for row in db.query(Project.id).filter(Project.id.like(f"{MARKER}%")).all()}
        for index in range(1, projects + 1):
            project_id = f"test_prj_{index:03d}"
            if project_id not in existing_projects:
                category = CATEGORIES[(index - 1) % len(CATEGORIES)]
                db.add(Project(
                    id=project_id,
                    title=f"TEST DATA — {category} project {index:03d}",
                    description="Fictional disposable project generated for local testing and load testing.",
                    category=category,
                    difficulty=("Beginner", "Intermediate", "Advanced")[index % 3],
                    tech_stacks=["Python", "FastAPI", "React"] if index % 2 else ["Docker", "SQL", "Testing"],
                    github_link=None,
                    demo_url=None,
                    author_display_name=f"Test Student {((index - 1) % users) + 1:02d}",
                    student_id=generated_users[(index - 1) % users],
                ))
        db.commit()

        project_ids = [f"test_prj_{index:03d}" for index in range(1, projects + 1)]
        randomizer = random.Random(20261101)
        existing_votes = {(project_id, student_id) for project_id, student_id in db.query(ProjectVote.project_id, ProjectVote.student_id).filter(ProjectVote.project_id.like(f"{MARKER}%")).all()}
        for project_id in project_ids:
            for student_id in randomizer.sample(generated_users, k=min(3, len(generated_users))):
                if (project_id, student_id) not in existing_votes:
                    db.add(ProjectVote(project_id=project_id, student_id=student_id, direction="up"))
        db.commit()

        for project_id in project_ids:
            votes = db.query(ProjectVote).filter(ProjectVote.project_id == project_id, ProjectVote.direction == "up").count()
            db.query(Project).filter(Project.id == project_id).update({"upvote_count": votes, "downvote_count": 0})
            comment_id = f"test_cmt_{project_id.rsplit('_', 1)[-1]}"
            if not db.query(Comment).filter(Comment.id == comment_id).first():
                db.add(Comment(
                    id=comment_id,
                    project_id=project_id,
                    student_id=generated_users[0],
                    author_name="Test Student 01",
                    content="TEST DATA: generated constructive feedback for academic verification.",
                    feedback_type="feedback",
                ))
        db.commit()
        print(f"Seeded or retained {users} test users and {projects} test projects. Password: {PASSWORD}")
    finally:
        db.close()


def cleanup() -> None:
    """Delete only test-prefixed records, leaving curated/user data untouched."""
    db = SessionLocal()
    try:
        test_projects = [row.id for row in db.query(Project.id).filter(Project.id.like(f"{MARKER}%")).all()]
        test_users = [row.id for row in db.query(Student.id).filter(Student.id.like(f"{MARKER}%")).all()]
        if test_projects:
            db.query(Comment).filter(Comment.project_id.in_(test_projects)).delete(synchronize_session=False)
            db.query(ProjectVote).filter(ProjectVote.project_id.in_(test_projects)).delete(synchronize_session=False)
            db.query(SavedProject).filter(SavedProject.project_id.in_(test_projects)).delete(synchronize_session=False)
            db.query(Project).filter(Project.id.in_(test_projects)).delete(synchronize_session=False)
        if test_users:
            db.query(FollowedCategory).filter(FollowedCategory.student_id.in_(test_users)).delete(synchronize_session=False)
            db.query(SavedProject).filter(SavedProject.student_id.in_(test_users)).delete(synchronize_session=False)
            db.query(ProjectVote).filter(ProjectVote.student_id.in_(test_users)).delete(synchronize_session=False)
            db.query(Comment).filter(Comment.student_id.in_(test_users)).delete(synchronize_session=False)
            db.query(Student).filter(Student.id.in_(test_users)).delete(synchronize_session=False)
        db.commit()
        print(f"Removed {len(test_projects)} test projects and {len(test_users)} test users only.")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Manage disposable ProjectSpace test data.")
    commands = parser.add_subparsers(dest="command", required=True)
    seed_parser = commands.add_parser("seed")
    seed_parser.add_argument("--users", type=int, default=25, choices=range(1, 31))
    seed_parser.add_argument("--projects", type=int, default=60, choices=range(1, 101))
    cleanup_parser = commands.add_parser("cleanup")
    cleanup_parser.add_argument("--confirm", action="store_true", help="Required because cleanup deletes only generated test records.")
    args = parser.parse_args()
    if args.command == "seed":
        seed(args.users, args.projects)
    elif args.confirm:
        cleanup()
    else:
        parser.error("cleanup requires --confirm")


if __name__ == "__main__":
    main()


