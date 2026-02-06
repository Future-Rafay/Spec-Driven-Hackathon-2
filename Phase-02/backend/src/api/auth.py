"""
Authentication API endpoints.
Handles user registration, sign-in, and authentication operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from ..core.database import get_session
from ..core.security import get_current_user
from ..models.user import User, UserCreate, UserResponse, UserSignIn, AuthToken
from ..models.errors import ErrorResponse
from ..services import auth_service

router = APIRouter()


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "User successfully registered",
            "model": UserResponse
        },
        400: {
            "description": "Bad request - Invalid email or weak password",
            "model": ErrorResponse
        },
        409: {
            "description": "Conflict - Email already registered",
            "model": ErrorResponse
        }
    },
    summary="Register new user",
    description="""
    Create a new user account with email and password.

    **Requirements:**
    - Email must be valid format and unique
    - Password must meet security requirements:
      - Minimum 8 characters
      - At least one uppercase letter
      - At least one lowercase letter
      - At least one digit
      - At least one special character

    **Returns:** User information (without password)
    """
)
async def signup(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session)
) -> UserResponse:
    """
    Register a new user account.

    Validates input, checks for duplicates, hashes password,
    and creates user in database.
    """
    return await auth_service.signup(session, user_data)


@router.post(
    "/signin",
    response_model=AuthToken,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Successfully authenticated",
            "model": AuthToken
        },
        401: {
            "description": "Unauthorized - Invalid credentials",
            "model": ErrorResponse
        }
    },
    summary="Sign in user",
    description="""
    Authenticate user with email and password, returns JWT token.

    **Security:**
    - Generic error message for incorrect credentials (doesn't reveal if email exists)
    - Timing-attack resistant password verification
    - Updates last_signin_at timestamp

    **Returns:** JWT token with 7-day expiry and user information
    """
)
async def signin(
    signin_data: UserSignIn,
    session: AsyncSession = Depends(get_session)
) -> AuthToken:
    """
    Authenticate user and generate JWT token.

    Verifies credentials and returns access token for subsequent requests.
    """
    return await auth_service.signin(session, signin_data)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Current user information",
            "model": UserResponse
        },
        401: {
            "description": "Unauthorized - Missing or invalid token",
            "model": ErrorResponse
        }
    },
    summary="Get current user",
    description="""
    Retrieve information about the currently authenticated user.

    **Authentication:** Requires valid JWT token in Authorization header

    **Use Case:** Verify authentication status, get user details

    **Returns:** Current user information
    """
)
async def get_me(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """
    Get current authenticated user information.

    Requires valid JWT token in Authorization: Bearer header.
    """
    return UserResponse.model_validate(current_user)
