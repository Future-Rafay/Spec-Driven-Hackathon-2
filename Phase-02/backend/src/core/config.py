"""
Database configuration module for FastAPI backend.
Loads environment variables and provides application settings.
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database Configuration
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL database connection URL"
    )

    # JWT Configuration
    JWT_SECRET: str = Field(
        ...,
        min_length=32,
        description="Secret key for JWT token signing (min 32 characters)"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_DAYS: int = 7

    # Frontend Configuration
    FRONTEND_URL: str = Field(
        default="http://localhost:3000",
        description="Frontend application URL for CORS"
    )

    # Application Configuration
    ENVIRONMENT: str = Field(
        default="development",
        description="Application environment (development, staging, production)"
    )
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    )

    @property
    def CORS_ORIGINS(self) -> List[str]:
        """
        Derive CORS allowed origins from FRONTEND_URL.
        In production, this should be more restrictive.
        """
        return [self.FRONTEND_URL]

    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT.lower() == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
