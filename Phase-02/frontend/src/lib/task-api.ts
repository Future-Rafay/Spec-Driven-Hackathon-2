/**
 * Task API client methods.
 * Wraps the backend API client with task-specific operations.
 */

import { backendAPI } from './api-client'
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'

/**
 * Task API methods for CRUD operations.
 */
export const taskAPI = {
  /**
   * List all tasks for the authenticated user.
   * @returns Promise<Task[]> Array of tasks sorted by creation date (newest first)
   */
  list: (): Promise<Task[]> => {
    return backendAPI.get<Task[]>('/api/tasks')
  },

  /**
   * Create a new task.
   * @param data Task creation data (title, description)
   * @returns Promise<Task> Created task object
   */
  create: (data: TaskCreateInput): Promise<Task> => {
    return backendAPI.post<Task>('/api/tasks', data)
  },

  /**
   * Get a specific task by ID.
   * @param id Task UUID
   * @returns Promise<Task> Task object
   */
  get: (id: string): Promise<Task> => {
    return backendAPI.get<Task>(`/api/tasks/${id}`)
  },

  /**
   * Update an existing task.
   * @param id Task UUID
   * @param data Task update data (title, description)
   * @returns Promise<Task> Updated task object
   */
  update: (id: string, data: TaskUpdateInput): Promise<Task> => {
    return backendAPI.put<Task>(`/api/tasks/${id}`, data)
  },

  /**
   * Delete a task permanently.
   * @param id Task UUID
   * @returns Promise<void>
   */
  delete: (id: string): Promise<void> => {
    return backendAPI.delete<void>(`/api/tasks/${id}`)
  },

  /**
   * Toggle task completion status.
   * @param id Task UUID
   * @returns Promise<Task> Updated task object with toggled completion status
   */
  toggleComplete: (id: string): Promise<Task> => {
    return backendAPI.patch<Task>(`/api/tasks/${id}/complete`)
  }
}
