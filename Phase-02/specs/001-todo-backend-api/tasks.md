
---
description: "Task list for Todo Backend API & Data Layer implementation"
---

# Tasks: Todo Backend API & Data Layer

**Input**: Design documents from `/specs/001-todo-backend-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tasks-api.yaml

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend: Python FastAPI with SQLModel
- Frontend: Not modified by this feature (separate integration)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Verify authentication system (1-auth) is complete and operational
- [ ] T002 Verify users table exists in database with correct schema
- [ ] T003 [P] Create backend/migrations/002_create_tasks_table.sql migration file per data-model.md
- [ ] T004 [P] Create backend/src/models/task.py file structure (empty, will be filled in Phase 2)
- [ ] T005 [P] Create backend/src/services/task_service.py file structure (empty, will be filled in Phase 2)
- [ ] T006 [P] Create backend/src/api/tasks.py file structure (empty, will be filled in Phase 2)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Run database migration backend/migrations/002_create_tasks_table.sql to create tasks table
- [ ] T008 Verify tasks table schema matches data-model.md (id, title, description, completed, user_id, created_at, updated_at)
- [ ] T009 Verify foreign key constraint tasks.user_id → users.id exists
- [ ] T010 Verify indexes exist (idx_tasks_user_id, idx_tasks_completed, idx_tasks_created_at)
- [ ] T011 [P] Create Task model in backend/src/models/task.py (SQLModel with table=True, 7 fields per data-model.md)
- [ ] T012 [P] Create TaskCreate DTO in backend/src/models/task.py (title, description fields with validation)
- [ ] T013 [P] Create TaskUpdate DTO in backend/src/models/task.py (title, description fields with validation)
- [ ] T014 [P] Create TaskResponse DTO in backend/src/models/task.py (all fields for API responses)
- [ ] T015 Verify get_current_user dependency exists in backend/src/core/security.py (from 1-auth feature)
- [ ] T016 Verify get_session dependency exists in backend/src/core/database.py (from 1-auth feature)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and List Personal Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to create new tasks and view all their existing tasks with strict user isolation

**Independent Test**: User can authenticate, create multiple tasks with different titles, and retrieve a list showing only their own tasks. Verify that tasks created by User A are not visible to User B.

### Implementation for User Story 1

- [ ] T017 [US1] Create list_tasks function in backend/src/services/task_service.py (query tasks filtered by user_id, return List[Task])
- [ ] T018 [US1] Create create_task function in backend/src/services/task_service.py (validate title, create task with user_id, return Task)
- [ ] T019 [US1] Implement GET /api/tasks endpoint in backend/src/api/tasks.py (use get_current_user dependency, call list_tasks service, return 200 with TaskResponse list)
- [ ] T020 [US1] Implement POST /api/tasks endpoint in backend/src/api/tasks.py (use get_current_user dependency, validate TaskCreate, call create_task service, return 201 with TaskResponse)
- [ ] T021 [US1] Add title validation in backend/src/services/task_service.py create_task function (reject empty titles with 400 Bad Request)
- [ ] T022 [US1] Add user_id filtering in backend/src/services/task_service.py list_tasks function (WHERE Task.user_id == current_user.id)
- [ ] T023 [US1] Register tasks router in backend/src/main.py (app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"]))
- [ ] T024 [US1] Test POST /api/tasks with valid JWT token (verify 201 Created response with task data)
- [ ] T025 [US1] Test GET /api/tasks with valid JWT token (verify 200 OK response with user's tasks only)
- [ ] T026 [US1] Test POST /api/tasks without JWT token (verify 401 Unauthorized response)
- [ ] T027 [US1] Test GET /api/tasks without JWT token (verify 401 Unauthorized response)
- [ ] T028 [US1] Test cross-user isolation (User A creates task, User B lists tasks, verify User B does not see User A's task)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create and list tasks with proper authentication and isolation

---

## Phase 4: User Story 2 - Update and Delete Tasks (Priority: P2)

**Goal**: Enable authenticated users to modify existing tasks (change title or description) and permanently remove tasks they no longer need

**Independent Test**: User can retrieve a specific task by ID, update its title or description, and delete tasks. Verify that users cannot modify or delete tasks belonging to other users.

### Implementation for User Story 2

- [ ] T029 [US2] Create get_task_by_id function in backend/src/services/task_service.py (query task by id AND user_id, return Task or None)
- [ ] T030 [US2] Create update_task function in backend/src/services/task_service.py (verify ownership, validate title, update task, return Task)
- [ ] T031 [US2] Create delete_task function in backend/src/services/task_service.py (verify ownership, delete task, return None)
- [ ] T032 [US2] Implement GET /api/tasks/{task_id} endpoint in backend/src/api/tasks.py (use get_current_user dependency, call get_task_by_id service, return 200 with TaskResponse or 404)
- [ ] T033 [US2] Implement PUT /api/tasks/{task_id} endpoint in backend/src/api/tasks.py (use get_current_user dependency, validate TaskUpdate, call update_task service, return 200 with TaskResponse or 404)
- [ ] T034 [US2] Implement DELETE /api/tasks/{task_id} endpoint in backend/src/api/tasks.py (use get_current_user dependency, call delete_task service, return 204 No Content or 404)
- [ ] T035 [US2] Add ownership verification in backend/src/services/task_service.py get_task_by_id function (WHERE Task.id == task_id AND Task.user_id == current_user.id)
- [ ] T036 [US2] Add ownership verification in backend/src/services/task_service.py update_task function (raise 404 if task not found or not owned)
- [ ] T037 [US2] Add ownership verification in backend/src/services/task_service.py delete_task function (raise 404 if task not found or not owned)
- [ ] T038 [US2] Test GET /api/tasks/{task_id} with valid JWT token and owned task (verify 200 OK response with task data)
- [ ] T039 [US2] Test PUT /api/tasks/{task_id} with valid JWT token and owned task (verify 200 OK response with updated task data)
- [ ] T040 [US2] Test DELETE /api/tasks/{task_id} with valid JWT token and owned task (verify 204 No Content response)
- [ ] T041 [US2] Test GET /api/tasks/{task_id} with valid JWT token but other user's task (verify 404 Not Found response)
- [ ] T042 [US2] Test PUT /api/tasks/{task_id} with valid JWT token but other user's task (verify 404 Not Found response)
- [ ] T043 [US2] Test DELETE /api/tasks/{task_id} with valid JWT token but other user's task (verify 404 Not Found response)
- [ ] T044 [US2] Test PUT /api/tasks/{task_id} with empty title (verify 400 Bad Request response)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can create, list, get, update, and delete tasks

---

## Phase 5: User Story 3 - Toggle Task Completion Status (Priority: P3)

**Goal**: Enable authenticated users to mark tasks as complete or incomplete without editing the entire task

**Independent Test**: User can mark a task as complete, verify the status changes, then mark it as incomplete again. Verify that completion status persists across sessions.

### Implementation for User Story 3

- [ ] T045 [US3] Create toggle_task_completion function in backend/src/services/task_service.py (verify ownership, toggle completed field, update updated_at, return Task)
- [ ] T046 [US3] Implement PATCH /api/tasks/{task_id}/complete endpoint in backend/src/api/tasks.py (use get_current_user dependency, call toggle_task_completion service, return 200 with TaskResponse or 404)
- [ ] T047 [US3] Add ownership verification in backend/src/services/task_service.py toggle_task_completion function (raise 404 if task not found or not owned)
- [ ] T048 [US3] Add toggle logic in backend/src/services/task_service.py toggle_task_completion function (if completed=False set to True, if completed=True set to False)
- [ ] T049 [US3] Test PATCH /api/tasks/{task_id}/complete with valid JWT token and incomplete task (verify 200 OK response with completed=True)
- [ ] T050 [US3] Test PATCH /api/tasks/{task_id}/complete with valid JWT token and completed task (verify 200 OK response with completed=False)
- [ ] T051 [US3] Test PATCH /api/tasks/{task_id}/complete with valid JWT token but other user's task (verify 404 Not Found response)
- [ ] T052 [US3] Test PATCH /api/tasks/{task_id}/complete without JWT token (verify 401 Unauthorized response)

**Checkpoint**: All user stories should now be independently functional - complete task management with creation, listing, updating, deletion, and completion toggling

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T053 [P] Add logging for task creation in backend/src/services/task_service.py create_task function (log user_id and task_id on success)
- [ ] T054 [P] Add logging for task updates in backend/src/services/task_service.py update_task function (log user_id and task_id on success)
- [ ] T055 [P] Add logging for task deletion in backend/src/services/task_service.py delete_task function (log user_id and task_id on success)
- [ ] T056 [P] Add logging for task completion toggle in backend/src/services/task_service.py toggle_task_completion function (log user_id, task_id, and new status)
- [ ] T057 [P] Add error logging for ownership verification failures in backend/src/services/task_service.py (log attempted unauthorized access)
- [ ] T058 [P] Update backend/README.md with task endpoints documentation (add 6 new endpoints to API documentation section)
- [ ] T059 [P] Verify all endpoints return correct HTTP status codes per contracts/tasks-api.yaml (200, 201, 204, 400, 401, 404)
- [ ] T060 [P] Verify all error responses match ErrorResponse schema from contracts/tasks-api.yaml ({"detail": "message"})
- [ ] T061 Validate quickstart.md instructions (run through all curl examples, verify responses match expected output)
- [ ] T062 [P] Verify task ownership is immutable (attempt to update user_id field, verify it's not allowed)
- [ ] T063 [P] Verify foreign key constraint works (attempt to create task with non-existent user_id, verify it fails)
- [ ] T064 [P] Verify CASCADE delete works (delete user, verify all their tasks are deleted)
- [ ] T065 Run full end-to-end test (create user, create tasks, list tasks, update task, toggle completion, delete task, verify all operations work)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T006) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion (T007-T016)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete (T017-T052)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (but logically follows US1 for testing)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (but requires tasks to exist for testing)

### Within Each User Story

- Service functions before API endpoints
- Core implementation before testing
- Ownership verification before cross-user testing
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup phase**: T003, T004, T005, T006 can run in parallel (different files)
- **Foundational phase**: T011, T012, T013, T014 can run in parallel (different DTOs in same file)
- **User Story 1**: T017, T018 can run in parallel (different service functions)
- **User Story 2**: T029, T030, T031 can run in parallel (different service functions)
- **User Story 3**: T045 is a single function (no parallelization within story)
- **Polish phase**: T053, T054, T055, T056, T057, T058, T059, T060, T062, T063, T064 can run in parallel (different concerns)

---

## Parallel Example: User Story 1

```bash
# Launch service functions in parallel:
Task T017: "Create list_tasks function in backend/src/services/task_service.py"
Task T018: "Create create_task function in backend/src/services/task_service.py"

