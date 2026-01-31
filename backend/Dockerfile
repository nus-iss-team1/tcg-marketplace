# 1️⃣ Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./

# Copy backend workspace
COPY backend ./backend

RUN npm ci --workspace=backend

# Build the NestJS project
RUN npm run build --workspace=backend

# 2️⃣ Production stage
FROM node:20-alpine AS runner

ARG REVISION

LABEL org.opencontainers.image.source=https://github.com/nus-iss-team1/tcg-marketplace
LABEL org.opencontainers.image.revision=${REVISION}

WORKDIR /app

# Copy build output from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/package*.json ./

# Copy any static files if needed (optional)
# COPY public ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

WORKDIR /app/backend

# Start the app
CMD ["node", "dist/main.js"]
