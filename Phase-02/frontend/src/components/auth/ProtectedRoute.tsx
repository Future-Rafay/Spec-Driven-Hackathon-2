'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  redirectTo = '/signin'
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has valid access token
    const token = localStorage.getItem('access_token')

    if (!token) {
      // No token found, redirect to signin
      router.push(redirectTo)
      setIsAuthenticated(false)
    } else {
      // Token exists, allow access
      // Note: Token validity will be verified by backend on API calls
      setIsAuthenticated(true)
    }
  }, [router, redirectTo])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated (redirect in progress)
  if (!isAuthenticated) {
    return null
  }

  // Render protected content
  return <>{children}</>
}
