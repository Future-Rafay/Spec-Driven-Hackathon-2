# Data Model: Task Management UI

**Feature**: 2-task-ui
**Date**: 2026-02-07
**Purpose**: Define frontend data structures and type definitions for task management

## Frontend Type Definitions

### Core Task Types

```typescript
/**
 * Task entity representing a todo item.
 * Matches backend TaskResponse model.
 */
export interface Task {
  id: string                    // UUID as string
  title: string                 // 1-500 characters
  description: string | null    // Optional, 0-2000 characters
  completed: boolean            // Completion status
  user_id: string              // Owner UUID (from JWT)
  created_at: string           // ISO 8601 timestamp
  updated_at: string           // ISO 8601 timestamp
}

/**
 * Data required to create a new task.
 * Matches backend TaskCreate model.
 */
export interface TaskCreateInput {
  title: string                 // Required, 1-500 characters
  description?: string          // Optional, 0-2000 characters
}

/**
 * Data required to update an existing task.
 * Matches backend TaskUpdate model.
 */
export interface TaskUpdateInput {
  title: string                 // Required, 1-500 characters
  description?: string          // Optional, 0-2000 characters
}
```

### Form State Types

```typescript
/**
 * Form state for task creation/editing.
 */
export interface TaskFormState {
  title: string
  description: string
  isSubmitting: boolean
  error: string | null
}

/**
 * Form validation errors.
 */
export interface TaskFormErrors {
  title?: string
  description?: string
}
```

### Component State Types

```typescript
/**
 * State for the main tasks page.
 */
export interface TasksPageState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  isCreating: boolean
}

/**
 * State for individual task item.
 */
export interface TaskItemState {
  isEditing: boolean
  isDeleting: boolean
  isToggling: boolean
  error: string | null
}
```

### API Response Types

```typescript
/**
 * API error response structure.
 */
export interface APIError {
  detail: string
  status?: number
}

/**
 * List tasks API response.
 */
export type ListTasksResponse = Task[]

/**
 * Create task API response.
 */
export type CreateTaskResponse = Task

/**
 * Update task API response.
 */
export type UpdateTaskResponse = Task

/**
 * Toggle completion API response.
 */
export type ToggleCompletionResponse = Task

/**
 * Delete task API response (204 No Content).
 */
export type DeleteTaskResponse = void
```

## Data Flow

### 1. Task List Loading

```
User navigates to /tasks
  ↓
TasksPage component mounts
  ↓
useEffect triggers API call
  ↓
GET /api/tasks with JWT token
  ↓
Backend returns Task[]
  ↓
Update tasks state
  ↓
TaskList renders TaskItem components
```

### 2. Task Creation

```
User fills create form
  ↓
User submits form
  ↓
Validate input (title not empty)
  ↓
Optimistically add task to local state (with temp ID)
  ↓
POST /api/tasks with TaskCreateInput
  ↓
Backend returns Task with real ID
  ↓
Replace temp task with real task in state
  ↓
Clear form
  ↓
(On error: remove temp task, show error)
```

### 3. Task Update

```
User clicks edit on TaskItem
  ↓
TaskItem enters edit mode (isEditing = true)
  ↓
User modifies title/description
  ↓
User saves changes
  ↓
Optimistically update task in local state
  ↓
PUT /api/tasks/{id} with TaskUpdateInput
  ↓
Backend returns updated Task
  ↓
Update task in state with backend response
  ↓
Exit edit mode
  ↓
(On error: revert task, show error)
```

### 4. Task Completion Toggle

```
User clicks completion checkbox
  ↓
Optimistically toggle completed in local state
  ↓
PATCH /api/tasks/{id}/complete
  ↓
Backend returns updated Task
  ↓
Update task in state with backend response
  ↓
(On error: revert completed status, show error)
```

### 5. Task Deletion

