-- Database Migration: Create Users Table
-- Version: 001
-- Description: Initial schema for authentication system

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_signin_at TIMESTAMP NULL
);

-- Create indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_last_signin ON users(last_signin_at);

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts for authentication and identity management';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN users.email IS 'User email address (unique, case-insensitive)';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt-hashed password (never plain text)';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp (UTC)';
COMMENT ON COLUMN users.last_signin_at IS 'Last successful sign-in timestamp (UTC)';
