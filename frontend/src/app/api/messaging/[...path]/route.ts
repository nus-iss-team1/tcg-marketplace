import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function getBackendUrl(path: string, search: string) {
  const base =
    process.env.MESSAGING_API || process.env.BACKEND_API || "http://localhost:3002";
  return `${base}/messaging/${path}${search}`;
}

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const url = getBackendUrl(path.join("/"), req.nextUrl.search);

  const headers = new Headers(req.headers);
  headers.delete("host");

  const res = await fetch(url, {
    method: req.method,
    headers,
    body: req.body,
    // @ts-expect-error -- Node fetch supports duplex for streaming bodies
    duplex: "half",
  });

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
