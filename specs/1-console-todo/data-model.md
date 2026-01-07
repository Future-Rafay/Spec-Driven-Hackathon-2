# Data Model: In-Memory Console Todo App (Phase I)

**Branch**: `1-console-todo`
**Date**: 2026-01-07

## Entity: Todo

### Fields

- **id**: integer
  - Unique within a single running session
  - Assigned at creation time
  - Never reused within the session
- **title**: string
  - Required
  - Stored exactly as provided (after basic trimming)
- **completed**: boolean
  - Default: false

### State transitions

- Create: (no todo) → Todo(completed=false)
- Mark complete: Todo(completed=false) → Todo(completed=true)
- Update title: Todo(title=old) → Todo(title=new)
- Delete: Todo → (removed)

### Validation rules

- Title MUST be non-empty after trimming whitespace.
- Todo operations that reference an ID MUST fail with a deterministic “not found” response if the
  ID does not exist.
