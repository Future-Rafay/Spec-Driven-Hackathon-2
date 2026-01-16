"""
Application entry point and command loop.
"""

import sys
import os
# Add the src directory to the path to allow imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from storage import TodoStorage
from commands import CommandParser
from lib.task_formatter import TaskFormatter
from lib.styler import RichStyler


def main():
    """
    Main application function that runs the command loop.
    """
    # Initialize the styling components
    styler = RichStyler()
    formatter = TaskFormatter(styler)

    styler.print_status_message("Welcome to the In-Memory Console Todo App!", 'info')
    styler.print_status_message("Type 'help' for available commands or 'exit' to quit.", 'info')
    print()  # Empty line for spacing

    storage = TodoStorage()
    parser = CommandParser()

    while True:
        try:
            user_input = input("> ").strip()

            if not user_input:
                continue

            parsed = parser.parse_command(user_input)
            action = parsed['action']
            args = parsed['args']

            if action == 'add':
                handle_add(storage, args, styler)
            elif action == 'view':
                handle_view(storage, formatter)
            elif action == 'complete':
                handle_complete(storage, args, styler)
            elif action == 'update':
                handle_update(storage, args, styler)
            elif action == 'delete':
                handle_delete(storage, args, styler)
            elif action == 'help':
                handle_help(styler)
            elif action == 'theme':
                handle_theme(storage, args, styler, formatter)
            elif action == 'exit':
                styler.print_status_message("Goodbye!", 'info')
                break
            else:
                styler.print_status_message(f"Invalid command: '{user_input}'. Type 'help' for available commands.", 'error')

        except KeyboardInterrupt:
            styler.print_status_message("\nGoodbye!", 'info')
            break
        except EOFError:
            styler.print_status_message("\nGoodbye!", 'info')
            break


def handle_add(storage, args, styler):
    """
    Handle the add command.

    Args:
        storage (TodoStorage): The storage instance
        args (list): Arguments for the command (title, priority)
        styler (RichStyler): The styler instance for output
    """
    if not args or not args[0].strip():
        styler.print_status_message("Error: Please provide a task description. Usage: add 'task description' [priority]", 'error')
        return

    title = args[0].strip()
    if not title:
        styler.print_status_message("Error: Task description cannot be empty.", 'error')
        return

    # Get priority from args (second parameter, default to 'normal')
    priority = args[1] if len(args) > 1 else 'normal'

    # Validate priority
    if priority not in ['high', 'normal', 'low']:
        priority = 'normal'

    todo = storage.add_todo(title, priority)
    styler.print_status_message(f"Added todo #{todo.id}: {todo.title} [{'Complete' if todo.completed else 'Incomplete'}] (Priority: {todo.priority})", 'success')


def handle_view(storage, formatter):
    """
    Handle the view command.

    Args:
        storage (TodoStorage): The storage instance
        formatter (TaskFormatter): The formatter instance for styled output
    """
    todos = storage.get_all_todos()

    if not todos:
        formatter.print_empty_list_message()
        return

    formatter.print_tasks_list(todos)


def handle_complete(storage, args, styler):
    """
    Handle the complete command.

    Args:
        storage (TodoStorage): The storage instance
        args (list): Arguments for the command
        styler (RichStyler): The styler instance for output
    """
    if not args:
        styler.print_status_message("Error: Please provide a todo ID. Usage: complete <id>", 'error')
        return

    todo_id = args[0]
    todo = storage.get_todo(todo_id)

    if not todo:
        styler.print_status_message(f"Error: Todo with ID {todo_id} not found.", 'error')
        return

    storage.complete_todo(todo_id)
    styler.print_status_message(f"Todo #{todo_id} marked as complete: {todo.title}", 'success')


