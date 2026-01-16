"""
Theme handling module for the todo app.
"""

from .lib.styler import RichStyler
from .lib.theme import ThemeConfig


def handle_theme(storage, args, styler: RichStyler, formatter):
    """
    Handle the theme command to change the application's visual theme.

    Args:
        storage (TodoStorage): The storage instance (not used directly here)
        args (list): Arguments for the command (theme name)
        styler (RichStyler): The styler instance for output
        formatter (TaskFormatter): The formatter instance (not used directly here)
    """
    # Initialize theme config if not already initialized
    if not hasattr(handle_theme, 'theme_config'):
        handle_theme.theme_config = ThemeConfig()

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