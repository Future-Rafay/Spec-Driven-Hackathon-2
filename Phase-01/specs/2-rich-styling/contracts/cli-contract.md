# CLI Contract: Styled Todo App Interface

## Overview
This contract defines the command-line interface for the styled todo application, specifying how commands are interpreted and how styled output is presented to users.

## Commands and Responses

### List Tasks
**Command**: `todo list` or `todo`

**Response Format**:
```
┌─────────────┬──────────────────────────────┬─────────────┐
│ Status      │ Task                         │ Priority    │
├─────────────┼──────────────────────────────┼─────────────┤
│ [green]✓[/green] Completed │ Buy groceries                │ Normal      │
│ [red]⚠ Overdue │ Submit report               │ High        │
│ [yellow]○ Pending  │ Schedule meeting            │ Low         │
└─────────────┴──────────────────────────────┴─────────────┘
```

### Add Task
**Command**: `todo add "task description"`

**Response Format**:
```
[yellow]Added:[/] "task description" [blue](ID: 123)[/]
```

### Complete Task
**Command**: `todo complete 123`

**Response Format**:
```
[green]Completed:[/] "task description"
```

### Error Handling
**Error Format**:
```
[red]Error:[/] Invalid task ID or command syntax
[italic]Hint: Use 'todo help' for available commands[/]
```

## Styling Specifications

### Colors
- **Green**: Completed tasks, success messages
- **Red**: Overdue tasks, errors, urgent items
- **Yellow**: Pending tasks, warnings, new additions
- **Blue**: Informational text, IDs
- **Cyan**: Headers and labels
- **Magenta**: Task content

### Symbols
- **✓**: Completed tasks
- **○**: Pending tasks
- **⚠**: Overdue tasks
- **★**: High priority tasks
- **☆**: Low priority tasks

## Accessibility Features
- Sufficient color contrast ratios
- Symbol alternatives for color-blind users
- Plain text fallback when colors not supported