# Quickstart Guide: Authentication & Identity Layer

**Feature**: Authentication & Identity Layer
**Branch**: `1-auth`
**Date**: 2026-02-04
**Phase**: Phase 1 - Design

## Overview

This guide provides step-by-step instructions to set up, run, and test the authentication system locally. Follow these instructions to verify the implementation works correctly before deployment.

---

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher
- **Python**: 3.11 or higher
- **PostgreSQL**: Access to Neon Serverless PostgreSQL (or local PostgreSQL 14+)
- **Git**: For version control
- **curl** or **Postman**: For API testing

### Required Accounts

- **Neon Account**: Sign up at https://neon.tech for serverless PostgreSQL
- **GitHub Account**: For repository access (if applicable)

---

## Part 1: Environment Setup

### 1.1 Clone Repository

```bash
git clone <repository-url>
cd <repository-name>
git checkout 1-auth
```

### 1.2 Backend Setup (FastAPI)

#### Install Python Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Create Backend Environment File

Create `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Configuration
JWT_SECRET=your-secret-key-min-32-chars-generate-with-openssl
FRONTEND_URL=http://localhost:3000

# Application
ENVIRONMENT=development
LOG_LEVEL=INFO
```

**Generate JWT Secret**:
```bash
# Generate secure random secret (32 bytes, base64 encoded)
openssl rand -base64 32
```

### 1.3 Frontend Setup (Next.js)

#### Install Node Dependencies

```bash
cd frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

#### Create Frontend Environment File

Create `frontend/.env.local`:

```bash
# Better Auth
BETTER_AUTH_SECRET=<same-as-JWT_SECRET-from-backend>
BETTER_AUTH_URL=http://localhost:3000

# Database (same as backend)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: `BETTER_AUTH_SECRET` must match `JWT_SECRET` from backend `.env`

---

## Part 2: Database Initialization

### 2.1 Get Neon PostgreSQL Connection String

1. Log in to https://console.neon.tech
2. Create a new project (or use existing)
3. Copy the connection string from the dashboard
4. Format: `postgresql://user:password@host/database?sslmode=require`

### 2.2 Run Database Migrations

#### Option A: Using Alembic (Recommended)

```bash
cd backend

# Initialize Alembic (first time only)
alembic init migrations

# Create initial migration
alembic revision --autogenerate -m "Create users table"

# Apply migrations
alembic upgrade head
```

#### Option B: Direct SQL Execution

```bash
cd backend

# Connect to database and run schema
psql $DATABASE_URL -f migrations/001_create_users_table.sql
```

SQL file content (`migrations/001_create_users_table.sql`):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_signin_at TIMESTAMP NULL
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_signin ON users(last_signin_at);
```

### 2.3 Verify Database Schema

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Describe users table
\d users

# Expected output:
#                Table "public.users"
#     Column      |            Type             | Nullable
# ----------------+-----------------------------+----------
#  id             | uuid                        | not null
#  email          | character varying(255)      | not null
#  password_hash  | character varying(255)      | not null
#  created_at     | timestamp without time zone | not null
#  last_signin_at | timestamp without time zone |
```

---

## Part 3: Running the Application

### 3.1 Start Backend (FastAPI)

```bash
cd backend

# Activate virtual environment (if not already active)
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Run development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8080

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8080 (Press CTRL+C to quit)
# INFO:     Started reloader process
# INFO:     Started server process
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
```

**Verify Backend**:
```bash
curl http://localhost:8080/health
# Expected: {"status": "healthy"}
```

### 3.2 Start Frontend (Next.js)

Open a new terminal:

```bash
cd frontend

# Run development server
npm run dev
# or
yarn dev
# or
pnpm dev

# Expected output:
#   ▲ Next.js 16.x.x
#   - Local:        http://localhost:3000
#   - Ready in X.Xs
```

**Verify Frontend**:
Open browser to http://localhost:3000

---

## Part 4: Testing Authentication Flow

### 4.1 Test User Registration (Signup)

#### Using curl

```bash
# Register new user
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Expected response (201 Created):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "created_at": "2026-02-04T10:30:00Z",
  "last_signin_at": null
}
```

#### Using Frontend

