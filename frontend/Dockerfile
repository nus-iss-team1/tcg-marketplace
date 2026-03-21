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

# Build with placeholders – replaced at runtime by docker-entrypoint.sh
ENV NEXT_PUBLIC_COGNITO_USER_POOL_ID=__COGNITO_USER_POOL_ID__
ENV NEXT_PUBLIC_COGNITO_CLIENT_ID=__COGNITO_CLIENT_ID__
ENV NEXT_PUBLIC_BACKEND_API=http://placeholder.local

# Disable telemetry during build for privacy/speed
ENV NEXT_TELEMETRY_DISABLED=1
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
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./

USER nextjs

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]