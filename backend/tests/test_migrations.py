from sqlalchemy import create_engine, inspect, text

import app.database as database


def test_additive_migration_preserves_project_and_consolidates_legacy_votes(tmp_path, monkeypatch):
    db_path = tmp_path / "legacy-projectspace.sqlite"
    legacy_engine = create_engine(f"sqlite:///{db_path}")
    with legacy_engine.begin() as connection:
        connection.execute(text("CREATE TABLE students (id VARCHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) NOT NULL, roll_number VARCHAR(50), avatar_seed VARCHAR(50), created_at DATETIME NOT NULL)"))
        connection.execute(text("CREATE TABLE projects (id VARCHAR(36) PRIMARY KEY, title VARCHAR(200) NOT NULL, description TEXT, category VARCHAR(80) NOT NULL DEFAULT 'Web Development', github_link VARCHAR(500), demo_url VARCHAR(500), tech_stacks JSON NOT NULL, upvote_count INTEGER NOT NULL DEFAULT 0, student_id VARCHAR(36), created_at DATETIME NOT NULL)"))
        connection.execute(text("CREATE TABLE upvotes (id VARCHAR(36) PRIMARY KEY, project_id VARCHAR(36) NOT NULL, student_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL)"))
        connection.execute(text("CREATE TABLE downvotes (id VARCHAR(36) PRIMARY KEY, project_id VARCHAR(36) NOT NULL, student_id VARCHAR(36) NOT NULL, created_at DATETIME NOT NULL)"))
        connection.execute(text("CREATE TABLE comments (id VARCHAR(36) PRIMARY KEY, project_id VARCHAR(36) NOT NULL, student_id VARCHAR(36), author_name VARCHAR(100), content TEXT NOT NULL, created_at DATETIME NOT NULL)"))
        connection.execute(text("INSERT INTO students (id, name, email, created_at) VALUES ('stu_legacy', 'Legacy author', 'legacy@example.invalid', '2025-01-01 00:00:00')"))
        connection.execute(text("INSERT INTO projects (id, title, description, category, tech_stacks, upvote_count, student_id, created_at) VALUES ('prj_legacy', 'Legacy project', 'Keep this record', 'Web Development', '[]', 1, 'stu_legacy', '2025-01-01 00:00:00')"))
        connection.execute(text("INSERT INTO upvotes (id, project_id, student_id, created_at) VALUES ('upv_legacy', 'prj_legacy', 'stu_legacy', '2025-01-01 00:00:00')"))
        connection.execute(text("INSERT INTO downvotes (id, project_id, student_id, created_at) VALUES ('dnv_legacy', 'prj_legacy', 'stu_legacy', '2025-01-01 00:00:00')"))

    monkeypatch.setattr(database, "engine", legacy_engine)
    database.init_db()
    database.init_db()  # Startup is safe to repeat; it must not duplicate migrated vote rows.

    with legacy_engine.connect() as connection:
        row = connection.execute(text("SELECT title, description, category, upvote_count, downvote_count FROM projects WHERE id = 'prj_legacy'")).one()
        assert row == ("Legacy project", "Keep this record", "Web Development & Full Stack", 1, 0)
        votes = connection.execute(text("SELECT project_id, student_id, direction FROM project_votes")).all()
        assert votes == [("prj_legacy", "stu_legacy", "up")]
        assert "author_profile_url" in {column["name"] for column in inspect(legacy_engine).get_columns("projects")}
        assert "interests" in {column["name"] for column in inspect(legacy_engine).get_columns("students")}
        assert {"saved_projects", "followed_categories"}.issubset(set(inspect(legacy_engine).get_table_names()))
    legacy_engine.dispose()