```
User clicks delete button
  ↓
Show confirmation dialog
  ↓
User confirms deletion
  ↓
Optimistically remove task from local state
  ↓
DELETE /api/tasks/{id}
  ↓
Backend returns 204 No Content
  ↓
Task remains removed from state
  ↓
(On error: restore task, show error)
```

## Validation Rules

### Title Validation

- **Required**: Cannot be empty or whitespace-only
- **Min Length**: 1 character (after trimming)
- **Max Length**: 500 characters
- **Trimming**: Leading/trailing whitespace removed before submission

**Frontend Validation**:
```typescript
function validateTitle(title: string): string | null {
  const trimmed = title.trim()
  if (trimmed.length === 0) {
    return 'Title is required'
  }
  if (trimmed.length > 500) {
    return 'Title must be 500 characters or less'
  }
  return null
}
```

### Description Validation

- **Optional**: Can be empty or null
- **Max Length**: 2000 characters
- **Trimming**: Leading/trailing whitespace removed, empty string converted to null

**Frontend Validation**:
```typescript
function validateDescription(description: string): string | null {
  if (description.length > 2000) {
    return 'Description must be 2000 characters or less'
  }
  return null
}
```

## State Management Patterns

### Optimistic Update Pattern

```typescript
// 1. Save current state for rollback
const previousTasks = [...tasks]

// 2. Update state optimistically
setTasks(updatedTasks)

// 3. Call API
try {
  const result = await apiCall()
  // 4. Update with backend response
  setTasks(tasks.map(t => t.id === result.id ? result : t))
} catch (error) {
  // 5. Rollback on error
  setTasks(previousTasks)
  setError(error.message)
}
```

### Loading State Pattern

```typescript
// 1. Set loading state
setIsLoading(true)
setError(null)

// 2. Perform async operation
try {
  const result = await apiCall()
  // 3. Update state with result
  setState(result)
} catch (error) {
  // 4. Set error state
  setError(error.message)
} finally {
  // 5. Clear loading state
  setIsLoading(false)
}
```

## Error Handling

### Error Message Mapping

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Map API errors to user-friendly messages
    if (error.message.includes('401')) {
      return 'Session expired. Please sign in again.'
    }
    if (error.message.includes('404')) {
      return 'Task not found.'
    }
    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection.'
    }
    return error.message
  }
  return 'An unexpected error occurred. Please try again.'
}
```

### Error Display Strategy

- **Form errors**: Display inline below form fields (red text)
- **Operation errors**: Display inline near the affected task (red text)
- **Page-level errors**: Display at top of page (red banner)
- **Auto-clear**: Errors clear on next successful operation or user retry

## Performance Considerations

### State Updates

- **Immutable updates**: Always create new arrays/objects, never mutate
- **Minimal re-renders**: Use React.memo for TaskItem if performance issues arise
- **Debouncing**: Not needed for current scope (no search/filter)

### Data Caching

- **No persistent cache**: Tasks fetched fresh on page load
- **Session cache**: Tasks remain in state during page session
- **Invalidation**: Not needed (no background updates)

## Type Safety

All components must use TypeScript with strict mode enabled:

```typescript
// tsconfig.json requirements
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## File Organization

```
frontend/src/
├── types/
│   └── task.ts              # All task-related type definitions
├── lib/
│   └── task-api.ts          # Task API client methods
├── components/
│   └── tasks/
│       ├── TaskList.tsx     # Task list component
│       ├── TaskItem.tsx     # Individual task component
│       ├── TaskForm.tsx     # Create/edit form component
│       └── EmptyState.tsx   # Empty state component
└── app/
    └── (protected)/
        └── tasks/
            └── page.tsx     # Main tasks page
```

## Summary

This data model provides:
- ✅ Type-safe interfaces matching backend models
- ✅ Clear data flow for all CRUD operations
- ✅ Validation rules aligned with backend constraints
- ✅ Optimistic update patterns for better UX
- ✅ Error handling strategies
- ✅ Performance considerations
- ✅ Organized file structure

All types are designed to work seamlessly with the existing backend API and maintain type safety throughout the application.
