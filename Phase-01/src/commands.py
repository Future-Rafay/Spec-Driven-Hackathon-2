"""
Command parsing and validation module.
"""

import re


class CommandParser:
    """
    Parses and validates user commands for the todo application.
    """

    def __init__(self):
        """
        Initialize the command parser.
        """
        pass

    def parse_command(self, user_input):
        """
        Parse user input and extract command and arguments.

        Args:
            user_input (str): Raw user input

        Returns:
            dict: Parsed command with 'action' and 'args' keys
        """
        if not user_input.strip():
            return {'action': 'invalid', 'args': []}

        # Split input into parts but respect quoted strings
        parts = self._split_with_quotes(user_input.strip())

        if not parts:
            return {'action': 'invalid', 'args': []}

        action = parts[0].lower()

        if action in ['add']:
            # For add command, we can have title and optional priority
            if len(parts) >= 2:
                title = ' '.join(parts[1:])

                # Check if priority is specified (e.g., "add 'task' high")
                priority = 'normal'  # default priority
                if len(parts) >= 3 and parts[-1].lower() in ['high', 'normal', 'low']:
                    priority = parts[-1].lower()
                    # Remove priority from title
                    title = ' '.join(parts[1:-1])

                # Remove quotes if they were used
                if title.startswith('"') and title.endswith('"') and len(title) > 1:
                    title = title[1:-1]
                elif title.startswith("'") and title.endswith("'") and len(title) > 1:
                    title = title[1:-1]

                return {'action': 'add', 'args': [title, priority]}
            else:
                return {'action': 'invalid', 'args': []}

        elif action in ['view', 'list']:
            return {'action': 'view', 'args': []}

        elif action in ['complete', 'done']:
            if len(parts) == 2 and parts[1].isdigit():
                return {'action': 'complete', 'args': [int(parts[1])]}
            else:
                return {'action': 'invalid', 'args': []}

        elif action in ['update']:
            if len(parts) >= 3 and parts[1].isdigit():
                title = ' '.join(parts[2:])
                # Remove quotes if they were used
                if title.startswith('"') and title.endswith('"') and len(title) > 1:
                    title = title[1:-1]
                elif title.startswith("'") and title.endswith("'") and len(title) > 1:
                    title = title[1:-1]
                return {'action': 'update', 'args': [int(parts[1]), title]}
            else:
                return {'action': 'invalid', 'args': []}

        elif action in ['delete', 'remove']:
            if len(parts) == 2 and parts[1].isdigit():
                return {'action': 'delete', 'args': [int(parts[1])]}
            else:
                return {'action': 'invalid', 'args': []}

        elif action in ['help', 'h']:
            return {'action': 'help', 'args': []}

        elif action in ['theme']:
            if len(parts) >= 2:
                theme_name = parts[1].lower()
                return {'action': 'theme', 'args': [theme_name]}
            else:
                return {'action': 'theme', 'args': []}  # List available themes

        elif action in ['exit', 'quit', 'q']:
            return {'action': 'exit', 'args': []}

        else:
            return {'action': 'invalid', 'args': []}

    def _split_with_quotes(self, text):
        """
        Split text by spaces while respecting quoted strings.

        Args:
            text (str): Text to split

        Returns:
            list: List of parts with quoted strings kept intact
        """
        # Regular expression to match quoted strings or space-separated words
        pattern = r'"([^"]*)"|\'([^\']*)\'|(\S+)'
        matches = re.findall(pattern, text)
        # Each match is a tuple with 3 groups, only one will be non-empty
        return [match[0] or match[1] or match[2] for match in matches]