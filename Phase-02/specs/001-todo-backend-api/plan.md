# Implementation Plan: Todo Backend API & Data Layer

**Branch**: `todo-backend-api` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-backend-api/spec.md`

## Summary

This plan implements a secure RESTful backend API for todo task management with strict per-user data isolation. The backend provides CRUD operations for tasks, enforces JWT-based authentication on all endpoints, and ensures users can only access their own data through query-level filtering. All task data is persisted in Neon PostgreSQL using SQLModel ORM, with FastAPI handling the API layer.

**Core Value**: Enable authenticated users to create, read, update, delete, and toggle completion status of their personal todo tasks through a secure REST API.

**Technical Approach**: FastAPI application with modular routing, authentication middleware extracting user identity from JWT tokens, SQLModel for database operations, and Neon PostgreSQL for persistent storage. All queries are automatically scoped to the authenticated user to enforce data isolation.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.115+, SQLModel 0.0.22+, asyncpg 0.29+ (async PostgreSQL driver), PyJWT 2.9+
**Storage**: Neon Serverless PostgreSQL (async connection via asyncpg)
**Testing**: pytest with pytest-asyncio for async endpoint testing
**Target Platform**: Linux server (containerized deployment)
**Project Type**: Web application (backend API only)
**Performance Goals**: <500ms response time for task operations, support 100+ concurrent users
**Constraints**: Stateless API, JWT-only authentication, query-level user isolation, no in-memory storage
**Scale/Scope**: Multi-user system with strict data isolation, 6 REST endpoints, 2 database tables (users, tasks)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development First ✅
- **Status**: PASS
- **Evidence**: Complete specification exists at `specs/001-todo-backend-api/spec.md` with 20 functional requirements, 3 prioritized user stories, and 10 success criteria
- **Compliance**: This plan follows spec → plan → tasks → implementation workflow

### Principle II: Security-by-Design ✅
- **Status**: PASS
- **Evidence**:
  - FR-001: All endpoints require JWT authentication
  - FR-002: User identity extracted from JWT, not client input
  - FR-009: Cross-user access prevention enforced
  - FR-013: All queries filtered by authenticated user ID
  - SEC-001 to SEC-008: Comprehensive security requirements defined
- **Compliance**: Security is architected from the start with authentication middleware and query-level isolation

### Principle III: Zero Manual Coding ✅
- **Status**: PASS
- **Evidence**: All code will be generated through Claude Code following structured prompts from this plan
- **Compliance**: No manual coding permitted; all implementation via agentic workflow

### Principle IV: Clear Separation of Concerns ✅
- **Status**: PASS
- **Evidence**:
  - Backend API layer clearly separated from frontend (separate directories)
  - Authentication layer (1-auth) separate from business logic (this feature)
  - Data layer (SQLModel) separate from API layer (FastAPI routes)
- **Compliance**: Modular architecture with well-defined boundaries

### Principle V: Production-Oriented Architecture ✅
- **Status**: PASS
- **Evidence**:
  - Environment-based configuration (DATABASE_URL, JWT_SECRET)
  - Proper error handling (FR-014, FR-016, FR-020)
  - Async database operations for scalability
  - Reproducible database schema (FR-018)
- **Compliance**: Production-quality patterns from the start

### Principle VI: Deterministic and Reproducible Outputs ✅
- **Status**: PASS
- **Evidence**:
  - All specs, plans, and tasks documented
  - Database schema defined before implementation
  - API contracts specified in OpenAPI format
  - Quickstart guide for reproducible setup
- **Compliance**: Entire feature rebuildable from specs and prompts

### Technology Stack Compliance ✅
- **Backend**: FastAPI (REQUIRED) ✅
- **ORM**: SQLModel (REQUIRED) ✅
- **Database**: Neon Serverless PostgreSQL (REQUIRED) ✅
- **Authentication**: JWT tokens from Better Auth (REQUIRED) ✅
- **Spec Tooling**: Claude Code + Spec-Kit Plus (REQUIRED) ✅

**Overall Gate Status**: ✅ PASS - All constitutional principles satisfied. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-backend-api/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (Phase 0-1 output)
├── research.md          # Phase 0: Technology research and decisions
├── data-model.md        # Phase 1: Database schema and entity definitions
├── quickstart.md        # Phase 1: Setup and testing guide
├── contracts/           # Phase 1: API contracts
│   └── tasks-api.yaml   # OpenAPI 3.0 specification for task endpoints
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (complete)
└── tasks.md             # Phase 2: Implementation tasks (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User model (from 1-auth feature)
│   │   └── task.py          # Task model (NEW - this feature)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py  # Auth service (from 1-auth feature)
│   │   └── task_service.py  # Task business logic (NEW - this feature)
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py          # Auth endpoints (from 1-auth feature)
│   │   └── tasks.py         # Task endpoints (NEW - this feature)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Configuration (from 1-auth feature)
│   │   ├── database.py      # Database connection (from 1-auth feature)
│   │   ├── security.py      # JWT utilities (from 1-auth feature)
│   │   └── validators.py    # Input validation (from 1-auth feature)
│   └── main.py              # FastAPI app (from 1-auth feature, will register new router)
├── migrations/
│   ├── 001_create_users_table.sql  # From 1-auth feature
│   └── 002_create_tasks_table.sql  # NEW - this feature
├── tests/
│   ├── __init__.py
│   ├── test_task_api.py     # NEW - API endpoint tests
│   └── test_task_service.py # NEW - Business logic tests
├── requirements.txt         # Python dependencies (will add new deps if needed)
├── .env.example             # Environment template (from 1-auth feature)
└── README.md                # Backend documentation (will update)

frontend/
├── [Not modified by this feature - frontend integration is separate]
```

