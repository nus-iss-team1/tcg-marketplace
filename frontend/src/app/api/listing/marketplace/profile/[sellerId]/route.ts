import { NextRequest } from "next/server";
import { proxyToListing } from "@/app/api/proxy";
export const dynamic = "force-dynamic";

async function handler(req: NextRequest, context: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await context.params;
  return proxyToListing(`/listing/marketplace/profile/${encodeURIComponent(sellerId)}`)(req);
}
export const GET = handler;
