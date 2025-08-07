# Multi-stage Node.js Dockerfile for RitZone Backend

# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Runtime image
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S ritzone && \
    adduser -S ritzone -u 1001 -G ritzone

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY --chown=ritzone:ritzone . .

# Switch to non-root user
USER ritzone

# Set environment variables
ENV NODE_ENV=production
ENV BACKEND_PORT=8001

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8001/api/health || exit 1

# Start the application
CMD ["node", "server.js"]