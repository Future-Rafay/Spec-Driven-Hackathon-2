-- Database Migration: Create Tasks Table
-- Version: 002
-- Description: Task management with user ownership and completion tracking
-- Dependencies: 001_create_users_table.sql (users table must exist)

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE tasks IS 'User todo tasks with ownership and completion tracking';
COMMENT ON COLUMN tasks.id IS 'Unique task identifier (UUID)';
COMMENT ON COLUMN tasks.title IS 'Task title (required, max 500 chars, cannot be empty)';
COMMENT ON COLUMN tasks.description IS 'Optional task description (unlimited length)';
COMMENT ON COLUMN tasks.completed IS 'Task completion status (default false)';
COMMENT ON COLUMN tasks.user_id IS 'Owner user ID (foreign key to users.id, immutable)';
COMMENT ON COLUMN tasks.created_at IS 'Task creation timestamp (UTC, immutable)';
COMMENT ON COLUMN tasks.updated_at IS 'Last update timestamp (UTC, auto-updated)';

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