**Structure Decision**: Web application structure (Option 2 from template). Backend and frontend are clearly separated. This feature adds new files to the existing backend structure established by the 1-auth feature. The backend follows a layered architecture: models (data), services (business logic), api (routes), core (utilities).

## Complexity Tracking

> **No violations detected - this section is empty**

All constitutional principles are satisfied without requiring complexity justifications.

---

## Phase 0: Research & Technology Decisions

### Research Questions

1. **FastAPI Dependency Injection for User Context**
   - How to pass authenticated user from middleware to route handlers?
   - Best practices for dependency injection in FastAPI?

2. **SQLModel Async Queries with User Filtering**
   - How to structure queries that always filter by user_id?
   - Best practices for preventing accidental cross-user data leakage?

3. **JWT Token Verification Integration**
   - How to reuse existing JWT verification from 1-auth feature?
   - How to extract user_id from JWT payload?

4. **Error Response Standardization**
   - What HTTP status codes for each error scenario?
   - How to structure error responses consistently?

5. **Database Migration Strategy**
   - How to create reproducible migrations for tasks table?
   - How to handle foreign key relationships with users table?

### Research Outputs

See [research.md](./research.md) for detailed findings, decisions, and rationale.

**Key Decisions Summary**:
- Use FastAPI `Depends()` with `get_current_user` dependency for user context injection
- All task queries will use `.where(Task.user_id == current_user.id)` pattern
- Reuse existing `get_current_user` dependency from `backend/src/core/security.py`
- Standardize error responses with `HTTPException` and appropriate status codes
- Create SQL migration file `002_create_tasks_table.sql` with foreign key to users table

---

## Phase 1: Design Artifacts

### 1.1 Data Model

See [data-model.md](./data-model.md) for complete entity definitions, relationships, and validation rules.

**Entities Summary**:
- **Task**: id (UUID), title (str), description (optional str), completed (bool), user_id (UUID FK), created_at (datetime), updated_at (datetime)
- **User**: Existing entity from 1-auth feature (id, email, password_hash, created_at, last_signin_at)

**Relationships**:
- User → Tasks (one-to-many)
- Task → User (many-to-one, immutable after creation)

### 1.2 API Contracts

See [contracts/tasks-api.yaml](./contracts/tasks-api.yaml) for complete OpenAPI 3.0 specification.

**Endpoints Summary**:
- `GET /api/tasks` - List all tasks for authenticated user
- `POST /api/tasks` - Create new task for authenticated user
- `GET /api/tasks/{task_id}` - Get specific task (ownership verified)
- `PUT /api/tasks/{task_id}` - Update task (ownership verified)
- `DELETE /api/tasks/{task_id}` - Delete task (ownership verified)
- `PATCH /api/tasks/{task_id}/complete` - Toggle completion status (ownership verified)

**Authentication**: All endpoints require `Authorization: Bearer <jwt_token>` header

### 1.3 Quickstart Guide

See [quickstart.md](./quickstart.md) for step-by-step setup, testing, and validation instructions.

