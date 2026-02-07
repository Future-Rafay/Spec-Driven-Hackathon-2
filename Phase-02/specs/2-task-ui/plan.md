# Implementation Plan: Task Management UI

**Branch**: `2-task-ui` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/2-task-ui/spec.md`

## Summary

Implement a responsive Next.js frontend for task management that integrates with the existing FastAPI backend. The feature provides authenticated users with a complete CRUD interface for managing personal todo tasks, including creation, editing, deletion, and completion tracking. The implementation leverages existing Better Auth authentication and the already-functional backend task API endpoints.

**Technical Approach**: Build a single-page task management interface using Next.js App Router with component-based route protection, React state management for local UI state, and optimistic updates for better user experience. All task operations communicate with the backend via a centralized API client that automatically attaches JWT tokens.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+ (App Router)
**Primary Dependencies**:
- React 18+ (UI framework)
- Next.js 16+ (App Router)
- Better Auth (authentication, already configured)
- Native fetch API (HTTP client, wrapped in existing api-client.ts)

**Storage**: Backend PostgreSQL via REST API (no direct database access from frontend)
**Testing**: Manual testing against acceptance criteria (no automated tests in scope)
**Target Platform**: Web browsers (Chrome, Firefox, Safari) on desktop and mobile
**Project Type**: Web application (frontend only, backend already exists)
**Performance Goals**:
- Task list load < 2 seconds
- UI feedback < 500ms for interactions
- Support 100 tasks without performance degradation

**Constraints**:
- Must use existing Better Auth for authentication
- Must communicate with backend at `http://localhost:8080`
- Must use Next.js App Router (not Pages Router)
- JWT tokens must be passed via Authorization header
- No direct database access from frontend
- Must work on screens as small as 320px wide

**Scale/Scope**:
- Single-user task management (multi-user via backend isolation)
- ~4 React components
- ~100-200 lines per component
- 1 protected route (`/tasks`)
- 6 API endpoint integrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Spec-Driven Development First
- **Status**: PASS
- **Evidence**: Complete specification exists at `specs/2-task-ui/spec.md` with all requirements, user stories, and success criteria defined before implementation planning.

### ✅ Security-by-Design
- **Status**: PASS
- **Evidence**:
  - Route protection via `ProtectedRoute` component (FR-007)
  - JWT tokens automatically attached to all API requests (FR-008)
  - Backend enforces user-scoped queries (no frontend security bypass possible)
  - No sensitive data stored in localStorage (JWT tokens are short-lived)
  - Token expiration handled with redirect to signin (FR-014)

### ✅ Zero Manual Coding
- **Status**: PASS
- **Evidence**: All implementation will be generated via Claude Code using available agents and skills from `.claude/agents` and `.claude/skills`. Plan explicitly delegates work to:
  - `frontend-builder` skill for UI components
  - `auth-skill` for authentication integration
  - `backend-core` for API client enhancements

### ✅ Clear Separation of Concerns
- **Status**: PASS
- **Evidence**:
  - Frontend communicates with backend only via REST API (TC-003)
  - No business logic duplication (backend is source of truth)
  - Clear component boundaries: TasksPage (orchestration), TaskList (display), TaskItem (individual task), TaskForm (input)
  - API client layer abstracts HTTP communication
  - Type definitions separate from components

### ✅ Production-Oriented Architecture
- **Status**: PASS
- **Evidence**:
  - Comprehensive error handling (FR-010, inline error messages)
  - Loading states for all async operations (FR-009)
  - Input validation before API calls (FR-003)
  - Optimistic updates with rollback on error (FR-016)
  - Environment-based configuration (NEXT_PUBLIC_BACKEND_URL)
  - Responsive design for mobile and desktop (FR-012)

### ✅ Deterministic and Reproducible Outputs
- **Status**: PASS
- **Evidence**:
  - Complete specification, plan, research, data model, and contracts documented
  - All architectural decisions recorded with rationale
  - Implementation can be regenerated from specs and plan
  - No undocumented manual steps required

### ✅ Technology Stack Compliance
- **Status**: PASS
- **Evidence**:
  - Next.js 16+ App Router (REQUIRED) ✅
  - Better Auth with JWT (REQUIRED) ✅
  - FastAPI backend (already exists) ✅
  - PostgreSQL database (already exists) ✅
  - Spec-Kit Plus for planning (this document) ✅

**Overall Gate Status**: ✅ PASS - All constitutional requirements met. Proceed with implementation.

## Project Structure

