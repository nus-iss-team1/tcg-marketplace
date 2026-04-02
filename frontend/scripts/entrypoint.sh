#!/bin/sh
set -e

# Replace build-time placeholders with runtime env var values.
# next.config.ts rewrites bake URLs into compiled JS at build time,
# so we sed-replace the placeholders before starting the server.

replace_placeholder() {
  local placeholder="$1"
  local value="$2"
  if [ -n "$value" ] && [ "$value" != "$placeholder" ]; then
    find /app -type f \( -name "*.js" -o -name "*.json" \) | while read file; do
      sed -i "s|$placeholder|$value|g" "$file"
    done
    echo "Injected $placeholder -> $value"
  fi
}

replace_placeholder "http://baked-listing-api.internal" "$LISTING_API"
replace_placeholder "http://baked-messaging-api.internal" "$MESSAGING_API"

exec node server.js
