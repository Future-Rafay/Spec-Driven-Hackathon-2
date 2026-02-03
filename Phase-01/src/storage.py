"""
In-memory state container module.
"""

from todos import Todo


class TodoStorage:
    """
    Manages in-memory storage for todos with ID assignment.
    """

    def __init__(self):
        """
        Initialize the storage with an empty collection and ID counter.
        """
        self.todos = {}  # Dictionary with ID as key, Todo object as value
        self.next_id = 1  # Counter for generating unique IDs

    def add_todo(self, title, priority='normal', due_date=None):
        """
        Add a new todo with a unique ID.

        Args:
            title (str): Description of the task
            priority (str): Priority level ('high', 'normal', 'low') (default: 'normal')
            due_date (Optional[date]): Due date for the task (default: None)

        Returns:
            Todo: The created Todo object
        """
        todo = Todo(id=self.next_id, title=title, completed=False, priority=priority, due_date=due_date)
        self.todos[self.next_id] = todo
        self.next_id += 1
        return todo

    def get_todo(self, todo_id):
        """
        Retrieve a specific todo by ID.

        Args:
            todo_id (int): ID of the todo to retrieve

        Returns:
            Todo: The requested Todo object or None if not found
        """
        return self.todos.get(todo_id)

    def get_all_todos(self):
        """
        Retrieve all todos in the storage.

        Returns:
            list: List of all Todo objects
        """
        return list(self.todos.values())

    def update_todo(self, todo_id, title=None, completed=None, priority=None, due_date=None):
        """
        Update an existing todo's properties.

        Args:
            todo_id (int): ID of the todo to update
            title (str, optional): New title for the todo
            completed (bool, optional): New completion status
            priority (str, optional): New priority for the todo
            due_date (Optional[date], optional): New due date for the todo

        Returns:
            Todo: Updated Todo object or None if not found
        """
        if todo_id not in self.todos:
            return None

        todo = self.todos[todo_id]
        if title is not None:
            todo.title = title
        if completed is not None:
            todo.completed = completed
        if priority is not None:
            todo.priority = priority
        if due_date is not None:
            todo.due_date = due_date
        return todo

    def complete_todo(self, todo_id):
        """
        Mark a todo as completed.

        Args:
            todo_id (int): ID of the todo to mark as complete

        Returns:
            Todo: Updated Todo object or None if not found
        """
        return self.update_todo(todo_id, completed=True)

    def delete_todo(self, todo_id):
        """
        Remove a todo by ID.

        Args:
            todo_id (int): ID of the todo to delete

        Returns:
            bool: True if deleted, False if not found
        """
        if todo_id in self.todos:
            del self.todos[todo_id]
            return True
        return False

    def get_next_id(self):
        """
        Get the next available ID without consuming it.

        Returns:
            int: The next available ID
        """
        return self.next_id