### Documentation (this feature)

```text
specs/2-task-ui/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file - implementation plan
├── research.md          # Phase 0 output - architectural decisions
├── data-model.md        # Phase 1 output - frontend data structures
├── quickstart.md        # Phase 1 output - developer guide
├── contracts/           # Phase 1 output - API contracts
│   └── api-contract.md  # Backend API documentation
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Existing auth routes
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── (protected)/         # Protected routes group
│   │   │   ├── profile/         # Existing profile page
│   │   │   └── tasks/           # NEW: Task management page
│   │   │       └── page.tsx     # Main tasks page component
│   │   ├── layout.tsx           # Root layout (existing)
│   │   └── page.tsx             # Home page (existing)
│   ├── components/
│   │   ├── auth/                # Existing auth components
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── SigninForm.tsx
│   │   │   └── SignupForm.tsx
│   │   └── tasks/               # NEW: Task components
│   │       ├── TaskList.tsx     # Task list display
│   │       ├── TaskItem.tsx     # Individual task item
│   │       ├── TaskForm.tsx     # Create/edit form
│   │       └── EmptyState.tsx   # Empty state message
│   ├── lib/
│   │   ├── auth-client.ts       # Existing Better Auth client
│   │   ├── api-client.ts        # Existing backend API client
│   │   ├── auth.ts              # Existing auth utilities
│   │   └── task-api.ts          # NEW: Task API methods
│   └── types/
│       ├── auth.ts              # Existing auth types
│       └── task.ts              # NEW: Task type definitions
└── tests/                       # Out of scope for this feature

backend/
├── src/
│   ├── api/
│   │   ├── auth.py              # Existing auth endpoints
│   │   └── tasks.py             # Existing task endpoints (already implemented)
│   ├── models/
│   │   ├── user.py              # Existing user model
│   │   └── task.py              # Existing task model (already implemented)
│   ├── services/
│   │   └── task_service.py      # Existing task service (already implemented)
│   └── core/
│       ├── database.py          # Existing database connection
│       └── security.py          # Existing JWT verification
└── migrations/
    └── 002_create_tasks_table.sql  # Existing task table migration
```

**Structure Decision**: Web application structure (Option 2 from template) with frontend and backend separation. Frontend uses Next.js App Router with route groups for authentication state (`(auth)` for public routes, `(protected)` for authenticated routes). Backend structure already exists and is functional.

## Complexity Tracking

No constitutional violations. This section is not applicable.

## Architecture

### Frontend Architecture

#### Route Structure

```
/ (root)
├── /signin                    # Public: Sign in page (existing)
├── /signup                    # Public: Sign up page (existing)
├── /profile                   # Protected: User profile (existing)
└── /tasks                     # Protected: Task management (NEW)
```

**Route Protection Strategy**: Component-based protection using existing `ProtectedRoute` wrapper component. The `/tasks` page will be wrapped with `<ProtectedRoute>` which checks authentication state and redirects to `/signin` if unauthenticated.

**Rationale**: Leverages existing infrastructure, provides clear loading states, and is simpler to implement than middleware-based protection for this feature scope.

#### Component Hierarchy

```
TasksPage (page.tsx)
├── ProtectedRoute (wrapper)
├── Header/Title
├── TaskForm (create new task)
│   ├── Title input
│   ├── Description textarea
│   ├── Submit button
│   └── Error display
├── TaskList (display tasks)
│   ├── EmptyState (when no tasks)
│   └── TaskItem[] (array of tasks)
│       ├── Completion checkbox
│       ├── Task content (title, description)
│       ├── Edit mode (inline)
│       ├── Delete button
│       └── Error display
└── Page-level error display
```

**Component Responsibilities**:

1. **TasksPage** (`app/(protected)/tasks/page.tsx`):
   - Fetch tasks on mount
   - Manage tasks array state
   - Handle all CRUD operations
   - Implement optimistic updates
   - Coordinate between child components
   - Handle page-level errors

2. **TaskList** (`components/tasks/TaskList.tsx`):
   - Receive tasks array as prop
   - Render TaskItem for each task
   - Show EmptyState when tasks.length === 0
   - Pass event handlers to TaskItem

3. **TaskItem** (`components/tasks/TaskItem.tsx`):
   - Display single task (title, description, completion status)
   - Toggle completion on checkbox click
   - Enter edit mode on click/button
   - Show inline edit form in edit mode
   - Trigger delete with confirmation
   - Display item-level errors

