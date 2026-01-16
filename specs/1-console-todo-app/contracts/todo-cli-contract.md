# API Contract: Todo Operations

## Command-Line Interface Contract

### Add Todo
- **Command**: `add "task description"`
- **Input**: String containing the task description (quoted to handle spaces)
- **Output**: Confirmation message with assigned ID
- **Success**: Todo added to in-memory store with unique ID
- **Error cases**: Empty description, system unable to assign ID

### View Todos
- **Command**: `view` or `list`
- **Input**: None
- **Output**: Formatted list of all todos with ID, status, and description
- **Success**: All todos displayed in readable format
- **Error cases**: None (empty list is valid output)

### Complete Todo
- **Command**: `complete <id>`
- **Input**: Integer ID of the todo to complete
- **Output**: Confirmation message of completion
- **Success**: Todo marked as completed in the system
- **Error cases**: Invalid ID, ID does not exist

### Update Todo
- **Command**: `update <id> "new description"`
- **Input**: Integer ID and new description string
- **Output**: Confirmation message of update
- **Success**: Todo description updated in the system
- **Error cases**: Invalid ID, ID does not exist, empty description

### Delete Todo
- **Command**: `delete <id>`
- **Input**: Integer ID of the todo to delete
- **Output**: Confirmation message of deletion
- **Success**: Todo removed from the system
- **Error cases**: Invalid ID, ID does not exist

### Help
- **Command**: `help`
- **Input**: None
- **Output**: List of available commands with brief descriptions
- **Success**: Help information displayed
- **Error cases**: None

### Exit
- **Command**: `exit` or `quit`
- **Input**: None
- **Output**: Goodbye message
- **Success**: Application terminates gracefully
- **Error cases**: None