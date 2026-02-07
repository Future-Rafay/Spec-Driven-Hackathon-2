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
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleClick}
            disabled={isToggling}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          />
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            /* Edit mode */
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value)
                    setTitleError(null)
                  }}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    titleError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Task title"
                  maxLength={500}
                  disabled={isSaving}
                />
                {titleError && (
                  <p className="mt-1 text-xs text-red-600">{titleError}</p>
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
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    descriptionError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Task description (optional)"
                  maxLength={2000}
                  disabled={isSaving}
                />
                {descriptionError && (
                  <p className="mt-1 text-xs text-red-600">{descriptionError}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Display mode */
            <>
              <h3
                className={`text-base font-medium ${
                  task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`mt-1 text-sm ${
                    task.completed ? 'line-through text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {task.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                {task.updated_at !== task.created_at && (
                  <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
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
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit task"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Delete task"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm text-yellow-800 mb-3">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  )
}
