# Implementation Plan: Backend Stability Audit and Error Resolution

**Branch**: `001-backend-stability-audit` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-stability-audit/spec.md`

## Summary

This plan outlines a systematic approach to diagnose and fix all issues preventing the FastAPI backend from starting successfully. The audit will identify import errors, dependency mismatches, async database configuration issues, and entrypoint problems. The goal is to achieve a clean server startup with `uvicorn src.main:app --reload --host 0.0.0.0 --port 8080` without any ImportError, ModuleNotFoundError, or startup crashes.

**Primary Requirement**: Systematically audit the entire backend codebase to identify and resolve all startup-blocking issues.

**Technical Approach**: Multi-phase analysis using specialized agents to examine dependencies, imports, database configuration, and runtime behavior, followed by minimal surgical fixes.

## Technical Context

**Language/Version**: Python 3.14.2
**Primary Dependencies**: FastAPI 0.115.0+, uvicorn 0.30.0+, SQLModel 0.0.22+, SQLAlchemy (async), asyncpg (async PostgreSQL driver)
**Storage**: Neon Serverless PostgreSQL (async connection required)
**Testing**: pytest 8.3.0+, pytest-asyncio 0.24.0+
**Target Platform**: Linux/Windows server with Python 3.8+ support
**Project Type**: Web application (backend API)
**Performance Goals**: Server startup in under 5 seconds, no blocking operations during initialization
**Constraints**: Minimal surgical fixes only, no large refactors, preserve existing functionality
**Scale/Scope**: Single backend service with ~15 source files, 4 main modules (api, core, models, services)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Alignment with Constitutional Principles

✅ **Spec-Driven Development First**: This audit follows the spec → plan → tasks → implementation workflow. The specification was completed before planning began.

✅ **Security-by-Design**: The audit will not compromise existing security measures (JWT authentication, password hashing, user data isolation). All fixes will preserve security architecture.

✅ **Zero Manual Coding**: All fixes will be generated through Claude Code following structured prompts and this implementation plan.

✅ **Clear Separation of Concerns**: The audit respects existing layer boundaries (api, core, models, services) and will not introduce cross-layer dependencies.

✅ **Production-Oriented Architecture**: Fixes will maintain production-quality patterns (async operations, proper error handling, environment-based configuration).

✅ **Deterministic and Reproducible Outputs**: All identified issues and fixes will be documented with exact file paths, root causes, and code changes for reproducibility.

### Technology Stack Compliance

✅ **Backend**: Python FastAPI (compliant)
✅ **ORM**: SQLModel (compliant)
✅ **Database**: Neon Serverless PostgreSQL (compliant - requires async driver)
⚠️ **Database Driver**: Currently using `psycopg2-binary` (synchronous) - MUST be replaced with `asyncpg` for async operations

### Gates Status

**PASS** - All constitutional principles are upheld. One dependency correction required (psycopg2-binary → asyncpg).

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-stability-audit/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - dependency compatibility research
├── data-model.md        # Phase 1 output - audit report structure
├── quickstart.md        # Phase 1 output - how to run the audit
├── contracts/           # Phase 1 output - audit report schema
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── __init__.py
│   ├── main.py                    # FastAPI entrypoint (AUDIT TARGET)
│   ├── api/
│   │   ├── __init__.py
│   │   └── auth.py                # Auth router (AUDIT TARGET)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Settings (AUDIT TARGET)
│   │   ├── database.py            # Async DB setup (CRITICAL AUDIT TARGET)
│   │   ├── security.py            # JWT/password (AUDIT TARGET)
│   │   └── validators.py          # Input validation
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # User model (AUDIT TARGET)
│   │   └── errors.py              # Error schemas
│   └── services/
│       ├── __init__.py
│       └── auth_service.py        # Auth business logic (AUDIT TARGET)
├── requirements.txt               # Dependencies (CRITICAL AUDIT TARGET)
├── .env                           # Environment variables
└── venv/                          # Virtual environment

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Web application structure with backend/ directory. The audit focuses exclusively on backend/src/ and backend/requirements.txt. Frontend is out of scope.

## Complexity Tracking

No constitutional violations requiring justification. The audit maintains existing architecture and applies minimal fixes only.

## Phase 0: Research & Discovery

### Objectives

1. Research async PostgreSQL driver requirements for SQLModel + SQLAlchemy
2. Investigate SQLModel 0.0.22 compatibility with SQLAlchemy 2.x async patterns
3. Identify correct import patterns for async engine and session creation
4. Research FastAPI lifespan event best practices for async database initialization
5. Verify Python 3.14.2 compatibility with all dependencies

### Research Tasks

#### Task 0.1: Async PostgreSQL Driver Research

**Question**: What is the correct async PostgreSQL driver for SQLModel + SQLAlchemy async operations?

**Research Focus**:
- SQLModel documentation on async database connections
- SQLAlchemy 2.x async engine requirements
- asyncpg vs psycopg2-binary vs psycopg3 comparison
- Connection string format for async drivers

**Expected Outcome**: Confirmation that `asyncpg` is required and `psycopg2-binary` must be removed.

#### Task 0.2: SQLModel Async Import Patterns

**Question**: What are the correct imports for async engine and session creation with SQLModel 0.0.22?

**Research Focus**:
- SQLModel async engine creation (does SQLModel provide `create_async_engine`?)
- Correct import sources: `sqlmodel` vs `sqlalchemy.ext.asyncio`
- AsyncEngine type hints location
- async_sessionmaker vs sessionmaker for async sessions

**Expected Outcome**: Documented correct import statements for database.py.

#### Task 0.3: FastAPI Async Lifespan Patterns

**Question**: Are there any known issues with async database initialization in FastAPI lifespan events?

**Research Focus**:
- FastAPI lifespan context manager best practices
- Async database connection pooling during startup
- Error handling in lifespan events
- Shutdown cleanup patterns

**Expected Outcome**: Validation that current lifespan pattern in main.py is correct or identification of issues.

#### Task 0.4: Dependency Version Compatibility

**Question**: Are all dependencies in requirements.txt compatible with Python 3.14.2 and each other?

**Research Focus**:
- FastAPI 0.115.0+ compatibility with Pydantic 2.9.0+
- SQLModel 0.0.22 compatibility with SQLAlchemy 2.x
- pydantic-settings import patterns (BaseSettings location)
- JWT library compatibility (pyjwt vs python-jose)

**Expected Outcome**: Confirmed compatible version matrix or identified conflicts.

### Deliverable: research.md

Document all findings with:
- Decision: What was chosen (e.g., "Use asyncpg as PostgreSQL driver")
- Rationale: Why chosen (e.g., "Required for SQLAlchemy async engine")
- Alternatives considered: What else was evaluated (e.g., "psycopg3 async mode")
- Code examples: Correct import and usage patterns

## Phase 1: Design & Contracts

### Prerequisites

- research.md completed with all async patterns documented
- Dependency compatibility matrix confirmed

### Design Artifacts

#### 1.1: Data Model (data-model.md)

**Audit Report Structure**:

```
AuditReport
├── summary: AuditSummary
├── issues: List[Issue]
└── recommendations: List[Recommendation]

AuditSummary
├── total_files_scanned: int
├── total_issues_found: int
├── critical_issues: int
├── warning_issues: int
└── audit_duration_seconds: float

Issue
├── id: str (e.g., "IMPORT-001")
├── severity: Enum[CRITICAL, HIGH, MEDIUM, LOW]
├── category: Enum[IMPORT, DEPENDENCY, DATABASE, CONFIG, ENTRYPOINT]
├── file_path: str
├── line_number: Optional[int]
├── problem_description: str
├── root_cause: str
├── exact_fix: CodeFix
└── related_issues: List[str]

CodeFix
├── file_path: str
├── old_code: str
├── new_code: str
└── explanation: str

Recommendation
├── priority: int
├── description: str
└── impact: str
```

**Validation Rules**:
- All CRITICAL issues must have exact_fix with working code
- file_path must be absolute or relative to backend/ root
- severity must match impact (startup-blocking = CRITICAL)

#### 1.2: API Contracts (contracts/)

**Audit Execution Contract**:

```yaml
# contracts/audit-execution.yaml
name: Backend Stability Audit
version: 1.0.0

phases:
  - name: dependency_audit
    agent: Dependency Audit Agent
    inputs:
      - requirements.txt
      - pyproject.toml (if exists)
    outputs:
      - dependency_issues.json

  - name: import_scan
    agent: Import Resolution Agent
    inputs:
      - backend/src/**/*.py
    outputs:
      - import_issues.json

  - name: database_verification
    agent: Async DB Specialist Agent
    inputs:
      - backend/src/core/database.py
      - backend/src/core/config.py
    outputs:
      - database_issues.json

  - name: entrypoint_validation
    agent: Entrypoint Validation Agent
    inputs:
      - backend/src/main.py
    outputs:
      - entrypoint_issues.json

  - name: consolidation
    agent: Codebase Analysis Agent
    inputs:
      - dependency_issues.json
      - import_issues.json
      - database_issues.json
      - entrypoint_issues.json
    outputs:
      - audit_report.json
