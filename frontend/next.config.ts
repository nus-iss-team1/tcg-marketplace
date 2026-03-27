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
    ],
  },
  async rewrites() {
    const listingApi = process.env.NEXT_PUBLIC_LISTING_API || process.env.NEXT_PUBLIC_BACKEND_API;
    const messagingApi = process.env.NEXT_PUBLIC_MESSAGING_API || process.env.NEXT_PUBLIC_BACKEND_API;
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
