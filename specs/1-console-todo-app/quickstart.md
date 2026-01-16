# Quickstart Guide: In-Memory Console Todo App

## Prerequisites
- Python 3.13+ installed
- UV environment manager (optional but recommended)

## Setup
1. Clone the repository
2. Navigate to the project directory
3. Install dependencies (if any) or run directly with Python

## Running the Application
```bash
python src/main.py
```

Or if using UV:
```bash
uv run src/main.py
```

## Available Commands
- `add "task description"` - Add a new todo
- `view` or `list` - View all todos
- `complete <id>` - Mark a todo as complete
- `update <id> "new description"` - Update a todo description
- `delete <id>` - Delete a todo
- `help` - Show available commands
- `exit` or `quit` - Exit the application

## Example Usage
```
> add "Buy groceries"
Added todo #1: Buy groceries [Incomplete]

> add "Walk the dog"
Added todo #2: Walk the dog [Incomplete]

> view
1. [ ] Buy groceries
2. [ ] Walk the dog

> complete 1
Todo #1 marked as complete: Buy groceries

> view
1. [x] Buy groceries
2. [ ] Walk the dog

> update 2 "Walk the big brown dog"
Updated todo #2: Walk the big brown dog [Incomplete]

> delete 2
Deleted todo #2: Walk the big brown dog

> exit
Goodbye!
```

## Expected Behavior
- All data is stored in memory only and will be lost when the application exits
- Commands are case-sensitive
- Invalid commands or IDs will show error messages but won't crash the app
- The application runs in an infinite loop until the user types 'exit'