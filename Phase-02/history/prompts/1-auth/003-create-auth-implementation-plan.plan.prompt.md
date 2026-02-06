---
id: 003
title: Create Auth Implementation Plan
stage: plan
date: 2026-02-04
surface: agent
model: claude-sonnet-4-5-20250929
feature: 1-auth
branch: 1-auth
user: user
command: /sp.plan
labels: ["planning", "architecture", "jwt", "better-auth", "fastapi", "design-artifacts"]
links:
  spec: specs/1-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-auth/plan.md
  - specs/1-auth/research.md
  - specs/1-auth/data-model.md
  - specs/1-auth/contracts/auth-api.yaml
  - specs/1-auth/quickstart.md
tests:
  - none
---

## Prompt

/sp.plan

Create:
- Authentication architecture sketch (frontend ↔ backend JWT flow)
- Step-by-step auth lifecycle (signup → login → API request → verification)
- Clear boundary definitions between frontend auth and backend verification
- Validation checklist mapped to success criteria

Architecture & flow:
- Frontend (Next.js + Better Auth):
  - Configure Better Auth with JWT plugin enabled
  - Define token payload expectations (user ID, email)
  - Attach JWT to all API requests via Authorization header

- Backend (FastAPI):
  - Implement JWT verification middleware
  - Validate token signature using shared secret
  - Decode token and extract user identity
  - Inject authenticated user into request context
  - Reject unauthenticated or invalid requests early

Decisions needing documentation:
- JWT over session-based auth (statelessness vs simplicity)
- Shared secret via environment variable vs key service
- Token verification at middleware vs per-route dependency
- Trust boundary: JWT claims vs request parameters
- Token expiry duration tradeoffs (security vs UX)

Testing & validation strategy:
- Signup and signin flow validation
- JWT issuance validation (presence, structure, expiry)
- API request without token → expect 401
- API request with invalid token → expect 401
- API request with valid token → authenticated user resolved
- Mismatched user ID in URL vs JWT → request rejected
- Confirm no cross-user data access is possible

Quality checks:
- All auth rules trace back to constitution principles
- No hardcoded secrets in code
- All auth logic defined before implementation
- Spec is sufficient to generate code without clarification

Execution approach:
- Spec-first, no implementation assumptions
- Auth logic defined before API or database specs
- Designed to be reusable across future specs

## Response snapshot

Created comprehensive implementation plan for Authentication & Identity Layer with complete Phase 0 research and Phase 1 design artifacts.

**Plan Structure (plan.md)**:
- Summary: Stateless JWT authentication with user isolation
- Technical Context: Python 3.11+, FastAPI, SQLModel, Next.js 16+, Better Auth, Neon PostgreSQL
- Constitution Check: ✅ ALL GATES PASSED (6 principles, all technology standards, all API/security standards)
- Project Structure: Web application (backend/ and frontend/ directories)
- Complexity Tracking: No violations

**Phase 0: Research (research.md)**:
Completed by parallel research agents covering:
1. Better Auth JWT Configuration
   - Decision: Use JWT plugin with custom payload (user ID, email)
   - Token storage: Hybrid approach (HTTP-only cookies for sessions, in-memory JWT for API calls)
   - Token refresh: Automatic via cookie cache with 401 retry fallback
2. Password Security
   - Decision: bcrypt with 12 rounds work factor
   - Validation: 8+ chars, uppercase, lowercase, digit, special char
   - Timing-attack resistant verification
3. FastAPI JWT Verification
   - Decision: Dependency injection pattern (recommended over middleware)
   - PyJWT with JWKS or shared secret
   - User injection via request context

**Phase 1: Design Artifacts**:

1. **Data Model (data-model.md)**:
   - User entity: id (UUID), email (unique, indexed), password_hash, created_at, last_signin_at
   - Validation rules: Email format, password complexity, duplicate prevention
   - Password hashing: bcrypt with 12 rounds
   - DTOs: UserCreate, UserSignIn, UserResponse, AuthToken
   - State transitions: No Account → Registered → Authenticated
   - Database migration scripts (SQL and Alembic)

2. **API Contracts (contracts/auth-api.yaml)**:
   - OpenAPI 3.1.0 specification
   - 3 endpoints defined:
     - POST /api/auth/signup (201, 400, 409, 422)
     - POST /api/auth/signin (200, 401, 422)
     - GET /api/auth/me (200, 401) - protected
   - Complete request/response schemas
   - Error response schemas with error codes
   - Security scheme: Bearer JWT
   - Example requests and responses

3. **Quickstart Guide (quickstart.md)**:
   - Environment setup (backend and frontend)
   - Database initialization (Neon PostgreSQL)
   - Running the application (FastAPI + Next.js)
   - Testing authentication flow (curl examples)
   - Verification checklist (backend, frontend, security, database)
   - Troubleshooting common issues
   - Quick reference (env vars, endpoints, ports)

**Key Architectural Decisions**:
1. JWT over session-based auth: Statelessness enables horizontal scaling
2. Shared secret via environment variable: Simpler for development, JWKS for production
3. Dependency injection over middleware: Better testability and granular control
4. Trust boundary: JWT claims only (never client input)
5. Token expiry: 7 days (balances security and UX per spec)

**Security Architecture**:
- HTTP-only cookies for Better Auth sessions (XSS protection)
- In-memory JWT for API calls (no localStorage/sessionStorage)
- Authorization: Bearer header for FastAPI requests
- Bcrypt password hashing (12 rounds)
- Timing-attack resistant password verification
- Generic error messages (don't reveal if email exists)
- User ID extraction from verified JWT only

**Project Structure**:
```
backend/
├── src/
│   ├── models/user.py
│   ├── services/auth_service.py
│   ├── middleware/jwt_middleware.py
│   ├── api/auth.py
│   └── core/config.py, security.py
└── tests/contract/, integration/, unit/

frontend/
├── src/
│   ├── app/(auth)/signup/, signin/
│   ├── components/auth/
│   ├── lib/auth.ts, api-client.ts
│   └── types/auth.ts
└── tests/auth/
```

**Constitution Compliance**:
- ✅ Spec-Driven Development First: Complete spec before planning
- ✅ Security-by-Design: JWT auth, user isolation, query-level enforcement
- ✅ Zero Manual Coding: All code will be generated from this plan
- ✅ Clear Separation of Concerns: Frontend/backend/auth/data layers defined
- ✅ Production-Oriented Architecture: Environment config, error handling, scalability
- ✅ Deterministic Outputs: All decisions documented, reproducible from plan

## Outcome

- ✅ Impact: Complete implementation plan ready for task generation and code implementation
- 🧪 Tests: Test strategy defined in quickstart.md (signup, signin, JWT verification, user isolation)
- 📁 Files: Created plan.md, research.md, data-model.md, auth-api.yaml, quickstart.md
- 🔁 Next prompts: /sp.tasks to generate testable implementation tasks organized by user story
- 🧠 Reflection: Planning phase successfully completed all required artifacts. Research resolved all technical unknowns. Design artifacts provide sufficient detail for deterministic code generation. All constitutional principles satisfied.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully with all artifacts
- Graders run and results (PASS/FAIL): Constitution Check PASSED (all 6 principles + all standards)
- Prompt variant (if applicable): N/A (initial planning)
- Next experiment (smallest change to try): Execute /sp.tasks to test task generation from complete plan
