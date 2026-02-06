# Research: Todo Backend API & Data Layer

**Feature**: 001-todo-backend-api
**Date**: 2026-02-06
**Phase**: Phase 0 - Technology Research and Decisions

## Research Questions & Findings

### 1. FastAPI Dependency Injection for User Context

**Question**: How to pass authenticated user from middleware to route handlers? What are the best practices for dependency injection in FastAPI?

**Research Findings**:

FastAPI provides a powerful dependency injection system using the `Depends()` function. For authentication, the recommended pattern is:

1. Create a dependency function that extracts and validates the JWT token
2. Return the authenticated user object from the dependency
3. Inject this dependency into route handlers that need authentication

**Example Pattern**:
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session)
) -> User:
    token = credentials.credentials
    payload = verify_jwt(token)  # Raises HTTPException if invalid
    user_id = payload.get("id")
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/tasks")
async def list_tasks(current_user: User = Depends(get_current_user)):
    # current_user is automatically injected
    pass
```

**Decision**: Use existing `get_current_user` dependency from `backend/src/core/security.py` (implemented in 1-auth feature). This dependency already handles JWT verification and user extraction.

**Rationale**:
- Reuses existing authentication infrastructure
- Consistent with 1-auth feature implementation
- FastAPI automatically handles dependency resolution
- Type hints provide IDE support and validation

**Alternatives Considered**:
- Middleware approach: Less flexible, harder to test individual routes
- Manual token extraction in each route: Violates DRY principle, error-prone

---

### 2. SQLModel Async Queries with User Filtering

**Question**: How to structure queries that always filter by user_id? What are best practices for preventing accidental cross-user data leakage?

**Research Findings**:

SQLModel with async SQLAlchemy provides several patterns for user-scoped queries:

**Pattern 1: Explicit filtering in every query**
```python
from sqlmodel import select

