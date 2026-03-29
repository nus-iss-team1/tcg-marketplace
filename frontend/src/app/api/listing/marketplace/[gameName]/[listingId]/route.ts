import { NextRequest } from "next/server";
import { proxyToListing } from "@/app/api/proxy";
export const dynamic = "force-dynamic";

async function handler(req: NextRequest, context: { params: Promise<{ gameName: string; listingId: string }> }) {
  const { gameName, listingId } = await context.params;
  return proxyToListing(`/listing/marketplace/${encodeURIComponent(gameName)}/${encodeURIComponent(listingId)}`)(req);
}
export const GET = handler;
export const PATCH = handler;
export const DELETE = handler;
