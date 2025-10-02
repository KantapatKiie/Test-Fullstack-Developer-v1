# Fetch Wrapper Usage Examples

## Overview
The `fetchWrapper` is a custom fetch utility that automatically adds:
- `x-request-id` UUID header to every request
- `Authorization` Bearer token header (when needed)
- Proper error handling and response parsing

## Basic Usage

```typescript
import { fetchWrapper } from '../utils/fetchWrapper';

// GET request with automatic headers
const response = await fetchWrapper.get('/demo/echo?x=hello');
console.log(response.data); // { requestId: "uuid", x: "hello" }

// POST request with data
const payment = await fetchWrapper.post('/payments', 
  { amount: 100, currency: 'USD' },
  { headers: { 'Idempotency-Key': 'unique-key-123' } }
);

// GET request without authentication
const publicData = await fetchWrapper.get('/public/data', { includeAuth: false });
```

## API Response Format

```typescript
interface FetchWrapperResponse<T> {
  data?: T;           // Success response data
  error?: string;     // Error message if request failed
  status: number;     // HTTP status code
  headers: Headers;   // Response headers
}
```

## Request Headers Added Automatically

1. **x-request-id**: UUID v4 generated for each request
2. **Authorization**: Bearer token from localStorage (if `includeAuth: true`)
3. **Content-Type**: application/json (default)

## Examples from Test Page

### Echo Test
```typescript
const response = await fetchWrapper.get<{requestId: string, x: string}>('/demo/echo?x=test');
// Logs request with UUID and returns echoed data
```

### Authenticated Request
```typescript
const profile = await fetchWrapper.get<User>('/users/profile');
// Automatically includes Authorization header
```

### Custom Headers
```typescript
const payment = await fetchWrapper.post('/payments', data, {
  headers: {
    'Idempotency-Key': 'custom-key',
    'X-Custom-Header': 'value'
  }
});
```

### No Authentication
```typescript
const response = await fetchWrapper.get('/demo/echo', { 
  includeAuth: false 
});
// Skips Authorization header
```

## Features

✅ **Automatic UUID Generation**: Each request gets a unique x-request-id  
✅ **Auth Token Management**: Reads token from Zustand store in localStorage  
✅ **Type Safety**: Full TypeScript support with generics  
✅ **Error Handling**: Consistent error format across all requests  
✅ **Flexible Headers**: Support for custom headers and auth override  
✅ **Multiple HTTP Methods**: GET, POST, PUT, DELETE, PATCH support  
✅ **Response Parsing**: Automatic JSON/text parsing based on Content-Type  

## Backend Integration

The backend recognizes the `x-request-id` header and includes it in:
- Response logs
- Error messages  
- API responses (echo endpoint)
- Database transaction tracking

This enables full request tracing across frontend and backend systems.