# Quickstart Guide: Rich Library Styling Implementation

## Installation

```bash
pip install -r requirements.txt
```

## Running the Application

```bash
python src/main.py
```

## Using the Styled Features

1. **View tasks with styling**:
   - Run `view` or `list` to see tasks with colored output
   - Completed tasks appear in green (✓)
   - Pending tasks appear in yellow (○)
   - Overdue tasks appear in red (⚠)
   - Priority indicators: ★ for high priority, ☆ for low priority

2. **Add tasks with priority**:
   ```bash
   add "My task" high    # High priority task
   add "Normal task"     # Normal priority (default)
   add "Low priority" low # Low priority task
   ```

3. **Change themes**:
   ```bash
   theme                 # List available themes
   theme dark            # Switch to dark theme
   theme light           # Switch to light theme
   theme high_contrast   # Switch to high contrast theme
   ```

4. **Accessibility features**:
   - Set `NO_COLOR=1` environment variable to disable colors
   - The app will still show symbols (✓, ○, ⚠) even without colors
   - High contrast theme available for better visibility

## Example Session

```
> add "Complete project" high
Added todo #1: Complete project [Incomplete] (Priority: high)

> add "Buy groceries"
Added todo #1: Buy groceries [Incomplete] (Priority: normal)

> view
Todo List
============================================================
1. [yellow]○[/yellow] [bright_red]★[/bright_red] Complete project
2. [yellow]○[/yellow]  Buy groceries

> complete 1
Todo #1 marked as complete: Complete project

> view
Todo List
============================================================
1. [green]✓[/green] [bright_red]★[/bright_red] Complete project
2. [yellow]○[/yellow]  Buy groceries

> theme dark
Theme changed to 'dark'
```

## Environment Configuration

Set environment variable to disable colors:
```bash
export NO_COLOR=1
```

Or programmatically:
```python
import os
os.environ["NO_COLOR"] = "1"
```