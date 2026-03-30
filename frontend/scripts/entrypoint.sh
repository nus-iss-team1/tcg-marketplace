#!/bin/sh
set -e

# Replace build-time placeholder with runtime BACKEND_API value.
# next.config.ts rewrites bake the URL into compiled JS at build time,
# so we sed-replace the placeholder before starting the server.
if [ -n "$BACKEND_API" ] && [ "$BACKEND_API" != "BAKED_BACKEND_API" ]; then
  find /app/.next -type f -name "*.js" | while read file; do
    sed -i "s|BAKED_BACKEND_API|$BACKEND_API|g" "$file"
  done
  echo "Injected BACKEND_API=$BACKEND_API into build output"
fi

exec node server.js
