# Multi-stage build for production
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci --only=production && \
    cd backend && npm ci --only=production && \
    cd ../frontend && npm ci --only=production

# Build stage for frontend
FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy backend files
COPY --chown=nodejs:nodejs backend/ ./backend/
COPY --chown=nodejs:nodejs backend/package*.json ./backend/

# Copy frontend build
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/dist ./backend/public

# Install backend production dependencies
WORKDIR /app/backend
RUN npm ci --only=production && npm cache clean --force

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const req = http.request({hostname: 'localhost', port: 3001, path: '/api/health', timeout: 2000}, (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1) }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]