async def get_user_tasks(session: AsyncSession, user_id: UUID) -> List[Task]:
    statement = select(Task).where(Task.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().all()
```

**Pattern 2: Service layer wrapper**
```python
class TaskService:
    def __init__(self, session: AsyncSession, user_id: UUID):
        self.session = session
        self.user_id = user_id

    async def list_tasks(self) -> List[Task]:
        statement = select(Task).where(Task.user_id == self.user_id)
        result = await self.session.execute(statement)
        return result.scalars().all()
```

**Pattern 3: Query builder with automatic filtering**
```python
def user_scoped_query(model, user_id: UUID):
    return select(model).where(model.user_id == user_id)

statement = user_scoped_query(Task, current_user.id)
```

**Decision**: Use Pattern 1 (explicit filtering) with service layer functions that always require user_id parameter.

**Rationale**:
- Explicit is better than implicit (Python Zen)
- Easy to audit - every query visibly includes user_id filter
- No magic or hidden behavior
- Simple to test and debug
- Consistent with existing codebase patterns

**Best Practices to Prevent Data Leakage**:
1. **Never trust client input for user_id** - always use authenticated user from JWT
2. **Always filter by user_id** - make it a required parameter in service functions
3. **Verify ownership for single-item operations** - check task.user_id == current_user.id
4. **Use type hints** - enforce UUID types for user_id to prevent string injection
5. **Code review checklist** - verify every query includes user_id filter

**Alternatives Considered**:
- PostgreSQL Row-Level Security (RLS): Adds database complexity, harder to debug
- ORM-level query filters: SQLModel doesn't support global query filters like Django ORM

---

### 3. JWT Token Verification Integration

**Question**: How to reuse existing JWT verification from 1-auth feature? How to extract user_id from JWT payload?

**Research Findings**:

The 1-auth feature already implements JWT verification in `backend/src/core/security.py`:

**Existing Implementation**:
```python
def verify_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token"""
    payload = jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM]
    )
    return payload

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_session)
) -> User:
    """Extract and validate user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    user_id = UUID(payload.get("id"))
    # ... fetch user from database
```

**JWT Payload Structure** (from 1-auth):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

**Decision**: Reuse existing `get_current_user` dependency without modification. Extract user_id from the returned User object.

**Rationale**:
- No code duplication
- Consistent authentication across all endpoints
- Already handles token validation, expiry, and user lookup
- Returns full User object with all fields (id, email, etc.)

**Usage in Task Routes**:
```python
@router.post("/tasks")
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    # current_user.id is the authenticated user's UUID
    new_task = await task_service.create_task(session, task_data, current_user.id)
    return new_task
```

**Alternatives Considered**:
- Create separate JWT verification for tasks: Violates DRY, inconsistent behavior
- Extract user_id directly from token in routes: Bypasses user existence check

---

### 4. Error Response Standardization

**Question**: What HTTP status codes for each error scenario? How to structure error responses consistently?

**Research Findings**:

**HTTP Status Code Standards** (RFC 7231, REST best practices):

| Scenario | Status Code | Meaning | When to Use |
|----------|-------------|---------|-------------|
| Success (read) | 200 OK | Request succeeded | GET, PUT, PATCH successful |
| Success (create) | 201 Created | Resource created | POST successful |
| Client error (validation) | 400 Bad Request | Invalid input | Empty title, invalid data types |
| Client error (auth) | 401 Unauthorized | Not authenticated | Missing/invalid JWT token |
| Client error (authz) | 403 Forbidden | Authenticated but not authorized | Accessing other user's task |
| Client error (not found) | 404 Not Found | Resource doesn't exist | Invalid task ID |
| Client error (validation) | 422 Unprocessable Entity | Semantic validation error | Pydantic validation failures |
| Server error | 500 Internal Server Error | Server-side failure | Database connection lost |

**FastAPI Error Response Structure**:
```python
# Automatic structure from HTTPException
{
  "detail": "Error message here"
}

# Pydantic validation errors (422)
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Decision**: Use FastAPI's built-in `HTTPException` for all error responses. Follow standard HTTP status codes.

**Error Handling Pattern**:
```python
from fastapi import HTTPException, status

# Authentication error
raise HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"}
)

# Authorization error (ownership check)
if task.user_id != current_user.id:
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden"
    )

# Not found error
if not task:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Task not found"
    )

# Validation error
if not task_data.title.strip():
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Title cannot be empty"
    )
```

**Security Considerations**:
- **403 vs 404 for unauthorized access**: Use 403 to prevent task ID enumeration
- **Generic error messages**: Don't reveal whether task exists if user doesn't own it
- **No stack traces in production**: FastAPI handles this automatically
- **Log detailed errors server-side**: Use Python logging for debugging

**Rationale**:
- Standard HTTP semantics improve API usability
- FastAPI's HTTPException integrates with OpenAPI docs
- Consistent error structure across all endpoints
- Security-conscious error messages

**Alternatives Considered**:
- Custom error response format: Unnecessary complexity, breaks REST conventions
- Always return 404 for unauthorized access: Less semantically correct than 403

---

### 5. Database Migration Strategy

**Question**: How to create reproducible migrations for tasks table? How to handle foreign key relationships with users table?

**Research Findings**:

**Migration Approaches**:

1. **SQL Migration Files** (chosen for 1-auth):
   - Direct SQL scripts in `backend/migrations/`
   - Executed via `psql` command
   - Simple, explicit, version-controlled

2. **Alembic** (SQLAlchemy migration tool):
   - Auto-generates migrations from model changes
   - Tracks migration history in database
   - More complex setup

3. **SQLModel create_all()** (programmatic):
   - Creates tables from Python models
   - No migration history
   - Not suitable for production

**Decision**: Use SQL migration files (consistent with 1-auth feature). Create `002_create_tasks_table.sql`.

**Migration File Structure**:
```sql
-- 002_create_tasks_table.sql

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE tasks IS 'User todo tasks with ownership and completion tracking';
COMMENT ON COLUMN tasks.id IS 'Unique task identifier (UUID)';
COMMENT ON COLUMN tasks.title IS 'Task title (required, max 500 chars)';
COMMENT ON COLUMN tasks.description IS 'Optional task description';
COMMENT ON COLUMN tasks.completed IS 'Task completion status (default false)';
COMMENT ON COLUMN tasks.user_id IS 'Owner user ID (foreign key to users.id)';
COMMENT ON COLUMN tasks.created_at IS 'Task creation timestamp (UTC)';
COMMENT ON COLUMN tasks.updated_at IS 'Last update timestamp (UTC)';
```

**Foreign Key Considerations**:
- **ON DELETE CASCADE**: When user is deleted, all their tasks are deleted
- **NOT NULL constraint**: Every task must have an owner
- **Index on user_id**: Optimizes user-scoped queries (most common operation)

**Rationale**:
- Consistent with existing migration approach (1-auth)
- Explicit and auditable
- Version-controlled in git
- Reproducible across environments
- No additional tooling required

**Migration Execution**:
```bash
# From backend/ directory
psql $DATABASE_URL -f migrations/002_create_tasks_table.sql
```

**Alternatives Considered**:
- Alembic: Adds complexity, requires learning new tool, overkill for simple schema
- Programmatic creation: Not reproducible, no migration history

---

## Technology Stack Summary

### Confirmed Technologies

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Backend Framework | FastAPI | 0.115+ | Async support, automatic OpenAPI docs, dependency injection |
| ORM | SQLModel | 0.0.22+ | Type-safe, async support, integrates with FastAPI |
| Database Driver | asyncpg | 0.29+ | Async PostgreSQL driver for SQLAlchemy |
| Database | Neon PostgreSQL | Latest | Serverless, auto-scaling, production-ready |
| Authentication | JWT (PyJWT) | 2.9+ | Stateless, standard, already implemented in 1-auth |
| Validation | Pydantic | 2.x | Built into FastAPI, automatic validation |
| Testing | pytest + pytest-asyncio | Latest | Async test support, industry standard |

### Dependencies to Add

No new dependencies required - all necessary packages already installed for 1-auth feature:
- FastAPI ✅ (already installed)
- SQLModel ✅ (already installed)
- asyncpg ✅ (already installed)
- PyJWT ✅ (already installed)
- pytest + pytest-asyncio ✅ (already installed)

---

## Architecture Patterns

### 1. Layered Architecture

```
API Layer (FastAPI routes)
    ↓ calls
Service Layer (business logic)
    ↓ calls
Data Layer (SQLModel + asyncpg)
    ↓ queries
Database (Neon PostgreSQL)
```

**Benefits**:
- Clear separation of concerns
- Easy to test each layer independently
- Business logic isolated from HTTP concerns

### 2. Dependency Injection Pattern

```python
# Route depends on service, service depends on session
@router.post("/tasks")
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    return await task_service.create_task(session, task_data, current_user.id)
```

**Benefits**:
- Testable (can inject mocks)
- Reusable dependencies
- Type-safe

### 3. User-Scoped Query Pattern

```python
# Every query explicitly filters by user_id
async def list_tasks(session: AsyncSession, user_id: UUID) -> List[Task]:
    statement = select(Task).where(Task.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().all()
```

**Benefits**:
- Prevents data leakage
- Explicit and auditable
- Easy to verify in code review

---

## Security Decisions

### 1. Authentication Strategy
- **Decision**: Reuse JWT verification from 1-auth feature
- **Implementation**: Use `get_current_user` dependency on all task routes
- **Enforcement**: FastAPI automatically returns 401 if dependency fails

### 2. Authorization Strategy
- **Decision**: Query-level filtering + ownership verification
- **Implementation**:
  - List operations: Filter by `user_id == current_user.id`
  - Single-item operations: Verify `task.user_id == current_user.id` before access
- **Enforcement**: Raise 403 Forbidden if ownership check fails

### 3. Data Isolation Strategy
- **Decision**: Never trust client-provided user_id
- **Implementation**: Always use `current_user.id` from JWT token
- **Enforcement**: Service functions require user_id parameter, routes pass `current_user.id`

### 4. Error Message Strategy
- **Decision**: Generic messages for security-sensitive errors
- **Implementation**:
  - 401: "Not authenticated" (don't reveal token details)
  - 403: "Forbidden" (don't reveal if task exists)
  - 404: "Task not found" (same as 403 to prevent enumeration)
- **Enforcement**: Use standard HTTPException messages

---

## Performance Considerations

### 1. Database Indexes
- **user_id index**: Optimizes user-scoped queries (most common)
- **completed index**: Optimizes filtering by completion status (future feature)
- **created_at index**: Optimizes sorting by creation date (default order)

### 2. Async Operations
- All database operations use async/await
- Non-blocking I/O for concurrent requests
- Connection pooling via SQLAlchemy async engine

### 3. Query Optimization
- Use `select()` with explicit columns when possible
- Avoid N+1 queries (not applicable for simple CRUD)
- Index foreign keys for join performance

---

## Testing Strategy

### Unit Tests (Service Layer)
- Test business logic in isolation
- Mock database session
- Verify user_id filtering logic

### Integration Tests (API Layer)
- Test full request/response cycle
- Use test database
- Verify authentication and authorization

### Security Tests
- Test cross-user access prevention
- Test authentication bypass attempts
- Test SQL injection prevention (via parameterized queries)

---

## Rollout Plan

### Phase 2A: Database Schema
1. Create migration file
2. Run migration on development database
3. Verify foreign key constraints

### Phase 2B: Data Layer
1. Create Task model
2. Create DTOs (TaskCreate, TaskUpdate, TaskResponse)
3. Add validation rules

### Phase 2C: Service Layer
1. Implement CRUD functions
2. Add user_id filtering
3. Add ownership verification

### Phase 2D: API Layer
1. Create route handlers
2. Add authentication dependencies
3. Add error handling

### Phase 2E: Testing & Integration
1. Write unit tests
2. Write integration tests
3. Update documentation

---

**Research Complete**: All technical decisions documented. Ready for Phase 1 design artifacts.
