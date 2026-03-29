import { NextRequest } from "next/server";
import { proxyToListing } from "@/app/api/proxy";
export const dynamic = "force-dynamic";

async function handler(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  return proxyToListing(`/listing/profile/${encodeURIComponent(userId)}`)(req);
}
export const GET = handler;
