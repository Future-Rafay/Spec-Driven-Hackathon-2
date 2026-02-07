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
    <form onSubmit={handleSubmit} className="card p-6 mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Task
        </h2>
      </div>

      {/* General error */}
      {error && (
        <div className="mb-4 alert alert-error flex items-start animate-slide-down">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Title input */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          Title <span className="text-danger-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setTitleError(null)
          }}
          className={`input ${titleError ? 'input-error' : ''}`}
          placeholder="Enter task title"
          disabled={isSubmitting}
          maxLength={500}
        />
        {titleError && (
          <p className="mt-2 text-sm text-danger-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {titleError}
          </p>
        )}
        <div className="mt-1 flex justify-between items-center">
          <p className="text-xs text-gray-500">{title.length}/500 characters</p>
          {title.length > 450 && (
            <span className="badge badge-danger">Approaching limit</span>
          )}
        </div>
      </div>

      {/* Description textarea */}
      <div className="mb-5">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            setDescriptionError(null)
          }}
          rows={3}
          className={`input resize-none ${descriptionError ? 'input-error' : ''}`}
          placeholder="Add more details about your task..."
          disabled={isSubmitting}
          maxLength={2000}
        />
        {descriptionError && (
          <p className="mt-2 text-sm text-danger-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {descriptionError}
          </p>
        )}
        <div className="mt-1 flex justify-between items-center">
          <p className="text-xs text-gray-500">{description.length}/2000 characters</p>
          {description.length > 1800 && (
            <span className="badge badge-danger">Approaching limit</span>
          )}
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full py-3 font-semibold"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="spinner w-5 h-5 mr-2" viewBox="0 0 24 24"></svg>
            Creating...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Task
          </span>
        )}
      </button>
    </form>
  )
}
