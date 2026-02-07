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

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
