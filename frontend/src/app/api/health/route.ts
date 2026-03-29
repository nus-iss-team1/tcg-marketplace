import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    env: {
      BACKEND_API: process.env.BACKEND_API ?? "NOT_SET",
      LISTING_API: process.env.LISTING_API ?? "NOT_SET",
      NODE_ENV: process.env.NODE_ENV ?? "NOT_SET",
    },
  });
}
