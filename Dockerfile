# Multi-stage build for optimized production image

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code and build configuration
COPY src/ ./src/
COPY tsconfig.json ./

# Build the TypeScript project
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
               const options = { host: 'localhost', port: process.env.PORT || 3000, path: '/health', timeout: 2000 }; \
               const request = http.request(options, (res) => { \
                 if (res.statusCode === 200) process.exit(0); \
                 else process.exit(1); \
               }); \
               request.on('error', () => process.exit(1)); \
               request.end();"

# Define environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/index.js"]