# Data Model: Authentication & Identity Layer

**Feature**: Authentication & Identity Layer
**Branch**: `1-auth`
**Date**: 2026-02-04
**Phase**: Phase 1 - Design

## Overview

This document defines the data entities, fields, validation rules, and relationships for the authentication system. All entities will be implemented using SQLModel (Pydantic + SQLAlchemy) and stored in Neon Serverless PostgreSQL.

---

## Entity: User

### Purpose

Represents an individual user account in the system. Each user has unique credentials and owns zero or more tasks (to be defined in future task management feature).

### Fields

| Field Name | Type | Constraints | Description |
|------------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4() | Unique identifier for the user |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | User's email address (used for authentication) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt-hashed password (never store plain text) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `last_signin_at` | TIMESTAMP | NULLABLE | Last successful sign-in timestamp |

### SQLModel Definition

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

class User(SQLModel, table=True):
    """User entity for authentication and identity management"""

    __tablename__ = "users"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique user identifier"
    )

    email: str = Field(
        max_length=255,
        unique=True,
        index=True,
        nullable=False,
        description="User email address (unique, case-insensitive)"
    )

    password_hash: str = Field(
        max_length=255,
        nullable=False,
        description="Bcrypt-hashed password"
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Account creation timestamp"
    )

    last_signin_at: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="Last successful sign-in timestamp"
    )
```

### Validation Rules

#### Email Validation (FR-002)

- **Format**: Must match standard email regex pattern
- **Case Sensitivity**: Stored and compared in lowercase
- **Uniqueness**: Must be unique across all users
- **Length**: Maximum 255 characters
- **Required**: Cannot be null or empty

**Validation Logic**:
```python
import re
from email_validator import validate_email, EmailNotValidError

def validate_user_email(email: str) -> str:
    """
    Validate and normalize email address.

    Returns: Normalized email (lowercase)
    Raises: ValueError if invalid
    """
    if not email or not email.strip():
        raise ValueError("Email is required")

    try:
        # Validate email format
        validated = validate_email(email, check_deliverability=False)
        # Return normalized (lowercase) email
        return validated.normalized.lower()
    except EmailNotValidError as e:
        raise ValueError(f"Invalid email format: {str(e)}")
```

#### Password Validation (FR-003)

- **Minimum Length**: 8 characters
- **Maximum Length**: 128 characters (before hashing)
- **Complexity Requirements**:
  - At least one lowercase letter (a-z)
  - At least one uppercase letter (A-Z)
  - At least one digit (0-9)
  - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- **Prohibited**: Common passwords (check against top 10,000 list)
- **Required**: Cannot be null or empty

**Validation Logic**:
```python
import re
from typing import List

COMMON_PASSWORDS = set([
    "password", "123456", "12345678", "qwerty", "abc123",
    "monkey", "1234567", "letmein", "trustno1", "dragon"
    # ... load from file in production
])

def validate_password(password: str) -> None:
    """
    Validate password meets security requirements.

    Raises: ValueError with specific requirement that failed
    """
    if not password:
        raise ValueError("Password is required")

    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")

    if len(password) > 128:
        raise ValueError("Password must not exceed 128 characters")

    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")

    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")

    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit")

    if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]", password):
        raise ValueError("Password must contain at least one special character")

    if password.lower() in COMMON_PASSWORDS:
        raise ValueError("Password is too common, please choose a stronger password")
```

#### Duplicate Email Prevention (FR-004)

- **Database Constraint**: UNIQUE constraint on email column
- **Application Logic**: Check for existing email before insertion
- **Error Handling**: Return clear error message (HTTP 409 Conflict)

**Check Logic**:
```python
from sqlmodel import Session, select

async def check_email_exists(session: Session, email: str) -> bool:
    """Check if email already exists in database"""
    normalized_email = email.lower()
    statement = select(User).where(User.email == normalized_email)
    result = await session.exec(statement)
    return result.first() is not None
