# Task Management API Contract

**Version**: 1.0.0
**Base URL**: `http://localhost:8080` (development) / `${NEXT_PUBLIC_BACKEND_URL}` (production)
**Authentication**: JWT Bearer token (required for all endpoints)

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The JWT token is obtained from Better Auth after successful signin and contains the user's identity. The backend extracts the user ID from the token to enforce user-scoped operations.

## Common Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request succeeded with no response body |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Resource not found or not owned by user |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

## Error Response Format

All error responses follow this structure:

```json
{
  "detail": "Human-readable error message"
}
```

## Endpoints

### 1. List Tasks

**Endpoint**: `GET /api/tasks`

**Description**: Retrieve all tasks belonging to the authenticated user, sorted by creation date (newest first).

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**: None

**Success Response** (200 OK):
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "user_id": "987e6543-e21b-12d3-a456-426614174000",
    "created_at": "2026-02-07T10:30:00Z",
    "updated_at": "2026-02-07T10:30:00Z"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "title": "Finish project",
    "description": null,
    "completed": true,
    "user_id": "987e6543-e21b-12d3-a456-426614174000",
    "created_at": "2026-02-06T15:20:00Z",
    "updated_at": "2026-02-07T09:15:00Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `500 Internal Server Error`: Database error

**Frontend Usage**:
```typescript
const tasks = await backendAPI.get<Task[]>('/api/tasks')
```

---

### 2. Create Task

**Endpoint**: `POST /api/tasks`

**Description**: Create a new task for the authenticated user.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Field Constraints**:
- `title` (required): 1-500 characters, cannot be empty or whitespace-only
- `description` (optional): 0-2000 characters, can be null or omitted

**Success Response** (201 Created):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "987e6543-e21b-12d3-a456-426614174000",
  "created_at": "2026-02-07T10:30:00Z",
  "updated_at": "2026-02-07T10:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid JWT token
- `422 Unprocessable Entity`: Validation error (e.g., empty title)
- `500 Internal Server Error`: Database error

**Validation Errors** (422):
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "Title cannot be empty or whitespace-only",
      "type": "value_error"
    }
  ]
}
```

**Frontend Usage**:
```typescript
const newTask = await backendAPI.post<Task>('/api/tasks', {
  title: 'Buy groceries',
  description: 'Milk, eggs, bread'
})
```

---

### 3. Get Task

**Endpoint**: `GET /api/tasks/{task_id}`

**Description**: Retrieve a specific task by ID. Returns 404 if task doesn't exist or doesn't belong to the authenticated user.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `task_id` (UUID): Task identifier

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "987e6543-e21b-12d3-a456-426614174000",
  "created_at": "2026-02-07T10:30:00Z",
  "updated_at": "2026-02-07T10:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Task not found or not owned by user
- `500 Internal Server Error`: Database error

**Frontend Usage**:
```typescript
const task = await backendAPI.get<Task>(`/api/tasks/${taskId}`)
```

---

### 4. Update Task

**Endpoint**: `PUT /api/tasks/{task_id}`

**Description**: Update an existing task's title and/or description. Returns 404 if task doesn't exist or doesn't belong to the authenticated user.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters**:
- `task_id` (UUID): Task identifier

**Request Body**:
```json
{
  "title": "Buy groceries and supplies",
  "description": "Milk, eggs, bread, cleaning supplies"
}
```

**Field Constraints**:
- `title` (required): 1-500 characters, cannot be empty or whitespace-only
- `description` (optional): 0-2000 characters, can be null

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy groceries and supplies",
  "description": "Milk, eggs, bread, cleaning supplies",
  "completed": false,
  "user_id": "987e6543-e21b-12d3-a456-426614174000",
  "created_at": "2026-02-07T10:30:00Z",
  "updated_at": "2026-02-07T11:45:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Task not found or not owned by user
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Database error

**Frontend Usage**:
```typescript
const updatedTask = await backendAPI.put<Task>(`/api/tasks/${taskId}`, {
  title: 'Buy groceries and supplies',
  description: 'Milk, eggs, bread, cleaning supplies'
})
```

---

### 5. Delete Task

**Endpoint**: `DELETE /api/tasks/{task_id}`

**Description**: Permanently delete a task. Returns 404 if task doesn't exist or doesn't belong to the authenticated user.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `task_id` (UUID): Task identifier

**Request Body**: None

**Success Response** (204 No Content):
```
(empty response body)
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Task not found or not owned by user
- `500 Internal Server Error`: Database error

**Frontend Usage**:
```typescript
await backendAPI.delete(`/api/tasks/${taskId}`)
```

---

### 6. Toggle Task Completion

**Endpoint**: `PATCH /api/tasks/{task_id}/complete`

**Description**: Toggle the completion status of a task (completed ↔ incomplete). Returns 404 if task doesn't exist or doesn't belong to the authenticated user.

**Request Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `task_id` (UUID): Task identifier

**Request Body**: None (completion status is toggled automatically)

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "user_id": "987e6543-e21b-12d3-a456-426614174000",
  "created_at": "2026-02-07T10:30:00Z",
  "updated_at": "2026-02-07T12:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Task not found or not owned by user
- `500 Internal Server Error`: Database error

**Frontend Usage**:
```typescript
const toggledTask = await backendAPI.patch<Task>(`/api/tasks/${taskId}/complete`)
```

**Note**: The backend automatically toggles the completion status. If the task is currently incomplete, it becomes complete, and vice versa.

---

## Data Types

### Task Object

```typescript
interface Task {
  id: string                    // UUID as string
  title: string                 // 1-500 characters
  description: string | null    // Optional, 0-2000 characters
  completed: boolean            // Completion status
  user_id: string              // Owner UUID (from JWT)
  created_at: string           // ISO 8601 timestamp
  updated_at: string           // ISO 8601 timestamp
}
```

### Task Create Input

```typescript
interface TaskCreateInput {
  title: string                 // Required, 1-500 characters
  description?: string          // Optional, 0-2000 characters
}
```

### Task Update Input

```typescript
interface TaskUpdateInput {
  title: string                 // Required, 1-500 characters
  description?: string          // Optional, 0-2000 characters
}
```

## Security Notes

1. **User Isolation**: All endpoints enforce user-scoped queries. Users can only access their own tasks.
2. **JWT Verification**: Backend verifies JWT signature using shared secret (BETTER_AUTH_SECRET).
3. **User ID Extraction**: User ID is extracted from JWT token, never trusted from client input.
4. **Cross-User Access**: Attempting to access another user's task returns 404 (not 403) to prevent task ID enumeration.
5. **Token Expiration**: Expired tokens return 401, triggering frontend redirect to signin.

## Rate Limiting

No rate limiting is currently implemented. For production, consider:
- 100 requests per minute per user
- 1000 requests per hour per user

## Versioning

API version is not currently included in the URL. Future versions may use:
- URL versioning: `/api/v2/tasks`
- Header versioning: `Accept: application/vnd.api+json; version=2`

## Testing

Example test scenarios:

1. **List tasks**: Verify only authenticated user's tasks are returned
2. **Create task**: Verify task is created with correct user_id
3. **Update task**: Verify 404 when updating another user's task
4. **Delete task**: Verify 404 when deleting another user's task
5. **Toggle completion**: Verify status toggles correctly
6. **Validation**: Verify empty title returns 422
7. **Authentication**: Verify missing token returns 401

## Backend Implementation Reference

- **API Routes**: `backend/src/api/tasks.py`
- **Service Layer**: `backend/src/services/task_service.py`
- **Data Models**: `backend/src/models/task.py`
- **Authentication**: `backend/src/core/security.py`
