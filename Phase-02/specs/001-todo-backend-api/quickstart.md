# Quickstart Guide: Todo Backend API

**Feature**: todo-backend-api
**Date**: 2026-02-06
**Prerequisites**: Authentication system (1-auth) must be complete and operational

## Overview

This guide provides step-by-step instructions to set up, run, and test the todo backend API locally. The API provides CRUD operations for tasks with strict per-user data isolation enforced through JWT authentication.

---

## Prerequisites

### Required Software

- **Python**: 3.11 or higher
- **PostgreSQL**: Neon Serverless PostgreSQL (or local PostgreSQL 14+)
- **Git**: For version control
- **curl** or **Postman**: For API testing

### Required Setup

- **Authentication System**: The 1-auth feature must be complete with:
  - Users table created in database
  - JWT authentication working
  - Valid JWT tokens available for testing

### Environment Variables

Ensure your `backend/.env` file has:
```bash
DATABASE_URL=postgresql+asyncpg://user:password@host/database?sslmode=require
JWT_SECRET=your-secret-key-min-32-chars
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
LOG_LEVEL=INFO
```

---

## Part 1: Database Setup

### 1.1 Verify Authentication System

Before proceeding, verify the authentication system is working:

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# Should return a count (0 or more users)
```

### 1.2 Run Tasks Table Migration

```bash
cd backend

# Run the tasks table migration
psql $DATABASE_URL -f migrations/002_create_tasks_table.sql

# Expected output:
# CREATE TABLE
# CREATE INDEX
# CREATE INDEX
# CREATE INDEX
# COMMENT
# ... (multiple COMMENT statements)
# CREATE FUNCTION
# CREATE TRIGGER
```

### 1.3 Verify Database Schema

```bash
# Verify tasks table exists
psql $DATABASE_URL -c "\d tasks"

# Expected output:
#                Table "public.tasks"
#     Column      |            Type             | Nullable
# ----------------+-----------------------------+----------
#  id             | uuid                        | not null
#  title          | character varying(500)      | not null
#  description    | text                        |
#  completed      | boolean                     | not null
#  user_id        | uuid                        | not null
#  created_at     | timestamp without time zone | not null
#  updated_at     | timestamp without time zone | not null

# Verify foreign key constraint
psql $DATABASE_URL -c "SELECT conname FROM pg_constraint WHERE conrelid = 'tasks'::regclass AND contype = 'f';"

# Expected output:
#        conname
# ----------------------
#  tasks_user_id_fkey

# Verify indexes
psql $DATABASE_URL -c "SELECT indexname FROM pg_indexes WHERE tablename = 'tasks';"

# Expected output:
#         indexname
# --------------------------
#  tasks_pkey
#  idx_tasks_user_id
#  idx_tasks_completed
#  idx_tasks_created_at
```

---

## Part 2: Running the Application

### 2.1 Start Backend Server

```bash
cd backend

# Activate virtual environment (if not already active)
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Start development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8080

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8080 (Press CTRL+C to quit)
# INFO:     Started reloader process
# INFO:     Started server process
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
```

### 2.2 Verify Backend Health

```bash
# Test health check endpoint
curl http://localhost:8080/health

# Expected response:
# {"status":"healthy","environment":"development"}
```

### 2.3 View API Documentation

Open your browser to:
- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc

You should see the task endpoints listed under the "Tasks" tag.

---

## Part 3: Testing the API

### 3.1 Obtain JWT Token

First, you need a valid JWT token from the authentication system:

```bash
# Sign in to get JWT token
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Response:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "bearer",
#   "expires_in": 604800,
#   "user": {...}
# }

# Save the access_token for subsequent requests
export JWT_TOKEN="<access_token_from_response>"
```

### 3.2 Test Task Creation (POST /api/tasks)

```bash
# Create a task with description
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'

# Expected response (201 Created):
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "title": "Buy groceries",
#   "description": "Milk, eggs, bread",
#   "completed": false,
#   "user_id": "123e4567-e89b-12d3-a456-426614174000",
#   "created_at": "2026-02-06T10:30:00Z",
#   "updated_at": "2026-02-06T10:30:00Z"
# }

# Create a task without description
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Call dentist"
  }'

