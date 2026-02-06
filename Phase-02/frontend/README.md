# Frontend - Authentication & Identity Layer

Next.js 16+ frontend application with Better Auth integration for secure user authentication.

## Overview

This frontend application provides a complete authentication UI with:
- User registration and sign-in forms
- Better Auth integration with JWT plugin
- Protected routes with authentication checks
- API client with automatic JWT injection
- Error handling and loading states
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Authentication**: Better Auth with JWT plugin
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API with custom wrapper
- **State Management**: React hooks (useState, useEffect)

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── signin/        # Sign-in page
│   │   │   └── signup/        # Sign-up page
│   │   ├── (protected)/       # Protected route group
│   │   │   └── profile/       # User profile page
│   │   ├── api/               # API routes
│   │   │   └── auth/[...all]/ # Better Auth handler
│   │   ├── layout.tsx         # Root layout
│   │   └── error.tsx          # Error boundary
│   ├── components/            # React components
│   │   └── auth/
│   │       ├── SignupForm.tsx      # Registration form
│   │       ├── SigninForm.tsx      # Sign-in form
│   │       └── ProtectedRoute.tsx  # Auth wrapper
│   ├── lib/                   # Utilities
│   │   ├── auth.ts           # Better Auth config
│   │   ├── auth-client.ts    # Auth client
│   │   └── api-client.ts     # Backend API client
│   └── types/                # TypeScript types
│       └── auth.ts           # Auth interfaces
├── package.json              # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind config
├── .env.local.example       # Environment template
└── README.md               # This file
```

## Setup

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Backend API running (see backend/README.md)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open browser**:
   Navigate to http://localhost:3000

## Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=your-jwt-secret-must-match-backend
BETTER_AUTH_URL=http://localhost:3000

# Database (same as backend)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: `BETTER_AUTH_SECRET` must match `JWT_SECRET` from backend `.env`

## Features

### Authentication Pages

#### Sign Up (`/signup`)
- Email and password input fields
- Client-side validation (email format, password strength)
- Real-time error display
- Success message and redirect
- Link to sign-in page

#### Sign In (`/signin`)
- Email and password input fields
- Better Auth integration
- Error handling for invalid credentials
- Automatic redirect on success
- Link to sign-up page

### Protected Routes

#### Profile Page (`/profile`)
- Displays current user information
- Tests protected endpoint integration
- Automatic redirect if not authenticated
- Sign-out functionality

### Components

#### SignupForm
- Controlled form with React state
- Email validation (format check)
- Password validation (complexity requirements)
- API integration with backend
- Error handling (400, 409 responses)

#### SigninForm
- Better Auth signin integration
- Form validation
- Loading states
- Error display
- Redirect on success

#### ProtectedRoute
- Authentication check wrapper
- Redirects to signin if not authenticated
- Loading state while checking auth
- Reusable for any protected content

### API Client

The `api-client.ts` provides a wrapper for backend API calls:

```typescript
import { backendAPI } from '@/lib/api-client'

// GET request with JWT
const user = await backendAPI.get<User>('/api/auth/me')

// POST request with JWT
const result = await backendAPI.post('/api/tasks', { title: 'New task' })

// PUT request with JWT
await backendAPI.put('/api/tasks/123', { completed: true })

// DELETE request with JWT
await backendAPI.delete('/api/tasks/123')
```

Features:
- Automatic JWT injection from localStorage
- Token caching (avoids repeated lookups)
- 401 handling (clears token, redirects to signin)
- Error handling with user-friendly messages

## Better Auth Integration

### Configuration

Better Auth is configured in `src/lib/auth.ts`:

```typescript
export const auth = betterAuth({
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL!
  },
  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email
        }),
        expiresIn: "7d"
      }
    })
  ],
  session: {
    expiresIn: 604800, // 7 days
    cookieCache: {
      enabled: true,
      maxAge: 300, // 5 minutes
      strategy: "jwt"
    }
  }
})
```

### Client Usage

```typescript
import { authClient } from '@/lib/auth-client'

// Sign in
const result = await authClient.signIn.email({
  email: 'user@example.com',
  password: 'SecurePass123!'
})

// Check session
const session = await authClient.getSession()

