"""
Error response schemas for consistent API error handling.
"""
from typing import List, Optional, Any
from enum import Enum
from pydantic import BaseModel


class ErrorCode(str, Enum):
    """Standard error codes for API responses."""

    # Validation Errors
    INVALID_EMAIL = "INVALID_EMAIL"
    WEAK_PASSWORD = "WEAK_PASSWORD"
    VALIDATION_ERROR = "VALIDATION_ERROR"

    # Authentication Errors
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    MISSING_TOKEN = "MISSING_TOKEN"
    INVALID_TOKEN = "INVALID_TOKEN"
    EXPIRED_TOKEN = "EXPIRED_TOKEN"

    # Authorization Errors
    FORBIDDEN = "FORBIDDEN"

    # Resource Errors
    EMAIL_EXISTS = "EMAIL_EXISTS"
    USER_NOT_FOUND = "USER_NOT_FOUND"

    # Server Errors
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"


class ErrorResponse(BaseModel):
    """Standard error response format."""

    detail: str
    error_code: Optional[ErrorCode] = None

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid email or password",
                "error_code": "INVALID_CREDENTIALS"
            }
        }


class ValidationErrorDetail(BaseModel):
    """Detailed validation error information."""

    loc: List[str]
    msg: str
    type: str


class ValidationError(BaseModel):
    """Validation error response with field-level details."""

    detail: List[ValidationErrorDetail]

    class Config:
        json_schema_extra = {
            "example": {
                "detail": [
                    {
                        "loc": ["body", "email"],
                        "msg": "field required",
                        "type": "value_error.missing"
                    },
                    {
                        "loc": ["body", "password"],
                        "msg": "ensure this value has at least 8 characters",
                        "type": "value_error.any_str.min_length"
                    }
                ]
            }
        }
