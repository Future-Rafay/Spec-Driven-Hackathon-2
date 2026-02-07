# Quickstart Guide: Task Management UI

**Feature**: 2-task-ui
**Date**: 2026-02-07
**Purpose**: Developer guide for implementing and testing the task management frontend

## Prerequisites

Before starting implementation, ensure:

1. ✅ Backend API is running and accessible at `http://localhost:8080`
2. ✅ Backend task endpoints are functional (`/api/tasks`)
3. ✅ Better Auth is configured and working (signup/signin flows)
4. ✅ Frontend development server can be started
5. ✅ Environment variables are configured

## Environment Setup

### Required Environment Variables

Create or update `frontend/.env.local`:

```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-must-match-backend
BETTER_AUTH_URL=http://localhost:3000

# Database Configuration (same as backend)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Backend API Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Verify Backend is Running

```bash
# Test backend health
curl http://localhost:8080/health

# Test task endpoints (requires JWT token)
curl -H "Authorization: Bearer <your-jwt-token>" http://localhost:8080/api/tasks
```

## Implementation Workflow

### Phase 1: Setup Type Definitions

**File**: `frontend/src/types/task.ts`

Create TypeScript interfaces for task data structures:

```typescript
export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface TaskCreateInput {
  title: string
  description?: string
}

export interface TaskUpdateInput {
  title: string
  description?: string
}
```

**Verification**: TypeScript compilation succeeds with no errors.

---

### Phase 2: Create Task API Client

**File**: `frontend/src/lib/task-api.ts`

Extend the existing `backendAPI` client with task-specific methods:

```typescript
import { backendAPI } from './api-client'
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'

export const taskAPI = {
  // List all tasks for authenticated user
  list: () => backendAPI.get<Task[]>('/api/tasks'),

  // Create new task
  create: (data: TaskCreateInput) =>
    backendAPI.post<Task>('/api/tasks', data),

  // Get specific task
  get: (id: string) =>
    backendAPI.get<Task>(`/api/tasks/${id}`),

  // Update task
  update: (id: string, data: TaskUpdateInput) =>
    backendAPI.put<Task>(`/api/tasks/${id}`, data),

  // Delete task
  delete: (id: string) =>
    backendAPI.delete(`/api/tasks/${id}`),

  // Toggle completion
  toggleComplete: (id: string) =>
    backendAPI.patch<Task>(`/api/tasks/${id}/complete`)
}
```

**Verification**: Import succeeds, TypeScript types are correct.

---

### Phase 3: Create Task Components

#### 3.1 Empty State Component

**File**: `frontend/src/components/tasks/EmptyState.tsx`

```typescript
export default function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">No tasks yet. Create your first task!</p>
    </div>
  )
}
```

#### 3.2 Task Item Component

**File**: `frontend/src/components/tasks/TaskItem.tsx`

Displays individual task with edit/delete/toggle actions.

**Key Features**:
- Checkbox for completion toggle
- Inline editing mode
- Delete confirmation
- Error handling

#### 3.3 Task List Component

**File**: `frontend/src/components/tasks/TaskList.tsx`

Renders array of tasks or empty state.

**Props**:
- `tasks: Task[]`
- `onUpdate: (task: Task) => void`
- `onDelete: (id: string) => void`
- `onToggle: (id: string) => void`

#### 3.4 Task Form Component

**File**: `frontend/src/components/tasks/TaskForm.tsx`

Form for creating new tasks.

**Key Features**:
- Title input (required)
- Description textarea (optional)
- Client-side validation
- Submit button with loading state
- Error display

---

### Phase 4: Create Tasks Page

**File**: `frontend/src/app/(protected)/tasks/page.tsx`

Main page that orchestrates all components.

**Key Responsibilities**:
1. Fetch tasks on mount
2. Manage tasks state
3. Handle CRUD operations
4. Implement optimistic updates
5. Handle errors

**Structure**:
```typescript
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load tasks on mount
  useEffect(() => { /* ... */ }, [])

  // CRUD handlers
  const handleCreate = async (data: TaskCreateInput) => { /* ... */ }
  const handleUpdate = async (id: string, data: TaskUpdateInput) => { /* ... */ }
  const handleDelete = async (id: string) => { /* ... */ }
  const handleToggle = async (id: string) => { /* ... */ }

  return (
    <ProtectedRoute>
      {/* Page content */}
    </ProtectedRoute>
  )
}
```

---

### Phase 5: Add Route Protection

Wrap the tasks page with `ProtectedRoute` component (already exists):

```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function TasksPage() {
  return (
    <ProtectedRoute>
      {/* Page content */}
    </ProtectedRoute>
  )
}
```

**Verification**: Unauthenticated users are redirected to `/signin`.

---

## Testing Checklist

### Manual Testing

#### Authentication Flow
- [ ] Navigate to `/tasks` without authentication → redirected to `/signin`
- [ ] Sign in successfully → can access `/tasks`
- [ ] Sign out → redirected to `/signin` when accessing `/tasks`

#### Task List
- [ ] Empty state displays when no tasks exist
- [ ] Tasks load and display correctly
- [ ] Tasks are sorted by creation date (newest first)
- [ ] Loading state displays during fetch

#### Create Task
- [ ] Can create task with title only
- [ ] Can create task with title and description
- [ ] Cannot submit empty title (validation error shown)
- [ ] Task appears in list immediately after creation
- [ ] Error message displays if API call fails

#### Update Task
- [ ] Can edit task title
- [ ] Can edit task description
- [ ] Cannot save empty title (validation error shown)
- [ ] Changes persist after page reload
- [ ] Error message displays if API call fails

#### Delete Task
- [ ] Confirmation dialog appears before deletion
- [ ] Task is removed from list after confirmation
- [ ] Task remains if deletion is cancelled
- [ ] Error message displays if API call fails

#### Toggle Completion
- [ ] Checkbox toggles completion status
- [ ] Visual feedback is immediate (< 500ms)
- [ ] Status persists after page reload
- [ ] Error message displays if API call fails

#### Error Handling
- [ ] Network errors display user-friendly messages
- [ ] 401 errors redirect to signin
- [ ] 404 errors display "Task not found"
- [ ] Validation errors display specific field errors

#### Responsive Design
- [ ] Layout works on mobile (320px width)
- [ ] Layout works on tablet (768px width)
- [ ] Layout works on desktop (1024px+ width)

### API Integration Testing

```bash
# Test with authenticated user
# 1. Sign in and get JWT token
# 2. Use token to test each endpoint

