"""Fill missing domain labels on the known demo catalog without reseeding records."""
from app.database import SessionLocal
from app.models.project import Project
from seed_data import REAL_PROJECTS_WITH_LIVE_DEMOS, seed_category


def backfill_demo_categories() -> int:
    db = SessionLocal()
    changed = 0
    try:
        for sample in REAL_PROJECTS_WITH_LIVE_DEMOS:
            project = db.query(Project).filter(Project.github_link == sample["github_link"]).first()
            if project and project.category in (None, "", "Other"):
                project.category = seed_category(sample)
                changed += 1
        db.commit()
        return changed
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print(f"Updated category labels on {backfill_demo_categories()} existing demo projects.")
