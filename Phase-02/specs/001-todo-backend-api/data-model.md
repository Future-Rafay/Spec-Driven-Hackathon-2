# Data Model: Todo Backend API

**Feature**: 001-todo-backend-api
**Date**: 2026-02-06
**Phase**: Phase 1 - Data Model Design

## Entity Definitions

### Task Entity

**Purpose**: Represents a todo task owned by a user with title, description, and completion status.

**Table Name**: `tasks`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique task identifier |
| title | VARCHAR(500) | NOT NULL | Task title (required, max 500 characters) |
| description | TEXT | NULL | Optional task description (unlimited length) |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Task completion status |
| user_id | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | Owner user ID (immutable after creation) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Task creation timestamp (UTC) |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Last update timestamp (UTC) |

**Indexes**:
- `PRIMARY KEY (id)` - Unique task lookup
- `INDEX idx_tasks_user_id (user_id)` - Optimizes user-scoped queries (most common operation)
- `INDEX idx_tasks_completed (completed)` - Optimizes filtering by completion status
- `INDEX idx_tasks_created_at (created_at DESC)` - Optimizes sorting by creation date

**Constraints**:
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` - Referential integrity with users table
- `CHECK (LENGTH(TRIM(title)) > 0)` - Title cannot be empty or whitespace-only

**Validation Rules**:
- Title: Required, 1-500 characters after trimming whitespace
- Description: Optional, 0-2000 characters (enforced at application level)
- Completed: Boolean, defaults to false
- User ID: Must reference existing user in users table
- Created At: Automatically set on creation, immutable
- Updated At: Automatically updated on modification

---

### User Entity (Reference)

**Purpose**: Represents an authenticated user who owns tasks. Defined in 1-auth feature.

**Table Name**: `users`

**Fields** (relevant to this feature):

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt-hashed password |
| created_at | TIMESTAMP | NOT NULL | Account creation timestamp |
| last_signin_at | TIMESTAMP | NULL | Last successful sign-in timestamp |

**Note**: This entity is not modified by the todo-backend-api feature. It is referenced via foreign key only.

---

## Relationships

### User → Tasks (One-to-Many)

- **Cardinality**: One user can have zero or many tasks
- **Foreign Key**: `tasks.user_id → users.id`
- **Cascade Behavior**: `ON DELETE CASCADE` - When user is deleted, all their tasks are deleted
- **Ownership**: Task ownership is established at creation time and is immutable

**Relationship Diagram**:
```
users (1) ──────< (many) tasks
  id                      user_id
```

**Query Pattern**:
```sql
-- Get all tasks for a user
SELECT * FROM tasks WHERE user_id = $1;