// Sign out
await authClient.signOut()
```

## Styling

### Tailwind CSS

The application uses Tailwind CSS for styling:

- **Forms**: Consistent input styling with focus states
- **Buttons**: Primary (indigo) and secondary (gray) variants
- **Errors**: Red background with clear messaging
- **Loading**: Spinner animations
- **Responsive**: Mobile-first design

### Color Scheme

- **Primary**: Indigo (indigo-600, indigo-700)
- **Success**: Green (green-50, green-800)
- **Error**: Red (red-50, red-800)
- **Neutral**: Gray (gray-50 to gray-900)

## Usage Examples

### Basic Authentication Flow

1. **User visits app**: Redirected to signin if not authenticated
2. **User signs up**: `/signup` → Creates account → Redirects to signin
3. **User signs in**: `/signin` → Authenticates → Stores JWT → Redirects to home
4. **User accesses protected page**: JWT sent with request → Backend verifies → Content displayed
5. **User signs out**: JWT cleared → Redirected to signin

### Protecting a Page

```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  )
}
```

### Making Authenticated API Calls

```typescript
'use client'

import { useEffect, useState } from 'react'
import { backendAPI } from '@/lib/api-client'

export default function MyComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await backendAPI.get('/api/some-endpoint')
        setData(result)
      } catch (error) {
        console.error('Failed to fetch:', error)
      }
    }
    fetchData()
  }, [])

  return <div>{/* Render data */}</div>
}
```

## Development

### Running Development Server

```bash
npm run dev
```

Server runs on http://localhost:3000 with hot reload enabled.

### Building for Production

```bash
npm run build
npm run start
```

### Type Checking

```bash
npm run type-check
# or
tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Error Handling

### Error Boundary

The application includes a global error boundary (`app/error.tsx`) that:
- Catches authentication errors
- Displays user-friendly error messages
- Provides recovery options (retry, go to signin)
- Logs errors to console

### Form Validation Errors

- **Email**: Format validation with regex
- **Password**: Complexity requirements (8+ chars, uppercase, lowercase, digit, special)
- **API Errors**: Displayed below form fields or in alert boxes

### Network Errors

- **Connection Failed**: User-friendly message with retry option
- **401 Unauthorized**: Automatic redirect to signin
- **Other Errors**: Generic error message with details

## Security Considerations

### Token Storage

- **Current**: localStorage (for development)
- **Production**: Consider httpOnly cookies for enhanced security

### CORS

- Backend must allow frontend origin
- Credentials included in requests

### XSS Prevention

- React automatically escapes content
- No dangerouslySetInnerHTML used
- User input sanitized

## Deployment

### Production Checklist

- [ ] Update BETTER_AUTH_SECRET (match backend)
- [ ] Set NEXT_PUBLIC_BACKEND_URL to production API
- [ ] Set NEXT_PUBLIC_APP_URL to production domain
- [ ] Enable HTTPS only
- [ ] Configure production database
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable analytics (optional)
- [ ] Test authentication flow end-to-end

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

**Better Auth errors**:
```bash
# Ensure BETTER_AUTH_SECRET matches backend JWT_SECRET
echo $BETTER_AUTH_SECRET

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

**API calls fail with CORS error**:
- Check backend CORS configuration
- Verify NEXT_PUBLIC_BACKEND_URL is correct
- Ensure backend is running

**JWT token not sent**:
- Check localStorage has 'access_token'
- Verify api-client.ts is being used
- Check browser console for errors

**Protected routes not working**:
- Verify token exists in localStorage
- Check ProtectedRoute component is wrapping content
- Test /api/auth/me endpoint directly

### Debug Mode

Enable detailed logging:

```typescript
// In api-client.ts, add console.logs
console.log('Token:', token)
console.log('Request:', endpoint, data)
console.log('Response:', response)
```

## Testing

### Manual Testing

1. **Sign Up Flow**:
   - Navigate to `/signup`
   - Enter valid email and password
   - Verify success message
   - Check database for new user

2. **Sign In Flow**:
   - Navigate to `/signin`
   - Enter credentials
   - Verify redirect to home
   - Check localStorage for token

3. **Protected Route**:
   - Navigate to `/profile`
   - Verify user data displays
   - Sign out and verify redirect

### Automated Testing

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest

# Run tests
npm test
```

## Support

- **Specification**: See `specs/1-auth/spec.md`
- **Backend API**: See `backend/README.md`
- **Quickstart Guide**: See `specs/1-auth/quickstart.md`
- **Issues**: Report bugs in project issue tracker

## License

[Your License Here]
