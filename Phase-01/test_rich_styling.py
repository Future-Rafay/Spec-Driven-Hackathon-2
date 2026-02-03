#!/usr/bin/env python3
"""
Simple test script to validate rich styling functionality.
"""

import sys
import os
# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from lib.styler import RichStyler
from lib.theme import ThemeConfig

def test_basic_styling():
    """Test basic rich styling functionality."""
    print("Testing basic rich styling...")
    styler = RichStyler()

    # Test different status messages
    styler.print_status_message("This is an info message", 'info')
    styler.print_status_message("This is a success message", 'success')
    styler.print_status_message("This is a warning message", 'warning')
    styler.print_status_message("This is an error message", 'error')

    print("\nTesting task styling...")
    # Test task styling
    styler.print_task(1, "Sample task", False, 'normal')
    styler.print_task(2, "High priority task", False, 'high')
    styler.print_task(3, "Low priority task", False, 'low')
    styler.print_task(4, "Completed task", True, 'normal')

    print("\nTesting overdue task styling...")
    # Test overdue task styling
    styler.print_task(5, "Overdue task", False, 'normal', is_overdue=True)

def test_themes():
    """Test theme functionality."""
    print("\n\nTesting themes...")
    styler = RichStyler()
    theme_config = ThemeConfig()

    print("Available themes:", theme_config.get_available_themes())

    # Apply a different theme
    if theme_config.set_theme('dark'):
        theme_config.apply_theme_to_styler(styler)
        styler.print_status_message("Switched to dark theme", 'success')

        # Test with the new theme
        styler.print_task(6, "Dark theme task", False, 'high')

def test_no_color_mode():
    """Test no-color mode."""
    print("\n\nTesting no-color mode...")
    styler = RichStyler(force_plain=True)

    styler.print_status_message("This is a message in no-color mode", 'info')
    styler.print_task(7, "No-color task", False, 'normal')

if __name__ == "__main__":
    test_basic_styling()
    test_themes()
    test_no_color_mode()
    print("\nAll tests completed successfully!")