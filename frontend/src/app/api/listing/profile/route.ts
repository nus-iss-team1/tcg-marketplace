import { proxyToListing } from "@/app/api/proxy";
export const dynamic = "force-dynamic";
const handler = proxyToListing("/listing/profile");
export const PATCH = handler;
