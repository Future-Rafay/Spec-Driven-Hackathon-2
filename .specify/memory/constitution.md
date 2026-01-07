# AI-Native Todo Application (Console → Cloud-Native) Constitution
<!--
Sync Impact Report

- Version change: (template placeholders) → 1.0.0
- Modified principles: Filled all placeholder principle fields with project-specific principles
- Added sections:
  - Scope & Phase Constraints
  - Engineering Standards & Constraints
  - Development Workflow & Quality Gates
- Removed sections: none
- Template fixes applied:
  - Corrected placeholder typo: `PRINCIPLE__DESCRIPTION` → Principle 6 description content
- Templates requiring updates:
  - .specify/templates/spec-template.md ✅ (no changes required)
  - .specify/templates/plan-template.md ✅ (no changes required)
  - .specify/templates/tasks-template.md ✅ (no changes required)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): original adoption date is unknown
-->

## Core Principles

### Correctness First (Deterministic in Phase I)
Phase I behavior MUST be deterministic and testable. The in-memory domain logic is the source of
truth for later phases, and all future interfaces MUST preserve the same business rules.

### Progressive Enhancement (Phase-by-Phase Delivery)
Each phase MUST build cleanly on the previous phase without breaking the conceptual model.
Earlier phases MUST remain independently runnable, and later phases MUST mirror the earlier
domain logic rather than reinvent it.

### Simplicity Before Abstraction
Prefer the smallest viable design and the smallest viable diff. Do not introduce abstractions,
patterns, or infrastructure that are not required for the current phase.

### Explicit Over Implicit Design Decisions
Important behavior MUST be explicit: command syntax, error handling, state transitions, and
constraints. Avoid hidden state, surprising side effects, and “magic” behaviors.

### Clear Separation of Concerns
Separate core domain logic (rules), state/storage (in-memory data structures for Phase I), and
interfaces (stdin/stdout CLI for Phase I). This separation MUST remain clear as the project
migrates to web/AI/cloud phases.

### AI-Assisted Development, Human-Verified Output
AI may be used to generate code and ideas, but humans MUST verify correctness and ensure rules
are not bypassed. In Phase III, the AI layer MUST act as an interface only; it MUST NOT become a
source of truth and MUST have deterministic fallback behavior.

## Scope & Phase Constraints

**Project scope**: AI-Native Todo Application evolving from console to cloud-native.

- **Phase I — In-Memory Python Console Todo App**
  - Language: Python (standard library only)
  - Storage: in-memory only (lists/dicts); **no files, no databases**
  - Interface: console only (stdin/stdout)
  - Persistence: none
  - External services: not allowed

- **Phase II — Full-Stack Web Application**
  - Frontend: Next.js
  - Backend: FastAPI
  - ORM: SQLModel
  - Database: Neon (PostgreSQL)
  - API MUST strictly mirror Phase I domain logic
  - Authentication is optional, but architecture is mandatory

- **Phase III — AI-Powered Todo Chatbot**
  - AI layer MUST not bypass core business rules
  - Chatbot is an interface, not the source of truth
  - Uses: OpenAI ChatKit, Agents SDK, Official MCP SDK
  - Deterministic fallback required when AI fails

- **Phase IV — Local Kubernetes Deployment**
  - All services containerized with Docker
  - Local cluster via Minikube
  - Helm charts MUST be minimal and readable
  - kubectl-ai and kagent are for ops only (not business logic)

- **Phase V — Advanced Cloud Deployment**
  - Event-driven components via Kafka
  - Service orchestration with Dapr
  - Deployment target: DigitalOcean DOKS
  - Observability and scalability prioritized over feature expansion

## Engineering Standards & Constraints

- Phase I MUST work fully without internet or disk.
- Todo CRUD operations MUST be deterministic and testable.
- Command syntax and error handling MUST be predictable.
- No hidden state or side effects.
- Code MUST be readable by an intermediate Python developer.

## Development Workflow & Quality Gates

- Changes MUST be small and testable.
- Each feature MUST have a clear reason to exist.
- Avoid premature optimization and over-engineering, especially in early phases.
- Console commands MUST be documented with examples.
- Future-phase hooks MUST be clearly marked.

## Governance

This constitution is the top-level authority for project engineering decisions.

- **Amendments**: Changes MUST be proposed explicitly (e.g., via a PR) and include rationale and
  trade-offs. If an amendment changes project constraints or phase standards, it MUST also
  identify any required updates to dependent templates and documents.
- **Versioning**:
  - **MAJOR**: Backward-incompatible governance or constraint changes (e.g., allowing persistence
    in Phase I, removing determinism requirements).
  - **MINOR**: New principle/section added, or materially expanded guidance.
  - **PATCH**: Clarifications/wording changes with no semantic change.
- **Compliance review**: Plans, tasks, and implementations SHOULD include an explicit “constitution
  check” to verify constraints and non-goals for the current phase.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date unknown | **Last Amended**: 2026-01-07
