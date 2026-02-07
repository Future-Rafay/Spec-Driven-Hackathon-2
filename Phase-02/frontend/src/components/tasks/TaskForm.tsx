/**
 * TaskForm component - form for creating new tasks.
 */

'use client'

import { useState } from 'react'

interface TaskFormProps {
  onSubmit: (data: { title: string; description?: string }) => Promise<void>
}

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)

  // Client-side validation
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setError(null)
    setTitleError(null)
    setDescriptionError(null)

    // Validate
    const titleValidationError = validateTitle(title)
    const descriptionValidationError = validateDescription(description)

    if (titleValidationError) {
      setTitleError(titleValidationError)
      return
    }

    if (descriptionValidationError) {
      setDescriptionError(descriptionValidationError)
      return
    }

    // Submit
    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined
      })

      // Clear form on success
      setTitle('')
      setDescription('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h2>

      {/* General error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Title input */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setTitleError(null)
          }}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            titleError ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter task title"
          disabled={isSubmitting}
          maxLength={500}
        />
        {titleError && (
          <p className="mt-1 text-sm text-red-600">{titleError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">{title.length}/500 characters</p>
      </div>

      {/* Description textarea */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            setDescriptionError(null)
          }}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            descriptionError ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter task description (optional)"
          disabled={isSubmitting}
          maxLength={2000}
        />
        {descriptionError && (
          <p className="mt-1 text-sm text-red-600">{descriptionError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">{description.length}/2000 characters</p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full px-4 py-2 text-white font-medium rounded-md transition-colors ${
          isSubmitting
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </span>
        ) : (
          'Create Task'
        )}
      </button>
    </form>
  )
}
