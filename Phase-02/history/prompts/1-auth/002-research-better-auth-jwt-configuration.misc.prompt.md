---
id: 002
title: Research Better Auth JWT Configuration
stage: misc
date: 2026-02-04
surface: agent
model: claude-sonnet-4-5-20250929
feature: 1-auth
branch: 1-auth
user: Abdul Rafay
command: research
labels: ["research", "better-auth", "jwt", "nextjs", "app-router", "fastapi", "token-storage", "security"]
links:
  spec: specs/1-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-auth/research.md
tests:
  - none
---

## Prompt

Research Better Auth JWT configuration for Next.js App Router:

1. How to configure Better Auth to issue JWTs with custom payload (user ID, email)
2. Token storage strategy in Next.js App Router (cookies vs localStorage vs sessionStorage)
3. How to attach JWT to API requests from Next.js client components and server components
4. Better Auth session management and token refresh patterns

Focus on:
- Official Better Auth documentation for JWT plugin
- Next.js 16+ App Router compatibility
- Security best practices for token storage
- Integration patterns with external APIs (FastAPI backend)

Provide concrete configuration examples and implementation guidance.

## Response snapshot

Successfully researched Better Auth JWT configuration and created comprehensive research document covering all requested areas.

**Key Findings**:

1. **JWT Configuration**: Better Auth uses cookie-based sessions by default. JWT plugin must be added explicitly for external API communication. Custom payload configured via `definePayload` function with user ID, email, and other claims.

2. **Token Storage Strategy**: Hybrid approach recommended:
   - HTTP-only cookies for Better Auth session management (XSS-resistant)
   - In-memory JWT extraction for FastAPI API calls (secure, short-lived)
   - Avoid localStorage/sessionStorage (XSS vulnerable)
   - Use Authorization: Bearer header for API requests

3. **Attaching JWT to Requests**:
   - Client components: Use `jwtClient` plugin with `authClient.token()` method
   - Server components: Use `auth.api.getSession()` + `auth.api.createJWT()`
   - API routes: Session verification + JWT generation for backend forwarding

4. **Session Management & Refresh**:
   - Automatic refresh via cookie cache with `refreshCache: true`
   - Refreshes at 80% of maxAge (4 minutes for 5-minute cache)
   - Session extension after updateAge (1 day) extends expiry by 7 days
   - 401 retry logic for handling edge cases

**Technical Decisions Made**:
- Use JWT plugin with custom payload for FastAPI communication
- Implement API client wrapper with automatic JWT injection
- Configure 7-day token expiry (per spec requirement)
- Use JWKS verification in production, shared secret in development
- Implement automatic token refresh with 401 fallback

**Security Best Practices Documented**:
- HTTP-only cookies for session storage
- SameSite attribute for CSRF protection
- JWT signature verification on every backend request
- User ID extraction from verified tokens only
- No client-side JWT storage in localStorage/sessionStorage

**Implementation Roadmap Created**:
- Phase 1: Better Auth setup with JWT plugin
- Phase 2: Client integration with API wrapper
- Phase 3: FastAPI JWT verification middleware
- Phase 4: Integration testing

**Documentation Limitations**:
- Some Better Auth docs returned 404 (Next.js integration, middleware, external API pages)
- Guidance based on available documentation and industry best practices
- Additional verification may be needed during implementation

**Files Created**:
- specs/1-auth/research.md (10 sections, ~500 lines, comprehensive implementation guidance)

## Outcome

- ✅ Impact: Complete research document resolving all Phase 0 technical decisions for authentication implementation
- 🧪 Tests: None (research phase - testing guidance provided for implementation)
- 📁 Files: Created research.md with configuration examples, security analysis, and implementation roadmap
- 🔁 Next prompts: Continue with Phase 1 (data model and API contracts) or proceed to /sp.tasks for implementation planning
- 🧠 Reflection: Successfully extracted actionable implementation guidance from Better Auth documentation despite some 404 errors. Research provides clear decision rationale, alternatives considered, and concrete code examples for all integration points (client components, server components, API routes, FastAPI backend).

## Evaluation notes (flywheel)

- Failure modes observed: WebSearch API errors (400 status), some Better Auth documentation pages returned 404
- Graders run and results (PASS/FAIL): Research objectives PASSED (all 4 focus areas addressed with concrete examples)
- Prompt variant (if applicable): N/A (initial research task)
- Next experiment (smallest change to try): Validate research findings during implementation phase, particularly Next.js middleware integration patterns that had unavailable documentation
