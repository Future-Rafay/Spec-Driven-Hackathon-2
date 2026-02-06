<!--
Sync Impact Report:
- Version change: [initial] → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections: All core principles, Technology Standards, API & Security Standards, Development Workflow
- Removed sections: None
- Templates requiring updates:
  ✅ constitution.md (this file)
  ✅ plan-template.md (validated - Constitution Check section already present)
  ✅ spec-template.md (validated - priority-based user stories align with spec-driven principles)
  ✅ tasks-template.md (validated - user story organization aligns with workflow requirements)
- Follow-up TODOs: None - all templates validated and aligned
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Spec-Driven Development First

All development MUST follow the strict workflow: spec → plan → tasks → implementation. No implementation may begin without a complete specification. Every feature, API endpoint, and data model MUST be explicitly defined in written specs before any code generation occurs. This ensures deterministic, reproducible outputs and maintains traceability from requirements to implementation.

**Rationale**: Spec-driven development eliminates ambiguity, enables reproducibility, and ensures all stakeholders understand what will be built before resources are committed. It is the foundation for agentic development where AI agents generate code from structured specifications.

### II. Security-by-Design

Security is NON-NEGOTIABLE and MUST be architected from the start, not added later. All backend routes MUST enforce authentication. User data isolation MUST be enforced at the query level. JWT-based authentication MUST be stateless and deterministic. No cross-user data leakage is permitted under any circumstances.

**Rationale**: Security vulnerabilities in multi-user applications can lead to data breaches and loss of trust. By mandating security at the architectural level, we prevent entire classes of vulnerabilities rather than patching them reactively.

### III. Zero Manual Coding

All code MUST be generated through Claude Code and structured prompts. No manual coding is permitted. This constraint ensures consistency, reproducibility, and demonstrates the viability of fully agentic development workflows. Generated code MUST be readable, consistent, and framework-idiomatic.

**Rationale**: Manual coding introduces variability and makes the development process non-reproducible. By constraining all code generation to AI agents following specs, we create a deterministic, auditable, and repeatable development process.

### IV. Clear Separation of Concerns

Frontend, backend, authentication, and data layers MUST be clearly separated. Frontend and backend MUST communicate only via documented REST APIs. No business logic may leak across boundaries. Each layer MUST have well-defined responsibilities and interfaces.

**Rationale**: Separation of concerns enables independent testing, parallel development, and easier maintenance. It prevents tight coupling that makes systems brittle and difficult to evolve.

### V. Production-Oriented Architecture

Even basic features MUST be implemented with production-quality architecture. This includes proper error handling, environment-based configuration, secure secret management, and scalable data access patterns. No shortcuts or "temporary" implementations are permitted.

**Rationale**: Technical debt is expensive to fix later. By enforcing production standards from the start, we avoid the costly refactoring cycle and ensure the application is deployment-ready at every stage.

### VI. Deterministic and Reproducible Outputs

All prompts, plans, and implementations MUST produce deterministic, reproducible results. The entire project MUST be rebuildable end-to-end from specs and prompts alone. No undocumented manual steps or tribal knowledge are permitted.

**Rationale**: Reproducibility is essential for debugging, auditing, and knowledge transfer. If the development process cannot be reproduced, it cannot be validated, improved, or scaled.

## Technology Standards

### Mandatory Technology Stack

- **Frontend**: Next.js 16+ using App Router (REQUIRED)
- **Backend**: Python FastAPI (REQUIRED)
- **ORM**: SQLModel (REQUIRED)
- **Database**: Neon Serverless PostgreSQL (REQUIRED)
- **Authentication**: Better Auth with JWT (REQUIRED)
- **Spec Tooling**: Claude Code + Spec-Kit Plus only (REQUIRED)

No substitutions or alternatives are permitted without a constitutional amendment.

### Framework Constraints

- Next.js MUST use App Router (not Pages Router)
- FastAPI MUST follow RESTful design principles
- SQLModel MUST be used for all database operations (no raw SQL except for migrations)
- All database schemas MUST be explicitly defined in specs before implementation

