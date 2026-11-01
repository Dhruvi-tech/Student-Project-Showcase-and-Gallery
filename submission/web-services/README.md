# Web Services / Full Stack Submission Package

## Project overview

ProjectSpace is an API-backed student project gallery. Students can discover a preserved 320-project catalog, filter 20 domains, publish work, vote, comment, bookmark, follow categories, and manage account data.

## Architecture

React/Vite renders the interface and calls FastAPI REST endpoints. FastAPI validates JSON with Pydantic, applies authentication/authorization/business rules, and uses SQLAlchemy to persist to SQLite. See `ARCHITECTURE.md`.

## Evidence

- REST/OpenAPI: `http://127.0.0.1:8000/docs`
- Functional matrix: `../../WEB_50_MARKS.md`
- Tests/results: `../../TEST_RESULTS.md`
- Demonstration: `../../FINAL_PRESENTATION_SCRIPT.md`
- Viva: `../../WEB_VIVA_QUESTIONS.md`
- Screenshots: `../../SCREENSHOT_CHECKLIST.md`

## Assessment mapping

Frontend/UX, authentication/authorization, REST/business rules, database persistence, and integration testing are mapped with file references and verified results in `WEB_50_MARKS.md`.
