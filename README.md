# In-Memory Console Todo App with Rich Styling

A simple console-based todo application that stores all data in memory. This application allows users to manage their tasks through a command-line interface without any persistence to files or databases. Enhanced with rich styling for improved visual experience.

## Features

- Add new todo tasks
- View all existing tasks
- Mark tasks as complete
- Update task descriptions
- Delete tasks
- **NEW: Rich styling** - Colorful output with different colors based on status and priority
- **NEW: Visual indicators** - Status symbols (✓, ○, ⚠) and priority symbols (★, ☆) for better visual scanning
- **NEW: Theme support** - Multiple visual themes (default, dark, light, high_contrast)
- **NEW: Priority levels** - Tasks can be assigned high, normal, or low priority
- **NEW: Overdue detection** - Tasks with past due dates are highlighted
- **NEW: Accessibility** - Graceful degradation to plain text when colors are not supported
- All data stored in memory only (no persistence)

## Requirements

- Python 3.13 or higher
- UV environment manager (optional)
- `rich` library for styling (install via requirements.txt)

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the application:
```bash
python src/main.py
```

Or if using UV:
```bash
uv run src/main.py
```

## Available Commands

- `add "task description" [priority]` - Add a new todo (priority: high, normal, low)
- `view` or `list` - View all todos
- `complete <id>` - Mark a todo as complete
- `update <id> "new description"` - Update a todo description
- `delete <id>` - Delete a todo
- `theme [name]` - Change visual theme or list available themes
- `help` - Show available commands
- `exit` or `quit` - Exit the application

## Example Usage

```
> add "Buy groceries" high
Added todo #1: Buy groceries [Incomplete] (Priority: high)

> add "Walk the dog" normal
Added todo #2: Walk the dog [Incomplete] (Priority: normal)

> view
Todo List
============================================================
1. [red]⚠[/red] [bright_red]★[/bright_red] Buy groceries
2. [yellow]○[/yellow]  Walk the dog

> complete 1
Todo #1 marked as complete: Buy groceries

> view
Todo List
============================================================
1. [green]✓[/green] [bright_red]★[/bright_red] Buy groceries
2. [yellow]○[/yellow]  Walk the dog

> theme dark
Theme changed to 'dark'

> theme
Available Themes
  - default
  - dark (current)
  - light
  - high_contrast

Usage: theme <theme_name> (current: dark)

> exit
Goodbye!
```

## Theme Options

The application supports several themes:
- `default`: Standard color scheme
- `dark`: Dark mode friendly colors
- `light`: Light mode optimized colors
- `high_contrast`: High contrast colors for accessibility

## Accessibility

The application includes several accessibility features:
- **Color blind friendly**: Uses symbols in addition to colors to convey status information (✓, ○, ⚠, ★, ☆)
- **High contrast theme**: A high contrast theme is available for users with visual impairments
- **Graceful degradation**: When colors are not supported (via NO_COLOR environment variable or terminal limitations), the application falls back to text-based symbols
- **Terminal compatibility**: Works in environments without color support

## Environment Variables

- `NO_COLOR`: When set, disables colored output for terminals that don't support it

## Architecture

The application follows a modular design with clear separation of concerns:

- `main.py` - Application entry point and command loop
- `commands.py` - Command parsing and validation
- `todos.py` - Todo model and business logic
- `storage.py` - In-memory state management
- `lib/styler.py` - Rich styling wrapper
- `lib/theme.py` - Theme configuration
- `lib/task_formatter.py` - Task display formatter

## Limitations

- All data is stored in memory only and will be lost when the application exits
- No external dependencies beyond Python standard library and rich library
- Single-user, single-session application