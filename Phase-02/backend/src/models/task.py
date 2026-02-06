"""
Task model and DTOs for todo task management.
Implements Task entity with user ownership and completion tracking.
"""
from sqlmodel import SQLModel, Field
from pydantic import BaseModel, validator
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