**Setup Steps**:
1. Ensure 1-auth feature is complete and database is initialized
2. Run tasks table migration
3. Start backend server
4. Test endpoints with curl or Postman

---

## Phase 2: Implementation Strategy

### 2.1 Implementation Order

**Prerequisites**: 1-auth feature must be complete (authentication system operational)

**Phase 2A: Database Schema** (Blocking)
1. Create `002_create_tasks_table.sql` migration
2. Run migration to create tasks table
3. Verify foreign key relationship with users table

**Phase 2B: Data Layer** (Depends on 2A)
1. Create `backend/src/models/task.py` with Task model and DTOs
2. Add validation for title (non-empty) and description (optional)

**Phase 2C: Business Logic** (Depends on 2B)
1. Create `backend/src/services/task_service.py` with CRUD functions
2. Implement user-scoped queries (all queries filter by user_id)
3. Implement ownership verification for single-task operations

**Phase 2D: API Layer** (Depends on 2C)
1. Create `backend/src/api/tasks.py` with route handlers
2. Use `get_current_user` dependency for authentication
3. Call task_service functions with current_user context
4. Handle errors and return appropriate HTTP status codes

**Phase 2E: Integration** (Depends on 2D)
1. Register tasks router in `backend/src/main.py`
2. Update backend README with new endpoints
3. Test all endpoints with authentication

### 2.2 Key Implementation Decisions

#### Decision 1: Ownership Enforcement Strategy
**Chosen**: Query-level filtering with explicit user_id checks
**Rationale**:
- All list queries automatically filter by `user_id == current_user.id`
- Single-task operations verify ownership before allowing access
- Prevents accidental data leakage through forgotten filters
**Alternatives Rejected**:
- Row-level security in PostgreSQL: Adds complexity, harder to debug
- Application-level ACL: Over-engineered for simple user isolation

#### Decision 2: PATCH vs PUT for Updates
**Chosen**:
- `PUT /api/tasks/{task_id}` for full task updates (title + description)
- `PATCH /api/tasks/{task_id}/complete` for completion toggle only
**Rationale**:
- PUT semantics: Replace entire resource (title and description)
- PATCH semantics: Partial update (only completion status)
- Separate endpoint for toggle provides clear intent and simpler client code
**Alternatives Rejected**:
- Single PATCH endpoint for all updates: Less clear intent, more complex validation

#### Decision 3: URL user_id vs JWT Validation Logic
**Chosen**: No user_id in URL paths; user identity comes from JWT only
**Rationale**:
- URLs are `/api/tasks` and `/api/tasks/{task_id}`, not `/api/users/{user_id}/tasks`
- User identity extracted from JWT token via `get_current_user` dependency
- Prevents client from attempting to access other users' data via URL manipulation
- Simpler API design with fewer path parameters
**Alternatives Rejected**:
- `/api/users/{user_id}/tasks`: Requires validating URL user_id matches JWT user_id, adds complexity

#### Decision 4: SQLModel Structure Choices
**Chosen**:
- Task model inherits from `SQLModel` with `table=True`
- Separate DTO classes for request/response (TaskCreate, TaskUpdate, TaskResponse)
- Use UUID for task IDs (consistent with User model)
**Rationale**:
- SQLModel provides type safety and automatic validation
- Separate DTOs prevent exposing internal fields (user_id, timestamps)
- UUIDs prevent ID enumeration attacks
**Alternatives Rejected**:
- Auto-increment integers for IDs: Predictable, enables enumeration attacks
- Single model for DB and API: Exposes internal fields, less secure

### 2.3 Testing Strategy

**Unit Tests** (backend/tests/test_task_service.py):
- Create task → persists correctly with user_id
- List tasks → returns only user-owned tasks
- Get task by ID → blocked if not owner
- Update task → owner only, validates title
- Delete task → owner only, permanent removal
- Toggle complete → state persists correctly

**Integration Tests** (backend/tests/test_task_api.py):
- No token → 401 Unauthorized
- Invalid token → 401 Unauthorized
- Valid token, create task → 201 Created
- Valid token, list tasks → 200 OK with user's tasks only
- Valid token, get other user's task → 403 Forbidden
- Valid token, update other user's task → 403 Forbidden
- Valid token, delete other user's task → 403 Forbidden
- Valid token, invalid task ID → 404 Not Found
- Valid token, empty title → 400 Bad Request

