"""
Task service layer for business logic.
Implements CRUD operations with user-scoped queries and ownership verification.
"""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status
import logging

from ..models.task import Task, TaskCreate, TaskUpdate
from ..models.user import User

logger = logging.getLogger(__name__)


async def list_tasks(
    session: AsyncSession,
    current_user: User
) -> List[Task]:
    """
    List all tasks for the authenticated user.

    Args:
        session: Database session
        current_user: Authenticated user from JWT token

    Returns:
        List of Task objects owned by the user
    """
    statement = select(Task).where(Task.user_id == current_user.id)
    result = await session.execute(statement)
    tasks = result.scalars().all()
    return list(tasks)


async def create_task(
    session: AsyncSession,
    task_data: TaskCreate,
    current_user: User
) -> Task:
    """
    Create a new task for the authenticated user.

    Args:
        session: Database session
        task_data: Task creation data (title, description)
        current_user: Authenticated user from JWT token

    Returns:
        Created Task object

    Raises:
        HTTPException: If validation fails (400)
    """
    # Validate title is not empty (additional check beyond Pydantic)
    if not task_data.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title cannot be empty"
        )

    # Create new task with user ownership
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        user_id=current_user.id,
        completed=False
    )

    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)

    logger.info(f"Task created: user_id={current_user.id}, task_id={new_task.id}")
    return new_task


async def get_task_by_id(
    session: AsyncSession,
    task_id: UUID,
    current_user: User
) -> Optional[Task]:
    """
    Get a specific task by ID with ownership verification.

    Args:
        session: Database session
        task_id: Task UUID to retrieve
        current_user: Authenticated user from JWT token

    Returns:
        Task object if found and owned by user, None otherwise
    """
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user.id
    )
    result = await session.execute(statement)
    task = result.scalar_one_or_none()
    return task


async def update_task(
    session: AsyncSession,
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User
) -> Task:
    """
    Update an existing task with ownership verification.

    Args:
        session: Database session
        task_id: Task UUID to update
        task_data: Task update data (title, description)
        current_user: Authenticated user from JWT token

    Returns:
        Updated Task object

    Raises:
        HTTPException: If task not found or not owned by user (404)
        HTTPException: If validation fails (400)
    """
    # Get task with ownership verification
    task = await get_task_by_id(session, task_id, current_user)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Validate title is not empty
    if not task_data.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title cannot be empty"
        )

    # Update task fields
    task.title = task_data.title
    task.description = task_data.description
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    logger.info(f"Task updated: user_id={current_user.id}, task_id={task.id}")
    return task


async def delete_task(
    session: AsyncSession,
    task_id: UUID,
    current_user: User
) -> None:
    """
    Delete a task with ownership verification.

    Args:
        session: Database session
        task_id: Task UUID to delete
        current_user: Authenticated user from JWT token

    Raises:
        HTTPException: If task not found or not owned by user (404)
    """
    # Get task with ownership verification
    task = await get_task_by_id(session, task_id, current_user)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    await session.delete(task)
    await session.commit()

    logger.info(f"Task deleted: user_id={current_user.id}, task_id={task_id}")


async def toggle_task_completion(
    session: AsyncSession,
    task_id: UUID,
    current_user: User
) -> Task:
    """
    Toggle task completion status with ownership verification.

    Args:
        session: Database session
        task_id: Task UUID to toggle
        current_user: Authenticated user from JWT token

    Returns:
        Updated Task object with toggled completion status

    Raises:
        HTTPException: If task not found or not owned by user (404)
    """
    # Get task with ownership verification
    task = await get_task_by_id(session, task_id, current_user)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completion status
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    logger.info(
        f"Task completion toggled: user_id={current_user.id}, "
        f"task_id={task.id}, completed={task.completed}"
    )
    return task