## API & Security Standards

### API Design Requirements

- **RESTful design only**: No GraphQL, no RPC
- **Authentication**: All endpoints MUST require a valid JWT after authentication is enabled
- **Authorization header**: JWT MUST be passed via `Authorization: Bearer <token>` header
- **Backend verification**: Backend MUST verify JWT signature using shared secret
- **User identity extraction**: Backend MUST extract user identity from JWT, not from client trust
- **User-scoped operations**: All task operations MUST be filtered by authenticated user ID
- **Error responses**: Unauthorized requests MUST return HTTP 401; Forbidden cross-user access MUST return HTTP 403

### Security Requirements

- **Secret management**: Shared JWT secret MUST be provided via environment variable (BETTER_AUTH_SECRET)
- **No hardcoded secrets**: No secrets in frontend or backend code
- **Token expiry**: Token expiry MUST be enforced (e.g., 7 days)
- **Stateless authentication**: Backend MUST NOT rely on frontend sessions or cookies
- **Task ownership**: Task ownership MUST be enforced on every read/write/delete operation
- **Environment variables**: All secrets and configuration MUST use environment variables

### Data Integrity Requirements

- **Persistent storage**: Persistent storage REQUIRED (no in-memory storage)
- **User association**: Each task MUST be associated with a user identifier
- **Explicit schemas**: Database schema MUST be explicitly defined in specs
- **Reproducible migrations**: Migrations or schema initialization MUST be reproducible
- **Zero data leakage**: No cross-user data leakage under any circumstances

## Development Workflow

### Agentic Dev Stack Workflow (STRICT)

1. **Write spec**: Complete feature specification with all requirements, API contracts, and data models
2. **Generate plan**: Architectural plan with decisions, trade-offs, and implementation strategy
3. **Break into tasks**: Testable tasks with clear acceptance criteria
4. **Implement via Claude Code**: Code generation through structured prompts

**No step may be skipped. Each phase MUST be reviewable independently.**

### Specification Requirements

- All features MUST map directly to written specs
- Every API endpoint MUST be explicitly defined before implementation
- All data models MUST be specified with field types, constraints, and relationships
- Authentication and authorization rules MUST be explicitly stated
- Error handling and edge cases MUST be documented

### Quality Gates

- Each phase (spec, plan, tasks, implementation) MUST be reviewed before proceeding
- Generated code MUST pass all defined acceptance criteria
- No feature is complete until it meets all security, data integrity, and API standards
- Prompts, plans, and iterations are part of the evaluation and MUST be preserved

## Governance

This constitution supersedes all other development practices and guidelines. All development activities, code generation prompts, and architectural decisions MUST comply with these principles.

### Amendment Process

1. Proposed amendments MUST be documented with rationale and impact analysis
2. Version number MUST be incremented according to semantic versioning:
   - **MAJOR**: Backward incompatible governance/principle removals or redefinitions
   - **MINOR**: New principle/section added or materially expanded guidance
   - **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements
3. All dependent templates (plan, spec, tasks, commands) MUST be updated to reflect amendments
4. A Sync Impact Report MUST be generated and prepended to the constitution file

### Compliance Review

- All specs, plans, and tasks MUST reference relevant constitutional principles
- Code generation prompts MUST explicitly state which principles they uphold
- Any deviation from constitutional principles MUST be flagged and justified
- Complexity MUST be justified against the principle of production-oriented architecture

### Success Criteria

The project is considered successful when:
- All 5 basic todo features are implemented as a web application
- Multi-user support with strict data isolation is functional
- Fully functional authentication (signup/signin) is operational
- Secure REST API with JWT verification is implemented
- Responsive frontend UI is connected to backend APIs
- Neon PostgreSQL is used as the single source of truth
- No manual code was written outside Claude Code
- Project can be rebuilt end-to-end from specs and prompts alone

**Version**: 1.0.0 | **Ratified**: 2026-02-04 | **Last Amended**: 2026-02-04
