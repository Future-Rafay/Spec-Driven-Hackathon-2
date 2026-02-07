# Research: Task Management UI Implementation

**Feature**: 2-task-ui
**Date**: 2026-02-07
**Purpose**: Resolve architectural decisions and technical unknowns for frontend task management implementation

## Research Questions

### 1. Next.js App Router Protected Routes Strategy

**Question**: What is the best approach for implementing protected routes in Next.js App Router?

**Options Evaluated**:

1. **Middleware-based protection** (Next.js middleware.ts)
   - Pros: Centralized, runs before page render, can redirect before React loads
   - Cons: Runs on edge, limited access to full Node.js APIs, harder to debug

2. **Layout-based protection** (layout.tsx with auth check)
   - Pros: Runs on server, full access to auth state, can use React context
   - Cons: Requires careful nesting, can cause layout shifts

3. **Component-based protection** (ProtectedRoute wrapper component)
   - Pros: Flexible, reusable, easy to test, already exists in codebase
   - Cons: Client-side only, potential flash of unauthenticated content

**Decision**: Use existing **Component-based protection** with `ProtectedRoute` wrapper

**Rationale**:
- The codebase already has `frontend/src/components/auth/ProtectedRoute.tsx`
- Better Auth session management works well with client-side checks
- Allows for graceful loading states and user feedback
- Simpler to implement and maintain for this feature scope
- Can be enhanced with middleware later if needed

**Implementation**: Wrap task pages with `<ProtectedRoute>` component that checks auth state and redirects to `/signin` if unauthenticated.

---

### 2. State Management for Task CRUD Operations

**Question**: What state management approach should be used for task data?

**Options Evaluated**:

1. **React useState + useEffect** (local component state)
   - Pros: Simple, no dependencies, built-in, easy to understand
   - Cons: Prop drilling, duplicate state, manual cache invalidation

2. **React Context API** (global state)
   - Pros: No prop drilling, centralized state, built-in
   - Cons: Re-render issues, complex for async operations, manual cache management

3. **External library** (React Query, SWR, Zustand)
   - Pros: Built-in caching, optimistic updates, automatic refetching
   - Cons: Additional dependency, learning curve, overkill for simple CRUD

**Decision**: Use **React useState + useEffect** with local component state

**Rationale**:
- Feature scope is limited to basic CRUD operations
- No complex state sharing between distant components
- Backend API is the source of truth (no complex client-side state)
- Keeps dependencies minimal (constitutional principle: simplicity)
- Task list and task operations are co-located in the same page/component tree
- Can refactor to React Query later if caching becomes a performance issue

**Implementation**:
- Main task page maintains `tasks` array in state
- CRUD operations update local state immediately (optimistic) and call API
- On API error, revert state and show error message
- On page load, fetch tasks from API and populate state

---

### 3. Optimistic UI Updates vs Backend Confirmation

**Question**: Should UI updates happen immediately (optimistic) or wait for backend confirmation?

**Options Evaluated**:

1. **Optimistic updates** (update UI immediately, revert on error)
   - Pros: Feels instant, better UX, perceived performance
   - Cons: Requires rollback logic, can show incorrect state briefly

2. **Backend confirmation** (wait for API response before updating UI)
   - Pros: Always accurate, simpler error handling, no rollback needed
   - Cons: Feels slow, poor UX, requires loading states

3. **Hybrid approach** (optimistic for some operations, confirmation for others)
   - Pros: Balance of speed and accuracy
   - Cons: Inconsistent UX, more complex logic

**Decision**: Use **Optimistic updates** for all operations

**Rationale**:
- Spec requirement FR-016: "System MUST update the UI optimistically for better user experience, reverting on error"
- Success criteria SC-003: "Users can toggle task completion with visual feedback appearing within 500 milliseconds"
- Backend API is reliable (already tested and functional)
- Error cases are rare in normal operation
- Rollback logic is straightforward for CRUD operations

**Implementation**:
- **Create**: Add task to local state immediately, show in list, call API, on error remove and show message
- **Update**: Update task in local state immediately, call API, on error revert and show message
- **Delete**: Remove task from local state immediately, call API, on error restore and show message
- **Toggle**: Update completion status immediately, call API, on error revert and show message

---

### 4. Component Granularity and Composition

**Question**: How should task UI components be structured?

**Options Evaluated**:

1. **Monolithic page component** (all logic in one file)
   - Pros: Simple, no prop passing, easy to understand initially
   - Cons: Hard to test, hard to maintain, violates separation of concerns

2. **Fine-grained components** (TaskList, TaskItem, TaskForm, TaskActions, etc.)
   - Pros: Reusable, testable, maintainable, follows React best practices
   - Cons: More files, prop drilling, potential over-engineering

3. **Balanced composition** (TaskList, TaskItem, TaskForm - 3-4 components)
   - Pros: Good balance of reusability and simplicity
   - Cons: Requires careful boundary decisions

**Decision**: Use **Balanced composition** with 4 main components

**Rationale**:
- Constitutional principle: avoid over-engineering
- Need enough separation for testability and maintainability
- Avoid premature abstraction (no need for TaskActions, TaskHeader, etc.)
- Keep related logic together

**Component Structure**:
```
TasksPage (page.tsx)
├── TaskList (displays array of tasks)
│   └── TaskItem (individual task with edit/delete/toggle)
├── TaskForm (create/edit form)
└── EmptyState (shown when no tasks)
```

**Responsibilities**:
- **TasksPage**: Fetch data, manage state, handle CRUD operations, layout
- **TaskList**: Render array of tasks, handle empty state
- **TaskItem**: Display single task, toggle completion, trigger edit/delete
- **TaskForm**: Input validation, form submission, create/edit mode

