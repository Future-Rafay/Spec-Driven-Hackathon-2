# Tasks: Backend Stability Audit and Error Resolution

**Input**: Design documents from `/specs/001-backend-stability-audit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are NOT included - this is an audit and fix task, not new feature development.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each category of fixes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/requirements.txt`
- All paths relative to repository root

---

## Phase 1: Setup (Audit Preparation)

**Purpose**: Prepare for systematic audit and establish baseline

- [x] T001 Document current server startup attempt and capture all error messages
- [x] T002 Create backup of backend/requirements.txt before modifications
- [x] T003 [P] Create backup of backend/src/core/database.py before modifications
- [x] T004 [P] Verify Python version is 3.8+ (currently 3.14.2)

**Checkpoint**: Baseline established - ready to begin fixes

---

## Phase 2: User Story 1 - Critical Import and Dependency Errors (Priority: P1) 🎯 MVP

**Goal**: Resolve all import errors, missing dependencies, and module resolution issues that prevent the FastAPI backend from starting.

**Independent Test**: Run `uvicorn src.main:app --reload --host 0.0.0.0 --port 8080` from backend/ directory and verify no ImportError, ModuleNotFoundError, or dependency-related exceptions occur during startup.

### Dependency Fixes for User Story 1

- [x] T005 [US1] Replace psycopg2-binary with asyncpg in backend/requirements.txt (change line 10 from `psycopg2-binary>=2.9.9` to `asyncpg>=0.29.0`)
- [x] T006 [US1] Install updated dependencies by running `pip install -r requirements.txt` in backend/ directory
- [x] T007 [US1] Verify asyncpg installation with `pip show asyncpg` command

### Import Fixes for User Story 1

- [x] T008 [US1] Fix incorrect import in backend/src/core/database.py line 6 (remove `from sqlmodel import SQLModel, create_engine`)
- [x] T009 [US1] Add correct SQLModel import in backend/src/core/database.py (add `from sqlmodel import SQLModel`)
- [x] T010 [US1] Add correct async engine imports in backend/src/core/database.py (add `from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, async_sessionmaker`)
- [x] T011 [US1] Remove incorrect AsyncEngine import from backend/src/core/database.py line 7 (remove `from sqlmodel.ext.asyncio.session import AsyncSession, AsyncEngine`)
- [x] T012 [US1] Keep correct AsyncSession import in backend/src/core/database.py (verify `from sqlmodel.ext.asyncio.session import AsyncSession` remains)
- [x] T013 [US1] Remove incorrect sessionmaker import in backend/src/core/database.py line 9 (remove `from sqlalchemy.orm import sessionmaker`)

### Validation for User Story 1

- [x] T014 [US1] Attempt server startup and verify ImportError/ModuleNotFoundError are resolved
- [x] T015 [US1] Document any remaining import-related errors for further investigation

**Checkpoint**: Import and dependency errors resolved - server should load Python modules without import failures

---

## Phase 3: User Story 2 - Database Configuration and Async Setup (Priority: P2)

**Goal**: Verify and fix async database engine and session configuration for SQLModel + SQLAlchemy integration.

**Independent Test**: Verify that the database engine initializes without errors, async sessions are created correctly, and the ASGI app can establish database connections during startup (even if DATABASE_URL points to invalid database, the configuration itself should be correct).

### Async Engine Configuration for User Story 2

- [x] T016 [US2] Fix async engine creation in backend/src/core/database.py line 19 (change `engine: AsyncEngine = create_async_engine(` - verify create_async_engine is now imported correctly from T010)
- [x] T017 [US2] Remove unused pool parameter in backend/src/core/database.py if NullPool import exists (verify line 10 - remove `from sqlalchemy.pool import NullPool` if present and unused)
- [x] T018 [US2] Verify async engine configuration parameters in backend/src/core/database.py lines 19-26 (echo, future, pool_pre_ping, pool_size, max_overflow)

### Async Session Factory for User Story 2

- [x] T019 [US2] Fix session factory in backend/src/core/database.py line 29 (replace `sessionmaker` with `async_sessionmaker`)
- [x] T020 [US2] Update async_sessionmaker parameters in backend/src/core/database.py lines 29-35 (remove `autocommit=False, autoflush=False` as these are deprecated in SQLAlchemy 2.x async sessions)
- [x] T021 [US2] Verify async_sessionmaker configuration: engine, class_=AsyncSession, expire_on_commit=False

### Database Connection String for User Story 2

- [x] T022 [US2] Check if DATABASE_URL in backend/.env uses correct asyncpg driver format (should be `postgresql+asyncpg://` not `postgresql://`)
- [x] T023 [US2] Update DATABASE_URL format in backend/.env if needed (add +asyncpg to connection string)
- [x] T024 [US2] Verify connection string format in backend/src/core/config.py settings.DATABASE_URL

### Validation for User Story 2

- [x] T025 [US2] Attempt server startup and verify database configuration loads without async-related errors
- [x] T026 [US2] Verify init_db() function in backend/src/core/database.py lines 38-53 works with async engine
- [x] T027 [US2] Verify get_session() dependency in backend/src/core/database.py lines 56-77 works with async session factory

**Checkpoint**: Database configuration correct - async engine and sessions properly configured

---

## Phase 4: User Story 3 - Application Entrypoint and Router Registration (Priority: P3)

**Goal**: Ensure main.py entrypoint correctly initializes the FastAPI app and registers all routers.

**Independent Test**: Verify that `uvicorn src.main:app` successfully loads the ASGI application, all routers are registered, and the server responds to health check endpoint at `http://localhost:8080/health`.

### Entrypoint Validation for User Story 3

- [x] T028 [US3] Verify FastAPI app instantiation in backend/src/main.py lines 53-58 (check title, description, version, lifespan)
- [x] T029 [US3] Verify lifespan context manager in backend/src/main.py lines 22-50 (check async def lifespan, init_db, close_db calls)
- [x] T030 [US3] Verify CORS middleware configuration in backend/src/main.py lines 61-67 (check settings.CORS_ORIGINS)

### Router Registration for User Story 3

- [x] T031 [US3] Verify auth router import in backend/src/main.py line 110 (check `from .api import auth`)
- [x] T032 [US3] Verify auth router registration in backend/src/main.py line 112 (check `app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])`)
- [x] T033 [US3] Verify health check endpoint in backend/src/main.py lines 97-106 (check `/health` route)

### Uvicorn Target Validation for User Story 3

- [x] T034 [US3] Verify uvicorn target path `src.main:app` is resolvable (check backend/src/__init__.py exists)
- [x] T035 [US3] Verify main.py __main__ block in backend/src/main.py lines 115-122 (check uvicorn.run configuration)

### Full Server Startup Test for User Story 3

- [x] T036 [US3] Start server with `uvicorn src.main:app --reload --host 0.0.0.0 --port 8080` from backend/ directory
- [x] T037 [US3] Verify server starts without ImportError, ModuleNotFoundError, or startup crashes
- [x] T038 [US3] Test health check endpoint: `curl http://localhost:8080/health` returns `{"status": "healthy", "environment": "development"}`
- [x] T039 [US3] Verify database initialization logs show "Database initialized successfully"
- [x] T040 [US3] Verify auth router is accessible at `/api/auth` endpoints

**Checkpoint**: All user stories complete - backend server starts successfully and all endpoints are accessible

---

## Phase 5: Polish & Validation

**Purpose**: Final validation and documentation

- [x] T041 [P] Run full server startup test and document all success criteria met
- [x] T042 [P] Verify SC-001: Backend server starts successfully without ImportError/ModuleNotFoundError
- [x] T043 [P] Verify SC-005: Database connection initializes successfully during server startup
- [x] T044 [P] Verify SC-006: All routers are registered and accessible through the FastAPI application
- [x] T045 [P] Verify SC-008: Dependency versions are aligned and compatible (asyncpg, SQLModel, SQLAlchemy, FastAPI)
- [x] T046 Document all fixes applied with file paths, old code, new code, and explanations
- [x] T047 [P] Clean up backup files created in Phase 1 (if fixes are successful)
- [x] T048 [P] Update backend/requirements.txt comments to document asyncpg requirement
- [x] T049 Test server restart to ensure fixes persist across restarts
- [x] T050 Verify no circular import errors remain (SC-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion - MUST complete before US2 and US3
- **User Story 2 (Phase 3)**: Depends on US1 completion (imports must work before database config can be tested)
- **User Story 3 (Phase 4)**: Depends on US1 and US2 completion (imports and database must work before entrypoint can be tested)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: CRITICAL - Must complete first (blocks US2 and US3)
  - Fixes import errors and dependency mismatches
  - Without these fixes, server cannot even load Python modules

- **User Story 2 (P2)**: Depends on US1 completion
  - Requires correct imports from US1 to fix database configuration
  - Cannot test database config if imports are broken

- **User Story 3 (P3)**: Depends on US1 and US2 completion
  - Requires working imports and database config to test entrypoint
  - Final validation that all components work together

### Critical Path

The critical path for achieving server startup:

1. **T005-T007**: Fix dependency (asyncpg) - BLOCKING
2. **T008-T013**: Fix imports (database.py) - BLOCKING
3. **T019-T021**: Fix async session factory - BLOCKING
4. **T022-T024**: Update connection string format - BLOCKING
5. **T036-T040**: Validate full server startup - VERIFICATION

All tasks in the critical path must complete in order for successful server startup.

### Within Each User Story

**User Story 1 (Import/Dependency Fixes)**:
- T005-T007 (dependency) must complete before T008-T013 (imports)
- T008-T013 (imports) can be done sequentially (same file)
- T014-T015 (validation) must be last

**User Story 2 (Database Config)**:
- T016-T018 (engine) before T019-T021 (session factory)
- T022-T024 (connection string) can be parallel with engine/session fixes
- T025-T027 (validation) must be last

**User Story 3 (Entrypoint)**:
- T028-T033 (validation tasks) can be done in parallel [P] (different concerns)
- T034-T035 (uvicorn target) can be parallel with router validation
- T036-T040 (full startup test) must be last and sequential

### Parallel Opportunities

- **Phase 1 Setup**: T002, T003, T004 can run in parallel [P]
- **User Story 1**: Limited parallelization (same file edits)
- **User Story 2**: T022-T024 (connection string) parallel with T016-T021 (engine/session)
- **User Story 3**: T028-T035 (validation checks) can run in parallel [P]
- **Phase 5 Polish**: T041-T045, T047-T048 can run in parallel [P]

---

## Parallel Example: User Story 2

```bash
# These tasks can run in parallel (different concerns):
Task T022: "Check DATABASE_URL format in backend/.env"
Task T016: "Fix async engine creation in backend/src/core/database.py"

# But these must be sequential (same file, dependent changes):
Task T019: "Fix session factory" (depends on T016 completing)
Task T025: "Validate database config" (depends on T019, T022 completing)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: User Story 1 (T005-T015)
3. **STOP and VALIDATE**: Test that imports work
4. If imports work, proceed to US2

### Incremental Delivery

1. Complete Setup → Baseline established
2. Add User Story 1 → Test imports independently → Imports working
3. Add User Story 2 → Test database config independently → Database config working
4. Add User Story 3 → Test full server startup independently → Server fully operational
5. Each story adds fixes without breaking previous fixes

### Sequential Execution (Recommended)

Due to the nature of this audit (fixing existing code with dependencies):

1. **Phase 1 (Setup)**: Complete all setup tasks
2. **Phase 2 (US1)**: Complete ALL import/dependency fixes before moving on
3. **Phase 3 (US2)**: Complete ALL database config fixes before moving on
4. **Phase 4 (US3)**: Complete ALL entrypoint validation
5. **Phase 5 (Polish)**: Final validation and cleanup

**Rationale**: Each user story builds on the previous one. Import errors must be fixed before database config can be tested, and both must work before entrypoint can be validated.

---

## Notes

- [P] tasks = different files or independent concerns, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story represents a category of fixes (imports, database, entrypoint)
- User stories are NOT independent in this case - they have sequential dependencies
- Verify each fix immediately after applying (test-as-you-go approach)
- Commit after each completed user story phase
- Stop at any checkpoint to validate fixes independently
- All file paths are relative to repository root
- Backup files before modifications (T002, T003)
- Document all changes for reproducibility

---

## Success Criteria Mapping

- **SC-001**: Verified by T037, T042 (server starts without ImportError/ModuleNotFoundError)
- **SC-002**: Verified by T046 (all issues documented with 100% accuracy)
- **SC-003**: Verified by T046 (every issue includes working code fix)
- **SC-004**: Not applicable (audit is manual, not automated)
- **SC-005**: Verified by T039, T043 (database connection initializes successfully)
- **SC-006**: Verified by T040, T044 (all routers registered and accessible)
- **SC-007**: Verified by T050 (zero circular import errors)
- **SC-008**: Verified by T045 (dependency versions aligned and compatible)

---

## Task Count Summary

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (User Story 1 - P1)**: 11 tasks
- **Phase 3 (User Story 2 - P2)**: 12 tasks
- **Phase 4 (User Story 3 - P3)**: 13 tasks
- **Phase 5 (Polish)**: 10 tasks

**Total**: 50 tasks

**Critical Path Tasks**: 15 tasks (T005-T007, T008-T013, T019-T021, T022-T024, T036-T040)

**Parallel Opportunities**: 12 tasks marked [P] across all phases
