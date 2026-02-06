"""
Input validation utilities for email and password validation.
"""
import re
from typing import Set
from email_validator import validate_email, EmailNotValidError


# Common passwords to reject (subset - load from file in production)
COMMON_PASSWORDS: Set[str] = {
    "password", "123456", "12345678", "qwerty", "abc123",
    "monkey", "1234567", "letmein", "trustno1", "dragon",
    "baseball", "iloveyou", "master", "sunshine", "ashley",
    "bailey", "passw0rd", "shadow", "123123", "654321"
}


def validate_user_email(email: str) -> str:
    """
    Validate and normalize email address.

    Args:
        email: Email address to validate

    Returns:
        Normalized email address (lowercase)

    Raises:
        ValueError: If email format is invalid
    """
    if not email or not email.strip():
        raise ValueError("Email is required")

    try:
        # Validate email format using email-validator library
        validated = validate_email(email, check_deliverability=False)
        # Return normalized (lowercase) email
        return validated.normalized.lower()
    except EmailNotValidError as e:
        raise ValueError(f"Invalid email format: {str(e)}")


def validate_password(password: str) -> None:
    """
    Validate password meets security requirements.

    Requirements:
    - Minimum 8 characters
    - Maximum 128 characters
    - At least one lowercase letter (a-z)
    - At least one uppercase letter (A-Z)
    - At least one digit (0-9)
    - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
    - Not in common passwords list

    Args:
        password: Password to validate

    Raises:
        ValueError: If password doesn't meet requirements (with specific message)
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
        raise ValueError(
            "Password must contain at least one special character "
            "(!@#$%^&*()_+-=[]{}|;:,.<>?)"
        )

    if password.lower() in COMMON_PASSWORDS:
        raise ValueError(
            "Password is too common, please choose a stronger password"
        )
