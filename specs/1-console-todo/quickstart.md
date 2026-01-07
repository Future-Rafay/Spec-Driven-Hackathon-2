# Quickstart: In-Memory Console Todo App (Phase I)

**Branch**: `1-console-todo`

## Goal

Run the Phase I interactive console todo app and exercise the core commands.

## Prerequisites

- Python 3.13+
- UV environment (per project constraint)

## Run

From the repository root:

1. Start the app
2. Observe that help is printed
3. Enter commands (examples below)

## Example session

```text
help
add Buy milk
view
update 1 Buy oat milk
complete 1
view
delete 1
view
exit
```

## Expected behavior

- No files are created.
- Restarting the program resets the todo list.
- Invalid input produces deterministic error output and does not mutate state.
