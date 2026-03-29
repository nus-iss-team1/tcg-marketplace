import { NextRequest } from "next/server";

export function proxyToListing(backendPath: string) {
  return async (req: NextRequest) => {
    const base =
      process.env.LISTING_API || process.env.BACKEND_API || "http://localhost:3001";
    const url = `${base}${backendPath}${req.nextUrl.search}`;

    const headers = new Headers(req.headers);
    const incomingHost = req.headers.get("host") ?? "";
    if (process.env.LISTING_API) {
      headers.set("host", new URL(process.env.LISTING_API).host);
    } else if (incomingHost) {
      headers.set("host", `listing.${incomingHost}`);
    } else {
      headers.delete("host");
    }

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
  };
}

export function proxyToMessaging(backendPath: string) {
  return async (req: NextRequest) => {
    const base =
      process.env.MESSAGING_API || process.env.BACKEND_API || "http://localhost:3002";
    const url = `${base}${backendPath}${req.nextUrl.search}`;

    const headers = new Headers(req.headers);
    const incomingHost = req.headers.get("host") ?? "";
    if (process.env.MESSAGING_API) {
      headers.set("host", new URL(process.env.MESSAGING_API).host);
    } else if (incomingHost) {
      headers.set("host", `messaging.${incomingHost}`);
    } else {
      headers.delete("host");
    }

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
  };
}
