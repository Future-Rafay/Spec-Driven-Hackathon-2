"""
Todo model and business logic module.
"""

from datetime import datetime, date
from typing import Optional


class Todo:
    """
    Represents a single todo task with id, title, completion status, priority, and due date.
    """

    def __init__(self, id, title, completed=False, priority='normal', due_date: Optional[date] = None):
        """
        Initialize a Todo object.

        Args:
            id (int): Unique identifier for the todo
            title (str): Description of the task
            completed (bool): Completion status (default: False)
            priority (str): Priority level ('high', 'normal', 'low') (default: 'normal')
            due_date (Optional[date]): Due date for the task (default: None)
        """
        self.id = id
        self.title = title
        self.completed = completed
        self.priority = priority
        self.due_date = due_date

    def __repr__(self):
        """
        String representation of the Todo object.
        """
        status = "x" if self.completed else " "
        return f"[{status}] {self.title}"

    def is_overdue(self) -> bool:
        """
        Check if the task is overdue (not completed and past due date).

        Returns:
            bool: True if the task is overdue, False otherwise
        """
        if self.completed or not self.due_date:
            return False

        today = date.today()
        return self.due_date < today

    def to_dict(self):
        """
        Convert the Todo object to a dictionary.

        Returns:
            dict: Dictionary representation of the Todo
        """
        return {
            "id": self.id,
            "title": self.title,
            "completed": self.completed,
            "priority": self.priority,
            "due_date": self.due_date.isoformat() if self.due_date else None
        }