**Acceptance Tests** (manual via quickstart.md):
- User A creates task → appears in User A's list, not User B's list
- User A updates task → changes persist
- User A deletes task → removed permanently
- User A toggles completion → status changes
- User B cannot access User A's tasks (403)

### 2.4 Error Handling Matrix

| Scenario | HTTP Status | Error Message | Security Note |
|----------|-------------|---------------|---------------|
| No auth token | 401 | "Not authenticated" | Generic message |
| Invalid/expired token | 401 | "Invalid authentication credentials" | Don't reveal token details |
| Valid token, other user's task | 403 | "Forbidden" | Don't reveal task exists |
| Valid token, non-existent task | 404 | "Task not found" | Same as 403 to prevent enumeration |
| Empty title | 400 | "Title cannot be empty" | Validation error |
| Malformed request body | 422 | "Validation error: {details}" | Pydantic validation |
| Database connection failure | 500 | "Internal server error" | Log details, don't expose to client |

### 2.5 Validation Checklist

**Input Validation**:
- [ ] Task title is non-empty string (1-500 characters)
- [ ] Task description is optional string (0-2000 characters)
- [ ] Task completed is boolean
- [ ] Task ID is valid UUID format

**Authentication Validation**:
- [ ] Authorization header present
- [ ] JWT token valid and not expired
- [ ] User ID extracted from JWT payload
- [ ] User exists in database

**Authorization Validation**:
- [ ] For list operations: Query filtered by user_id
- [ ] For single-task operations: Task ownership verified before access
- [ ] Cross-user access attempts return 403

**Data Integrity Validation**:
- [ ] Task user_id matches authenticated user
- [ ] Task user_id is immutable after creation
- [ ] Foreign key constraint enforced (user_id references users.id)
- [ ] Timestamps automatically set (created_at, updated_at)

---

## Phase 3: Post-Implementation Validation

### 3.1 Constitution Re-Check

After implementation, verify:
- [ ] All code generated via Claude Code (no manual coding)
- [ ] All endpoints require JWT authentication
- [ ] All queries filter by authenticated user ID
- [ ] Database schema matches data-model.md
- [ ] API responses match contracts/tasks-api.yaml
- [ ] Quickstart guide instructions work end-to-end

### 3.2 Success Criteria Validation

From spec.md, verify:
- [ ] SC-001: Users can create task and see it within 2 seconds
- [ ] SC-002: Users can retrieve task list (100 tasks) within 1 second
- [ ] SC-003: 100% of operations enforce user isolation (cross-user tests fail with 403)
- [ ] SC-004: Correct HTTP status codes for all scenarios
- [ ] SC-005: Task data persists across server restarts
- [ ] SC-006: System handles 100 concurrent users without errors
- [ ] SC-007: Task ownership is immutable
- [ ] SC-008: All queries automatically filtered by user identity
- [ ] SC-009: 100% of unauthenticated requests rejected (401)
- [ ] SC-010: Database schema reproducible from migration file

### 3.3 Security Validation

- [ ] No user can access another user's tasks (403 on all attempts)
- [ ] No user_id accepted from client input (only from JWT)
- [ ] All endpoints require valid JWT token (401 without token)
- [ ] Error messages don't reveal sensitive information
- [ ] SQL injection prevented (parameterized queries via SQLModel)
- [ ] Task ownership immutable (user_id cannot be changed after creation)

---

## Appendix: File Manifest

**Files Created by This Plan**:
- `specs/001-todo-backend-api/plan.md` (this file)
- `specs/001-todo-backend-api/research.md` (Phase 0 output)
- `specs/001-todo-backend-api/data-model.md` (Phase 1 output)
- `specs/001-todo-backend-api/quickstart.md` (Phase 1 output)
- `specs/001-todo-backend-api/contracts/tasks-api.yaml` (Phase 1 output)

**Files Created by Implementation** (Phase 2, via /sp.tasks):
- `backend/src/models/task.py`
- `backend/src/services/task_service.py`
- `backend/src/api/tasks.py`
- `backend/migrations/002_create_tasks_table.sql`
- `backend/tests/test_task_api.py`
- `backend/tests/test_task_service.py`

**Files Modified by Implementation**:
- `backend/src/main.py` (register tasks router)
- `backend/README.md` (document new endpoints)

---

**Plan Status**: Phase 0-1 complete. Ready for Phase 2 task generation via `/sp.tasks`.
