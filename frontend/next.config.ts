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
    return [
      {
        source: "/listing/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_API}/listing/:path*`,
      },
      {
        source: "/messaging/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_API}/messaging/:path*`,
      },
    ];
  },
};

export default nextConfig;
