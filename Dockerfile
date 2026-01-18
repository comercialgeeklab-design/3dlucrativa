# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV DB_HOST=localhost
ENV DB_PORT=3306
ENV DB_USERNAME=dummy
ENV DB_PASSWORD=dummy
ENV DB_DATABASE=dummy
ENV NODE_ENV=production
ENV MERCADO_PAGO_ACCESS_TOKEN=TEST-12345678901234567890
ENV NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-12345678901234567890
ENV JWT_SECRET=build-secret-key-change-in-production
ENV NEXT_PUBLIC_API_URL=http://localhost:3000/api
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000

# Build Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install curl and mysql-client para health checks
RUN apk add --no-cache curl mysql-client

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/contexts ./contexts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.scripts.json ./
COPY --from=builder /app/postcss.config.js ./
COPY --from=builder /app/tailwind.config.ts ./

# Copy entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start application with entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]

