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

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length

  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-12 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-200"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                  <span className="gradient-text">My Tasks</span>
                </h1>
                <p className="text-lg text-gray-600">Organize and track your daily tasks</p>
              </div>
              <a
                href="/"
                className="btn btn-outline px-4 py-2 text-sm"
                title="Back to home"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </a>
            </div>

            {/* Stats */}
            {!isLoading && !error && totalCount > 0 && (
              <div className="flex gap-4 animate-slide-up">
                <div className="card px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                    <p className="text-xs text-gray-600">Total Tasks</p>
                  </div>
                </div>

                <div className="card px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                    <p className="text-xs text-gray-600">Completed</p>
                  </div>
                </div>

                {totalCount > 0 && (
                  <div className="card px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{Math.round((completedCount / totalCount) * 100)}%</p>
                      <p className="text-xs text-gray-600">Progress</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Page-level error */}
          {error && (
            <div className="mb-6 alert alert-error animate-slide-down">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 flex-shrink-0 mr-3"
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
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1">Error loading tasks</h3>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={loadTasks}
                    className="mt-3 btn btn-danger px-4 py-2 text-sm"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative mb-4">
                <div className="spinner w-16 h-16"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading your tasks...</p>
            </div>
          )}

          {/* Create task form */}
          {!isLoading && !error && (
            <TaskForm onSubmit={handleCreate} />
          )}

          {/* Task list */}
          {!isLoading && !error && (
            <div className="card p-6">
              <TaskList
                tasks={tasks}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
