import { proxyToListing } from "@/app/api/proxy";
export const dynamic = "force-dynamic";
const handler = proxyToListing("/listing/reference/card");
export const GET = handler;