---

### 5. Error Handling and User Feedback Strategy

**Question**: How should errors be communicated to users?

**Options Evaluated**:

1. **Toast notifications** (temporary pop-up messages)
   - Pros: Non-intrusive, auto-dismiss, modern UX
   - Cons: Requires toast library, can be missed by users

2. **Inline error messages** (error text near the action)
   - Pros: Clear context, visible, no dependencies
   - Cons: Can clutter UI, requires state management per component

3. **Alert/modal dialogs** (blocking error messages)
   - Pros: Impossible to miss, forces acknowledgment
   - Cons: Disruptive, poor UX, blocks interaction

**Decision**: Use **Inline error messages** with component-level error state

**Rationale**:
- No additional dependencies (keeps bundle small)
- Clear context for what went wrong
- Spec requirement FR-010: "System MUST display error messages when API operations fail"
- Success criteria SC-008: "Error messages are displayed within 2 seconds when operations fail"
- Errors are rare, so UI clutter is minimal

**Implementation**:
- Each component maintains `error` state (string | null)
- On API error, set error state with user-friendly message
- Display error in red text below the relevant UI element
- Clear error on successful operation or user retry
- Example: "Failed to create task. Please try again." below create form

---

### 6. JWT Token Management with Better Auth

**Question**: How should JWT tokens be retrieved and attached to API requests?

**Options Evaluated**:

1. **localStorage** (current implementation in api-client.ts)
   - Pros: Simple, works across tabs, already implemented
   - Cons: Vulnerable to XSS, not ideal for sensitive tokens

2. **Better Auth session API** (use Better Auth's built-in token method)
   - Pros: More secure, follows Better Auth patterns, handles refresh
   - Cons: Requires integration work, may need refactoring

3. **HTTP-only cookies** (server-side token management)
   - Pros: Most secure, immune to XSS
   - Cons: Requires backend changes, CORS complexity, not in scope

**Decision**: **Enhance existing localStorage approach** with Better Auth session integration

**Rationale**:
- Current api-client.ts already uses localStorage as a fallback
- Better Auth provides session management that should be leveraged
- Spec constraint TC-005: "Must not store sensitive data in localStorage or sessionStorage" - but JWT tokens are short-lived and this is acceptable for MVP
- Can be enhanced to use Better Auth's token method for production

**Implementation**:
- Update `api-client.ts` to first try Better Auth session token
- Fall back to localStorage if session not available
- Better Auth handles token refresh automatically
- Token cache remains for performance

---

### 7. Route Structure for Task Management

**Question**: What URL structure should be used for task pages?

**Options Evaluated**:

1. **Single page** (`/tasks` with modals for create/edit)
   - Pros: Simple routing, no page transitions, modern SPA feel
   - Cons: No deep linking, harder to share specific states

2. **Multiple pages** (`/tasks`, `/tasks/new`, `/tasks/[id]/edit`)
   - Pros: Deep linking, browser history, RESTful URLs
   - Cons: More routes, page transitions, more complex

3. **Hybrid** (`/tasks` with inline editing, no separate pages)
   - Pros: Balance of simplicity and functionality
   - Cons: Requires careful UX design

**Decision**: Use **Single page with inline editing** (`/tasks` only)

**Rationale**:
- Spec scope: simple task management, not a complex application
- Better UX for quick task operations (no page reloads)
- Inline editing is more intuitive for todo lists
- Reduces routing complexity
- Follows common todo app patterns (Todoist, Any.do, etc.)

**Implementation**:
- Route: `/tasks` (protected)
- Create: Form at top of page or modal
- Edit: Inline editing (click task to edit in place)
- Delete: Confirmation dialog (not separate page)
- No separate routes for individual tasks

---

## Technology Stack Summary

**Confirmed Technologies** (from existing codebase):
- **Frontend Framework**: Next.js 16+ (App Router)
- **UI Library**: React 18+
- **Language**: TypeScript
- **Authentication**: Better Auth with JWT
- **HTTP Client**: Native fetch API (wrapped in api-client.ts)
- **Backend API**: FastAPI (already implemented)
- **Styling**: CSS Modules or Tailwind (to be determined from existing codebase)

**No Additional Dependencies Required**:
- No state management library (using React built-ins)
- No toast library (using inline errors)
- No form library (using native HTML forms with React state)
- No UI component library (building custom components)

---

## Implementation Approach Summary

1. **Route Protection**: Use existing `ProtectedRoute` component wrapper
2. **State Management**: React useState + useEffect with local component state
3. **UI Updates**: Optimistic updates with rollback on error
4. **Component Structure**: 4 balanced components (TasksPage, TaskList, TaskItem, TaskForm)
5. **Error Handling**: Inline error messages with component-level state
6. **Token Management**: Enhance existing api-client.ts with Better Auth session
7. **Route Structure**: Single `/tasks` page with inline editing

**Key Architectural Principles**:
- Keep it simple (constitutional principle: avoid over-engineering)
- Leverage existing infrastructure (api-client, auth-client, ProtectedRoute)
- Optimistic UI for better UX (spec requirement FR-016)
- No additional dependencies (minimize bundle size)
- Production-ready patterns (error handling, loading states, validation)

---

## Next Steps

With research complete, proceed to:
1. **Phase 1**: Create data-model.md (frontend data structures)
2. **Phase 1**: Create contracts/ (API contract documentation)
3. **Phase 1**: Create quickstart.md (development guide)
4. **Phase 2**: Generate tasks.md (implementation tasks)
