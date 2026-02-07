# Tasks: Task Management UI

**Input**: Design documents from `/specs/2-task-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contract.md

**Tests**: No automated tests in scope (manual testing only per spec)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Backend**: Already implemented, no backend tasks needed

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and API client foundation

- [x] T001 [P] Create Task type definitions in frontend/src/types/task.ts
- [x] T002 [P] Add patch method to BackendAPIClient in frontend/src/lib/api-client.ts
- [x] T003 Create task API wrapper methods in frontend/src/lib/task-api.ts

**Checkpoint**: Type system and API client ready for component implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Route protection infrastructure that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create protected route directory structure at frontend/src/app/(protected)/tasks/
- [x] T005 Verify ProtectedRoute component exists at frontend/src/components/auth/ProtectedRoute.tsx
- [x] T006 Verify Better Auth client configuration in frontend/src/lib/auth-client.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and Manage Personal Tasks (Priority: P1) 🎯 MVP

**Goal**: Display task list for authenticated users with empty state, loading state, and responsive layout

**Independent Test**: Authenticate user, create tasks via backend API directly (curl/Postman), navigate to /tasks, verify tasks display correctly with title, description, completion status, sorted by creation date (newest first). Verify empty state when no tasks exist.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create EmptyState component in frontend/src/components/tasks/EmptyState.tsx
- [x] T008 [P] [US1] Create TaskList component skeleton in frontend/src/components/tasks/TaskList.tsx
- [x] T009 [P] [US1] Create TaskItem component skeleton (display only) in frontend/src/components/tasks/TaskItem.tsx
- [x] T010 [US1] Create TasksPage with ProtectedRoute wrapper in frontend/src/app/(protected)/tasks/page.tsx
- [x] T011 [US1] Implement task fetching logic with loading state in TasksPage
- [x] T012 [US1] Implement task list rendering with TaskList and TaskItem components
- [x] T013 [US1] Implement empty state display when tasks array is empty
- [x] T014 [US1] Add responsive layout styling for mobile (320px+) and desktop
- [x] T015 [US1] Add error handling for task fetch failures with inline error display
- [x] T016 [US1] Verify tasks are sorted by created_at descending (newest first)

**Checkpoint**: At this point, authenticated users can view their task list. This is the MVP - a functional read-only task viewer.

---

## Phase 4: User Story 2 - Create New Tasks (Priority: P1)

**Goal**: Allow authenticated users to create new tasks with title and optional description

**Independent Test**: Authenticate user, navigate to /tasks, fill in create form with title "Test Task" and description "Test Description", submit, verify task appears in list immediately, refresh page, verify task persists.

### Implementation for User Story 2

- [x] T017 [P] [US2] Create TaskForm component in frontend/src/components/tasks/TaskForm.tsx
- [x] T018 [US2] Implement form state management (title, description, isSubmitting, error)
- [x] T019 [US2] Implement client-side validation (title required, 1-500 chars, description max 2000 chars)
- [x] T020 [US2] Add TaskForm to TasksPage above TaskList
- [x] T021 [US2] Implement handleCreate function in TasksPage with optimistic update
- [x] T022 [US2] Implement API call to taskAPI.create with error handling
- [x] T023 [US2] Implement rollback logic on API error
- [x] T024 [US2] Add form submission loading state and disable button during submission
- [x] T025 [US2] Clear form after successful task creation
- [x] T026 [US2] Display validation errors inline below form fields

**Checkpoint**: At this point, users can view AND create tasks. MVP is now interactive.

---

## Phase 5: User Story 3 - Mark Tasks as Complete (Priority: P1)

**Goal**: Allow authenticated users to toggle task completion status with immediate visual feedback

**Independent Test**: Authenticate user, create task, click completion checkbox, verify task is marked complete visually (strikethrough/checkmark), verify status persists after page refresh, toggle again to mark incomplete.

### Implementation for User Story 3

- [x] T027 [US3] Add completion checkbox to TaskItem component
- [x] T028 [US3] Implement handleToggle function in TasksPage with optimistic update
- [x] T029 [US3] Implement API call to taskAPI.toggleComplete with error handling
- [x] T030 [US3] Implement rollback logic on API error
- [x] T031 [US3] Add visual styling for completed tasks (strikethrough text, checkmark icon)
- [x] T032 [US3] Add loading state during toggle operation (disable checkbox)
- [x] T033 [US3] Display error message inline if toggle fails

**Checkpoint**: At this point, users can view, create, and complete tasks. Core task management functionality is complete.

---

## Phase 6: User Story 6 - Secure Access to Tasks (Priority: P1)

**Goal**: Ensure unauthenticated users cannot access task pages and are redirected to signin

**Independent Test**: Sign out, attempt to navigate to /tasks, verify redirect to /signin. Sign in, verify access to /tasks is granted. Let session expire, attempt task operation, verify redirect to /signin.

### Implementation for User Story 6

- [x] T034 [US6] Verify ProtectedRoute wrapper is correctly applied to TasksPage
- [x] T035 [US6] Test unauthenticated access redirects to /signin
- [x] T036 [US6] Verify JWT token is attached to all API requests (check api-client.ts)
- [x] T037 [US6] Test 401 error handling redirects to /signin
- [x] T038 [US6] Verify authentication state persists across page navigation

**Checkpoint**: Security requirements are met. All P1 user stories are now complete.

---

## Phase 7: User Story 4 - Edit Existing Tasks (Priority: P2)

**Goal**: Allow authenticated users to edit task titles and descriptions inline

**Independent Test**: Authenticate user, create task, click edit button/icon, modify title to "Updated Task", modify description, save, verify changes display immediately, refresh page, verify changes persist.

### Implementation for User Story 4

- [x] T039 [US4] Add edit mode state to TaskItem component (isEditing)
- [x] T040 [US4] Add edit button/icon to TaskItem component
- [x] T041 [US4] Implement inline edit form in TaskItem (title input, description textarea)
- [x] T042 [US4] Implement client-side validation in edit mode (same rules as create)
- [x] T043 [US4] Implement handleUpdate function in TasksPage with optimistic update
- [x] T044 [US4] Implement API call to taskAPI.update with error handling
- [x] T045 [US4] Implement rollback logic on API error
- [x] T046 [US4] Add cancel button to discard changes and exit edit mode
- [x] T047 [US4] Add save button with loading state during update
- [x] T048 [US4] Display validation errors inline in edit form

**Checkpoint**: At this point, users can edit existing tasks. Quality-of-life feature added.

---

## Phase 8: User Story 5 - Delete Tasks (Priority: P2)

**Goal**: Allow authenticated users to delete tasks with confirmation dialog

**Independent Test**: Authenticate user, create task, click delete button, verify confirmation dialog appears, confirm deletion, verify task is removed from list immediately, refresh page, verify task is gone. Test cancel flow - task should remain.

### Implementation for User Story 5

- [x] T049 [US5] Add delete button/icon to TaskItem component
- [x] T050 [US5] Add delete confirmation state to TaskItem (isDeleting)
- [x] T051 [US5] Implement confirmation dialog/prompt on delete button click
- [x] T052 [US5] Implement handleDelete function in TasksPage with optimistic update
- [x] T053 [US5] Implement API call to taskAPI.delete with error handling
- [x] T054 [US5] Implement rollback logic on API error (restore deleted task)
- [x] T055 [US5] Add loading state during delete operation
- [x] T056 [US5] Display error message inline if delete fails

**Checkpoint**: All user stories are now complete. Full CRUD functionality implemented.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T057 [P] Add responsive design testing for mobile (320px), tablet (768px), desktop (1024px+)
- [x] T058 [P] Add loading spinners/skeletons for better UX during async operations
- [x] T059 [P] Verify all error messages are user-friendly and actionable
- [x] T060 [P] Add visual feedback for optimistic updates (subtle animations/transitions)
- [ ] T061 [P] Test with 100 tasks to verify performance (SC-009) - REQUIRES MANUAL TESTING
- [ ] T062 [P] Verify task list loads within 2 seconds (SC-001) - REQUIRES MANUAL TESTING
- [ ] T063 [P] Verify completion toggle feedback within 500ms (SC-003) - REQUIRES MANUAL TESTING
- [ ] T064 [P] Test full workflow (signin → create → complete → delete) under 2 minutes (SC-007) - REQUIRES MANUAL TESTING
- [ ] T065 Run complete manual testing checklist from specs/2-task-ui/quickstart.md - REQUIRES MANUAL TESTING
- [ ] T066 Verify all 10 success criteria from spec.md are met - REQUIRES MANUAL TESTING
- [ ] T067 Cross-browser testing (Chrome, Firefox, Safari) - REQUIRES MANUAL TESTING
- [ ] T068 Mobile device testing (iOS, Android) - REQUIRES MANUAL TESTING
- [x] T069 Code cleanup and remove console.log statements
- [ ] T070 Update environment variables documentation if needed - REQUIRES VERIFICATION

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 (View) - Can start after Foundational
  - US2 (Create) - Depends on US1 (needs TasksPage and TaskList)
  - US3 (Toggle) - Depends on US1 (needs TaskItem display)
  - US6 (Security) - Can start after Foundational (parallel with US1-3)
  - US4 (Edit) - Depends on US1 (needs TaskItem display)
  - US5 (Delete) - Depends on US1 (needs TaskItem display)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 (needs TasksPage structure and state management)
- **User Story 3 (P1)**: Depends on US1 (needs TaskItem component)
- **User Story 6 (P1)**: Can start after Foundational - Independent (security layer)
- **User Story 4 (P2)**: Depends on US1 (needs TaskItem component)
- **User Story 5 (P2)**: Depends on US1 (needs TaskItem component)

### Within Each User Story

- Setup tasks (T001-T003) can run in parallel
- Foundational tasks (T004-T006) are verification only, can run in parallel
- Within US1: T007, T008, T009 can run in parallel (different components)
- Within US2: T017, T018, T019 can be done together (same component)
- Components before integration into TasksPage
- Core implementation before polish

### Parallel Opportunities

- **Phase 1**: All 3 tasks marked [P] can run in parallel (different files)
- **Phase 2**: All 3 tasks can run in parallel (verification only)
- **Phase 3 (US1)**: T007, T008, T009 can run in parallel (EmptyState, TaskList, TaskItem are independent)
- **Phase 9**: Most polish tasks marked [P] can run in parallel (testing, validation)

---

## Parallel Example: User Story 1

```bash
# Launch all component skeletons for User Story 1 together:
Task: "Create EmptyState component in frontend/src/components/tasks/EmptyState.tsx"
Task: "Create TaskList component skeleton in frontend/src/components/tasks/TaskList.tsx"
Task: "Create TaskItem component skeleton (display only) in frontend/src/components/tasks/TaskItem.tsx"

