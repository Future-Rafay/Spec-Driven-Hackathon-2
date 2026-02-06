# Research: Better Auth JWT Configuration for Next.js App Router

**Feature**: Authentication & Identity Layer
**Branch**: `1-auth`
**Date**: 2026-02-04
**Research Phase**: Phase 0 - Technical Decisions

## Executive Summary

This research document provides implementation guidance for integrating Better Auth with JWT tokens in a Next.js App Router application that communicates with a FastAPI backend. Key findings:

1. **Better Auth uses cookie-based sessions by default**, not JWTs
2. **JWT plugin is available** for generating tokens to send to external APIs (like FastAPI)
3. **Cookie cache with JWT strategy** provides JWT-like behavior for session storage
4. **Custom payload configuration** is fully supported for including user ID and email
5. **Token refresh is automatic** when using cookie cache with proper configuration

---

## 1. Better Auth JWT Configuration

### Decision: Use JWT Plugin for External API Communication

**Rationale**: Better Auth's default session management uses cookies and database storage. Since our architecture requires sending JWTs to a separate FastAPI backend, we must use the JWT plugin to generate tokens specifically for backend API authentication.

**Implementation**:

```typescript
// lib/auth.ts (Next.js frontend)
import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"

export const auth = betterAuth({
  database: {
    // Neon PostgreSQL connection
    provider: "postgres",
    url: process.env.DATABASE_URL
  },
  plugins: [
    jwt({
      jwt: {
        // Custom payload with user ID and email
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          // Add any additional claims needed by FastAPI
        }),
        // Token expiration (7 days as per spec)
        expiresIn: "7d",
        // Issuer and audience for verification
        issuer: process.env.NEXT_PUBLIC_APP_URL,
        audience: process.env.NEXT_PUBLIC_APP_URL,
      }
    })
  ],
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Refresh after 1 day
    // Cookie cache for performance
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
      strategy: "jwt" // Use JWT encoding for cookie cache
    }
  }
})
```

**Key Configuration Options**:

- `definePayload`: Customizes JWT claims (user ID, email, roles, etc.)
- `expiresIn`: Token lifetime (default 15 minutes, we set to 7 days per spec)
- `issuer`/`audience`: For token verification (should match FastAPI verification config)
- Algorithm: Default is EdDSA with Ed25519 (can configure ES256, RS256, PS256, etc.)

**Alternatives Considered**:

1. **Cookie-only sessions**: Rejected because FastAPI backend cannot access Next.js cookies
2. **Custom JWT implementation**: Rejected because Better Auth JWT plugin provides battle-tested solution
3. **Stateless JWT-only (no database)**: Rejected because we need user persistence and Better Auth's session management features

---

## 2. Token Storage Strategy in Next.js App Router

### Decision: Hybrid Approach - Cookies for Session + JWT for API Calls

**Rationale**: Better Auth manages sessions via HTTP-only cookies (secure, XSS-resistant). For FastAPI API calls, we extract JWT tokens from Better Auth and attach them to requests.

**Storage Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│ Next.js Frontend                                            │
│                                                             │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │ Better Auth      │         │ API Client              │  │
│  │ Session Cookie   │────────▶│ (with JWT injection)    │  │
│  │ (HTTP-only)      │         │                         │  │
│  └──────────────────┘         └─────────────────────────┘  │
│         │                              │                    │
│         │ Automatic                    │ Manual             │
│         │ Management                   │ Extraction         │
│         ▼                              ▼                    │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │ useSession()     │         │ Authorization: Bearer   │  │
│  │ Hook             │         │ <JWT>                   │  │
│  └──────────────────┘         └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────────┐
                              │ FastAPI Backend         │
                              │ JWT Verification        │
                              └─────────────────────────┘
