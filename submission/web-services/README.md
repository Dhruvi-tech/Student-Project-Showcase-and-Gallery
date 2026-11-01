# Web Services / Full Stack Submission Package

## Project Overview

ProjectSpace is an API-backed student project gallery. Students can discover a preserved 320-project catalog, filter across 20 engineering domains, publish work, vote, comment, bookmark, follow categories, and manage account data.

## Architecture

React/Vite renders the interface and calls FastAPI REST endpoints. FastAPI validates JSON with Pydantic, applies authentication/authorization/business rules, and uses SQLAlchemy to persist to SQLite. See [docs/architecture.md](../../docs/architecture.md).

## Evidence & Materials

- **REST / OpenAPI Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Functional Matrix (50 Marks):** [WEB_50_MARKS.md](./WEB_50_MARKS.md)
- **Viva Questions & Answers:** [WEB_VIVA_QUESTIONS.md](./WEB_VIVA_QUESTIONS.md)
- **Verification & Test Results:** [../TEST_RESULTS.md](../TEST_RESULTS.md)
- **Demonstration Script:** [../FINAL_PRESENTATION_SCRIPT.md](../FINAL_PRESENTATION_SCRIPT.md)
- **Screenshot Checklist:** [../SCREENSHOT_CHECKLIST.md](../SCREENSHOT_CHECKLIST.md)

## Assessment Mapping

Frontend/UX, authentication/authorization, REST/business rules, database persistence, and integration testing are mapped with file references and verified results in [WEB_50_MARKS.md](./WEB_50_MARKS.md).
