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
<<<<<<< HEAD
<<<<<<< HEAD
        source: "/api/:path*",
        destination: `${process.env.BACKEND_API}/api/:path*`,
=======
        source: "/listing/:path*",
=======
        source: "/api/listing/:path*",
>>>>>>> 77596b0 (feat: add forgot password flow, fix API proxy routing and mobile edit buttons)
        destination: `${process.env.NEXT_PUBLIC_BACKEND_API}/listing/:path*`,
      },
      {
        source: "/api/messaging/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_API}/messaging/:path*`,
>>>>>>> f24248a (feat: add messaging service to CI/CD pipeline and infrastructure)
      },
    ];
  },
};

export default nextConfig;
