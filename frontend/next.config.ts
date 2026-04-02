import type { NextConfig } from "next";


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
      { hostname: "assets.tcgdex.net" },
    ],
  },
  async rewrites() {
    const listingApi = process.env.NEXT_PUBLIC_LISTING_API || "http://localhost:3001";
    const messagingApi = process.env.NEXT_PUBLIC_MESSAGING_API || "http://localhost:3002";
    return [
      {
        source: "/api/listing/:path*",
        destination: `${listingApi}/:path*`,
      },
      {
        source: "/api/messaging/:path*",
        destination: `${messagingApi}/:path*`,
      },
    ];
  },
};

export default nextConfig;