-- Get user with their task count
SELECT u.*, COUNT(t.id) as task_count
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
WHERE u.id = $1
GROUP BY u.id;
```

---

## SQLModel Definitions

### Task Model (Database Table)

```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    """
    Task model representing a todo item owned by a user.

    Attributes:
        id: Unique task identifier (UUID)
        title: Task title (required, max 500 chars)
        description: Optional task description
        completed: Task completion status (default False)
        user_id: Owner user ID (foreign key to users.id)
        created_at: Task creation timestamp (UTC)
        updated_at: Last update timestamp (UTC)
    """
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=500, min_length=1)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False)
    user_id: UUID = Field(foreign_key="users.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Task DTOs (Request/Response)

```python
from pydantic import BaseModel, Field, validator
from uuid import UUID
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    """
    DTO for creating a new task.

    Attributes:
        title: Task title (required, 1-500 chars)
        description: Optional task description (0-2000 chars)

    Note: completed defaults to False, user_id comes from JWT token
    """
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)

    @validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace-only')
        return v.strip()

    @validator('description')
    def description_optional(cls, v):
        if v is not None:
            return v.strip() if v.strip() else None
        return v


class TaskUpdate(BaseModel):
    """
    DTO for updating an existing task.

    Attributes:
        title: New task title (required, 1-500 chars)
        description: New task description (optional, 0-2000 chars)

    Note: completed is updated via separate PATCH endpoint
    """
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=2000)

    @validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace-only')
        return v.strip()

    @validator('description')
    def description_optional(cls, v):
        if v is not None:
            return v.strip() if v.strip() else None
        return v


class TaskResponse(BaseModel):
    """
    DTO for task responses (read operations).

    Attributes:
        id: Task UUID
        title: Task title
        description: Optional task description
        completed: Task completion status
        user_id: Owner user ID
        created_at: Creation timestamp
        updated_at: Last update timestamp

    Note: Includes all fields for client display
    """
    id: UUID
    title: str
    description: Optional[str]
    completed: bool
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode for SQLModel compatibility
```

---

## Data Validation Rules

### Title Validation

**Rules**:
- Required field (cannot be null or empty)
- Minimum length: 1 character (after trimming whitespace)
- Maximum length: 500 characters
- Whitespace-only titles are rejected
- Leading/trailing whitespace is automatically trimmed

**Validation Logic**:
```python
def validate_title(title: str) -> str:
    """Validate and normalize task title"""
    if not title:
        raise ValueError("Title is required")

    trimmed = title.strip()

    if not trimmed:
        raise ValueError("Title cannot be empty or whitespace-only")

    if len(trimmed) > 500:
        raise ValueError("Title cannot exceed 500 characters")

    return trimmed
```

**Error Responses**:
- Empty title → 400 Bad Request: "Title cannot be empty"
- Whitespace-only → 400 Bad Request: "Title cannot be empty or whitespace-only"
- Too long → 422 Unprocessable Entity: Pydantic validation error

---

### Description Validation

**Rules**:
- Optional field (can be null or empty)
- Maximum length: 2000 characters (enforced at application level)
- Empty strings are converted to null
- Leading/trailing whitespace is automatically trimmed

**Validation Logic**:
```python
def validate_description(description: Optional[str]) -> Optional[str]:
    """Validate and normalize task description"""
    if description is None:
        return None

    trimmed = description.strip()

    if not trimmed:
        return None  # Convert empty string to null

    if len(trimmed) > 2000:
        raise ValueError("Description cannot exceed 2000 characters")

    return trimmed
```

**Error Responses**:
- Too long → 422 Unprocessable Entity: Pydantic validation error
- Empty string → Converted to null (no error)

---

### Completed Validation

**Rules**:
- Boolean field (true or false)
- Defaults to false on creation
- Can only be updated via PATCH /tasks/{id}/complete endpoint
- Cannot be set during creation (always starts as false)

**Validation Logic**:
```python
def validate_completed(completed: bool) -> bool:
    """Validate task completion status"""
    if not isinstance(completed, bool):
        raise ValueError("Completed must be a boolean value")
    return completed
```

---

### User ID Validation

**Rules**:
- Required field (cannot be null)
- Must be a valid UUID format
- Must reference an existing user in users table (foreign key constraint)
- Immutable after creation (cannot be changed)
- Always extracted from JWT token, never from client input

**Validation Logic**:
```python
def validate_user_id(user_id: UUID, current_user_id: UUID) -> UUID:
    """Validate user ID for task operations"""
    # For creation: use authenticated user's ID
    # For updates: verify ownership
    if user_id != current_user_id:
        raise ValueError("User ID mismatch - unauthorized access")
    return user_id
```

**Security Note**: User ID is NEVER accepted from client input. It is always extracted from the authenticated user's JWT token.

---

## State Transitions

### Task Lifecycle

```
[Created] → completed = false
    ↓
[Active] → user can update title/description
    ↓
[Completed] → completed = true (via PATCH /complete)
    ↓
[Active] → completed = false (via PATCH /complete - toggle back)
    ↓
[Deleted] → permanent removal (via DELETE)
```

**State Rules**:
- Tasks are created in "Active" state (completed = false)
- Completion status can be toggled between true and false
- Title and description can be updated in any state
- Deletion is permanent (no soft delete)
- All state transitions require ownership verification

---

## Database Migration

### Migration File: 002_create_tasks_table.sql

```sql
-- Database Migration: Create Tasks Table
-- Version: 002
-- Description: Task management with user ownership and completion tracking
-- Dependencies: 001_create_users_table.sql (users table must exist)

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
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
COMMENT ON COLUMN tasks.title IS 'Task title (required, max 500 chars, cannot be empty)';
COMMENT ON COLUMN tasks.description IS 'Optional task description (unlimited length)';
COMMENT ON COLUMN tasks.completed IS 'Task completion status (default false)';
COMMENT ON COLUMN tasks.user_id IS 'Owner user ID (foreign key to users.id, immutable)';
COMMENT ON COLUMN tasks.created_at IS 'Task creation timestamp (UTC, immutable)';
COMMENT ON COLUMN tasks.updated_at IS 'Last update timestamp (UTC, auto-updated)';

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Migration Execution**:
```bash
# From backend/ directory
psql $DATABASE_URL -f migrations/002_create_tasks_table.sql
```

**Verification**:
```bash
# Verify table structure
psql $DATABASE_URL -c "\d tasks"

# Verify foreign key constraint
psql $DATABASE_URL -c "SELECT conname, contype FROM pg_constraint WHERE conrelid = 'tasks'::regclass;"

# Verify indexes
psql $DATABASE_URL -c "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'tasks';"
```

---

## Data Integrity Constraints

### Foreign Key Integrity

**Constraint**: `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`

**Behavior**:
- Task cannot be created with non-existent user_id
- When user is deleted, all their tasks are automatically deleted
- Prevents orphaned tasks in the database

**Testing**:
```sql
-- Should fail: non-existent user
INSERT INTO tasks (title, user_id) VALUES ('Test', '00000000-0000-0000-0000-000000000000');
-- Error: violates foreign key constraint

-- Should succeed: existing user
INSERT INTO tasks (title, user_id) VALUES ('Test', (SELECT id FROM users LIMIT 1));
-- Success: task created

-- Should cascade: delete user
DELETE FROM users WHERE id = (SELECT user_id FROM tasks LIMIT 1);
-- Success: user and all their tasks deleted
```

---

### Immutability Constraints

**user_id Immutability**:
- Task ownership is set at creation time
- Cannot be changed after creation
- Enforced at application level (no UPDATE allowed on user_id)

**created_at Immutability**:
- Set automatically on creation
- Cannot be changed after creation
- Enforced at application level (no UPDATE allowed on created_at)

**Application-Level Enforcement**:
```python
# TaskUpdate DTO does not include user_id or created_at
class TaskUpdate(BaseModel):
    title: str
    description: Optional[str]
    # user_id and created_at are NOT included - cannot be updated
```

---

## Query Patterns

### User-Scoped Queries

**List all tasks for a user**:
```python
statement = select(Task).where(Task.user_id == current_user.id)
result = await session.execute(statement)
tasks = result.scalars().all()
```

**Get specific task with ownership verification**:
```python
statement = select(Task).where(
    Task.id == task_id,
    Task.user_id == current_user.id
)
result = await session.execute(statement)
task = result.scalar_one_or_none()

if not task:
    raise HTTPException(status_code=404, detail="Task not found")
```

**Create task with user ownership**:
```python
new_task = Task(
    title=task_data.title,
    description=task_data.description,
    user_id=current_user.id,  # Always from JWT token
    completed=False  # Always starts as false
)
session.add(new_task)
await session.commit()
await session.refresh(new_task)
```

**Update task with ownership verification**:
```python
statement = select(Task).where(
    Task.id == task_id,
    Task.user_id == current_user.id
)
result = await session.execute(statement)
task = result.scalar_one_or_none()

if not task:
    raise HTTPException(status_code=404, detail="Task not found")

task.title = task_data.title
task.description = task_data.description
task.updated_at = datetime.utcnow()  # Trigger handles this automatically

session.add(task)
await session.commit()
await session.refresh(task)
```

---

## Performance Considerations

### Index Strategy

**Primary Index** (`idx_tasks_user_id`):
- Most queries filter by user_id
- Optimizes: `SELECT * FROM tasks WHERE user_id = $1`
- Expected usage: 90%+ of all queries

**Secondary Index** (`idx_tasks_completed`):
- Optimizes filtering by completion status
- Useful for future features (filter completed/incomplete tasks)
- Expected usage: 10-20% of queries

**Tertiary Index** (`idx_tasks_created_at DESC`):
- Optimizes sorting by creation date
- Default sort order for task lists
- Expected usage: 50%+ of list queries

### Query Optimization

**Avoid N+1 Queries**:
- Not applicable for simple CRUD operations
- Each task query is independent
- No nested relationships to optimize

**Connection Pooling**:
- Handled by SQLAlchemy async engine
- Default pool size: 5 connections
- Max overflow: 10 connections

**Async Operations**:
- All database operations use async/await
- Non-blocking I/O for concurrent requests
- Scales to 100+ concurrent users

---

**Data Model Complete**: All entities, relationships, validation rules, and migration scripts defined. Ready for API contract design.
