import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Skip linting and type checking during Docker build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Standalone output for Docker deployment
  output: 'standalone',
  // Disable experimental features that may cause issues
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tcg-marketplace-dev-storage-*.s3.ap-southeast-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig