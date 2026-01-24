# Build stage
FROM node:25.1-alpine3.22 AS build

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

ARG REVISION

LABEL org.opencontainers.image.source=https://github.com/nus-iss-team1/tcg-marketplace
LABEL org.opencontainers.image.revision=${REVISION}

WORKDIR /app

# Copy built app and dependencies
COPY --from=build /app/frontend/.next ./frontend/.next
COPY --from=build /app/frontend/public ./frontend/public
COPY --from=build /app/frontend/package.json ./frontend/
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV NODE_ENV=production

EXPOSE 3000

WORKDIR /app/frontend

CMD ["npm", "start"]
