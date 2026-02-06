export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Todo App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Secure authentication system for your tasks
        </p>
        <div className="space-x-4">
          <a
            href="/signup"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
          >
            Sign Up
          </a>
          <a
            href="/signin"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-md hover:bg-gray-300"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  )
}
