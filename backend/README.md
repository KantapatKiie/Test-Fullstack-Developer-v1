# NestJS Backend

This is the backend service built with NestJS and TypeScript for the Full Stack Developer Test.

## Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **User Management**: Complete CRUD operations for users with role-based access control
- **Database**: PostgreSQL integration with TypeORM
- **Validation**: Request validation using class-validator
- **Documentation**: Auto-generated API documentation with Swagger
- **Security**: Password hashing, input validation, and CORS protection

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secrets
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3001/api`
API Documentation will be available at `http://localhost:3001/api/docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `GET /api/users/:id` - Get user by ID (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Health Check
- `GET /api/health` - API health status

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=fullstack_test
DATABASE_SYNCHRONIZE=true

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=3600s
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRATION=7d

PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start with file watching
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Generate test coverage

## Project Structure

```
src/
├── auth/              # Authentication module
│   ├── dto/           # Data transfer objects
│   ├── guards/        # Auth guards
│   ├── strategies/    # Passport strategies
│   └── decorators/    # Custom decorators
├── users/             # Users module
│   ├── dto/           # User DTOs
│   └── entities/      # User entity
├── common/            # Shared utilities
└── main.ts           # Application entry point
```