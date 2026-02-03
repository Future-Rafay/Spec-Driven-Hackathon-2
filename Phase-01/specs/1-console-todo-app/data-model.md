# Data Model: In-Memory Console Todo App

## Todo Entity

**Fields**:
- `id`: Integer (unique identifier, auto-generated)
- `title`: String (task description, required)
- `completed`: Boolean (completion status, default: False)

**Validation Rules**:
- ID must be unique within the system
- Title must not be empty or whitespace-only
- ID must be positive integer
- Completed status must be boolean

**State Transitions**:
- `incomplete` → `complete` (via complete operation)
- `complete` → `incomplete` (via update/reopen operation)

## Todo Collection

**Structure**: Dictionary with ID as key, Todo object as value
- Key: Integer (todo ID)
- Value: Object containing {id, title, completed}

**Operations Supported**:
- Create: Add new todo with unique ID
- Read: Retrieve todo by ID or list all todos
- Update: Modify existing todo properties
- Delete: Remove todo by ID
- Complete: Mark todo as completed/incomplete

## In-Memory State Container

**Components**:
- `todos`: Dictionary storing all todo items
- `next_id`: Integer counter for generating unique IDs
- Thread safety: Not required (single-threaded console app)

**Initialization**:
- `todos` = {}
- `next_id` = 1