# Full Stack Developer Test - Backend

NestJS backend with JWT authentication, SQLite database, and comprehensive API endpoints.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server (auto-seed + watch mode)
npm run start:dev
```

That's it! The server will:
1. 🏗️ Build the application
2. 🌱 Seed test users automatically  
3. 🚀 Start server on http://localhost:3000/api
4. 👀 Watch for file changes and auto-reload

## 📋 Test Credentials

After seeding, you can use these test accounts:

- **Admin**: `admin@test.com` / `password123`
- **User**: `user@test.com` / `password123`

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Seed data + start dev server |
| `npm run start:dev:fresh` | Clean DB + seed + start dev server |
| `npm run dev` | Alias for start:dev |
| `npm run build` | Build for production |
| `npm run start:prod` | Start production server |
| `npm run seed` | Seed database only |
| `npm run seed:fresh` | Reset DB + seed |
| `npm run clean` | Clean dist/ and database |

## 📚 API Documentation

Once running, visit:
- **API Base**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs

## 🧪 Test Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/refresh` - Refresh JWT token

### Demo Endpoints (Testing Features)
- `GET /api/demo/echo?x=hello` - Request ID middleware test
- `GET /api/demo/random?q=key` - In-memory cache with TTL
- `GET /api/demo/items?offset=0&limit=10` - Pagination test
- `POST /api/payments` - Idempotency-Key payments

### User Management
- `GET /api/users/profile` - Get user profile (protected)
- `GET /api/users` - List users (admin only)

## 🏗️ Features Implemented

- ✅ **JWT Authentication** - Login/register with refresh tokens
- ✅ **Request-ID Middleware** - UUID tracking for all requests
- ✅ **In-Memory Cache** - TTL-based caching system
- ✅ **Idempotency-Key** - Duplicate payment prevention
- ✅ **Query Validation + Pagination** - Offset/limit with validation
- ✅ **Role-based Access** - Admin/User permissions
- ✅ **SQLite Database** - File-based database for easy setup
- ✅ **Auto-seeding** - Test users created automatically
- ✅ **Swagger Documentation** - Interactive API docs

## 🔧 Configuration

The app uses sensible defaults but can be configured via `.env`:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## 🚀 For Reviewers

Just run `npm install && npm run start:dev` and you're ready to test all features!

The system will automatically:
1. Create SQLite database
2. Seed test users  
3. Start API server with hot reload
4. Provide interactive documentation at `/api/docs`

No additional setup required! 🎉