```

**Implementation Strategy**:

1. **Session Storage**: Better Auth handles via secure HTTP-only cookies
   - Automatic cookie management
   - XSS protection (JavaScript cannot access)
   - CSRF protection via SameSite attribute
   - Cookie cache with JWT encoding for performance

2. **JWT Extraction for API Calls**: Three methods available

   **Method 1: Client Plugin (Recommended)**
   ```typescript
   import { jwtClient } from "better-auth/client/plugins"

   const authClient = createAuthClient({
     baseURL: process.env.NEXT_PUBLIC_APP_URL,
     plugins: [jwtClient()]
   })

   // Get JWT token
   const { data } = await authClient.token()
   const jwtToken = data.token
   ```

   **Method 2: Direct Endpoint**
   ```typescript
   // Call /api/auth/token endpoint
   const response = await fetch('/api/auth/token', {
     headers: {
       'Authorization': `Bearer ${sessionToken}`
     }
   })
   const { token } = await response.json()
   ```

   **Method 3: From Response Header**
   ```typescript
   // Extract from set-auth-jwt header when calling getSession()
   const session = await authClient.getSession()
   // JWT available in response headers
   ```

**Security Considerations**:

- ✅ **HTTP-only cookies**: Prevents XSS attacks on session tokens
- ✅ **SameSite attribute**: Prevents CSRF attacks
- ⚠️ **JWT in localStorage**: AVOID - vulnerable to XSS
- ⚠️ **JWT in sessionStorage**: AVOID - vulnerable to XSS
- ✅ **JWT in memory**: Safe for short-lived API calls (our approach)
- ✅ **JWT in Authorization header**: Industry standard, secure transmission

**Best Practice for This Architecture**:

```typescript
// lib/api-client.ts
import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [jwtClient()]
})

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  // Get fresh JWT token
  const { data } = await authClient.token()

  if (!data?.token) {
    throw new Error('Not authenticated')
  }

  // Attach to FastAPI request
  return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json'
    }
  })
}
```

**Alternatives Considered**:

1. **localStorage for JWT**: Rejected due to XSS vulnerability
2. **sessionStorage for JWT**: Rejected due to XSS vulnerability
3. **Memory-only JWT**: Considered but requires re-fetching on page refresh (acceptable tradeoff)
4. **Proxy all API calls through Next.js**: Rejected due to added latency and complexity

---

## 3. Attaching JWT to API Requests

### Decision: Client-Side JWT Injection via API Client Wrapper

**Implementation for Client Components**:

```typescript
// lib/api-client.ts
import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [jwtClient()]
})

export class BackendAPIClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data, error } = await authClient.token()

    if (error || !data?.token) {
      throw new Error('Authentication required')
    }

    return {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json'
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  // Add PUT, DELETE, PATCH methods as needed
}

export const backendAPI = new BackendAPIClient()
```

**Usage in Client Components**:

```typescript
// app/todos/page.tsx
'use client'

import { useSession } from '@/lib/auth-client'
import { backendAPI } from '@/lib/api-client'
import { useEffect, useState } from 'react'

