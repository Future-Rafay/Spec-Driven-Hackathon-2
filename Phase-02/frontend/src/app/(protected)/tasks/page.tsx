/**
 * Tasks page - main task management interface.
 * Protected route that displays user's tasks.
 */

'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import TaskList from '@/components/tasks/TaskList'
import TaskForm from '@/components/tasks/TaskForm'
import type { Task } from '@/types/task'
import { taskAPI } from '@/lib/task-api'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks on mount
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const fetchedTasks = await taskAPI.list()
      // Tasks are already sorted by backend (newest first)
      setTasks(fetchedTasks)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks'
      setError(errorMessage)
      console.error('Error loading tasks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Create task handler with optimistic update
  const handleCreate = async (data: { title: string; description?: string }) => {
    // Create temporary task for optimistic update
    const tempTask: Task = {
      id: `temp-${Date.now()}`,
      title: data.title,
      description: data.description || null,
      completed: false,
      user_id: 'temp',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Save current state for rollback
    const previousTasks = [...tasks]

    try {
      // Optimistic update - add task immediately
      setTasks([tempTask, ...tasks])

      // Call API
      const createdTask = await taskAPI.create(data)

      // Replace temp task with real task from backend
      setTasks((current) =>
        current.map((t) => (t.id === tempTask.id ? createdTask : t))
      )
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)
      throw err // Re-throw so TaskForm can display error
    }
  }

  // Update task handler with optimistic update
  const handleUpdate = async (id: string, data: { title: string; description?: string }) => {
    // Save current state for rollback
    const previousTasks = [...tasks]

    try {
      // Optimistic update - update task immediately
      setTasks((current) =>
        current.map((task) =>
          task.id === id
            ? { ...task, title: data.title, description: data.description || null }
            : task
        )
      )

      // Call API
      const updatedTask = await taskAPI.update(id, data)

      // Update with backend response
      setTasks((current) =>
        current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      )
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)
      throw err // Re-throw so TaskItem can display error
    }
  }

  // Delete task handler with optimistic update
  const handleDelete = async (id: string) => {
    // Save current state for rollback
    const previousTasks = [...tasks]

    try {
      // Optimistic update - remove task immediately
      setTasks((current) => current.filter((task) => task.id !== id))

      // Call API
      await taskAPI.delete(id)
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)
      throw err // Re-throw so TaskItem can display error
    }
  }

  // Toggle completion handler with optimistic update
  const handleToggle = async (id: string) => {
    // Save current state for rollback
    const previousTasks = [...tasks]

    try {
      // Optimistic update - toggle completion immediately
      setTasks((current) =>
        current.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      )

      // Call API
      const updatedTask = await taskAPI.toggleComplete(id)

      // Update with backend response
      setTasks((current) =>
        current.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      )
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)
      throw err // Re-throw so TaskItem can display error
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="mt-2 text-gray-600">Manage your todo list</p>
          </div>

          {/* Page-level error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    onClick={loadTasks}
                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading tasks...</span>
            </div>
          )}

          {/* Create task form */}
          {!isLoading && !error && (
            <TaskForm onSubmit={handleCreate} />
          )}

          {/* Task list */}
          {!isLoading && !error && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <TaskList
                tasks={tasks}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            </div>
          )}

          {/* Task count */}
          {!isLoading && !error && tasks.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
