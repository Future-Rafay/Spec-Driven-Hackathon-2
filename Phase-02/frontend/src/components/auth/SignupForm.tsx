'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

interface UserResponse {
  id: string
  email: string
  created_at: string
  last_signin_at: string | null
}

export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Invalid email format'
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter'
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
    if (!/\d/.test(password)) return 'Password must contain a digit'
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      return 'Password must contain a special character'
    }
    return undefined
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})
    setSuccess(false)

    // Validate form
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        // Handle API errors
        if (response.status === 409) {
          setErrors({ general: 'Email already registered' })
        } else if (response.status === 400) {
          setErrors({ general: data.detail || 'Invalid input' })
        } else {
          setErrors({ general: 'Registration failed. Please try again.' })
        }
        return
      }

      // Success
      setSuccess(true)
      setFormData({ email: '', password: '' })

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        router.push('/signin')
      }, 2000)

    } catch (error) {
      setErrors({
        general: 'Network error. Please check your connection and try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Account created successfully! Redirecting to sign in...
          </p>
        </div>
      )}

      {errors.general && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{errors.general}</p>
        </div>
      )}

      <div className="rounded-md shadow-sm space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="you@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Must be 8+ characters with uppercase, lowercase, digit, and special character
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </a>
        </p>
      </div>
    </form>
  )
}
