# --- STAGE 1: Install Dependencies ---
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Only copy files that affect 'npm ci'
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Cognito config – inlined into the JS bundle at build time
ARG NEXT_PUBLIC_COGNITO_USER_POOL_ID
ARG NEXT_PUBLIC_COGNITO_CLIENT_ID
ARG NEXT_PUBLIC_LISTING_API
ARG NEXT_PUBLIC_MESSAGING_API
ARG NEXT_PUBLIC_IMAGE_TAG

# Disable telemetry during build for privacy/speed
ENV NEXT_TELEMETRY_DISABLED=1

# Use placeholder for API URLs so rewrites compile at build time.
# The entrypoint script replaces these with the real values at container start.
ENV LISTING_API=http://baked-listing-api.internal
ENV MESSAGING_API=http://baked-messaging-api.internal
RUN npm run build

# --- STAGE 3: Production Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build output
# Note: standalone includes a minimal node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy entrypoint script
COPY scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Make all files owned by nextjs so entrypoint can sed-replace placeholders
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000

# Runtime env vars — set these when running the container:
# LISTING_API, MESSAGING_API, MESSAGING_WS_API

ENTRYPOINT ["./entrypoint.sh"]