# Expected response (201 Created):
# {
#   "id": "660e8400-e29b-41d4-a716-446655440001",
#   "title": "Call dentist",
#   "description": null,
#   "completed": false,
#   "user_id": "123e4567-e89b-12d3-a456-426614174000",
#   "created_at": "2026-02-06T10:31:00Z",
#   "updated_at": "2026-02-06T10:31:00Z"
# }
```

### 3.3 Test Task Listing (GET /api/tasks)

```bash
# List all tasks for authenticated user
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response (200 OK):
# [
#   {
#     "id": "550e8400-e29b-41d4-a716-446655440000",
#     "title": "Buy groceries",
#     "description": "Milk, eggs, bread",
#     "completed": false,
#     "user_id": "123e4567-e89b-12d3-a456-426614174000",
#     "created_at": "2026-02-06T10:30:00Z",
#     "updated_at": "2026-02-06T10:30:00Z"
#   },
#   {
#     "id": "660e8400-e29b-41d4-a716-446655440001",
#     "title": "Call dentist",
#     "description": null,
#     "completed": false,
#     "user_id": "123e4567-e89b-12d3-a456-426614174000",
#     "created_at": "2026-02-06T10:31:00Z",
#     "updated_at": "2026-02-06T10:31:00Z"
#   }
# ]
```

### 3.4 Test Get Single Task (GET /api/tasks/{task_id})

```bash
# Get a specific task by ID
export TASK_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X GET http://localhost:8080/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response (200 OK):
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "title": "Buy groceries",
#   "description": "Milk, eggs, bread",
#   "completed": false,
#   "user_id": "123e4567-e89b-12d3-a456-426614174000",
#   "created_at": "2026-02-06T10:30:00Z",
#   "updated_at": "2026-02-06T10:30:00Z"
# }
```

### 3.5 Test Task Update (PUT /api/tasks/{task_id})

```bash
# Update task title and description
curl -X PUT http://localhost:8080/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy organic groceries",
    "description": "Almond milk, free-range eggs, whole wheat bread"
  }'

# Expected response (200 OK):
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "title": "Buy organic groceries",
#   "description": "Almond milk, free-range eggs, whole wheat bread",
#   "completed": false,
#   "user_id": "123e4567-e89b-12d3-a456-426614174000",
#   "created_at": "2026-02-06T10:30:00Z",
#   "updated_at": "2026-02-06T11:45:00Z"
# }
```

### 3.6 Test Task Completion Toggle (PATCH /api/tasks/{task_id}/complete)

```bash
# Toggle task to completed
curl -X PATCH http://localhost:8080/api/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response (200 OK):
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "title": "Buy organic groceries",
#   "description": "Almond milk, free-range eggs, whole wheat bread",
#   "completed": true,
#   "user_id": "123e4567-e89b-12d3-a456-426614174000",
#   "created_at": "2026-02-06T10:30:00Z",
#   "updated_at": "2026-02-06T12:00:00Z"
# }

# Toggle back to incomplete
curl -X PATCH http://localhost:8080/api/tasks/$TASK_ID/complete \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response (200 OK):
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "title": "Buy organic groceries",
#   "description": "Almond milk, free-range eggs, whole wheat bread",
#   "completed": false,
#   "user_id": "123e4567-e89b-12d3-a456-426614174000",
#   "created_at": "2026-02-06T10:30:00Z",
#   "updated_at": "2026-02-06T12:01:00Z"
# }
```

### 3.7 Test Task Deletion (DELETE /api/tasks/{task_id})

```bash
# Delete a task
curl -X DELETE http://localhost:8080/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response (204 No Content):
# (empty response body)

# Verify task is deleted
curl -X GET http://localhost:8080/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response (404 Not Found):
# {"detail":"Task not found"}
```

---

## Part 4: Testing Error Scenarios

### 4.1 Test Authentication Errors

```bash
# Test without token (401 Unauthorized)
curl -X GET http://localhost:8080/api/tasks

# Expected response (401):
# {"detail":"Not authenticated"}

# Test with invalid token (401 Unauthorized)
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer invalid.token.here"

# Expected response (401):
# {"detail":"Invalid authentication credentials"}
```

### 4.2 Test Validation Errors

```bash
# Test empty title (400 Bad Request)
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": ""
  }'

# Expected response (400):
# {"detail":"Title cannot be empty"}

# Test missing title (422 Unprocessable Entity)
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "No title provided"
  }'

# Expected response (422):
# {"detail":[{"loc":["body","title"],"msg":"field required","type":"value_error.missing"}]}
```

### 4.3 Test Authorization Errors (Cross-User Access)

```bash
# Sign in as a different user
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "password": "SecurePass123!"
  }'

# Save the second user's token
export JWT_TOKEN_USER2="<access_token_from_response>"

# Try to access first user's task with second user's token
curl -X GET http://localhost:8080/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $JWT_TOKEN_USER2"

# Expected response (404 Not Found):
# {"detail":"Task not found"}
# Note: Returns 404 instead of 403 to prevent task ID enumeration
```

### 4.4 Test Not Found Errors

```bash
# Test with non-existent task ID
curl -X GET http://localhost:8080/api/tasks/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response (404 Not Found):
# {"detail":"Task not found"}
```

---

## Part 5: Verification Checklist

### Backend Verification

- [ ] Backend starts without errors on port 8080
- [ ] Health check endpoint responds: `curl http://localhost:8080/health`
- [ ] OpenAPI docs accessible: http://localhost:8080/docs
- [ ] Database connection successful (check logs)
- [ ] Tasks table exists with correct schema
- [ ] Foreign key constraint to users table works

### API Functionality

- [ ] Can create task with valid JWT token (201 Created)
- [ ] Can list all tasks for authenticated user (200 OK)
- [ ] Can get specific task by ID (200 OK)
- [ ] Can update task title and description (200 OK)
- [ ] Can toggle task completion status (200 OK)
- [ ] Can delete task permanently (204 No Content)

