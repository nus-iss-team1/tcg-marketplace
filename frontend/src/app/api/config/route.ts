import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    messagingApi: process.env.MESSAGING_API || "",
  });
}
