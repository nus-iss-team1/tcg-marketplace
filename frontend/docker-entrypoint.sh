#!/bin/sh
set -e

# Replace build-time placeholders with runtime env vars in all JS files
find /app/.next -name "*.js" -exec sed -i \
  -e "s|__COGNITO_USER_POOL_ID__|${NEXT_PUBLIC_COGNITO_USER_POOL_ID}|g" \
  -e "s|__COGNITO_CLIENT_ID__|${NEXT_PUBLIC_COGNITO_CLIENT_ID}|g" \
  -e "s|http://placeholder.local|${NEXT_PUBLIC_BACKEND_API}|g" \
  {} +

# Also replace in server.js (standalone output)
sed -i \
  -e "s|__COGNITO_USER_POOL_ID__|${NEXT_PUBLIC_COGNITO_USER_POOL_ID}|g" \
  -e "s|__COGNITO_CLIENT_ID__|${NEXT_PUBLIC_COGNITO_CLIENT_ID}|g" \
  -e "s|http://placeholder.local|${NEXT_PUBLIC_BACKEND_API}|g" \
  /app/server.js

exec "$@"