1. Navigate to http://localhost:3000/signup
2. Enter email: `test@example.com`
3. Enter password: `SecurePass123!`
4. Click "Sign Up"
5. Verify success message appears

#### Test Error Cases

```bash
# Test duplicate email (409 Conflict)
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "AnotherPass456!"
  }'

# Expected: {"detail": "Email already registered", "error_code": "EMAIL_EXISTS"}

# Test weak password (400 Bad Request)
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "weak"
  }'

# Expected: {"detail": "Password must be at least 8 characters long", "error_code": "WEAK_PASSWORD"}

# Test invalid email (400 Bad Request)
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "not-an-email",
    "password": "SecurePass123!"
  }'

# Expected: {"detail": "Invalid email format", "error_code": "INVALID_EMAIL"}
```

### 4.2 Test User Sign In

#### Using curl

```bash
# Sign in with correct credentials
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Expected response (200 OK):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "created_at": "2026-02-04T10:30:00Z",
    "last_signin_at": "2026-02-04T15:45:00Z"
  }
}

# Save the access_token for next steps
export JWT_TOKEN="<access_token_from_response>"
```

#### Using Frontend

1. Navigate to http://localhost:3000/signin
2. Enter email: `test@example.com`
3. Enter password: `SecurePass123!`
4. Click "Sign In"
5. Verify redirect to dashboard or home page

#### Test Error Cases

```bash
# Test incorrect password (401 Unauthorized)
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword123!"
  }'

# Expected: {"detail": "Invalid email or password", "error_code": "INVALID_CREDENTIALS"}

# Test non-existent email (401 Unauthorized)
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "SecurePass123!"
  }'

# Expected: {"detail": "Invalid email or password", "error_code": "INVALID_CREDENTIALS"}
```

### 4.3 Test Protected Endpoint (Get Current User)

#### Using curl

```bash
# Get current user with valid JWT
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "created_at": "2026-02-04T10:30:00Z",
  "last_signin_at": "2026-02-04T15:45:00Z"
}
```

#### Test Error Cases

```bash
# Test without token (401 Unauthorized)
curl -X GET http://localhost:8080/api/auth/me

# Expected: {"detail": "Not authenticated", "error_code": "MISSING_TOKEN"}

# Test with invalid token (401 Unauthorized)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer invalid.token.here"

# Expected: {"detail": "Invalid authentication credentials", "error_code": "INVALID_TOKEN"}
```

### 4.4 Test User Isolation (Future: With Tasks)

Once task management is implemented, verify user isolation:

```bash
# As User A: Create a task
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "User A Task", "completed": false}'

# As User B: Try to access User A's task (should fail with 403)
curl -X GET http://localhost:8080/api/tasks/<task_id> \
  -H "Authorization: Bearer $USER_B_TOKEN"

# Expected: {"detail": "Forbidden", "error_code": "FORBIDDEN"}
```

---

## Part 5: Verification Checklist

### Backend Verification

- [ ] Backend starts without errors on port 8080
- [ ] Health check endpoint responds: `curl http://localhost:8080/health`
- [ ] OpenAPI docs accessible: http://localhost:8080/docs
- [ ] Database connection successful (check logs)
- [ ] User registration creates user in database
- [ ] User sign-in returns valid JWT token
- [ ] JWT verification works on protected endpoints
- [ ] Invalid tokens return 401 error
- [ ] Missing tokens return 401 error

### Frontend Verification

- [ ] Frontend starts without errors on port 3000
- [ ] Sign-up page renders correctly
- [ ] Sign-in page renders correctly
- [ ] Form validation works (email format, password requirements)
- [ ] Successful sign-up shows confirmation
- [ ] Successful sign-in redirects to protected area
- [ ] JWT token stored securely (not in localStorage)
- [ ] Protected pages require authentication
- [ ] Sign-out clears authentication state

### Security Verification

