# Backend - Authentication & Identity Layer

FastAPI backend service providing secure authentication and user management with JWT tokens.

## Overview

This backend service implements a complete authentication system with:
- User registration with email/password
- Secure password hashing (bcrypt, 12 rounds)
- JWT-based authentication (7-day expiry)
- Protected endpoints with user isolation
- PostgreSQL database with SQLModel ORM
- Comprehensive logging and error handling

## Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: SQLModel (async)
- **Authentication**: PyJWT + Passlib (bcrypt)
- **Validation**: Pydantic + email-validator
- **Server**: Uvicorn (ASGI)

## Project Structure

```
backend/
├── src/
│   ├── api/              # API route handlers
│   │   └── auth.py       # Authentication endpoints
│   ├── core/             # Core utilities
│   │   ├── config.py     # Configuration management
│   │   ├── database.py   # Database connection
│   │   ├── security.py   # JWT & password utilities
│   │   └── validators.py # Input validation
│   ├── models/           # Data models
│   │   ├── user.py       # User model & DTOs
│   │   └── errors.py     # Error schemas
│   ├── services/         # Business logic
│   │   └── auth_service.py # Authentication service
│   └── main.py           # Application entry point
├── migrations/           # Database migrations
│   └── 001_create_users_table.sql
├── requirements.txt      # Python dependencies
├── .env.example          # Environment template
└── README.md            # This file
```

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL database (Neon recommended)
- pip or poetry

### Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**:
   ```bash
   psql $DATABASE_URL -f migrations/001_create_users_table.sql
   ```

5. **Start development server**:
   ```bash
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT Configuration
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRY_DAYS=7

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Application Settings
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Generate JWT Secret

```bash
# Generate secure random secret (32 bytes, base64 encoded)
openssl rand -base64 32
```

## API Documentation

### Base URL

- Development: `http://localhost:8000`
- Production: `https://your-domain.com`

### Endpoints

#### Health Check

```http
GET /health
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "environment": "development"
}
```

#### User Registration

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-02-04T10:30:00Z",
  "last_signin_at": null
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email or weak password
- `409 Conflict`: Email already registered

#### User Sign In

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
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
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-02-04T10:30:00Z",
  "last_signin_at": "2026-02-04T15:45:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token

### Interactive API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Security Features

### Password Security

- **Hashing**: bcrypt with 12 rounds (variant 2b)
- **Validation**: Minimum 8 characters, uppercase, lowercase, digit, special character
- **Storage**: Only hashed passwords stored, never plain text

### JWT Security

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiry**: 7 days (configurable)
- **Payload**: User ID and email only
- **Verification**: Signature, expiration, and issued-at time checked

### API Security

- **CORS**: Configured for frontend origin only
- **Rate Limiting**: Recommended for production (not implemented)
- **Input Validation**: All inputs validated with Pydantic
- **Error Messages**: Generic messages for authentication failures (security best practice)

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_signin_at TIMESTAMP NULL
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_signin ON users(last_signin_at);
```

## Logging

The application logs all authentication events:

- **Signup**: Success and failure (with reasons)
- **Signin**: Success and failure (with generic messages for security)
- **JWT Verification**: Token validation failures
- **API Requests**: All requests with method, path, status, and duration

Log levels:
- `INFO`: Successful operations
- `WARNING`: Failed operations (invalid input, authentication failures)
- `ERROR`: System errors (database, configuration)

## Development

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html
```

### Code Quality

```bash
# Format code
black src/

# Lint code
ruff check src/

# Type checking
mypy src/
```

### Database Migrations

For production, use Alembic for database migrations:

```bash
# Initialize Alembic
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Deployment

### Production Checklist

- [ ] Generate new JWT_SECRET (never reuse development secret)
- [ ] Set ENVIRONMENT=production
- [ ] Configure production DATABASE_URL
- [ ] Enable HTTPS only
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting
- [ ] Review CORS settings
- [ ] Enable security headers
- [ ] Set up log aggregation

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY migrations/ ./migrations/

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment-Specific Configuration

The application automatically adjusts based on ENVIRONMENT variable:

- `development`: Debug logging, CORS relaxed, auto-reload
- `production`: Info logging, strict CORS, optimized

## Troubleshooting

### Common Issues

**Database connection fails**:
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check SSL mode
# Neon requires: ?sslmode=require
```

**JWT verification fails**:
```bash
# Verify secret is set
echo $JWT_SECRET

# Check token expiry (7 days default)
# Tokens expire and need refresh
```

**Import errors**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## Support

- **Specification**: See `specs/1-auth/spec.md`
- **API Contracts**: See `specs/1-auth/contracts/auth-api.yaml`
- **Quickstart Guide**: See `specs/1-auth/quickstart.md`
- **Issues**: Report bugs in project issue tracker

## License

[Your License Here]
