import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  // Note: Environment variables are automatically available in Next.js
  // No need to explicitly set them here, but keeping for clarity
};

export default nextConfig;