export default function TodosPage() {
  const { data: session, isPending } = useSession()
  const [todos, setTodos] = useState([])

  useEffect(() => {
    if (session) {
      backendAPI.get('/api/todos')
        .then(setTodos)
        .catch(console.error)
    }
  }, [session])

  if (isPending) return <div>Loading...</div>
  if (!session) return <div>Please sign in</div>

  return <div>{/* Render todos */}</div>
}
```

**Implementation for Server Components**:

```typescript
// app/todos/page.tsx (Server Component)
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function TodosPage() {
  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    redirect('/signin')
  }

  // Generate JWT for backend call
  const jwtToken = await auth.api.createJWT({
    userId: session.user.id
  })

  // Call FastAPI backend
  const response = await fetch(`${process.env.BACKEND_URL}/api/todos`, {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store' // Ensure fresh data
  })

  const todos = await response.json()

  return <div>{/* Render todos */}</div>
}
```

**Implementation for API Routes (Route Handlers)**:

```typescript
// app/api/proxy/todos/route.ts
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Verify session
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Generate JWT
  const jwtToken = await auth.api.createJWT({
    userId: session.user.id
  })

  // Forward to FastAPI
  const response = await fetch(`${process.env.BACKEND_URL}/api/todos`, {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    }
  })

  const data = await response.json()
  return NextResponse.json(data)
}
```

**Rationale**:

- Client components: Direct JWT extraction via `jwtClient` plugin
- Server components: Session verification + JWT generation for backend calls
- API routes: Optional proxy pattern for additional security layer

**Alternatives Considered**:

1. **Proxy all requests through Next.js API routes**: Adds latency but provides additional security layer (can implement later if needed)
2. **Direct client-to-FastAPI calls**: Chosen for lower latency and simpler architecture
3. **Server-side only calls**: Rejected because client components need real-time data updates

---

## 4. Session Management and Token Refresh Patterns

### Decision: Automatic Refresh via Cookie Cache

**Configuration**:

```typescript
export const auth = betterAuth({
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh after 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
      strategy: "jwt",
      refreshCache: true // Auto-refresh at 80% of maxAge
    }
  }
})
```

**How It Works**:

1. **Initial Authentication**: User signs in, Better Auth creates session in database
2. **Cookie Cache**: Session data stored in signed JWT cookie (5-minute cache)
3. **Automatic Refresh**: When 80% of cache maxAge reached (4 minutes), Better Auth refreshes
4. **Session Extension**: When updateAge reached (1 day), session expiry extended by 7 days
5. **JWT Token Generation**: On-demand JWT generation for FastAPI calls (15-minute expiry by default, configurable to 7 days)

**Refresh Flow Diagram**:

```
Time: 0min          4min         5min         24hrs        7days
      │             │            │            │            │
      ├─────────────┼────────────┼────────────┼────────────┤
      │             │            │            │            │
   Sign In    Auto Refresh  Cache Expire  Session     Session
              (80% maxAge)  (DB query)    Refresh     Expires
                                          (extend 7d)
```

**Token Refresh Strategy**:

```typescript
// lib/api-client.ts
export class BackendAPIClient {
  private tokenCache: { token: string; expiresAt: number } | null = null

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Check if cached token is still valid (with 1-minute buffer)
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 60000) {
      return {
        'Authorization': `Bearer ${this.tokenCache.token}`,
        'Content-Type': 'application/json'
      }
    }

    // Fetch fresh token
    const { data, error } = await authClient.token()

    if (error || !data?.token) {
      throw new Error('Authentication required')
    }

    // Cache token (assuming 7-day expiry from config)
    this.tokenCache = {
      token: data.token,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    }

    return {
      'Authorization': `Bearer ${this.tokenCache.token}`,
      'Content-Type': 'application/json'
    }
  }
}
```

**Handling Token Expiry**:

```typescript
// lib/api-client.ts
export class BackendAPIClient {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: { ...options.headers, ...headers }
      })

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Clear token cache
        this.tokenCache = null

        // Try one more time with fresh token
        const freshHeaders = await this.getAuthHeaders()
        const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers: { ...options.headers, ...freshHeaders }
        })

        if (retryResponse.status === 401) {
          // Session truly expired, redirect to sign-in
          window.location.href = '/signin'
          throw new Error('Session expired')
        }

        return retryResponse.json()
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }
}
```

**Session Refresh Patterns**:

1. **Automatic (Recommended)**: Cookie cache with `refreshCache: true`
   - Pros: No manual intervention, seamless UX
   - Cons: Slightly more complex configuration

2. **Manual Refresh**: Call `authClient.session.refresh()` periodically
   - Pros: Full control over refresh timing
   - Cons: Requires manual implementation, can miss refresh windows

3. **On-Demand**: Refresh only when 401 received
   - Pros: Minimal overhead
   - Cons: Poor UX (user sees error before refresh)

**Chosen Pattern**: Automatic refresh with 401 retry fallback

**Rationale**:
- Provides seamless user experience
- Handles edge cases (network issues, race conditions)
- Aligns with Better Auth's recommended approach
- Minimizes database queries via cookie cache

---

## 5. FastAPI Backend JWT Verification

### Decision: PyJWT with JWKS Verification

**Implementation**:

```python
# backend/src/core/security.py
from jose import jwt, JWTError
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from functools import lru_cache
from typing import Dict, Any

