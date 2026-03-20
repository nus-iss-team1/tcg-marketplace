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
      ...(process.env.NEXT_PUBLIC_CDN_HOSTNAME
        ? [{ hostname: process.env.NEXT_PUBLIC_CDN_HOSTNAME }]
        : []),
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_API}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
