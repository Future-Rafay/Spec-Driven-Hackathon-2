---

description: "Tasks for implementing Phase I in-memory console todo app"
---

# Tasks: In-Memory Console Todo App (Phase I)

**Input**: Design documents from `/specs/1-console-todo/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not included (explicitly out of scope in the feature specification).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths below follow the structure defined in `specs/1-console-todo/plan.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create source directory `src/` at repository root
- [ ] T002 [P] Create app entrypoint skeleton in `src/main.py` (command loop stub)
- [ ] T003 [P] Create command parsing skeleton in `src/commands.py` (parse/validate stubs)
- [ ] T004 [P] Create todo domain skeleton in `src/todos.py` (Todo type + service stubs)
- [ ] T005 [P] Create in-memory storage skeleton in `src/storage.py` (state container + id counter stubs)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Define deterministic output conventions (prefixes + view formatting) in `src/main.py`
- [ ] T007 Implement command parser contract (help/add/view/update/complete/delete/exit) in `src/commands.py`
- [ ] T008 Implement shared argument validation helpers (id parsing, title trimming) in `src/commands.py`
- [ ] T009 Implement in-memory state container (todos dict + monotonic id counter) in `src/storage.py`
- [ ] T010 Implement Todo entity representation and validation rules in `src/todos.py`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Manage todos from the console (Priority: P1) 🎯 MVP

**Goal**: Users can add, view, update, complete, and delete todos in a single interactive session.

**Independent Test**: Run the app and complete the quickstart example session from `specs/1-console-todo/quickstart.md`.

### Implementation for User Story 1

- [ ] T011 [US1] Wire the command loop to the parser in `src/main.py` (read line → parse → dispatch)
- [ ] T012 [US1] Implement `add` command execution in `src/main.py` using functions in `src/todos.py` and `src/storage.py`
- [ ] T013 [US1] Implement `view` command execution in `src/main.py` with deterministic formatting
- [ ] T014 [US1] Implement `update` command execution in `src/main.py`
- [ ] T015 [US1] Implement `complete` command execution in `src/main.py`
- [ ] T016 [US1] Implement `delete` command execution in `src/main.py`
- [ ] T017 [US1] Implement CRUD functions (create/list/update/complete/delete) in `src/todos.py` (no IO)
- [ ] T018 [US1] Implement storage operations needed for CRUD in `src/storage.py` (no IO)
- [ ] T019 [US1] Ensure `view` output includes id, completion status, and title (per `specs/1-console-todo/contracts/cli.md`) in `src/main.py`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Get predictable errors and help text (Priority: P2)

**Goal**: Users get deterministic help and deterministic error messages; invalid input never mutates in-memory state.

**Independent Test**: Run invalid commands and verify state is unchanged (compare `view` output before/after).

### Implementation for User Story 2

- [ ] T020 [US2] Print help on startup in `src/main.py` (use shared help text function)
- [ ] T021 [US2] Implement `help` command output in `src/main.py` (calls formatting in `src/commands.py`)
- [ ] T022 [US2] Implement deterministic errors for unknown command in `src/commands.py` and surface in `src/main.py`
- [ ] T023 [US2] Implement deterministic errors for missing args (per-command usage) in `src/commands.py`
- [ ] T024 [US2] Implement deterministic errors for invalid ID format in `src/commands.py`
- [ ] T025 [US2] Ensure not-found ID errors are deterministic and do not mutate state in `src/todos.py`
- [ ] T026 [US2] Normalize whitespace + case-insensitive commands in `src/commands.py`

**Checkpoint**: At this point, US1 operations still work, and invalid input behavior is predictable and non-mutating

---

## Phase 5: User Story 3 - Exit without side effects (Priority: P3)

**Goal**: Users can exit cleanly; restarting the app yields an empty list and no persistence.

**Independent Test**: Add a todo, exit, restart, and confirm `view` shows an empty list.

### Implementation for User Story 3

- [ ] T027 [US3] Implement `exit` command handling in `src/main.py` (break loop deterministically)
- [ ] T028 [US3] Ensure no file IO exists in the codebase (audit `src/` for open/write usage)

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T029 [P] Align CLI behavior with `specs/1-console-todo/contracts/cli.md` examples (audit outputs) in `src/main.py`
- [ ] T030 [P] Run quickstart manual validation and update `specs/1-console-todo/quickstart.md` if outputs differ
- [ ] T031 Code cleanup/refactor for readability (no behavior change) across `src/*.py`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
  - Implement sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation for core functionality
- **User Story 2 (P2)**: Depends on US1 because it validates that errors do not mutate state
- **User Story 3 (P3)**: Largely independent, but implemented last to match delivery priorities

### Within Each User Story

- Parsing/validation before execution
- Domain logic (`src/todos.py`) before wiring IO (`src/main.py`)
- Ensure error paths are deterministic and non-mutating

### Parallel Opportunities

- Setup file creation tasks T002–T005 can be done in parallel
- Polish tasks T029–T030 can be done in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Implement CRUD functions in src/todos.py"
Task: "Implement storage operations in src/storage.py"
Task: "Wire command loop to parser in src/main.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. STOP and VALIDATE: Run the quickstart session

### Incremental Delivery

1. US1 (core CRUD + complete)
2. US2 (deterministic help/errors; non-mutating invalid input)
3. US3 (exit + no-side-effects audit)