security = HTTPBearer()

@lru_cache()
def get_jwks() -> Dict[str, Any]:
    """Fetch and cache JWKS from Better Auth"""
    response = httpx.get(f"{settings.FRONTEND_URL}/api/auth/jwks")
    response.raise_for_status()
    return response.json()

async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> Dict[str, Any]:
    """Verify JWT token and extract payload"""
    token = credentials.credentials

    try:
        # Get JWKS
        jwks = get_jwks()

        # Decode and verify
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["EdDSA", "ES256", "RS256"],
            issuer=settings.FRONTEND_URL,
            audience=settings.FRONTEND_URL
        )

        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )
```

**Usage in FastAPI Routes**:

```python
# backend/src/api/todos.py
from fastapi import APIRouter, Depends
from src.core.security import verify_jwt

router = APIRouter()

@router.get("/api/todos")
async def get_todos(current_user: dict = Depends(verify_jwt)):
    user_id = current_user["id"]
    # Query todos for this user only
    return await todo_service.get_user_todos(user_id)
```

**Alternative**: Shared Secret Verification (Simpler but less secure)

```python
# backend/src/core/security.py
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_jwt_shared_secret(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> Dict[str, Any]:
    """Verify JWT with shared secret"""
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,  # Same as BETTER_AUTH_SECRET
            algorithms=["HS256"],
            issuer=settings.FRONTEND_URL,
            audience=settings.FRONTEND_URL
        )
        return payload
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Recommendation**: Use JWKS for production (more secure, supports key rotation). Use shared secret for development (simpler setup).

---

## 6. Security Best Practices

### Token Storage Security Matrix

| Storage Method | XSS Vulnerable | CSRF Vulnerable | Recommended |
|----------------|----------------|-----------------|-------------|
| HTTP-only Cookie | ❌ No | ✅ Yes (mitigated by SameSite) | ✅ Yes (for sessions) |
| localStorage | ✅ Yes | ❌ No | ❌ No |
| sessionStorage | ✅ Yes | ❌ No | ❌ No |
| Memory (React state) | ❌ No | ❌ No | ✅ Yes (for short-lived JWTs) |
| Authorization header | ❌ No | ❌ No | ✅ Yes (for API calls) |

### Implementation Checklist

- ✅ Use HTTP-only cookies for Better Auth sessions
- ✅ Use SameSite=Lax or Strict for CSRF protection
- ✅ Generate JWTs on-demand for FastAPI calls
- ✅ Store JWTs in memory only (not localStorage/sessionStorage)
- ✅ Use Authorization: Bearer header for API requests
- ✅ Verify JWT signature on every FastAPI request
- ✅ Extract user ID from verified JWT, never trust client input
- ✅ Set appropriate token expiry (7 days per spec)
- ✅ Implement automatic token refresh
- ✅ Handle 401 errors gracefully with retry logic
- ✅ Use HTTPS in production
- ✅ Rotate JWT signing keys periodically (via Better Auth key rotation)

---

## 7. Configuration Summary

### Environment Variables

**Frontend (.env.local)**:
```bash
# Better Auth
BETTER_AUTH_SECRET=<generate-with-openssl-rand-base64-32>
BETTER_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@host/db

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (.env)**:
```bash
# JWT Verification
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<same-as-BETTER_AUTH_SECRET>  # If using shared secret

