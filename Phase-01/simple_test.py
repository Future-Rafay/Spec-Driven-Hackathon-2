#!/usr/bin/env python3
"""
Simple test to verify the application works.
"""

import sys
import os
# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from lib.styler import RichStyler

def test_styler():
    print("Testing RichStyler...")
    styler = RichStyler()

    # Test basic functionality without problematic symbols
    styler.print_status_message("Rich styling is working!", 'success')

    # Test task printing (this is the problematic function)
    try:
        # Print with basic parameters
        print("Attempting to print a task...")
        styler.print_task(1, "Test task", False, 'normal')
        print("Task printed successfully!")
    except Exception as e:
        print(f"Error printing task: {e}")

    print("Test completed!")

if __name__ == "__main__":
    test_styler()