- [ ] Passwords are hashed in database (never plain text)
- [ ] JWT secret is loaded from environment variable
- [ ] JWT tokens expire after 7 days
- [ ] Duplicate email registration returns 409 error
- [ ] Weak passwords are rejected with clear error message
- [ ] Invalid email formats are rejected
- [ ] Generic error message for incorrect credentials (doesn't reveal if email exists)
- [ ] HTTP-only cookies used for session management (Better Auth)
- [ ] CORS configured correctly (frontend can call backend)

### Database Verification

```sql
-- Connect to database
psql $DATABASE_URL

-- Verify users table exists
SELECT * FROM users;

-- Verify email uniqueness constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users' AND constraint_type = 'UNIQUE';

-- Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users';

-- Verify password is hashed (starts with $2b$ for bcrypt)
SELECT email, LEFT(password_hash, 10) as hash_prefix
FROM users;
```

---

## Part 6: Troubleshooting

### Common Issues

#### Backend won't start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`
**Solution**: Activate virtual environment and install dependencies
```bash
source venv/bin/activate
pip install -r requirements.txt
```

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`
**Solution**: Verify DATABASE_URL is correct and Neon database is accessible
```bash
psql $DATABASE_URL -c "SELECT 1"
```

#### Frontend won't start

**Error**: `Error: Cannot find module 'better-auth'`
**Solution**: Install dependencies
```bash
npm install
```

**Error**: `BETTER_AUTH_SECRET is not defined`
**Solution**: Create `.env.local` file with required environment variables

#### JWT verification fails

**Error**: `Invalid authentication credentials`
**Solution**: Verify JWT_SECRET matches BETTER_AUTH_SECRET
```bash
# Backend .env
echo $JWT_SECRET

# Frontend .env.local
echo $BETTER_AUTH_SECRET

# They must be identical
```

#### Database migration fails

**Error**: `relation "users" already exists`
**Solution**: Drop and recreate table (development only)
```sql
DROP TABLE IF EXISTS users CASCADE;
-- Then re-run migration
```

### Debug Mode

#### Enable Backend Debug Logging

Edit `backend/.env`:
```bash
LOG_LEVEL=DEBUG
```

Restart backend to see detailed logs.

#### Enable Frontend Debug Logging

Edit `frontend/.env.local`:
```bash
NEXT_PUBLIC_DEBUG=true
```

Check browser console for detailed logs.

---

## Part 7: Next Steps

### After Verification

1. **Run Tests**: Execute automated test suite
   ```bash
   # Backend tests
   cd backend
   pytest

   # Frontend tests
   cd frontend
   npm test
   ```

2. **Generate Tasks**: Create implementation tasks
   ```bash
   /sp.tasks
   ```

3. **Begin Implementation**: Follow generated tasks in priority order

### Production Deployment

Before deploying to production:

- [ ] Change JWT_SECRET to production value (never reuse development secret)
- [ ] Enable HTTPS only
- [ ] Set secure cookie attributes (Secure, HttpOnly, SameSite=Strict)
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Enable rate limiting on auth endpoints
- [ ] Set up monitoring and alerting
- [ ] Review security checklist in constitution.md

---

## Part 8: Quick Reference

### Environment Variables Summary

| Variable | Location | Required | Example |
|----------|----------|----------|---------|
| DATABASE_URL | Backend & Frontend | Yes | postgresql://user:pass@host/db |
| JWT_SECRET | Backend | Yes | <32-char-random-string> |
| BETTER_AUTH_SECRET | Frontend | Yes | <same-as-JWT_SECRET> |
| FRONTEND_URL | Backend | Yes | http://localhost:3000 |
| NEXT_PUBLIC_BACKEND_URL | Frontend | Yes | http://localhost:808 |
| NEXT_PUBLIC_APP_URL | Frontend | Yes | http://localhost:3000 |

### API Endpoints Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| /api/auth/signup | POST | No | Register new user |
| /api/auth/signin | POST | No | Authenticate user |
| /api/auth/me | GET | Yes | Get current user |
| /health | GET | No | Health check |
| /docs | GET | No | OpenAPI documentation |

### Port Summary

| Service | Port | URL |
|---------|------|-----|
| Backend (FastAPI) | 808 | http://localhost:808 |
| Frontend (Next.js) | 3000 | http://localhost:3000 |
| Database (Neon) | 5432 | <connection-string> |

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review specification: `specs/1-auth/spec.md`
- Review API contracts: `specs/1-auth/contracts/auth-api.yaml`
- Review data model: `specs/1-auth/data-model.md`
- Review research: `specs/1-auth/research.md`
