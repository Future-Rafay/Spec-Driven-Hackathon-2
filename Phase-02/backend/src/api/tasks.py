"""
Task API endpoints for todo task management.
Implements RESTful CRUD operations with JWT authentication.
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from ..core.database import get_session
from ..core.security import get_current_user
from ..models.user import User
from ..models.task import TaskCreate, TaskUpdate, TaskResponse
from ..services import task_service

router = APIRouter()


@router.get("/", response_model=List[TaskResponse], status_code=status.HTTP_200_OK)
async def list_tasks(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    List all tasks for the authenticated user.

    Returns:
        List of tasks owned by the authenticated user
    """
    tasks = await task_service.list_tasks(session, current_user)
    return tasks


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    Args:
        task_data: Task creation data (title, description)

    Returns:
        Created task object
    """
    task = await task_service.create_task(session, task_data, current_user)
    return task


@router.get("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
async def get_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Get a specific task by ID.

    Args:
        task_id: Task UUID

    Returns:
        Task object if found and owned by user

    Raises:
        HTTPException: 404 if task not found or not owned by user
    """
    task = await task_service.get_task_by_id(session, task_id, current_user)

    if not task:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{task_id}", response_model=TaskResponse, status_code=status.HTTP_200_OK)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Update an existing task.

    Args:
        task_id: Task UUID
        task_data: Task update data (title, description)

    Returns:
        Updated task object

    Raises:
        HTTPException: 404 if task not found or not owned by user
    """
    task = await task_service.update_task(session, task_id, task_data, current_user)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Delete a task permanently.

    Args:
        task_id: Task UUID

    Raises:
        HTTPException: 404 if task not found or not owned by user
    """
    await task_service.delete_task(session, task_id, current_user)
    return None


@router.patch("/{task_id}/complete", response_model=TaskResponse, status_code=status.HTTP_200_OK)
async def toggle_task_completion(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Toggle task completion status.

    Args:
        task_id: Task UUID

    Returns:
        Updated task object with toggled completion status

    Raises:
        HTTPException: 404 if task not found or not owned by user
    """
    task = await task_service.toggle_task_completion(session, task_id, current_user)
    return task
