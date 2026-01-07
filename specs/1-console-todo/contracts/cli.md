# CLI Contract: In-Memory Console Todo App (Phase I)

**Branch**: `1-console-todo`
**Date**: 2026-01-07

This is a human-readable command contract for the interactive console app.

## General

- Commands are read line-by-line from stdin.
- Leading/trailing whitespace is ignored.
- Command keywords are case-insensitive.
- Titles are treated as the remaining text after the command and any required arguments.

## Commands

### help

**Description**: Show available commands.

**Example**:

- `help`

### add <title>

**Description**: Add a new todo.

**Examples**:

- `add Buy milk`

**Errors**:

- Missing title → prints usage and does not change state.
- Empty title after trimming → prints error and does not change state.

### view

**Description**: Show current todos.

**Examples**:

- `view`

### update <id> <title>

**Description**: Update an existing todo title.

**Examples**:

- `update 1 Buy oat milk`

**Errors**:

- Invalid ID format → prints error and does not change state.
- ID not found → prints error and does not change state.
- Missing title / empty title → prints error and does not change state.

### complete <id>

**Description**: Mark an existing todo as completed.

**Examples**:

- `complete 1`

**Errors**:

- Invalid ID format → prints error and does not change state.
- ID not found → prints error and does not change state.

### delete <id>

**Description**: Delete an existing todo.

**Examples**:

- `delete 1`

**Errors**:

- Invalid ID format → prints error and does not change state.
- ID not found → prints error and does not change state.

### exit

**Description**: Exit the application.

**Examples**:

- `exit`

## Output expectations (determinism)

- The app should print responses in a consistent format.
- Viewing todos should include: id, completed flag, title.
- Error messages should be consistent for the same class of error.
