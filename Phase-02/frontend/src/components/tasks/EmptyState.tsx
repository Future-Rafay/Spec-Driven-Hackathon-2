/**
 * EmptyState component - displayed when user has no tasks.
 */

export default function EmptyState() {
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-primary-50 to-secondary-50 p-6 rounded-full">
            <svg
              className="w-16 h-16 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3">No tasks yet</h3>
      <p className="text-gray-600 mb-2 max-w-sm mx-auto">
        Create your first task to get started on your productivity journey!
      </p>
      <p className="text-sm text-gray-500 flex items-center justify-center">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Use the form above to add a new task
      </p>
    </div>
  )
}
