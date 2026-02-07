/**
 * API client for backend communication with JWT authentication.
 * Handles token injection and error handling for all API requests.
 */

interface User {
  id: string
  email: string
  created_at: string
  last_signin_at: string | null
}

interface AuthToken {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

class BackendAPIClient {
  private baseURL: string
  private tokenCache: { token: string; expiresAt: number } | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  }

  /**
   * Get authentication headers with JWT token.
   * Caches token to avoid repeated fetches.
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    // Check if cached token is still valid (with 1-minute buffer)
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 60000) {
      return {
        'Authorization': `Bearer ${this.tokenCache.token}`,
        'Content-Type': 'application/json'
      }
    }

    // For now, we'll get the token from localStorage (set after signin)
    // In production, this would use Better Auth's token method
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

    if (!token) {
      throw new Error('Not authenticated')
    }

    // Cache token (assuming 7-day expiry from config)
    this.tokenCache = {
      token,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * Make authenticated GET request.
   */
  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers
    })

    if (response.status === 401) {
      // Clear token cache and redirect to signin
      this.tokenCache = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        window.location.href = '/signin'
      }
      throw new Error('Authentication required')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Make authenticated POST request.
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })

    if (response.status === 401) {
      this.tokenCache = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        window.location.href = '/signin'
      }
      throw new Error('Authentication required')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Make authenticated PUT request.
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    })

    if (response.status === 401) {
      this.tokenCache = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        window.location.href = '/signin'
      }
      throw new Error('Authentication required')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Make authenticated DELETE request.
   */
  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers
    })

    if (response.status === 401) {
      this.tokenCache = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        window.location.href = '/signin'
      }
      throw new Error('Authentication required')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Make authenticated PATCH request.
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined
    })

    if (response.status === 401) {
      this.tokenCache = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        window.location.href = '/signin'
      }
      throw new Error('Authentication required')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `API error: ${response.status}`)
    }

    return response.json()
  }
}

export const backendAPI = new BackendAPIClient()
export type { User, AuthToken }
