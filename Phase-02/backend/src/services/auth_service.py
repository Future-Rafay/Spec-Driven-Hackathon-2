"""
Authentication service layer.
Handles business logic for user registration and authentication.
"""
from datetime import datetime
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException, status
import logging

from ..models.user import User, UserCreate, UserResponse, UserSignIn, AuthToken
from ..models.errors import ErrorCode
from ..core.security import hash_password, verify_password, create_access_token
from ..core.validators import validate_user_email, validate_password

logger = logging.getLogger(__name__)


async def check_email_exists(session: AsyncSession, email: str) -> bool:
    """
    Check if an email address already exists in the database.

    Args:
        session: Database session
        email: Email address to check (will be normalized to lowercase)

    Returns:
        True if email exists, False otherwise
    """
    normalized_email = email.lower().strip()
    statement = select(User).where(User.email == normalized_email)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()
    return user is not None


async def signup(session: AsyncSession, user_data: UserCreate) -> UserResponse:
    """
    Register a new user account.

    Validates email and password, checks for duplicates, hashes password,
    and creates user in database.

    Args:
        session: Database session
        user_data: User registration data (email and password)

    Returns:
        UserResponse with created user information (no password)

    Raises:
        HTTPException 400: If email or password validation fails
        HTTPException 409: If email already exists
    """
    # Validate email format
    try:
        validated_email = validate_user_email(user_data.email)
    except ValueError as e:
        logger.warning(f"Signup failed - invalid email format: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Validate password complexity
    try:
        validate_password(user_data.password)
    except ValueError as e:
        logger.warning(f"Signup failed - weak password for email: {validated_email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Check if email already exists
    if await check_email_exists(session, validated_email):
        logger.warning(f"Signup failed - email already registered: {validated_email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Hash password
    password_hash = hash_password(user_data.password)

    # Create new user
    new_user = User(
        email=validated_email,
        password_hash=password_hash,
        created_at=datetime.utcnow(),
        last_signin_at=None
    )

    # Save to database
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    logger.info(f"Signup successful - new user created: {validated_email} (ID: {new_user.id})")

    # Return user response (excludes password_hash)
    return UserResponse.model_validate(new_user)


async def signin(session: AsyncSession, signin_data: UserSignIn) -> AuthToken:
    """
    Authenticate user and generate JWT token.

    Verifies credentials, updates last sign-in timestamp, and generates
    JWT token with 7-day expiry.

    Args:
        session: Database session
        signin_data: User sign-in data (email and password)

    Returns:
        AuthToken with JWT and user information

    Raises:
        HTTPException 401: If credentials are invalid (generic message for security)
    """
    # Normalize email for case-insensitive lookup
    normalized_email = signin_data.email.lower().strip()

    # Find user by email
    statement = select(User).where(User.email == normalized_email)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    # Generic error message for security (don't reveal if email exists)
    invalid_credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password"
    )

    if not user:
        logger.warning(f"Signin failed - user not found: {normalized_email}")
        raise invalid_credentials_error

    # Verify password (timing-attack resistant)
    if not verify_password(signin_data.password, user.password_hash):
        logger.warning(f"Signin failed - invalid password for user: {normalized_email}")
        raise invalid_credentials_error

    # Update last sign-in timestamp
    user.last_signin_at = datetime.utcnow()
    session.add(user)
    await session.commit()
    await session.refresh(user)

    # Generate JWT token with 7-day expiry
    token_payload = {
        "id": str(user.id),
        "email": user.email
    }
    access_token = create_access_token(token_payload)

    logger.info(f"Signin successful - user authenticated: {user.email} (ID: {user.id})")

    # Return auth token response
    return AuthToken(
        access_token=access_token,
        token_type="bearer",
        expires_in=604800,  # 7 days in seconds
        user=UserResponse.model_validate(user)
    )