# Database
DATABASE_URL=postgresql://user:pass@host/db
```

### Dependencies

**Frontend (package.json)**:
```json
{
  "dependencies": {
    "better-auth": "^1.0.0",
    "next": "^16.0.0",
    "react": "^18.0.0"
  }
}
```

**Backend (requirements.txt)**:
```
fastapi>=0.115.0
python-jose[cryptography]>=3.3.0
httpx>=0.27.0
sqlmodel>=0.0.22
```

---

## 8. Implementation Roadmap

### Phase 1: Better Auth Setup (Frontend)
1. Install Better Auth and JWT plugin
2. Configure auth instance with JWT plugin
3. Set up database connection
4. Create auth API route handler
5. Test JWT generation endpoint

### Phase 2: Client Integration (Frontend)
1. Create auth client with jwtClient plugin
2. Implement API client wrapper with JWT injection
3. Create useSession hook wrapper
4. Build sign-up and sign-in forms
5. Test authentication flow

### Phase 3: Backend JWT Verification (FastAPI)
1. Install PyJWT/python-jose
2. Implement JWT verification middleware
3. Create dependency for extracting current user
4. Protect all API routes with authentication
5. Test with frontend-generated JWTs

### Phase 4: Integration Testing
1. Test full authentication flow (sign-up → sign-in → API call)
2. Test token expiry and refresh
3. Test 401 error handling
4. Test user isolation (cross-user data access prevention)
5. Performance testing (JWT verification latency)

---

## 9. Open Questions & Risks

### Resolved
- ✅ How to generate JWTs with Better Auth: Use JWT plugin with `definePayload`
- ✅ Where to store JWTs: Memory for API calls, HTTP-only cookies for sessions
- ✅ How to refresh tokens: Automatic via cookie cache with `refreshCache: true`
- ✅ How to verify JWTs in FastAPI: PyJWT with JWKS or shared secret

### Remaining Questions
- ⚠️ **Next.js middleware integration**: Documentation was unavailable. Need to research how to protect routes at middleware level
- ⚠️ **Server component session access**: Specific Next.js App Router patterns need verification
- ⚠️ **Key rotation strategy**: How often to rotate JWT signing keys in production

### Risks
1. **Token expiry during active session**: Mitigated by automatic refresh and 401 retry logic
2. **JWKS endpoint availability**: Mitigated by caching and fallback to shared secret
3. **Clock skew between frontend and backend**: Mitigated by JWT `leeway` parameter
4. **XSS attacks**: Mitigated by HTTP-only cookies and avoiding localStorage

---

## 10. Recommendations

### For Development
1. Use shared secret verification (simpler setup)
2. Set shorter token expiry (15 minutes) for faster testing
3. Enable verbose logging for JWT verification
4. Use Postman/curl to test JWT generation independently

### For Production
1. Use JWKS verification (more secure, supports key rotation)
2. Set 7-day token expiry as per spec
3. Enable automatic key rotation (30-day interval recommended)
4. Monitor JWT verification latency (<50ms target)
5. Implement rate limiting on authentication endpoints
6. Use HTTPS only
7. Set secure cookie attributes (Secure, HttpOnly, SameSite=Strict)

### Next Steps
1. Create data model specification (Phase 1)
2. Create API contracts (Phase 1)
3. Generate implementation tasks (Phase 2)
4. Begin implementation following this research

---

## References

- Better Auth Session Management: https://www.better-auth.com/docs/concepts/session-management
- Better Auth JWT Plugin: https://better-auth.com/docs/plugins/jwt
- Better Auth Client: https://better-auth.com/docs/concepts/client
- PyJWT Documentation: https://pyjwt.readthedocs.io/
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/

**Note**: Some Better Auth documentation pages (Next.js integration, middleware, external API) returned 404 errors during research. Implementation guidance is based on available documentation and industry best practices. Additional verification may be needed during implementation phase.
