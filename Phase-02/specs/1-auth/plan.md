# Implementation Plan: Authentication & Identity Layer

**Branch**: `1-auth` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-auth/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement secure, stateless user authentication across Next.js frontend and FastAPI backend using JWT-based identity verification with Better Auth. The system enables user registration, sign-in, and enforces strict user data isolation at the query level. All backend routes require JWT verification, and user identity is extracted from verified tokens only, never from client input. The architecture ensures zero cross-user data leakage through automatic user association and ownership verification on all operations.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/JavaScript with Next.js 16+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Neon PostgreSQL driver, PyJWT, passlib[bcrypt] (backend); Next.js 16+, Better Auth, React 18+ (frontend)
**Storage**: Neon Serverless PostgreSQL (persistent user accounts and authentication data)
**Testing**: pytest with pytest-asyncio (backend), Jest or Vitest (frontend - to be determined in research)
**Target Platform**: Web application (Linux/container for backend API, modern browsers for frontend)
**Project Type**: Web application (separate frontend and backend)
**Performance Goals**: <50ms JWT verification per request, <2min registration flow, <30sec sign-in flow, support 1000 concurrent authenticated users
**Constraints**: Stateless authentication only (no server-side sessions), JWT expiry 7 days, shared secret via environment variable, HTTP 401 for auth failures, HTTP 403 for authorization failures
**Scale/Scope**: Multi-user todo application with foundational authentication layer supporting unlimited users with strict data isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development First
- ✅ **PASS**: Complete specification exists at `specs/1-auth/spec.md` with 3 user stories, 20 functional requirements, 6 security requirements, and 10 success criteria
- ✅ **PASS**: All API endpoints will be explicitly defined in contracts/ before implementation
- ✅ **PASS**: Data models will be specified in data-model.md before code generation
- ✅ **PASS**: This plan follows spec → plan → tasks → implementation workflow

### Principle II: Security-by-Design
- ✅ **PASS**: JWT-based authentication architected from the start (FR-006, FR-009)
- ✅ **PASS**: User data isolation enforced at query level (FR-015, FR-016)
- ✅ **PASS**: Stateless, deterministic JWT verification (FR-019)
- ✅ **PASS**: Zero cross-user data leakage guaranteed (SC-005, SR-003)
- ✅ **PASS**: All backend routes will require authentication after implementation
- ✅ **PASS**: Password hashing with bcrypt (FR-017, SR-001)
- ✅ **PASS**: Shared secret via environment variable only (FR-018, SR-002)

### Principle III: Zero Manual Coding
- ✅ **PASS**: All code will be generated via Claude Code following this plan
- ✅ **PASS**: Plan provides sufficient detail for deterministic code generation
- ✅ **PASS**: No manual coding steps in workflow

### Principle IV: Clear Separation of Concerns
- ✅ **PASS**: Frontend (Next.js + Better Auth) handles UI and token storage
- ✅ **PASS**: Backend (FastAPI) handles verification and business logic
- ✅ **PASS**: Communication only via REST APIs with JWT in Authorization header
- ✅ **PASS**: No business logic in frontend, no UI concerns in backend
- ✅ **PASS**: Authentication layer clearly separated from data layer

### Principle V: Production-Oriented Architecture
- ✅ **PASS**: Environment-based configuration for secrets (BETTER_AUTH_SECRET)
- ✅ **PASS**: Proper error handling with HTTP 401/403 status codes
- ✅ **PASS**: Scalable JWT verification via middleware (no per-route duplication)
- ✅ **PASS**: Industry-standard bcrypt for password hashing
- ✅ **PASS**: Token expiry enforcement (7 days)
- ✅ **PASS**: No shortcuts or temporary implementations

### Principle VI: Deterministic and Reproducible Outputs
- ✅ **PASS**: All decisions documented in this plan
- ✅ **PASS**: Research phase will resolve all technical unknowns
- ✅ **PASS**: Contracts will specify exact API behavior
- ✅ **PASS**: Data models will specify exact schema
- ✅ **PASS**: Implementation can be reproduced from plan alone

### Technology Standards Compliance
- ✅ **PASS**: Frontend uses Next.js 16+ with App Router (constitutional requirement)
- ✅ **PASS**: Backend uses Python FastAPI (constitutional requirement)
- ✅ **PASS**: ORM uses SQLModel (constitutional requirement)
- ✅ **PASS**: Database uses Neon Serverless PostgreSQL (constitutional requirement)
- ✅ **PASS**: Authentication uses Better Auth with JWT (constitutional requirement)

### API & Security Standards Compliance
- ✅ **PASS**: RESTful design only (no GraphQL, no RPC)
- ✅ **PASS**: JWT passed via `Authorization: Bearer <token>` header
- ✅ **PASS**: Backend verifies JWT signature using shared secret
- ✅ **PASS**: User identity extracted from JWT, not client input
- ✅ **PASS**: HTTP 401 for unauthorized, HTTP 403 for forbidden
- ✅ **PASS**: No hardcoded secrets
- ✅ **PASS**: Token expiry enforced (7 days)
- ✅ **PASS**: Stateless authentication (no sessions/cookies)

