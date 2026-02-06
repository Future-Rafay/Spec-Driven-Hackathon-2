export interface User {
  id: string
  email: string
  created_at: string
  last_signin_at: string | null
}

export interface AuthToken {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface SignupRequest {
  email: string
  password: string
}

export interface SigninRequest {
  email: string
  password: string
}

export interface ErrorResponse {
  detail: string
  error_code?: string
}
