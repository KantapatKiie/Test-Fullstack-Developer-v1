# Full Stack Developer Test Project

## Overview

This project demonstrates a complete full-stack application built with modern technologies and best practices. It consists of a NestJS backend with TypeScript and a React frontend with Vite and Tailwind CSS.

## 🏗️ Architecture

### Backend (NestJS + TypeScript)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based authentication
- **Validation**: Class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest for unit and integration tests

### Frontend (React + Vite + Tailwind)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API / Zustand
- **Routing**: React Router v6
- **UI Components**: Custom components with Tailwind

## 📋 Features Implemented

### Core Features
1. **User Authentication & Authorization**
   - User registration and login
   - JWT token-based authentication
   - Protected routes and API endpoints
   - Refresh token mechanism

2. **User Management**
   - CRUD operations for users
   - Profile management
   - Role-based access control

3. **API Features**
   - RESTful API design
   - Input validation and sanitization
   - Error handling and logging
   - API documentation with Swagger

4. **Frontend Features**
   - Responsive design with Tailwind CSS
   - Form validation and error handling
   - Loading states and user feedback
   - Axios interceptors for request/response handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-test
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your database connection in .env
   npm run migration:run
   npm run start:dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=fullstack_test

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=3600s
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRATION=7d

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Full Stack Test App
```

## 📁 Project Structure

```
fullstack-test/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # Users module
│   │   ├── common/         # Common utilities, guards, interceptors
│   │   ├── database/       # Database configuration and migrations
│   │   └── main.ts         # Application entry point
│   ├── test/               # Test files
│   ├── package.json
│   └── README.md
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services and axios configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main App component
│   ├── public/             # Static assets
│   ├── package.json
│   └── README.md
└── README.md               # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)

### Health Check
- `GET /api/health` - API health status

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # Integration tests
npm run test:cov      # Test coverage
```

### Frontend Testing
```bash
cd frontend
npm run test          # Run tests
npm run test:ui       # Run tests with UI
npm run coverage      # Test coverage
```

## 🛠️ Development Guidelines

### Code Style
- ESLint and Prettier configured for both frontend and backend
- Consistent naming conventions (camelCase for variables, PascalCase for components)
- TypeScript strict mode enabled

### Git Workflow
- Feature branch workflow
- Conventional commits
- Pre-commit hooks for linting and testing

### Security Best Practices
- Input validation and sanitization
- SQL injection prevention with TypeORM
- XSS protection
- CORS properly configured
- JWT token security
- Environment variables for sensitive data

## 📦 Dependencies

### Backend Key Dependencies
- `@nestjs/core` - NestJS framework
- `@nestjs/typeorm` - Database ORM
- `@nestjs/jwt` - JWT authentication
- `@nestjs/swagger` - API documentation
- `class-validator` - Input validation
- `bcrypt` - Password hashing

### Frontend Key Dependencies
- `react` - React framework
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `axios` - HTTP client
- `react-router-dom` - Routing
- `@hookform/resolvers` - Form validation

## 🚀 Deployment

### Docker Deployment
Both frontend and backend include Dockerfile for containerization.

### Production Build
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run preview
```

## 📊 Performance Considerations

- **Backend**: Database indexing, query optimization, caching strategies
- **Frontend**: Code splitting, lazy loading, image optimization
- **Security**: Rate limiting, input validation, secure headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is created for educational and testing purposes.

---

**Note**: This is a test project demonstrating full-stack development skills with modern technologies and best practices.