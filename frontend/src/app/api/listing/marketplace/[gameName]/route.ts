import { NextRequest } from "next/server";
import { proxyToListing } from "@/app/api/proxy";
export const dynamic = "force-dynamic";

async function handler(req: NextRequest, context: { params: Promise<{ gameName: string }> }) {
  const { gameName } = await context.params;
  return proxyToListing(`/listing/marketplace/${encodeURIComponent(gameName)}`)(req);
}
export const GET = handler;