4. **TaskForm** (`components/tasks/TaskForm.tsx`):
   - Controlled form inputs (title, description)
   - Client-side validation
   - Submit handler
   - Loading state during submission
   - Display form-level errors

5. **EmptyState** (`components/tasks/EmptyState.tsx`):
   - Display friendly message when no tasks exist
   - Encourage user to create first task

#### State Management

**Approach**: React useState + useEffect with local component state (no external state management library).

**State Structure**:

```typescript
// TasksPage state
const [tasks, setTasks] = useState<Task[]>([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

// TaskItem state (per item)
const [isEditing, setIsEditing] = useState(false)
const [isDeleting, setIsDeleting] = useState(false)
const [isToggling, setIsToggling] = useState(false)
const [error, setError] = useState<string | null>(null)

// TaskForm state
const [title, setTitle] = useState('')
const [description, setDescription] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**Rationale**: Simple CRUD operations don't require complex state management. Backend is source of truth. Local state is sufficient for UI coordination.

#### Data Flow

**Optimistic Update Pattern** (for all mutations):

1. Save current state for rollback
2. Update UI state immediately (optimistic)
3. Call backend API
4. On success: Update state with backend response
5. On error: Rollback to saved state, display error

**Example - Toggle Completion**:
```typescript
const handleToggle = async (taskId: string) => {
  // 1. Save current state
  const previousTasks = [...tasks]

  // 2. Optimistic update
  setTasks(tasks.map(t =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  ))

  // 3. Call API
  try {
    const updated = await taskAPI.toggleComplete(taskId)
    // 4. Update with backend response
    setTasks(tasks.map(t => t.id === updated.id ? updated : t))
  } catch (error) {
    // 5. Rollback on error
    setTasks(previousTasks)
    setError(getErrorMessage(error))
  }
}
```

### API Integration

#### API Client Architecture

**Existing Infrastructure**: `frontend/src/lib/api-client.ts` provides `BackendAPIClient` class with methods:
- `get<T>(endpoint: string): Promise<T>`
- `post<T>(endpoint: string, data: any): Promise<T>`
- `put<T>(endpoint: string, data: any): Promise<T>`
- `delete<T>(endpoint: string): Promise<T>`

**Enhancement Required**: Add `patch` method for toggle completion endpoint.

**New Task API Layer**: `frontend/src/lib/task-api.ts` will provide task-specific methods:

```typescript
export const taskAPI = {
  list: () => backendAPI.get<Task[]>('/api/tasks'),
  create: (data: TaskCreateInput) => backendAPI.post<Task>('/api/tasks', data),
  get: (id: string) => backendAPI.get<Task>(`/api/tasks/${id}`),
  update: (id: string, data: TaskUpdateInput) =>
    backendAPI.put<Task>(`/api/tasks/${id}`, data),
  delete: (id: string) => backendAPI.delete(`/api/tasks/${id}`),
  toggleComplete: (id: string) =>
    backendAPI.patch<Task>(`/api/tasks/${id}/complete`)
}
```

**JWT Token Handling**: Existing `api-client.ts` already handles JWT token attachment via `getAuthHeaders()` method. Tokens are retrieved from localStorage (set during signin) and cached for performance.

**Error Handling**: Existing client handles:
- 401 errors → Clear token, redirect to `/signin`
- Other errors → Parse error response, throw with message

### Authentication Integration

**Existing Infrastructure**:
- Better Auth configured with JWT plugin
- `auth-client.ts` provides Better Auth React client
- `ProtectedRoute.tsx` component checks auth state
- JWT tokens stored in localStorage after signin

**Integration Points**:
1. Wrap `/tasks` page with `<ProtectedRoute>`
2. Use existing `backendAPI` client (automatically attaches JWT)
3. Handle 401 responses (already implemented in api-client)

**No changes required** to existing auth infrastructure.

### UI/UX Design

#### Layout

```
┌─────────────────────────────────────┐
│ Header: "My Tasks"                  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Create Task Form                │ │
│ │ [Title input]                   │ │
│ │ [Description textarea]          │ │
│ │ [Create Button]                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Task List                           │
│ ┌─────────────────────────────────┐ │
│ │ ☐ Task 1 Title                  │ │
│ │   Description text...           │ │
│ │   [Edit] [Delete]               │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ☑ Task 2 Title (completed)      │ │
│ │   Description text...           │ │
│ │   [Edit] [Delete]               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Responsive Breakpoints

