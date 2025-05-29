import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For development, don't use static export
  // For production builds, you'll need to handle API routes differently
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