**Constitution Check Result**: ✅ **ALL GATES PASSED** - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/1-auth/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth-api.yaml    # OpenAPI spec for authentication endpoints
│   └── README.md        # Contract documentation
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── user.py              # User entity with SQLModel
│   ├── services/
│   │   └── auth_service.py      # Authentication business logic
│   ├── middleware/
│   │   └── jwt_middleware.py    # JWT verification middleware
│   ├── api/
│   │   └── auth.py              # Authentication endpoints
│   ├── core/
│   │   ├── config.py            # Environment configuration
│   │   └── security.py          # Password hashing, JWT utilities
│   └── main.py                  # FastAPI application entry
├── tests/
│   ├── contract/
│   │   └── test_auth_contract.py
│   ├── integration/
│   │   └── test_auth_flow.py
│   └── unit/
│       ├── test_auth_service.py
│       └── test_jwt_middleware.py
├── .env.example                 # Environment variable template
└── requirements.txt             # Python dependencies

frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signup/
│   │   │   │   └── page.tsx     # Registration page
│   │   │   └── signin/
│   │   │       └── page.tsx     # Sign-in page
│   │   └── layout.tsx           # Root layout with auth provider
│   ├── components/
│   │   └── auth/
│   │       ├── SignupForm.tsx   # Registration form component
│   │       └── SigninForm.tsx   # Sign-in form component
│   ├── lib/
│   │   ├── auth.ts              # Better Auth configuration
│   │   └── api-client.ts        # API client with JWT injection
│   └── types/
│       └── auth.ts              # TypeScript types for auth
├── tests/
│   └── auth/
│       ├── signup.test.tsx
│       └── signin.test.tsx
├── .env.local.example           # Environment variable template
└── package.json                 # Node dependencies
```

**Structure Decision**: Web application structure (Option 2) selected because the feature requires both Next.js frontend for user interface and FastAPI backend for secure authentication logic. Frontend handles Better Auth integration and token storage, while backend handles JWT verification and user data management. Clear separation enables independent development and testing of each layer while maintaining strict API contracts.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitutional principles and standards are satisfied by this architecture.

---

## Phase 0: Research & Technical Decisions

### Research Tasks

The following technical decisions require research to resolve implementation details:

1. **Better Auth JWT Configuration**
   - Research: How to configure Better Auth to issue JWTs with custom payload (user ID, email)
   - Research: Better Auth token storage strategy in Next.js App Router
   - Research: How to attach JWT to API requests from Next.js client

2. **FastAPI JWT Verification**
   - Research: Best practices for JWT verification middleware in FastAPI
   - Research: PyJWT library usage for signature verification with HS256
   - Research: How to inject authenticated user into request context

3. **Password Security**
   - Research: passlib[bcrypt] configuration for secure password hashing
   - Research: Recommended bcrypt work factor for 2026 security standards

4. **Database Schema**
   - Research: SQLModel best practices for user table with unique email constraint
   - Research: Neon PostgreSQL connection pooling for FastAPI

5. **Testing Strategy**
   - Research: Frontend testing framework choice (Jest vs Vitest for Next.js 16+)
   - Research: pytest patterns for testing JWT-protected endpoints

### Research Output Location

All research findings will be documented in `specs/1-auth/research.md` with the following structure:
- Decision made
- Rationale
- Alternatives considered
- Implementation guidance

---

## Phase 1: Design Artifacts

### Data Model (`data-model.md`)

Will define:
- **User Entity**: id (UUID), email (unique, indexed), password_hash, created_at, last_signin_at
- **Validation Rules**: Email format, password requirements (min 8 chars, complexity)
- **Relationships**: User → Tasks (one-to-many, to be defined in future task management spec)

### API Contracts (`contracts/auth-api.yaml`)

Will define OpenAPI specification for:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication
- `GET /api/auth/me` - Get current user (protected, for testing)

Each endpoint will specify:
- Request body schema
- Response schema (success and error cases)
- HTTP status codes (200, 201, 400, 401, 409)
- Authentication requirements

### Quickstart Guide (`quickstart.md`)

Will provide:
- Environment setup instructions (BETTER_AUTH_SECRET configuration)
- Database initialization steps
- How to run frontend and backend
- How to test authentication flow manually
- Example curl commands for API testing

---

## Phase 2: Implementation Readiness

After Phase 0 and Phase 1 complete, this plan will be ready for `/sp.tasks` command to generate:
- Testable tasks organized by user story (P1: Registration, P2: Sign-in, P3: Data Isolation)
- Clear dependencies and parallel execution opportunities
- Acceptance criteria mapped to spec requirements

**Next Command**: Continue with Phase 0 research execution below.
