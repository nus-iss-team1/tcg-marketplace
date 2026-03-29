import { proxyToListing } from "@/app/api/proxy";
export const dynamic = "force-dynamic";
const handler = proxyToListing("/listing/marketplace");
export const GET = handler;
export const POST = handler;