- **Mobile** (320px - 767px): Single column, full width, stacked layout
- **Tablet** (768px - 1023px): Single column, max-width container
- **Desktop** (1024px+): Centered container, max-width 800px

#### Visual States

1. **Loading**: Spinner or skeleton while fetching tasks
2. **Empty**: Friendly message when no tasks exist
3. **Error**: Red text with error message (inline, near relevant element)
4. **Success**: Immediate visual feedback (optimistic updates)
5. **Disabled**: Buttons disabled during async operations

### Validation Strategy

#### Client-Side Validation

**Title**:
- Required (cannot be empty)
- Min length: 1 character (after trim)
- Max length: 500 characters
- Validation timing: On submit (not on blur, to avoid annoying users)

**Description**:
- Optional
- Max length: 2000 characters
- Validation timing: On submit

**Error Display**: Inline below form field in red text.

#### Backend Validation

Backend performs same validation and returns 422 with error details. Frontend displays backend validation errors if client-side validation is bypassed.

### Error Handling Strategy

**Error Types**:

1. **Network Errors**: "Network error. Please check your connection."
2. **401 Unauthorized**: Redirect to `/signin` (handled by api-client)
3. **404 Not Found**: "Task not found."
4. **422 Validation**: Display specific field errors
5. **500 Server Error**: "An unexpected error occurred. Please try again."

**Error Display**:
- Form errors: Below form fields
- Operation errors: Below affected task item
- Page errors: Top of page (for load failures)

**Error Clearing**: Errors clear on next successful operation or user retry.

## Key Architectural Decisions

### Decision 1: Component-Based Route Protection

**Options Considered**:
1. Middleware-based (Next.js middleware.ts)
2. Layout-based (layout.tsx with auth check)
3. Component-based (ProtectedRoute wrapper) ✅ CHOSEN

**Decision**: Use existing `ProtectedRoute` component wrapper.

**Rationale**:
- Already exists in codebase (`components/auth/ProtectedRoute.tsx`)
- Works well with Better Auth session management
- Simpler to implement and maintain
- Provides clear loading states
- Can be enhanced later if needed

**Trade-offs**:
- Client-side only (potential flash of unauthenticated content)
- Acceptable for this feature scope (not handling sensitive data display)

---

### Decision 2: Local State Management (No External Library)

**Options Considered**:
1. React useState + useEffect ✅ CHOSEN
2. React Context API
3. External library (React Query, SWR, Zustand)

**Decision**: Use React built-in state management.

**Rationale**:
- Feature scope is limited to basic CRUD
- No complex state sharing between distant components
- Backend is source of truth (no complex client-side state)
- Keeps dependencies minimal (constitutional principle)
- Can refactor later if caching becomes necessary

**Trade-offs**:
- Manual cache invalidation
- No automatic refetching
- Acceptable for MVP scope

---

### Decision 3: Optimistic UI Updates

**Options Considered**:
1. Optimistic updates (update UI immediately, revert on error) ✅ CHOSEN
2. Backend confirmation (wait for API response)
3. Hybrid approach

**Decision**: Optimistic updates for all operations.

**Rationale**:
- Spec requirement FR-016: "System MUST update the UI optimistically"
- Success criteria SC-003: "visual feedback within 500 milliseconds"
- Backend API is reliable (already tested)
- Better user experience (feels instant)

**Trade-offs**:
- Requires rollback logic
- Can show incorrect state briefly
- Acceptable because errors are rare

---

### Decision 4: Balanced Component Composition

**Options Considered**:
1. Monolithic page component
2. Fine-grained components (10+ components)
3. Balanced composition (4 components) ✅ CHOSEN

**Decision**: 4 main components (TasksPage, TaskList, TaskItem, TaskForm).

**Rationale**:
- Constitutional principle: avoid over-engineering
- Sufficient separation for testability
- Avoids premature abstraction
- Keeps related logic together

**Trade-offs**:
- Less reusability than fine-grained approach
- Acceptable for feature scope

---

### Decision 5: Inline Error Messages

**Options Considered**:
1. Toast notifications
2. Inline error messages ✅ CHOSEN
3. Alert/modal dialogs

**Decision**: Inline error messages with component-level error state.

**Rationale**:
- No additional dependencies
- Clear context for errors
- Spec requirement FR-010: "display error messages when operations fail"
- Errors are rare, so UI clutter is minimal

**Trade-offs**:
- Can clutter UI if many errors
- Acceptable because errors are rare in normal operation

---

### Decision 6: Single Page with Inline Editing

