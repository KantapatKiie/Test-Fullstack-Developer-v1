# Full Stack Developer Test Project

## Overview

This project demonstrates a complete full-stack application built with modern technologies and best practices. It features a NestJS backend with SQLite database and a React frontend with real-time article search functionality.

## 🏗️ Architecture

### Backend (NestJS + TypeScript)
- **Framework**: NestJS with TypeScript
- **Database**: SQLite with in-memory operations
- **Authentication**: JWT-based authentication with refresh tokens
- **Middleware**: Request-ID tracking, CORS configuration
- **Caching**: In-memory cache for performance
- **Validation**: DTO validation and transformation
- **Documentation**: Available at `/api/docs` (Swagger)
- **Special Features**: Idempotency for payments, Request tracing

### Frontend (React + Vite + Tailwind)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS for responsive design
- **HTTP Client**: Custom fetchWrapper with UUID headers
- **State Management**: Zustand for global state
- **Routing**: React Router v6
- **UI Features**: Real-time search with debouncing, Toast notifications
- **Offline Support**: localStorage fallback for articles

## 📋 Features Implemented

### Authentication & User Management
1. **JWT Authentication System**
   - User registration and login with email/password
   - JWT access tokens with refresh token mechanism
   - Protected routes and API endpoints
   - Role-based access control (Admin/User)
   - Token validation middleware

2. **User Profile Management**
   - User registration with validation
   - Profile viewing and updating
   - Admin panel for user management
   - Password hashing with bcrypt

### Articles System
3. **Real-time Article Search**
   - Live search with 400ms debouncing
   - Backend search across title, content, author, and tags
   - List view with article excerpts
   - Detail view with full content
   - localStorage fallback when API is unavailable

4. **Article Management**
   - 8 sample articles with comprehensive data
   - API endpoints: `GET /articles` and `GET /articles/:id`
   - Search functionality: `GET /articles?search=term`
   - Response caching for performance

### API Features
5. **Request Tracking & Middleware**
   - Request-ID middleware for tracing
   - UUID generation for each request
   - Comprehensive error handling
   - CORS configuration for frontend access
   - Response interceptors with proper headers

6. **Demo & Testing Endpoints**
   - Echo endpoint for authentication testing
   - Pagination demo with query parameters
   - Error simulation endpoints
   - Random data generation
   - Payment idempotency system

### Frontend Features
7. **Modern React Application**
   - Responsive design with Tailwind CSS
   - Custom fetchWrapper with UUID headers
   - Real-time form validation
   - Loading states and error handling
   - Toast notifications for user feedback
   - Protected route components

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KantapatKiie/Test-Fullstack-Developer-v1.git
   cd fullstack-test
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Database will be created automatically (SQLite)
   npm run dev
   ```

3. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api
   - API Documentation: http://localhost:3000/api/docs

### Test Credentials
- **Admin**: admin@test.com / password123
- **User**: user@test.com / password123

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production  
JWT_REFRESH_EXPIRATION=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Database (SQLite - auto-created)
DATABASE_PATH=database.sqlite
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Full Stack Test App
```

## 📁 Project Structure

```
fullstack-test/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── app.controller.ts   # Main app controller
│   │   ├── app.module.ts       # Root application module
│   │   ├── main.ts             # Application entry point
│   │   ├── seed.ts             # Database seeding
│   │   ├── auth/               # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── guards/         # JWT and role guards
│   │   │   └── strategies/     # JWT strategy
│   │   ├── users/              # User management module
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── user.entity.ts
│   │   ├── articles/           # Articles module
│   │   │   ├── articles.controller.ts
│   │   │   └── articles.module.ts
│   │   ├── demo/               # Demo endpoints
│   │   │   ├── demo.controller.ts
│   │   │   ├── demo.service.ts
│   │   │   └── payments.controller.ts
│   │   └── common/             # Shared utilities
│   │       ├── cache.ts        # In-memory caching
│   │       └── request-id.middleware.ts
│   ├── database.sqlite         # SQLite database file
│   └── package.json
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   └── Input.tsx
│   │   ├── pages/              # Page components
│   │   │   ├── ArticlesPage.tsx    # Articles with search
│   │   │   ├── DashboardPage.tsx   # Main dashboard
│   │   │   ├── LoginPage.tsx       # Authentication
│   │   │   ├── RegisterPage.tsx    # User registration
│   │   │   └── FetchWrapperTestPage.tsx
│   │   ├── services/           # API services
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   └── apiService.ts
│   │   ├── store/              # State management
│   │   │   └── authStore.ts    # Zustand auth store
│   │   ├── utils/              # Utilities
│   │   │   ├── fetchWrapper.ts # Custom HTTP client
│   │   │   └── cn.ts          # Class name utilities
│   │   ├── hooks/              # Custom hooks
│   │   │   └── useDebounce.ts  # Debouncing hook
│   │   └── types/              # TypeScript definitions
│   │       └── api.ts
│   └── package.json
├── ส่วนที่ 1 - ข้อเขียน.md      # Technical documentation (Thai)
└── README.md                   # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/refresh` - Refresh access token