# Then launch API endpoints in parallel:
Task T019: "Implement GET /api/tasks endpoint in backend/src/api/tasks.py"
Task T020: "Implement POST /api/tasks endpoint in backend/src/api/tasks.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T016) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T017-T028)
4. **STOP and VALIDATE**: Test user registration independently
   - Create tasks with valid JWT token
   - List tasks and verify only user's tasks appear
   - Test cross-user isolation (User A cannot see User B's tasks)
   - Test authentication (requests without token fail with 401)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T016)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (T017-T028)
3. Add User Story 2 → Test independently → Deploy/Demo (T029-T044)
4. Add User Story 3 → Test independently → Deploy/Demo (T045-T052)
5. Add Polish → Final release (T053-T065)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T016)
2. Once Foundational is done:
   - Developer A: User Story 1 (T017-T028)
   - Developer B: User Story 2 (T029-T044)
   - Developer C: User Story 3 (T045-T052)
3. Stories complete and integrate independently
4. Team completes Polish together (T053-T065)

---

## Task Summary

**Total Tasks**: 65
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 10 tasks
- Phase 3 (User Story 1 - Create and List): 12 tasks
- Phase 4 (User Story 2 - Update and Delete): 16 tasks
- Phase 5 (User Story 3 - Toggle Completion): 8 tasks
- Phase 6 (Polish): 13 tasks

**Parallel Opportunities**: 18 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- US1: User can create and list tasks with proper authentication and isolation
- US2: User can get, update, and delete tasks with ownership verification
- US3: User can toggle task completion status with ownership verification

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 28 tasks

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are explicit and follow the web application structure from plan.md
- Tests are NOT included as they were not explicitly requested in the specification