```

**Issue Schema**:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Backend Audit Issue",
  "type": "object",
  "required": ["id", "severity", "category", "file_path", "problem_description", "root_cause", "exact_fix"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^[A-Z]+-[0-9]{3}$"
    },
    "severity": {
      "type": "string",
      "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    },
    "category": {
      "type": "string",
      "enum": ["IMPORT", "DEPENDENCY", "DATABASE", "CONFIG", "ENTRYPOINT"]
    },
    "file_path": {
      "type": "string"
    },
    "line_number": {
      "type": "integer",
      "minimum": 1
    },
    "problem_description": {
      "type": "string",
      "minLength": 10
    },
    "root_cause": {
      "type": "string",
      "minLength": 10
    },
    "exact_fix": {
      "type": "object",
      "required": ["file_path", "old_code", "new_code", "explanation"],
      "properties": {
        "file_path": {"type": "string"},
        "old_code": {"type": "string"},
        "new_code": {"type": "string"},
        "explanation": {"type": "string"}
      }
    }
  }
}
```

#### 1.3: Quickstart Guide (quickstart.md)

**How to Run the Audit**:

1. **Prerequisites**:
   - Python 3.8+ installed
   - Backend source code accessible
   - Terminal access

2. **Execution Steps**:
   ```bash
   # Step 1: Navigate to backend directory
   cd backend/

   # Step 2: Attempt to start server (capture errors)
   python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8080

   # Step 3: Document all errors encountered
   # Step 4: Run systematic audit (via /sp.implement)
   ```

3. **Expected Outputs**:
   - audit_report.json with all identified issues
   - Fixed code snippets for each issue
   - Prioritized fix order

4. **Success Criteria**:
   - Server starts without ImportError/ModuleNotFoundError
   - Database connection initializes successfully
   - Health check endpoint responds

### Agent Context Update

After completing Phase 1 design artifacts, update agent context:

```bash
# Run agent context update script
.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude
```

**Technologies to Add**:
- asyncpg (async PostgreSQL driver)
- SQLAlchemy 2.x async patterns
- FastAPI lifespan events
- SQLModel async session management

## Phase 2: Audit Execution Strategy

### Audit Phases (Detailed)

#### Phase 2.1: Environment & Dependency Audit

**Agent**: Dependency Audit Agent

**Inputs**:
- backend/requirements.txt
- Python version (3.14.2)

**Analysis**:
1. Check for synchronous vs async driver mismatch
2. Verify SQLModel + SQLAlchemy version compatibility
3. Validate FastAPI + Pydantic version alignment
4. Check for deprecated packages

**Known Issues to Verify**:
- ❌ `psycopg2-binary` (synchronous) used instead of `asyncpg` (async)
- ✅ FastAPI 0.115.0+ compatible with Pydantic 2.9.0+
- ✅ SQLModel 0.0.22 compatible with SQLAlchemy 2.x

**Expected Output**: dependency_issues.json with CRITICAL issue for psycopg2-binary

#### Phase 2.2: Project Structure Validation

**Agent**: Codebase Analysis Agent

**Inputs**:
- backend/src/ directory structure

**Analysis**:
1. Verify all packages have __init__.py files
2. Check for missing or empty __init__.py
3. Validate module naming conventions
4. Ensure no circular package dependencies

**Expected Output**: Structure validation report (likely PASS - structure looks correct)

#### Phase 2.3: Import Integrity Scan

**Agent**: Import Resolution Agent

**Inputs**:
- All .py files in backend/src/

**Analysis**:
1. Trace all import statements
2. Identify incorrect import sources
3. Detect circular imports
4. Validate relative vs absolute imports

