# Feature Specification: In-Memory Console Todo App (Phase I)

**Feature Branch**: `1-console-todo`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "/sp.specify In-Memory Python Console Todo App (Phase I)

Target audience:
- Reviewers of agentic AI development workflows

Objective:
Build a console-based todo app that stores all data in memory, developed strictly via Spec-Kit Plus → Claude Code (no manual coding).

Focus:
- Core todo functionality
- Clean structure
- Deterministic CLI behavior

Success criteria:
- Supports: Add, Delete, Update, View, Mark Complete
- In-memory only (no files, no DB)
- Runs correctly via CLI
- Clean, readable Python structure

Constraints:
- Python 3.13+
- UV environment
- Standard library only
- Console app only
- No manual code edits

Not building:
- Persistence
- Web/UI
- AI features
- Tests or frameworks"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage todos from the console (Priority: P1)

As a user, I want to manage my todo list entirely via the console so I can track tasks without
needing internet, a database, or a GUI.

**Why this priority**: This is the core value of the Phase I application and the foundation for
all later phases.

**Independent Test**: Start the app, add a todo, view todos, update it, mark it complete, delete
it, and verify the list matches expectations after each command.

**Acceptance Scenarios**:

1. **Given** the app is running with an empty list, **When** I add a todo with a title,
   **Then** it appears in the list with a new ID and an incomplete status.
2. **Given** an existing todo, **When** I update its title, **Then** the updated title is shown
   when viewing the list.
3. **Given** an existing todo, **When** I mark it complete, **Then** the todo is shown as
   complete when viewing the list.
4. **Given** an existing todo, **When** I delete it, **Then** it no longer appears in the list.

---

### User Story 2 - Get predictable errors and help text (Priority: P2)

As a user, I want consistent command syntax, help text, and clear error messages so I can recover
from mistakes and use the app deterministically.

**Why this priority**: Deterministic CLI behavior is a stated project principle and a key review
criterion for agentic workflow evaluation.

**Independent Test**: Run invalid commands (unknown command, missing args, bad ID) and verify the
app prints a consistent usage/help message and does not change the in-memory state.

**Acceptance Scenarios**:

1. **Given** the app is running, **When** I enter an unknown command,
   **Then** I receive a clear error and a hint to view help.
2. **Given** the app is running, **When** I run a command with missing required arguments,
   **Then** I receive a usage message for that command and no todos are changed.
3. **Given** the app is running with todos, **When** I reference a non-existent ID,
   **Then** I receive a clear "not found" error and the list is unchanged.

---

### User Story 3 - Exit without side effects (Priority: P3)

As a user, I want to exit the app cleanly so I can stop the session without leaving hidden state
behind.

**Why this priority**: Phase I explicitly forbids persistence; exiting should not create any
files or external side effects.

**Independent Test**: Add todos, exit the app, restart the app, and verify the list is empty.

**Acceptance Scenarios**:

1. **Given** I have added todos, **When** I exit and restart the app,
   **Then** the todo list starts empty.

### Edge Cases

- What happens when a user tries to update, delete, or complete a todo with an ID that does not
  exist?
- What happens when a user provides an empty title for a todo?
- How does the system handle extra whitespace or mixed-case commands?
- What happens when the todo list is empty and the user runs view?
- How does the system handle very long titles (e.g., 500+ characters)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST run as a console program that reads commands from standard input and
  writes results to standard output.
- **FR-002**: System MUST store all todos in memory for the duration of the process and MUST NOT
  read or write any persistence files.
- **FR-003**: System MUST allow users to add a todo with a title and receive a stable identifier
  for that todo within the current session.
- **FR-004**: System MUST allow users to view the current todo list, including each todo’s ID,
  title, and completion status.
- **FR-005**: System MUST allow users to update an existing todo’s title by referencing its ID.
- **FR-006**: System MUST allow users to mark a todo as complete by referencing its ID.
- **FR-007**: System MUST allow users to delete a todo by referencing its ID.
- **FR-008**: System MUST validate command arguments and provide deterministic, user-readable
  errors for invalid input (unknown command, missing args, invalid ID, non-existent ID).
- **FR-009**: System MUST provide a help command that lists supported commands and examples.
- **FR-010**: System MUST exit cleanly when the user requests exit, without writing any files or
  contacting any external services.

### Key Entities *(include if feature involves data)*

- **Todo**: A task item with an ID, a title, and a completion status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete the full CRUD + complete workflow (add, view, update, complete,
  delete) in a single session, and the displayed list always matches the expected state.
- **SC-002**: For a defined set of invalid inputs (unknown command, missing arguments, invalid
  ID format, non-existent ID), the system responds with consistent error messages and the in-memory
  todo list remains unchanged.
- **SC-003**: On restart, the system begins with an empty todo list (no persistence across
  sessions).
- **SC-004**: A reviewer can understand the core domain logic by reading the code without needing
  external libraries or frameworks.
