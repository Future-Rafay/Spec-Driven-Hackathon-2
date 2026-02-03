# Research: In-Memory Console Todo App

## Decision: Python CLI Architecture
**Rationale**: Following the specified architecture of command loop → command parser → business logic → state update → output. This provides a clean separation of concerns while maintaining simplicity.

**Alternatives considered**:
- Monolithic approach (everything in one file) - rejected for maintainability
- Framework-based approach (using Click, Typer, etc.) - rejected as it violates "standard library only" constraint

## Decision: In-Memory Data Structure
**Rationale**: Using a dictionary for O(1) lookup by ID with a separate counter for generating unique IDs. This meets the in-memory requirement while providing efficient operations.

**Alternatives considered**:
- List-based storage - less efficient for updates/deletes by ID
- Class-based model with static methods - overkill for Phase I simplicity

## Decision: Command Format
**Rationale**: Using simple verb-noun format (e.g., "add 'task'", "complete 1", "view all") that's intuitive for users and easy to parse with string operations.

**Alternatives considered**:
- Subcommand format (argparse-style) - more complex parsing
- Natural language processing - violates "deterministic" requirement
- Positional arguments only - less flexible

## Decision: Error Handling Approach
**Rationale**: Graceful error handling with clear, user-friendly messages that don't crash the application. Using try-except blocks for ID lookups and input validation.

**Alternatives considered**:
- Silent failures - poor user experience
- Hard crashes - not robust
- Generic error messages - not helpful