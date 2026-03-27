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
<<<<<<< HEAD
<<<<<<< HEAD
        source: "/api/:path*",
        destination: `${process.env.BACKEND_API}/api/:path*`,
=======
        source: "/listing/:path*",
=======
        source: "/api/listing/:path*",
<<<<<<< HEAD
>>>>>>> 77596b0 (feat: add forgot password flow, fix API proxy routing and mobile edit buttons)
        destination: `${process.env.NEXT_PUBLIC_BACKEND_API}/listing/:path*`,
      },
      {
        source: "/api/messaging/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_API}/messaging/:path*`,
>>>>>>> f24248a (feat: add messaging service to CI/CD pipeline and infrastructure)
=======
        destination: `${listingApi}/listing/:path*`,
      },
      {
        source: "/api/messaging/:path*",
        destination: `${messagingApi}/messaging/:path*`,
>>>>>>> 6fe6a2b (feat: add subdomain-based routing for backend services)
      },
    ];
  },
};

export default nextConfig;