```

### Password Hashing (FR-017, SR-001)

#### Hashing Configuration

- **Algorithm**: bcrypt
- **Work Factor**: 12 rounds (recommended for 2026)
- **Salt**: Automatically generated by bcrypt (unique per password)
- **Hash Length**: 60 characters (bcrypt standard)

**Implementation**:
```python
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
    bcrypt__ident="2b"
)

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash (timing-attack resistant)"""
    return pwd_context.verify(plain_password, hashed_password)
```

### Indexes

```sql
-- Primary key index (automatic)
CREATE UNIQUE INDEX idx_users_id ON users(id);

-- Email uniqueness and lookup performance
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Optional: Query performance for signin timestamp
CREATE INDEX idx_users_last_signin ON users(last_signin_at);
```

### Relationships

#### Current Feature (1-auth)

No relationships defined in this feature. User entity is standalone.

#### Future Features

- **User → Tasks** (one-to-many): Each user owns zero or more tasks
  - Foreign key: `tasks.user_id` references `users.id`
  - Cascade delete: When user deleted, all their tasks are deleted
  - Defined in future task management feature specification

### Database Migration

#### Initial Schema Creation

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_signin_at TIMESTAMP NULL
);

-- Create indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_signin ON users(last_signin_at);
```

#### SQLModel Migration (Alembic)

```python
# migrations/versions/001_create_users_table.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('last_signin_at', sa.DateTime(), nullable=True)
    )

    op.create_index('idx_users_email', 'users', ['email'], unique=True)
    op.create_index('idx_users_last_signin', 'users', ['last_signin_at'])

def downgrade():
    op.drop_index('idx_users_last_signin', 'users')
    op.drop_index('idx_users_email', 'users')
    op.drop_table('users')
```

---

## Data Transfer Objects (DTOs)

### UserCreate (Request)

Used for user registration (POST /api/auth/signup).

```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    """User registration request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=128, description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }
```

### UserSignIn (Request)

Used for user authentication (POST /api/auth/signin).

```python
class UserSignIn(BaseModel):
    """User sign-in request"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }
```

### UserResponse (Response)

Used for returning user information (excludes password_hash).

```python
from uuid import UUID
from datetime import datetime

class UserResponse(BaseModel):
    """User information response (no sensitive data)"""
    id: UUID = Field(..., description="User unique identifier")
    email: str = Field(..., description="User email address")
    created_at: datetime = Field(..., description="Account creation timestamp")
    last_signin_at: Optional[datetime] = Field(None, description="Last sign-in timestamp")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "created_at": "2026-02-04T10:30:00Z",
                "last_signin_at": "2026-02-04T15:45:00Z"
            }
        }
```

### AuthToken (Response)

Used for returning JWT token after successful authentication.

```python
class AuthToken(BaseModel):
    """Authentication token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiry in seconds")
    user: UserResponse = Field(..., description="Authenticated user information")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 604800,
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "email": "user@example.com",
                    "created_at": "2026-02-04T10:30:00Z",
                    "last_signin_at": "2026-02-04T15:45:00Z"
                }
            }
        }
```

---

## State Transitions

### User Account Lifecycle

```
┌─────────────┐
│   No Account│
└──────┬──────┘
       │
       │ POST /api/auth/signup
       │ (email + password)
       ▼
┌─────────────┐
│  Registered │
│ (Active)    │
└──────┬──────┘
       │
       │ POST /api/auth/signin
       │ (email + password)
       ▼
┌─────────────┐
│Authenticated│
│ (JWT issued)│
└──────┬──────┘
       │
       │ JWT expires (7 days)
       │ or user signs out
       ▼
┌─────────────┐
│ Registered  │
│ (Active)    │
└─────────────┘
```

**States**:
1. **No Account**: User does not exist in database
2. **Registered (Active)**: User account exists, can sign in
3. **Authenticated**: User has valid JWT token, can access protected resources

**Transitions**:
- **Registration**: No Account → Registered (creates user record)
- **Sign In**: Registered → Authenticated (issues JWT)
- **Token Expiry**: Authenticated → Registered (JWT expires, user must sign in again)
- **Sign Out**: Authenticated → Registered (client discards JWT)

**Out of Scope** (future features):
- Account deactivation/suspension
- Account deletion
- Email verification (unverified → verified)
- Password reset flow

---

## Data Integrity Rules

### Enforced at Database Level

1. **Primary Key**: `id` must be unique and not null
2. **Email Uniqueness**: `email` must be unique across all users
3. **Required Fields**: `id`, `email`, `password_hash`, `created_at` cannot be null

### Enforced at Application Level

1. **Email Format**: Must be valid email address
2. **Email Normalization**: Always stored in lowercase
3. **Password Complexity**: Must meet security requirements before hashing
4. **Password Hashing**: Never store plain text passwords
5. **Timestamp Accuracy**: Use UTC for all timestamps

### Security Rules (SR-001 to SR-006)

1. **SR-001**: Passwords stored as bcrypt hashes only (never plain text or reversible encryption)
2. **SR-002**: Password hash never exposed in API responses
3. **SR-003**: User ID extracted from verified JWT only (never from client input)
4. **SR-006**: Password verification uses timing-attack resistant comparison (bcrypt.verify)

---

## Performance Considerations

### Query Optimization

- **Email Lookup**: Indexed for O(log n) lookup during sign-in
- **User ID Lookup**: Primary key index for O(1) lookup
- **Connection Pooling**: Use Neon's connection pooling for FastAPI

### Expected Load

- **Users**: Support for unlimited users (scalable with Neon)
- **Sign-in Frequency**: Assume average user signs in once per day
- **Registration Rate**: Assume 100 new users per day initially
- **Query Performance**: Email lookup <10ms, password verification ~250ms (bcrypt)

---

## Testing Considerations

### Unit Tests

- Email validation (valid/invalid formats)
- Password validation (all complexity rules)
- Password hashing (verify hash generation and verification)
- Duplicate email detection

### Integration Tests

- User creation with valid data
- User creation with duplicate email (expect 409)
- User creation with invalid email (expect 400)
- User creation with weak password (expect 400)
- Sign-in with correct credentials (expect 200 + JWT)
- Sign-in with incorrect password (expect 401)
- Sign-in with non-existent email (expect 401)

### Contract Tests

- User entity matches OpenAPI schema
- DTOs serialize/deserialize correctly
- Database schema matches SQLModel definition

---

## Next Steps

1. ✅ Data model defined
2. ⏭️ Create API contracts (contracts/auth-api.yaml)
3. ⏭️ Create quickstart guide (quickstart.md)
4. ⏭️ Generate implementation tasks (/sp.tasks)
