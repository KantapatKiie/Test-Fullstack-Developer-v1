# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx-group && \
    adduser -S nginx-user -u 1001 -G nginx-group

# Set ownership for nginx directories
RUN chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    chown -R nginx-user:nginx-group /etc/nginx/conf.d

# Create and set ownership for tmp directory
RUN touch /tmp/nginx.pid && \
    chown -R nginx-user:nginx-group /tmp/nginx.pid && \
    mkdir -p /tmp/nginx && \
    chown -R nginx-user:nginx-group /tmp/nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
