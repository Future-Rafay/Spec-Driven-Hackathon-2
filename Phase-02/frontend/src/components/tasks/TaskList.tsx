/**
 * TaskList component - displays array of tasks or empty state.
 */

import type { Task } from '@/types/task'
import TaskItem from './TaskItem'
import EmptyState from './EmptyState'

interface TaskListProps {
  tasks: Task[]
  onUpdate: (id: string, data: { title: string; description?: string }) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export default function TaskList({ tasks, onUpdate, onDelete, onToggle }: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState />
  }

  // Separate completed and incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

  return (
    <div className="space-y-6">
      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
              <svg className="w-4 h-4 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Active Tasks
            </h3>
            <span className="badge badge-primary">{incompleteTasks.length}</span>
          </div>
          <div className="space-y-3">
            {incompleteTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
              <svg className="w-4 h-4 mr-2 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completed
            </h3>
            <span className="badge badge-success">{completedTasks.length}</span>
          </div>
          <div className="space-y-3 opacity-75">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