### Authentication & Authorization

- [ ] Requests without token return 401 Unauthorized
- [ ] Requests with invalid token return 401 Unauthorized
- [ ] User A cannot access User B's tasks (404 Not Found)
- [ ] User A cannot update User B's tasks (404 Not Found)
- [ ] User A cannot delete User B's tasks (404 Not Found)

### Data Isolation

- [ ] User A's tasks only appear in User A's list
- [ ] User B's tasks only appear in User B's list
- [ ] No cross-user data leakage in any endpoint
- [ ] Task ownership is immutable (user_id cannot be changed)

### Validation

- [ ] Empty title is rejected (400 Bad Request)
- [ ] Missing title is rejected (422 Unprocessable Entity)
- [ ] Title over 500 characters is rejected (422)
- [ ] Description over 2000 characters is rejected (422)
- [ ] Invalid UUID format is rejected (422)

### Data Persistence

- [ ] Created tasks persist across server restarts
- [ ] Updated tasks show new values after restart
- [ ] Deleted tasks remain deleted after restart
- [ ] Completion status persists correctly

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
**Solution**: Verify DATABASE_URL is correct and database is accessible
```bash
psql $DATABASE_URL -c "SELECT 1"
```

#### Migration fails

**Error**: `relation "users" does not exist`
**Solution**: Run authentication system migration first
```bash
psql $DATABASE_URL -f migrations/001_create_users_table.sql
```

**Error**: `relation "tasks" already exists`
**Solution**: Migration already run, skip or drop table first (development only)
```bash
psql $DATABASE_URL -c "DROP TABLE IF EXISTS tasks CASCADE;"
psql $DATABASE_URL -f migrations/002_create_tasks_table.sql
```

#### JWT token errors

**Error**: `Invalid authentication credentials`
**Solution**: Verify JWT_SECRET matches between backend and authentication system
```bash
# Check backend .env
echo $JWT_SECRET

# Token must be generated with same secret
```

**Error**: `Token has expired`
**Solution**: Sign in again to get a new token (tokens expire after 7 days)

#### Cross-user access not blocked

**Error**: User A can see User B's tasks
**Solution**: Verify all queries filter by user_id
```python
# Check service layer functions include:
statement = select(Task).where(Task.user_id == current_user.id)
```

### Debug Mode

#### Enable Backend Debug Logging

Edit `backend/.env`:
```bash
LOG_LEVEL=DEBUG
```

Restart backend to see detailed logs including:
- SQL queries
- JWT token verification
- Request/response details

#### Check Database State

```bash
# View all tasks in database
psql $DATABASE_URL -c "SELECT id, title, user_id, completed FROM tasks;"

# Count tasks per user
psql $DATABASE_URL -c "SELECT user_id, COUNT(*) FROM tasks GROUP BY user_id;"

# Verify foreign key constraint
psql $DATABASE_URL -c "SELECT * FROM pg_constraint WHERE conrelid = 'tasks'::regclass;"
```

---

## Part 7: Next Steps

### After Verification

1. **Run Automated Tests**: Execute test suite (when implemented)
   ```bash
   cd backend
   pytest tests/test_task_api.py -v
   pytest tests/test_task_service.py -v
   ```

2. **Generate Implementation Tasks**: Create detailed task list
   ```bash
   /sp.tasks
   ```

3. **Begin Implementation**: Follow generated tasks in priority order

### Production Deployment

Before deploying to production:

- [ ] Verify all environment variables are set correctly
- [ ] Use production DATABASE_URL (not development)
- [ ] Ensure JWT_SECRET is secure and different from development
- [ ] Enable HTTPS only
- [ ] Set up database backups
- [ ] Configure rate limiting on endpoints
- [ ] Set up monitoring and alerting
- [ ] Review security checklist in constitution.md
- [ ] Test with production-like data volumes

---

## Part 8: Quick Reference

### Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| DATABASE_URL | Yes | postgresql+asyncpg://user:pass@host/db |
| JWT_SECRET | Yes | <32-char-random-string> |
| FRONTEND_URL | Yes | http://localhost:3000 |
| ENVIRONMENT | Yes | development |
| LOG_LEVEL | Yes | INFO |

### API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/tasks | GET | Yes | List all user's tasks |
| /api/tasks | POST | Yes | Create new task |
| /api/tasks/{id} | GET | Yes | Get specific task |
| /api/tasks/{id} | PUT | Yes | Update task |
| /api/tasks/{id} | DELETE | Yes | Delete task |
| /api/tasks/{id}/complete | PATCH | Yes | Toggle completion |
| /health | GET | No | Health check |
| /docs | GET | No | API documentation |

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input (empty title) |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Task doesn't exist or not owned |
| 422 | Validation Error | Pydantic validation failure |
| 500 | Server Error | Database or server failure |

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review specification: `specs/todo-backend-api/spec.md`
- Review API contracts: `specs/todo-backend-api/contracts/tasks-api.yaml`
- Review data model: `specs/todo-backend-api/data-model.md`
- Review research: `specs/todo-backend-api/research.md`