**Known Issues to Verify**:
- ❌ database.py line 6: `from sqlmodel import create_engine` (incorrect - SQLModel doesn't have this)
- ❌ database.py line 7: `AsyncEngine` imported from wrong location
- ❌ database.py line 29: `sessionmaker` should be `async_sessionmaker` for async sessions

**Expected Output**: import_issues.json with 3+ CRITICAL issues

#### Phase 2.4: Database Layer Verification

**Agent**: Async DB Specialist Agent

**Inputs**:
- backend/src/core/database.py
- backend/src/core/config.py

**Analysis**:
1. Verify async engine creation pattern
2. Check async session factory configuration
3. Validate connection string format for asyncpg
4. Review init_db() async operations
5. Check get_session() dependency pattern

**Known Issues to Verify**:
- ❌ Incorrect imports for async engine/session
- ❌ Wrong sessionmaker (should be async_sessionmaker)
- ⚠️ Connection string may need asyncpg:// prefix instead of postgresql://

**Expected Output**: database_issues.json with 3-5 CRITICAL issues

#### Phase 2.5: App Boot Sequence Check

**Agent**: Entrypoint Validation Agent

**Inputs**:
- backend/src/main.py

**Analysis**:
1. Verify FastAPI app instantiation
2. Check lifespan event handler
3. Validate router registration
4. Confirm uvicorn target path (src.main:app)

**Expected Output**: entrypoint_issues.json (likely minimal issues - main.py looks correct)

#### Phase 2.6: Runtime Failure Prediction

**Agent**: Runtime Simulation Agent

**Inputs**:
- All previous issue reports

**Analysis**:
1. Simulate import sequence
2. Predict cascading failures
3. Identify hidden secondary errors
4. Estimate fix order impact

**Expected Output**: Prioritized fix order with dependency graph

### Phase 2.7: Fix Strategy & Prioritization

**Fix Order** (highest impact to lowest):

1. **CRITICAL-001**: Replace psycopg2-binary with asyncpg in requirements.txt
   - **Impact**: Enables async database operations
   - **Fix**: Change `psycopg2-binary>=2.9.9` to `asyncpg>=0.29.0`

2. **CRITICAL-002**: Fix database.py imports
   - **Impact**: Resolves ImportError on startup
   - **Fix**:
     ```python
     # Remove incorrect import
     # from sqlmodel import SQLModel, create_engine

     # Add correct imports
     from sqlmodel import SQLModel
     from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, async_sessionmaker
     ```

3. **CRITICAL-003**: Fix async session factory
   - **Impact**: Enables proper async session management
   - **Fix**:
     ```python
     # Replace sessionmaker with async_sessionmaker
     async_session_maker = async_sessionmaker(
         engine,
         class_=AsyncSession,
         expire_on_commit=False,
     )
     ```

4. **CRITICAL-004**: Update DATABASE_URL for asyncpg driver
   - **Impact**: Ensures correct driver is used
   - **Fix**: Update connection string from `postgresql://` to `postgresql+asyncpg://`

5. **MEDIUM-001**: Remove unused imports
   - **Impact**: Code cleanliness
   - **Fix**: Remove any unused imports identified during scan

### Deliverables

1. **Ordered Fix List**: Prioritized by impact (startup-blocking first)
2. **File-by-File Correction Plan**: Exact changes for each file
3. **Exact Patch Suggestions**: Code snippets ready to apply
4. **Root Cause Documentation**: Explanation for each issue

## Implementation Notes

### Critical Path

The critical path for achieving server startup:
1. Fix dependency (asyncpg) → 2. Fix imports (database.py) → 3. Fix session factory → 4. Update connection string

All four fixes must be applied for successful startup.

### Testing Strategy

After each fix:
1. Attempt server startup: `uvicorn src.main:app --reload --host 0.0.0.0 --port 8080`
2. Capture any new errors
3. Verify previous errors are resolved
4. Document progress

### Rollback Plan

If fixes cause new issues:
1. Revert changes in reverse order
2. Re-analyze with updated context
3. Apply alternative fix approach

### Success Validation

Server startup is successful when:
- ✅ No ImportError or ModuleNotFoundError
- ✅ Database engine initializes without errors
- ✅ FastAPI app loads completely
- ✅ Health check endpoint responds: `curl http://localhost:8080/health`
- ✅ Server logs show "Application startup complete"

## Risk Analysis

### High-Risk Areas

1. **Database Connection String Format**: asyncpg may require different format than psycopg2
   - **Mitigation**: Research exact connection string format in Phase 0

2. **SQLModel Version Compatibility**: SQLModel 0.0.22 may have breaking changes
   - **Mitigation**: Verify compatibility matrix in Phase 0

3. **Cascading Import Errors**: Fixing one import may reveal others
   - **Mitigation**: Use Runtime Simulation Agent to predict cascades

### Medium-Risk Areas

1. **Environment Variable Dependencies**: Missing .env variables may cause startup failures
   - **Mitigation**: Document all required environment variables

2. **Python 3.14.2 Compatibility**: Very new Python version may have package incompatibilities
   - **Mitigation**: Test with Python 3.11 if issues persist

## Next Steps

After completing this plan:

1. **Execute Phase 0 Research**: Create research.md with all findings
2. **Execute Phase 1 Design**: Create data-model.md, contracts/, quickstart.md
3. **Run Agent Context Update**: Update Claude agent context with new technologies
4. **Generate Tasks**: Run `/sp.tasks` to create actionable task list
5. **Implement Fixes**: Execute tasks via `/sp.implement`

## Architectural Decisions

### ADR Candidates

The following decisions may warrant ADR documentation:

1. **Choice of asyncpg over psycopg3**: Why asyncpg is preferred for SQLAlchemy async operations
2. **Async-only database layer**: Decision to use fully async database operations (no sync fallback)
3. **Minimal fix approach**: Decision to apply surgical fixes rather than refactoring

**Recommendation**: Create ADR for "asyncpg driver selection" if this becomes a pattern for other services.

---

**Plan Status**: ✅ Complete - Ready for Phase 0 research and task generation
**Next Command**: `/sp.tasks` (after research.md is created)