# Then integrate them sequentially:
Task: "Create TasksPage with ProtectedRoute wrapper"
Task: "Implement task fetching logic with loading state"
Task: "Implement task list rendering"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3, 6 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006) - CRITICAL
3. Complete Phase 3: User Story 1 (T007-T016) - View tasks
4. Complete Phase 4: User Story 2 (T017-T026) - Create tasks
5. Complete Phase 5: User Story 3 (T027-T033) - Toggle completion
6. Complete Phase 6: User Story 6 (T034-T038) - Security
7. **STOP and VALIDATE**: Test all P1 stories independently
8. Deploy/demo MVP

**MVP Scope**: 38 tasks (T001-T038) deliver core functionality

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (6 tasks)
2. Add User Story 1 → Test independently → Deploy/Demo (16 tasks total - read-only viewer)
3. Add User Story 2 → Test independently → Deploy/Demo (26 tasks total - can create)
4. Add User Story 3 → Test independently → Deploy/Demo (33 tasks total - can complete)
5. Add User Story 6 → Test independently → Deploy/Demo (38 tasks total - MVP complete!)
6. Add User Story 4 → Test independently → Deploy/Demo (48 tasks total - can edit)
7. Add User Story 5 → Test independently → Deploy/Demo (56 tasks total - full CRUD)
8. Add Polish → Final validation → Production ready (70 tasks total)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T006)
2. Once Foundational is done:
   - Developer A: User Story 1 (T007-T016) - View
   - Developer B: User Story 6 (T034-T038) - Security (can work in parallel)
