---
description: "Task list for Authentication & Identity Layer implementation"
---

# Tasks: Authentication & Identity Layer

**Input**: Design documents from `/specs/1-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-api.yaml

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend: Python FastAPI with SQLModel
- Frontend: Next.js 16+ App Router with Better Auth

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure (backend/src/models/, backend/src/services/, backend/src/api/, backend/src/core/, backend/src/middleware/)
- [x] T002 Create frontend directory structure (frontend/src/app/, frontend/src/components/, frontend/src/lib/, frontend/src/types/)
- [x] T003 [P] Initialize Python project with dependencies in backend/requirements.txt (fastapi, sqlmodel, pyjwt, passlib[bcrypt], python-jose, httpx, uvicorn, psycopg2-binary, python-dotenv)
- [x] T004 [P] Initialize Next.js project with dependencies in frontend/package.json (better-auth, next, react, typescript)
- [x] T005 [P] Create backend environment template in backend/.env.example (DATABASE_URL, JWT_SECRET, FRONTEND_URL, ENVIRONMENT, LOG_LEVEL)
- [x] T006 [P] Create frontend environment template in frontend/.env.local.example (BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL, NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_APP_URL)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create database configuration in backend/src/core/config.py (load environment variables, database URL, JWT secret, CORS settings)
- [x] T008 Create database connection manager in backend/src/core/database.py (SQLModel engine, session factory, get_session dependency)
- [x] T009 Create User model in backend/src/models/user.py (id UUID, email unique indexed, password_hash, created_at, last_signin_at)
- [x] T010 [P] Create password hashing utilities in backend/src/core/security.py (hash_password, verify_password using passlib bcrypt with 12 rounds)
- [x] T011 [P] Create JWT utilities in backend/src/core/security.py (create_access_token, verify_token using PyJWT with HS256)
- [x] T012 [P] Create error response schemas in backend/src/models/errors.py (ErrorResponse, ValidationError with error_code enum)
- [x] T013 [P] Create email validation utility in backend/src/core/validators.py (validate_user_email with email-validator library)
- [x] T014 [P] Create password validation utility in backend/src/core/validators.py (validate_password with complexity rules: 8+ chars, uppercase, lowercase, digit, special char)
- [x] T015 Create database migration script in backend/migrations/001_create_users_table.sql (CREATE TABLE users with UUID extension, indexes)
- [x] T016 Create FastAPI application entry point in backend/src/main.py (app initialization, CORS middleware, health check endpoint)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts with email and password, with validation and duplicate prevention

**Independent Test**: Submit registration form with valid credentials and verify user account is created in database. Test duplicate email rejection (409), weak password rejection (400), invalid email rejection (400).

### Implementation for User Story 1

- [x] T017 [P] [US1] Create UserCreate DTO in backend/src/models/user.py (email EmailStr, password str with min 8 max 128)
- [x] T018 [P] [US1] Create UserResponse DTO in backend/src/models/user.py (id UUID, email str, created_at datetime, last_signin_at optional datetime)
- [x] T019 [US1] Create check_email_exists function in backend/src/services/auth_service.py (query database for existing email, return bool)
- [x] T020 [US1] Create signup service function in backend/src/services/auth_service.py (validate email, validate password, check duplicate, hash password, create user, return UserResponse)
- [x] T021 [US1] Implement POST /api/auth/signup endpoint in backend/src/api/auth.py (call signup service, handle 201/400/409/422 responses)
- [x] T022 [P] [US1] Create signup page in frontend/src/app/(auth)/signup/page.tsx (form with email and password fields)
- [x] T023 [P] [US1] Create SignupForm component in frontend/src/components/auth/SignupForm.tsx (form validation, error display, submit handler)
- [x] T024 [US1] Integrate signup form with backend API in frontend/src/components/auth/SignupForm.tsx (fetch POST to /api/auth/signup, handle success/error responses)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register with email/password, validation works, duplicates are rejected

---

## Phase 4: User Story 2 - User Sign In (Priority: P2)

**Goal**: Enable registered users to authenticate with email and password and receive JWT token for subsequent requests

**Independent Test**: Submit sign-in form with valid credentials and verify JWT token is returned. Test incorrect password rejection (401), non-existent email rejection (401). Verify last_signin_at timestamp is updated.

### Implementation for User Story 2

- [x] T025 [P] [US2] Create UserSignIn DTO in backend/src/models/user.py (email EmailStr, password str)
- [x] T026 [P] [US2] Create AuthToken DTO in backend/src/models/user.py (access_token str, token_type str default "bearer", expires_in int, user UserResponse)
- [x] T027 [US2] Create signin service function in backend/src/services/auth_service.py (find user by email, verify password with timing-attack resistance, update last_signin_at, generate JWT with 7-day expiry, return AuthToken)
- [x] T028 [US2] Implement POST /api/auth/signin endpoint in backend/src/api/auth.py (call signin service, handle 200/401/422 responses with generic error message)
- [x] T029 [P] [US2] Configure Better Auth in frontend/src/lib/auth.ts (database connection, JWT plugin with custom payload: id and email, 7-day expiry, session config with cookie cache)
- [x] T030 [P] [US2] Create Better Auth API route handler in frontend/src/app/api/auth/[...all]/route.ts (export GET and POST handlers from Better Auth)
- [x] T031 [P] [US2] Create auth client in frontend/src/lib/auth-client.ts (createAuthClient with jwtClient plugin)
- [x] T032 [P] [US2] Create signin page in frontend/src/app/(auth)/signin/page.tsx (form with email and password fields)
- [x] T033 [P] [US2] Create SigninForm component in frontend/src/components/auth/SigninForm.tsx (form validation, error display, submit handler)
- [x] T034 [US2] Integrate signin form with Better Auth in frontend/src/components/auth/SigninForm.tsx (call authClient.signIn, handle success redirect, handle error display)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can register and sign in, JWT tokens are issued

---

## Phase 5: User Story 3 - Protected Data Access with User Isolation (Priority: P3)

**Goal**: Enforce JWT verification on all protected endpoints and ensure users can only access their own data

**Independent Test**: Call protected endpoint without token (expect 401), with invalid token (expect 401), with valid token (expect 200 with user data). Verify user ID is extracted from JWT and not from client input.

### Implementation for User Story 3

- [x] T035 [P] [US3] Create HTTPBearer security scheme in backend/src/core/security.py (FastAPI HTTPBearer for Authorization header)
- [x] T036 [US3] Create verify_jwt dependency in backend/src/core/security.py (extract token from Authorization header, verify signature with JWT_SECRET, decode payload, return user_id and email, raise 401 on invalid/expired token)
- [x] T037 [US3] Create get_current_user dependency in backend/src/core/security.py (call verify_jwt, query database for user by id from JWT, raise 401 if user not found, return User model)
- [x] T038 [US3] Implement GET /api/auth/me endpoint in backend/src/api/auth.py (use get_current_user dependency, return UserResponse, handle 200/401 responses)
- [x] T039 [P] [US3] Create API client wrapper in frontend/src/lib/api-client.ts (BackendAPIClient class with getAuthHeaders method that calls authClient.token(), get/post/put/delete methods with JWT injection, 401 retry logic)
- [x] T040 [P] [US3] Create auth TypeScript types in frontend/src/types/auth.ts (User, AuthToken, SignupRequest, SigninRequest interfaces)
- [x] T041 [US3] Add CORS middleware configuration in backend/src/main.py (allow FRONTEND_URL origin, allow credentials, allow Authorization header)
- [x] T042 [US3] Test protected endpoint integration in frontend (create test page that calls /api/auth/me using api-client, display user info or redirect to signin)

**Checkpoint**: All user stories should now be independently functional - complete authentication flow with JWT verification and user isolation enforced

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T043 [P] Add logging for authentication events in backend/src/services/auth_service.py (signup success/failure, signin success/failure, JWT verification failures)
- [x] T044 [P] Add request/response logging middleware in backend/src/main.py (log all API requests with method, path, status code, duration)
- [x] T045 [P] Create root layout with auth provider in frontend/src/app/layout.tsx (wrap children with Better Auth SessionProvider)
- [x] T046 [P] Create protected route wrapper in frontend/src/components/auth/ProtectedRoute.tsx (check session, redirect to signin if not authenticated)
- [x] T047 [P] Add error boundary in frontend/src/app/error.tsx (catch and display authentication errors gracefully)
- [ ] T048 Validate quickstart.md instructions (run through setup steps, verify all commands work, test authentication flow end-to-end) - **MANUAL TESTING REQUIRED**
- [x] T049 [P] Update backend README with API documentation links and environment setup
- [x] T050 [P] Update frontend README with Better Auth configuration and development instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T006) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion (T007-T016)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete (T017-T042)

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (but typically done after for logical flow)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2 (but requires JWT from US2 for testing)

### Within Each User Story

- DTOs can be created in parallel (marked [P])
- Services depend on DTOs being complete
- Endpoints depend on services being complete
- Frontend components can be created in parallel with backend (marked [P])
- Integration depends on both backend and frontend being complete

### Parallel Opportunities

- **Setup phase**: T003, T004, T005, T006 can run in parallel (different files)
- **Foundational phase**: T010, T011, T012, T013, T014 can run in parallel (different files)
- **User Story 1**: T017, T018 (DTOs) can run in parallel; T022, T023 (frontend) can run in parallel with backend
- **User Story 2**: T025, T026 (DTOs) can run in parallel; T029, T030, T031, T032, T033 (frontend setup) can run in parallel
- **User Story 3**: T035, T039, T040 can run in parallel (different concerns)
- **Polish phase**: T043, T044, T045, T046, T047, T049, T050 can run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Launch DTOs in parallel:
Task T017: "Create UserCreate DTO in backend/src/models/user.py"
Task T018: "Create UserResponse DTO in backend/src/models/user.py"

# Launch frontend components in parallel with backend service:
Task T020: "Create signup service function in backend/src/services/auth_service.py"
Task T022: "Create signup page in frontend/src/app/(auth)/signup/page.tsx"
Task T023: "Create SignupForm component in frontend/src/components/auth/SignupForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T016) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T017-T024)
4. **STOP and VALIDATE**: Test user registration independently
   - Register new user with valid credentials
   - Test duplicate email rejection
   - Test weak password rejection
   - Test invalid email rejection
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T016)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) (T017-T024)
3. Add User Story 2 → Test independently → Deploy/Demo (T025-T034)
4. Add User Story 3 → Test independently → Deploy/Demo (T035-T042)
5. Add Polish → Final release (T043-T050)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T016)
2. Once Foundational is done:
   - Developer A: User Story 1 (T017-T024)
   - Developer B: User Story 2 (T025-T034)
   - Developer C: User Story 3 (T035-T042)
3. Stories complete and integrate independently
4. Team completes Polish together (T043-T050)

---

## Task Summary

**Total Tasks**: 50
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 10 tasks
- Phase 3 (User Story 1 - Registration): 8 tasks
- Phase 4 (User Story 2 - Sign-in): 10 tasks
- Phase 5 (User Story 3 - Data Isolation): 8 tasks
- Phase 6 (Polish): 8 tasks

**Parallel Opportunities**: 23 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- US1: User registration with validation and duplicate prevention
- US2: User sign-in with JWT token issuance
- US3: Protected endpoint access with JWT verification

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 24 tasks

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are explicit and follow the web application structure from plan.md
- Tests are NOT included as they were not explicitly requested in the specification
