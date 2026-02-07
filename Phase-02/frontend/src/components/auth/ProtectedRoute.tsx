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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative spinner w-16 h-16 mx-auto"></div>
          </div>
          <p className="text-lg text-gray-600 font-medium">Checking authentication...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait a moment</p>
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
