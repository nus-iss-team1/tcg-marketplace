import type { NextConfig } from "next";

const listingApi = process.env.LISTING_API || process.env.BACKEND_API || "http://localhost:3001";
const messagingApi = process.env.MESSAGING_API || process.env.BACKEND_API || "http://localhost:3002";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      { hostname: "picsum.photos" },
      { hostname: "*.cloudfront.net" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/listing/:path*",
        destination: `${listingApi}/listing/:path*`,
      },
      {
        source: "/api/messaging/:path*",
        destination: `${messagingApi}/messaging/:path*`,
      },
    ];
  },
};

export default nextConfig;
