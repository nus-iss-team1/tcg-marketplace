# 1️⃣ Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./

# Copy backend workspace
COPY . .

RUN npm ci

# Build the NestJS project
RUN npm run build

# 2️⃣ Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy build output from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy any static files if needed (optional)
# COPY public ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=3002

# Expose port
EXPOSE 3002

WORKDIR /app

# Start the app
CMD ["node", "dist/main.js"]
