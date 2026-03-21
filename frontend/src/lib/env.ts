/**
 * Runtime environment config.
 *
 * Server-side: reads from process.env directly.
 * Client-side: reads from window.__ENV, which is injected by layout.tsx
 * at request time so the same Docker image works across environments.
 */

interface RuntimeEnv {
  COGNITO_USER_POOL_ID: string;
  COGNITO_CLIENT_ID: string;
}

declare global {
  interface Window {
    __ENV?: RuntimeEnv;
  }
}

export function getEnv(): RuntimeEnv {
  if (typeof window !== "undefined" && window.__ENV) {
    return window.__ENV;
  }

  return {
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID ?? "",
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID ?? "",
  };
}
