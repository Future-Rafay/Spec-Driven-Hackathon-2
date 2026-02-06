"""
Authentication and security utilities for JWT and password management.
Implements secure password hashing and JWT token operations.
"""
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from passlib.context import CryptContext
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel.ext.asyncio.session import AsyncSession
import logging

from .config import settings
from .database import get_session

logger = logging.getLogger(__name__)

# Password hashing context with bcrypt
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,  # 12 rounds for security (2026 standard)
    bcrypt__ident="2b"  # Use bcrypt variant 2b (most secure)
)

# HTTP Bearer security scheme
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt with 12 rounds.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    Uses timing-attack resistant comparison.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against

    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT access token with 7-day expiry.

    Args:
        data: Payload data to encode in token (typically user_id and email)

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    # Set expiration time (7 days from now)
    expire = datetime.utcnow() + timedelta(days=settings.JWT_EXPIRY_DAYS)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()  # Issued at time
    })

    # Encode JWT token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )

    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT token string to verify

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired (401)
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_iat": True,
                "require": ["exp", "iat", "id"]  # Required claims
            }
        )
        return payload
    except ExpiredSignatureError:
        logger.warning("JWT verification failed - token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except InvalidTokenError as e:
        logger.warning(f"JWT verification failed - invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    FastAPI dependency to verify JWT from Authorization header.

    Args:
        credentials: HTTP Bearer credentials from request header

    Returns:
        Decoded JWT payload with user information

    Raises:
        HTTPException: If token is missing or invalid (401)
    """
    token = credentials.credentials
    return verify_token(token)


async def get_current_user(
    payload: Dict[str, Any] = Depends(verify_jwt),
    session: AsyncSession = Depends(get_session)
) -> "User":  # type: ignore
    """
    FastAPI dependency to get current authenticated user.
    Extracts user ID from JWT and fetches user from database.

    Args:
        payload: Decoded JWT payload from verify_jwt dependency
        session: Database session from get_session dependency

    Returns:
        User model instance

    Raises:
        HTTPException: If user not found (401)
    """
    from ..models.user import User
    from sqlmodel import select

    user_id = payload.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Query user from database
    statement = select(User).where(User.id == user_id)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user
