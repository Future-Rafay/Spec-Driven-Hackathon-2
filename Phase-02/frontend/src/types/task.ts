/**
 * Task type definitions for the task management UI.
 * Matches backend API models.
 */

/**
 * Task entity representing a todo item.
 * Matches backend TaskResponse model.
 */
export interface Task {
  id: string                    // UUID as string
  title: string                 // 1-500 characters
  description: string | null    // Optional, 0-2000 characters
  completed: boolean            // Completion status
  user_id: string              // Owner UUID (from JWT)
  created_at: string           // ISO 8601 timestamp
  updated_at: string           // ISO 8601 timestamp
}

/**
 * Data required to create a new task.
 * Matches backend TaskCreate model.
 */
export interface TaskCreateInput {
  title: string                 // Required, 1-500 characters
  description?: string          // Optional, 0-2000 characters
}

/**
 * Data required to update an existing task.
 * Matches backend TaskUpdate model.
 */
export interface TaskUpdateInput {
  title: string                 // Required, 1-500 characters
  description?: string          // Optional, 0-2000 characters
}

/**
 * Form state for task creation/editing.
 */
export interface TaskFormState {
  title: string
  description: string
  isSubmitting: boolean
  error: string | null
}

/**
 * Form validation errors.
 */
export interface TaskFormErrors {
  title?: string
  description?: string
}

/**
 * State for the main tasks page.
 */
export interface TasksPageState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  isCreating: boolean
}

/**
 * State for individual task item.
 */
export interface TaskItemState {
  isEditing: boolean
  isDeleting: boolean
  isToggling: boolean
  error: string | null
}

/**
 * API error response structure.
 */
export interface APIError {
  detail: string
  status?: number
}
