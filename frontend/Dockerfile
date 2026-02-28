# Build stage
FROM node:25.1-alpine3.22 AS build

# Build argument to force cache invalidation
ARG BUILD_ID
RUN echo "Build ID: ${BUILD_ID}"

WORKDIR /app

# Copy root package files for workspaces
COPY package.json package-lock.json ./

# Copy frontend workspace
COPY frontend ./frontend

# Install dependencies for all workspaces
RUN npm ci --workspace=frontend

# Build the Next.js app
RUN npm run build --workspace=frontend

# Production stage
FROM node:25.1-alpine3.22

# Install curl for health checks
RUN apk add --no-cache curl

ARG REVISION

LABEL org.opencontainers.image.source=https://github.com/nus-iss-team1/tcg-marketplace
LABEL org.opencontainers.image.revision=${REVISION}

WORKDIR /app

# Copy standalone output
COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/.next/static ./frontend/.next/static
COPY --from=build /app/frontend/public ./frontend/public

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "frontend/server.js"]
