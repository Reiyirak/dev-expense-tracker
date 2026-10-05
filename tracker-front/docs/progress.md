# Progress

> Running log so any forked session can orient without re-reading the full curriculum. Update as lessons complete.

## Teaching mode — guided code (current)
- **Status:** active on this branch
- **What changed:** the "no spoilers / structure only" pedagogy is retired. Lessons are delivered in chat as a from-zero explanation plus complete, paste-ready code blocks.
- **Hard rule:** the agent must NOT write/create/edit any file (no `src/` writes, no patching files for the user). The user does all copy-pasting, file creation, and typing. Reading the repo to tailor the code is fine; editing `docs/` is fine when explicitly asked.
- **Where the rules live:** `docs/curriculum.md` → *Pedagogical rules (current)* + *Lesson delivery format*, and the "Lesson Mode" block at the top of `docs/AGENTS.md`.
- **Lessons 1.1 – 3.1** were authored under the old rule; their "structure only" wording describes lesson *scope*, not delivery. Don't restore it.

## Module 1 — Project Setup & Modern Architecture
- **Status:** Module 1 complete
- **Lessons completed:** 1.1, 1.2, 1.3, 1.4
- **Next:** Start Module 2
- **Notes:** din't change a thing, Angular 22 is already Zoneless and onPush by default.

## Module 2 — State Management with Signal Stores
- **Status:** Module 2 complete
- **Lessons completed:** 2.1, 2.2, 2.3, 2.4
- **Next:** Start Module 3
- **Notes:** use side effects to load and save the state of the storage

## Module 3 — Form Handling & Data Logging
- **Status:** in progress
- **Lessons completed:** 3.1
- **Next:** 3.2 — Signal Forms vs Typed Reactive Forms
- **Notes:** 3.1 is a decision lesson, no code. Committed to Signal Forms (stable in v22).
  3.1's original self-check was wrong — put ReactiveFormsModule in app.config providers —
  amended; ReactiveFormsModule goes in a component's imports array, and Signal Forms
  don't need it. §4 filled. Do not restore the old check.

## Module 4 — Dashboard & Signal-Driven Communication
- **Status:** pending
- **Lessons completed:** —
- **Next:** —
- **Notes:** —

## Module 5 — Filtering, CSV Export & Advanced Features
- **Status:** pending
- **Lessons completed:** —
- **Next:** —
- **Notes:** —

## Phase 2 — .NET Backend Integration
- **Status:** reserved (waits on Phase 1 completion)
- **Folder:** `tracker-back/`
- **Stack:** ASP.NET Core Web API + EF Core + SQLite (planned)
- **REST contract:** documented in `docs/curriculum.md` → "Future: .NET Backend Integration (Phase 2 Preview)"

---

## Conventions for updating this file

- Update module status after the last lesson in a module is signed off (`in progress` → `done`).
- Append to **Notes** anything that would help a future session: design decisions, snags hit, files touched.
- When forking a new session at a module boundary, point it at this file + `docs/curriculum.md` to ground.
