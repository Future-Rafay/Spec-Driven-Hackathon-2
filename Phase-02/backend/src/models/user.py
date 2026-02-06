"""
User model and DTOs for authentication system.
Defines database schema and data transfer objects.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String
from sqlalchemy import Index
from pydantic import EmailStr, field_validator


class User(SQLModel, table=True):
    """
    User entity for authentication and identity management.
    Stores user credentials and authentication metadata.
    """

    __tablename__ = "users"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique user identifier"
    )

    email: str = Field(
        sa_column=Column(String(255), unique=True, index=True, nullable=False),
        description="User email address (unique, case-insensitive)"
    )

    password_hash: str = Field(
        sa_column=Column(String(255), nullable=False),
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

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalize email to lowercase for case-insensitive comparison."""
        if isinstance(v, str):
            return v.lower().strip()
        return v


# Data Transfer Objects (DTOs)

class UserCreate(SQLModel):
    """User registration request DTO."""

    email: EmailStr = Field(
        ...,
        description="User email address",
        max_length=255
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password (8-128 characters)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }


class UserSignIn(SQLModel):
    """User sign-in request DTO."""

    email: EmailStr = Field(
        ...,
        description="User email address"
    )
    password: str = Field(
        ...,
        description="User password"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }


class UserResponse(SQLModel):
    """User information response DTO (excludes sensitive data)."""

    id: UUID = Field(..., description="User unique identifier")
    email: str = Field(..., description="User email address")
    created_at: datetime = Field(..., description="Account creation timestamp")
    last_signin_at: Optional[datetime] = Field(
        None,
        description="Last sign-in timestamp"
    )

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


class AuthToken(SQLModel):
    """Authentication token response DTO."""

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
