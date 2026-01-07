# Implementation Plan: In-Memory Console Todo App (Phase I)

**Branch**: `1-console-todo` | **Date**: 2026-01-07 | **Spec**: `specs/1-console-todo/spec.md`
**Input**: Feature specification from `/specs/1-console-todo/spec.md`

## Summary

Deliver a deterministic, in-memory, interactive console todo app that supports add, view, update,
complete, delete, help, and exit. The app MUST remain Phase I compliant (standard library only,
no persistence, no external services) and be structured for readability and progressive
enhancement.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Standard library only
**Storage**: In-memory only (process lifetime; no files; no DB)
**Testing**: Not in scope for this feature (explicitly excluded)
**Target Platform**: Local developer machine (console stdin/stdout)
**Project Type**: Single project (CLI app)
**Performance Goals**: Human-interactive CLI; deterministic output
**Constraints**:
- No persistence
- No external libraries/frameworks
- Deterministic CLI behavior and errors
- Clear separation of concerns (logic, state, interface)

**Scale/Scope**: Single-user, interactive session; list sizes expected to be small

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ Phase I is console-only (stdin/stdout)
- ✅ Phase I storage is in-memory only (no files, no DB)
- ✅ Standard library only
- ✅ Clear separation of concerns (core logic vs interface)
- ✅ Deterministic behavior emphasized (IDs, output format, error handling)

No violations detected; no complexity justification required.

## Project Structure

### Documentation (this feature)

```text
specs/1-console-todo/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/
│   └── cli.md           # CLI contract for interactive commands
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── main.py        # App entry, command loop
├── commands.py    # Parse & validate user commands
├── todos.py       # Todo model + CRUD logic
└── storage.py     # In-memory state container
```

**Structure Decision**: Single project CLI structure. Keep domain logic in `todos.py` and the state
container in `storage.py`. Keep parsing/validation in `commands.py` and interactive IO loop in
`main.py`.

## Complexity Tracking

> No constitution violations detected → N/A

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

## Phase 0: Outline & Research

Artifacts generated:
- `specs/1-console-todo/research.md`

Key outcomes:
- Session-scoped monotonic integer IDs
- Consistent, line-oriented output
- Help printed at startup per requested flow

## Phase 1: Design & Contracts

Artifacts generated:
- `specs/1-console-todo/data-model.md`
- `specs/1-console-todo/contracts/cli.md`
- `specs/1-console-todo/quickstart.md`

## Post-design Constitution Re-check

- ✅ No persistence introduced
- ✅ Standard library only
- ✅ Deterministic contract documented
- ✅ Separation of concerns preserved via module boundaries

## Notes / Next step

Proceed to `/sp.tasks` to produce a dependency-ordered task list that implements the CLI contract
and satisfies the spec.