**Options Considered**:
1. Single page with modals/inline editing ✅ CHOSEN
2. Multiple pages (/tasks, /tasks/new, /tasks/[id]/edit)
3. Hybrid approach

**Decision**: Single `/tasks` page with inline editing.

**Rationale**:
- Simpler routing
- Better UX for quick task operations
- No page reloads
- Follows common todo app patterns

**Trade-offs**:
- No deep linking to specific tasks
- Acceptable for feature scope

## Agent Execution Strategy

### Agent/Skill Delegation

**Available Agents** (from `.claude/agents/`):
- `frontend-nextjs-generator.md` - Next.js component generation
- `auth-agent.md` - Authentication integration
- `fastapi-backend-developer.md` - Backend work (not needed, backend complete)
- `neon-postgresql-operator.md` - Database work (not needed, schema exists)

**Available Skills** (from `.claude/skills/`):
- `frontend-builder` - Build frontend pages and components
- `auth-skill` - Implement authentication systems
- `backend-core` - Backend routes and API work (not needed)
- `database-skill` - Database design (not needed)

### Implementation Delegation Plan

**Phase 1: Type Definitions**
- **Agent**: None (simple TypeScript interfaces)
- **Skill**: None
- **Approach**: Direct implementation of type definitions from data-model.md

**Phase 2: API Client Enhancement**
- **Agent**: None (simple addition to existing file)
- **Skill**: `backend-core` (for API client patterns)
- **Approach**: Add `patch` method to api-client.ts, create task-api.ts wrapper

**Phase 3: Component Implementation**
- **Agent**: `frontend-nextjs-generator`
- **Skill**: `frontend-builder`
- **Approach**: Generate all 4 components (TasksPage, TaskList, TaskItem, TaskForm, EmptyState)
- **Delegation**: "Generate Next.js App Router page component for task management with TaskList, TaskItem, TaskForm, and EmptyState components following the architecture in plan.md"

**Phase 4: Route Protection**
- **Agent**: `auth-agent`
- **Skill**: `auth-skill`
- **Approach**: Integrate existing ProtectedRoute component
- **Delegation**: "Wrap /tasks page with existing ProtectedRoute component for authentication"

**Phase 5: Integration Testing**
- **Agent**: None (manual testing)
- **Skill**: None
- **Approach**: Follow testing checklist in quickstart.md

## Implementation Phases

### Phase 1: Foundation (Type Definitions & API Client)

**Deliverables**:
1. `frontend/src/types/task.ts` - Task type definitions
2. `frontend/src/lib/task-api.ts` - Task API methods
3. Enhancement to `frontend/src/lib/api-client.ts` - Add patch method

**Acceptance Criteria**:
- TypeScript compilation succeeds
- All types match backend models
- API client methods are type-safe

**Estimated Complexity**: Low (simple TypeScript interfaces and wrapper functions)

---

### Phase 2: Component Implementation

**Deliverables**:
1. `frontend/src/components/tasks/EmptyState.tsx`
2. `frontend/src/components/tasks/TaskForm.tsx`
3. `frontend/src/components/tasks/TaskItem.tsx`
4. `frontend/src/components/tasks/TaskList.tsx`
5. `frontend/src/app/(protected)/tasks/page.tsx`

**Acceptance Criteria**:
- All components render without errors
- TypeScript types are correct
- Components follow React best practices
- Responsive layout works on mobile and desktop

**Estimated Complexity**: Medium (4-5 components with state management)

---

### Phase 3: Integration & Testing

**Deliverables**:
1. Integrated task management page
2. Manual testing against acceptance criteria
3. Bug fixes and refinements

**Acceptance Criteria**:
- All user stories pass acceptance scenarios
- All success criteria are met
- No console errors
- Responsive design verified

**Estimated Complexity**: Medium (integration and testing)

## Testing Strategy

### Manual Testing Approach

Follow the comprehensive testing checklist in `quickstart.md`:

1. **Authentication Flow** (5 tests)
2. **Task List** (4 tests)
3. **Create Task** (4 tests)
4. **Update Task** (4 tests)
5. **Delete Task** (4 tests)
6. **Toggle Completion** (4 tests)
7. **Error Handling** (4 tests)
8. **Responsive Design** (3 tests)

**Total**: 32 manual test cases

### Success Criteria Verification

After implementation, verify all 10 success criteria from spec:

- **SC-001**: Task list loads within 2 seconds
- **SC-002**: New task appears within 3 seconds
- **SC-003**: Completion toggle feedback within 500ms
- **SC-004**: 95% of operations succeed on first attempt
- **SC-005**: Unauthenticated redirect within 1 second
- **SC-006**: Usable on 320px wide screens
- **SC-007**: Full workflow completes in under 2 minutes
- **SC-008**: Error messages display within 2 seconds
- **SC-009**: Handles 100 tasks without performance issues
- **SC-010**: JWT attached to 100% of API requests

## Risks & Mitigation

### Risk 1: JWT Token Management Complexity

**Risk**: Better Auth token retrieval may be more complex than expected.

**Likelihood**: Low
**Impact**: Medium

**Mitigation**:
- Existing api-client.ts already handles token retrieval from localStorage
- Can enhance with Better Auth session API if needed
- Fallback to current localStorage approach works for MVP

---

### Risk 2: Optimistic Update Rollback Bugs

**Risk**: Rollback logic may have edge cases causing UI inconsistencies.

**Likelihood**: Medium
**Impact**: Medium

**Mitigation**:
- Thorough testing of error scenarios
- Simple rollback pattern (restore previous state)
- Backend is source of truth (can always reload)

---

### Risk 3: Mobile Responsiveness Issues

**Risk**: Layout may not work well on very small screens (320px).

**Likelihood**: Low
**Impact**: Low

**Mitigation**:
- Test on mobile devices early
- Use responsive CSS (flexbox, grid)
- Success criteria SC-006 explicitly requires 320px support

---

### Risk 4: CORS Configuration

**Risk**: Backend CORS may not allow frontend origin.

**Likelihood**: Low (backend already configured for auth)
**Impact**: High (blocks all API calls)

**Mitigation**:
- Backend already configured for frontend origin (auth works)
- Verify CORS settings if issues arise
- Document in troubleshooting section

## Dependencies

### External Dependencies

1. **Backend API** (already implemented):
   - All 6 task endpoints functional
   - JWT authentication working
   - User-scoped queries enforced

2. **Better Auth** (already configured):
   - Signup/signin flows working
   - JWT token generation working
   - Session management working

3. **Frontend Infrastructure** (already exists):
   - Next.js 16+ App Router configured
   - Better Auth React client configured
   - API client with JWT token handling
   - ProtectedRoute component

### No Blocking Dependencies

All required infrastructure exists and is functional. This feature is purely additive (new components and pages).

## Rollout Plan

### Development

1. Create feature branch `2-task-ui` (already created)
2. Implement Phase 1 (types and API client)
3. Implement Phase 2 (components)
4. Implement Phase 3 (integration and testing)
5. Commit and push to remote

### Testing

1. Manual testing against checklist (32 test cases)
2. Success criteria verification (10 criteria)
3. Cross-browser testing (Chrome, Firefox, Safari)
4. Mobile device testing (iOS, Android)

### Deployment

1. Merge to main branch
2. Deploy frontend to production
3. Verify production environment variables
4. Smoke test in production

## Success Metrics

### Functional Metrics

- ✅ All 6 user stories pass acceptance scenarios
- ✅ All 17 functional requirements implemented
- ✅ All 10 success criteria met
- ✅ 32/32 manual test cases pass

### Technical Metrics

- ✅ Zero TypeScript compilation errors
- ✅ Zero console errors in browser
- ✅ Zero 401/403 errors for authenticated users
- ✅ 100% JWT token attachment rate

### User Experience Metrics

- ✅ Task list loads < 2 seconds
- ✅ UI feedback < 500ms
- ✅ Full workflow < 2 minutes
- ✅ Works on 320px screens

## Next Steps

1. ✅ Planning complete (this document)
2. ⏭️ Run `/sp.tasks` to generate implementation tasks
3. ⏭️ Run `/sp.implement` to execute tasks via agents
4. ⏭️ Manual testing and verification
5. ⏭️ Commit and create pull request

## References

- **Specification**: `specs/2-task-ui/spec.md`
- **Research**: `specs/2-task-ui/research.md`
- **Data Model**: `specs/2-task-ui/data-model.md`
- **API Contract**: `specs/2-task-ui/contracts/api-contract.md`
- **Quickstart**: `specs/2-task-ui/quickstart.md`
- **Backend API**: `backend/src/api/tasks.py`
- **Backend Models**: `backend/src/models/task.py`
- **Existing Auth**: `frontend/src/lib/auth-client.ts`
- **Existing API Client**: `frontend/src/lib/api-client.ts`
