/**
 * TaskItem component - displays individual task (display only for now).
 */

'use client'

import { useState } from 'react'
import type { Task } from '@/types/task'

interface TaskItemProps {
  task: Task
  onUpdate: (id: string, data: { title: string; description?: string }) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export default function TaskItem({ task, onUpdate, onDelete, onToggle }: TaskItemProps) {
  const [error, setError] = useState<string | null>(null)
  const [isToggling, setIsToggling] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')
  const [isSaving, setIsSaving] = useState(false)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleToggleClick = async () => {
    setIsToggling(true)
    setError(null)

    try {
      await onToggle(task.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle completion'
      setError(errorMessage)
    } finally {
      setIsToggling(false)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setError(null)
    setTitleError(null)
    setDescriptionError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle(task.title)
    setEditDescription(task.description || '')
    setTitleError(null)
    setDescriptionError(null)
  }

  const validateTitle = (value: string): string | null => {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      return 'Title is required'
    }
    if (trimmed.length > 500) {
      return 'Title must be 500 characters or less'
    }
    return null
  }

  const validateDescription = (value: string): string | null => {
    if (value.length > 2000) {
      return 'Description must be 2000 characters or less'
    }
    return null
  }

  const handleSaveEdit = async () => {
    // Validate
    const titleValidationError = validateTitle(editTitle)
    const descriptionValidationError = validateDescription(editDescription)

    if (titleValidationError) {
      setTitleError(titleValidationError)
      return
    }

    if (descriptionValidationError) {
      setDescriptionError(descriptionValidationError)
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      })
      setIsEditing(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task'
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      await onDelete(task.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task'
      setError(errorMessage)
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="card-hover p-5 animate-scale-in">
      <div className="flex items-start gap-4">
        {/* Completion checkbox */}
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleClick}
            disabled={isToggling}
            className="checkbox"
            aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          />
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            /* Edit mode */
            <div className="space-y-3 animate-fade-in">
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value)
                    setTitleError(null)
                  }}
                  className={`input text-sm ${titleError ? 'input-error' : ''}`}
                  placeholder="Task title"
                  maxLength={500}
                  disabled={isSaving}
                  autoFocus
                />
                {titleError && (
                  <p className="mt-1 text-xs text-danger-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {titleError}
                  </p>
                )}
              </div>
              <div>
                <textarea
                  value={editDescription}
                  onChange={(e) => {
                    setEditDescription(e.target.value)
                    setDescriptionError(null)
                  }}
                  rows={3}
                  className={`input text-sm resize-none ${descriptionError ? 'input-error' : ''}`}
                  placeholder="Task description (optional)"
                  maxLength={2000}
                  disabled={isSaving}
                />
                {descriptionError && (
                  <p className="mt-1 text-xs text-danger-600 flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {descriptionError}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="btn btn-success px-4 py-2 text-sm"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="spinner w-4 h-4 mr-1" viewBox="0 0 24 24"></svg>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save
                    </span>
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="btn btn-outline px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Display mode */
            <>
              <h3
                className={`text-base font-semibold transition-all duration-200 ${
                  task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`mt-2 text-sm transition-all duration-200 ${
                    task.completed ? 'line-through text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {task.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(task.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                {task.updated_at !== task.created_at && (
                  <span className="flex items-center badge badge-primary">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Updated
                  </span>
                )}
                {task.completed && (
                  <span className="badge badge-success">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completed
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        {!isEditing && (
          <div className="flex-shrink-0 flex gap-2">
            <button
              onClick={handleEditClick}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 focus-visible-ring"
              title="Edit task"
              aria-label="Edit task"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-200 focus-visible-ring"
              title="Delete task"
              aria-label="Delete task"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="mt-4 alert alert-warning animate-slide-down">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800 mb-3">
                Are you sure you want to delete this task?
              </p>
              <p className="text-xs text-yellow-700 mb-3">
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="btn btn-danger px-4 py-2 text-sm"
                >
                  {isDeleting ? (
                    <span className="flex items-center">
                      <svg className="spinner w-4 h-4 mr-1" viewBox="0 0 24 24"></svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete'
                  )}
                </button>
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="btn btn-outline px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-4 alert alert-error flex items-start animate-slide-down">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  )
}