3. After US1 complete:
   - Developer A: User Story 2 (T017-T026) - Create
   - Developer B: User Story 3 (T027-T033) - Toggle
4. After US1 complete:
   - Developer C: User Story 4 (T039-T048) - Edit
   - Developer D: User Story 5 (T049-T056) - Delete
5. All developers: Polish tasks in parallel (T057-T070)

---

## Task Summary

**Total Tasks**: 70

**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 3 tasks
- Phase 3 (US1 - View): 10 tasks
- Phase 4 (US2 - Create): 10 tasks
- Phase 5 (US3 - Toggle): 7 tasks
- Phase 6 (US6 - Security): 5 tasks
- Phase 7 (US4 - Edit): 10 tasks
- Phase 8 (US5 - Delete): 8 tasks
- Phase 9 (Polish): 14 tasks

**By Priority**:
- P1 User Stories (US1, US2, US3, US6): 38 tasks (MVP)
- P2 User Stories (US4, US5): 18 tasks (Quality-of-life)
- Infrastructure (Setup, Foundational, Polish): 20 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel

**Independent Test Criteria**:
- US1: View task list with empty state and loading
- US2: Create task and see it appear in list
- US3: Toggle completion and see visual update
- US6: Unauthenticated access redirects to signin
- US4: Edit task and see changes persist
- US5: Delete task and see it removed from list

**Suggested MVP Scope**: Tasks T001-T038 (38 tasks) deliver all P1 user stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests in scope (manual testing only per spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend API already exists and is functional - no backend tasks needed
- Existing auth infrastructure (Better Auth, ProtectedRoute) already works
- Focus on frontend component implementation and API integration