### Users Management
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `GET /api/users/profile` - Get current user profile
- `PATCH /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles?search=term` - Search articles (title, content, author, tags)
- `GET /api/articles/:id` - Get article details

### Demo & Testing
- `GET /api/demo/echo` - Echo endpoint for testing (requires auth)
- `GET /api/demo/error` - Simulate server error
- `GET /api/demo/random` - Random data generation
- `GET /api/demo/items` - Demo items with pagination
- `GET /api/demo/test-pagination` - Pagination testing

### Payments (Idempotency Demo)
- `POST /api/payments` - Create payment with idempotency
- `POST /api/payments/debug/all` - View all payments
- `POST /api/payments/debug/clear` - Clear payment cache

### Health Check
- `GET /api/health` - API health status

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test          # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Test coverage
npm run test:e2e      # End-to-end tests
```

### Frontend Testing
```bash
cd frontend
npm run test          # Run tests (if configured)
npm run type-check    # TypeScript type checking
npm run lint          # ESLint checking
```

### Manual Testing
- Use Swagger UI at `http://localhost:3000/api/docs`
- Test authentication flows in the frontend
- Test article search functionality
- Test API endpoints with different user roles

## 🛠️ Development Guidelines

### Code Architecture
- **Backend**: Modular NestJS architecture with clear separation of concerns
- **Frontend**: Component-based React with custom hooks and utility functions
- **Database**: SQLite for simplicity (auto-seeded with test data)
- **State Management**: Zustand for global auth state
- **API Communication**: Custom fetchWrapper with UUID headers

### Key Features Demonstrated
1. **Request Tracing**: Every request gets a unique UUID for debugging
2. **Authentication Flow**: Complete JWT implementation with refresh tokens
3. **Real-time Search**: Debounced search with API integration
4. **Error Handling**: Comprehensive error handling with user feedback
5. **Offline Support**: localStorage fallback for articles
6. **Responsive Design**: Mobile-first approach with Tailwind CSS
7. **Type Safety**: Full TypeScript implementation throughout

### Security Implementation
- JWT token security with proper expiration
- Password hashing with bcrypt
- Input validation and sanitization
- CORS properly configured
- Protected routes and API endpoints
- Role-based access control

## 📦 Key Dependencies

### Backend Dependencies
- `@nestjs/core` - NestJS framework
- `@nestjs/jwt` - JWT authentication
- `@nestjs/swagger` - API documentation
- `sqlite3` - SQLite database
- `bcrypt` - Password hashing
- `uuid` - UUID generation for request IDs
- `class-validator` - Input validation
- `class-transformer` - Data transformation

### Frontend Dependencies
- `react` ^19.1.1 - React framework
- `vite` - Fast build tool
- `tailwindcss` - Utility-first CSS framework
- `zustand` ^5.0.8 - State management
- `react-router-dom` ^7.9.3 - Routing
- `react-hook-form` ^7.63.0 - Form handling
- `react-hot-toast` ^2.6.0 - Toast notifications
- `uuid` ^13.0.0 - UUID generation
- `zod` ^4.1.11 - Schema validation

## 🚀 Deployment

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

### Docker Support
Both backend and frontend can be containerized for deployment.

## 📊 Performance Features

- **Backend**: In-memory caching, request ID tracing, efficient SQLite queries
- **Frontend**: Debounced search (400ms), localStorage caching, optimistic UI updates
- **API**: Idempotency for payments, comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Project Status

**Current Status**: ✅ **Completed**

All core features have been implemented and tested:
- ✅ JWT Authentication with refresh tokens
- ✅ User management with role-based access
- ✅ Real-time article search with debouncing
- ✅ Request ID tracking and logging
- ✅ Comprehensive error handling
- ✅ Responsive UI with Tailwind CSS
- ✅ API documentation with Swagger
- ✅ Offline support with localStorage fallback

## 📖 Documentation

- **Technical Questions**: See `ส่วนที่ 1 - ข้อเขียน.md` for detailed technical explanations
- **API Documentation**: Available at `http://localhost:3000/api/docs` when running
- **Backend Details**: Check `backend/README.md` and `backend/README-new.md`
- **Frontend Details**: Check `frontend/README.md` and `frontend/docs/`

---

**Repository**: [https://github.com/KantapatKiie/Test-Fullstack-Developer-v1](https://github.com/KantapatKiie/Test-Fullstack-Developer-v1)

**Note**: This project demonstrates full-stack development skills with modern technologies, best practices, and comprehensive feature implementation for a technical assessment.