# List tasks
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/tasks

# Create task
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"Test description"}' \
  http://localhost:8080/api/tasks

# Update task
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated task","description":"Updated description"}' \
  http://localhost:8080/api/tasks/<task-id>

# Toggle completion
curl -X PATCH -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/tasks/<task-id>/complete

# Delete task
curl -X DELETE -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/tasks/<task-id>
```

## Development Commands

```bash
# Start frontend development server
cd frontend
npm run dev

# Start backend server (in separate terminal)
cd backend
uvicorn src.main:app --reload

# Run TypeScript type checking
cd frontend
npm run type-check

# Build for production
cd frontend
npm run build
```

## Troubleshooting

### Issue: "Not authenticated" error

**Cause**: JWT token not found or expired

**Solution**:
1. Sign in again to get fresh token
2. Check localStorage for `access_token`
3. Verify `BETTER_AUTH_SECRET` matches between frontend and backend

### Issue: CORS errors

**Cause**: Backend not configured to accept requests from frontend origin

**Solution**:
1. Verify backend CORS settings allow `http://localhost:3000`
2. Check `NEXT_PUBLIC_BACKEND_URL` is correct

### Issue: Tasks not loading

**Cause**: Backend API not running or endpoint not registered

**Solution**:
1. Verify backend is running: `curl http://localhost:8080/health`
2. Check backend logs for errors
3. Verify tasks router is registered in `backend/src/main.py`

### Issue: Validation errors not displaying

**Cause**: Error response format mismatch

**Solution**:
1. Check backend error response structure
2. Verify frontend error parsing logic
3. Add console.log to debug error object

## Success Criteria Verification

After implementation, verify all success criteria from spec:

- [ ] **SC-001**: Task list loads within 2 seconds
- [ ] **SC-002**: New task appears within 3 seconds of creation
- [ ] **SC-003**: Completion toggle feedback within 500ms
- [ ] **SC-004**: 95% of operations succeed on first attempt
- [ ] **SC-005**: Unauthenticated redirect within 1 second
- [ ] **SC-006**: Usable on 320px wide screens
- [ ] **SC-007**: Full workflow completes in under 2 minutes
- [ ] **SC-008**: Error messages display within 2 seconds
- [ ] **SC-009**: Handles 100 tasks without performance issues
- [ ] **SC-010**: JWT attached to 100% of API requests

## Next Steps

After completing implementation:

1. Run full testing checklist
2. Verify all success criteria
3. Test on multiple browsers (Chrome, Firefox, Safari)
4. Test on mobile devices
5. Document any deviations from plan
6. Prepare for demo/evaluation

## Reference Documentation

- **Spec**: `specs/2-task-ui/spec.md`
- **Plan**: `specs/2-task-ui/plan.md`
- **Data Model**: `specs/2-task-ui/data-model.md`
- **API Contract**: `specs/2-task-ui/contracts/api-contract.md`
- **Backend API**: `backend/src/api/tasks.py`
- **Backend Models**: `backend/src/models/task.py`
