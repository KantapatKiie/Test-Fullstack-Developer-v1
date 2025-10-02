# React Frontend

This is the frontend application built with React, Vite, and Tailwind CSS for the Full Stack Developer Test.

## Features

- **Authentication**: Complete login/register flow with JWT tokens
- **Responsive Design**: Built with Tailwind CSS for mobile-first design
- **State Management**: Zustand for global state management
- **Form Handling**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors for request/response handling
- **Routing**: React Router v6 for client-side routing
- **Notifications**: React Hot Toast for user feedback
- **TypeScript**: Full TypeScript support for type safety

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Zustand** - State management
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Notifications

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Full Stack Test App
```

## API Integration

The frontend connects to the NestJS backend with:
- Automatic JWT token handling
- Request/response interceptors
- Error handling and user feedback
- Token refresh mechanism
- Type-safe API calls

## Building for Production

```bash
npm run build
npm run preview
```

The `dist/` directory will contain the production-ready files.