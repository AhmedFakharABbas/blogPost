import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose'],
  eslint: {
    // Disable ESLint during builds to avoid patching issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional: ignore TypeScript errors during builds if needed
    // ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
  // Optimize bundle splitting
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@/components/ui',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-sheet',
    ],
  },
  // Performance optimizations
  // Note: swcMinify is enabled by default in Next.js 15, no need to specify
  // Reduce JavaScript bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

export default nextConfig;
