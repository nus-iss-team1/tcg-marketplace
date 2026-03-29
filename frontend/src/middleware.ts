import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy /api/listing/* and /api/messaging/* to backend services at runtime.
 *
 * next.config rewrites are evaluated at build time, so env vars like BACKEND_API
 * are not available when building inside Docker. This middleware runs on every
 * matched request and reads process.env at request time.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/listing/")) {
    const backendBase =
      process.env.LISTING_API || process.env.BACKEND_API || "http://localhost:3001";
    const target = pathname.replace(/^\/api\/listing/, "/listing");
    const url = new URL(target + request.nextUrl.search, backendBase);
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/api/messaging/")) {
    const backendBase =
      process.env.MESSAGING_API || process.env.BACKEND_API || "http://localhost:3002";
    const target = pathname.replace(/^\/api\/messaging/, "/messaging");
    const url = new URL(target + request.nextUrl.search, backendBase);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/listing/:path*", "/api/messaging/:path*"],
};