def handle_update(storage, args, styler):
    """
    Handle the update command.

    Args:
        storage (TodoStorage): The storage instance
        args (list): Arguments for the command
        styler (RichStyler): The styler instance for output
    """
    if len(args) < 2:
        styler.print_status_message("Error: Please provide both ID and new description. Usage: update <id> 'new description'", 'error')
        return

    todo_id = args[0]
    new_title = args[1]

    if not new_title.strip():
        styler.print_status_message("Error: New description cannot be empty.", 'error')
        return

    todo = storage.get_todo(todo_id)

    if not todo:
        styler.print_status_message(f"Error: Todo with ID {todo_id} not found.", 'error')
        return

    storage.update_todo(todo_id, title=new_title)
    styler.print_status_message(f"Updated todo #{todo_id}: {new_title} [{'Complete' if todo.completed else 'Incomplete'}]", 'success')


def handle_delete(storage, args, styler):
    """
    Handle the delete command.

    Args:
        storage (TodoStorage): The storage instance
        args (list): Arguments for the command
        styler (RichStyler): The styler instance for output
    """
    if not args:
        styler.print_status_message("Error: Please provide a todo ID. Usage: delete <id>", 'error')
        return

    todo_id = args[0]
    todo = storage.get_todo(todo_id)

    if not todo:
        styler.print_status_message(f"Error: Todo with ID {todo_id} not found.", 'error')
        return

    storage.delete_todo(todo_id)
    styler.print_status_message(f"Deleted todo #{todo_id}: {todo.title}", 'info')


def handle_help(styler):
    """
    Handle the help command.

    Args:
        styler (RichStyler): The styler instance for output
    """
    styler.print_header("Available commands")
    help_text = [
        "  add 'task description' [priority] - Add a new todo (priority: high, normal, low)",
        "  view or list              - View all todos",
        "  complete <id>             - Mark a todo as complete",
        "  update <id> 'description' - Update a todo description",
        "  delete <id>               - Delete a todo",
        "  theme [name]              - Change visual theme or list available themes",
        "  help                      - Show this help message",
        "  exit or quit              - Exit the application"
    ]

    for line in help_text:
        styler.console.print(line)
    print()  # Empty line for spacing


def handle_theme(storage, args, styler, formatter):
    """
    Handle the theme command to change the application's visual theme.

    Args:
        storage (TodoStorage): The storage instance (not used directly here)
        args (list): Arguments for the command (theme name)
        styler (RichStyler): The styler instance for output
        formatter (TaskFormatter): The formatter instance (not used directly here)
    """
    # Import here to avoid circular imports
    from lib.theme import ThemeConfig

    # Initialize theme config if not already initialized
    if not hasattr(handle_theme, 'theme_config'):
        handle_theme.theme_config = ThemeConfig()
        # Load any saved theme preference
        saved_theme = handle_theme.theme_config.load_theme_preference()
        if saved_theme:
            handle_theme.theme_config.set_theme(saved_theme)

    theme_config = handle_theme.theme_config

    if not args:
        # No arguments provided, list available themes
        available_themes = theme_config.get_available_themes()
        styler.print_header("Available Themes")

        current_theme = theme_config.current_theme
        for theme_name in available_themes:
            marker = " (current)" if theme_name == current_theme else ""
            styler.console.print(f"  - {theme_name}{marker}")

        styler.print_status_message(f"\nUsage: theme <theme_name> (current: {current_theme})", 'info')
    else:
        # Attempt to change to the specified theme
        requested_theme = args[0]

        if theme_config.set_theme(requested_theme):
            # Apply the new theme to the styler
            theme_config.apply_theme_to_styler(styler)

            # Save the preference
            theme_config.save_theme_preference(requested_theme)

            styler.print_status_message(f"Theme changed to '{requested_theme}'", 'success')
        else:
            available_themes = theme_config.get_available_themes()
            styler.print_status_message(f"Unknown theme '{requested_theme}'. Available themes: {', '.join(available_themes)}", 'error')


if __name__ == "__main__":
    main()