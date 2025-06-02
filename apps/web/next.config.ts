import type { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const nextConfig: NextConfig = {
  // For development, don't use static export
  // For production builds, you'll need to handle API routes differently
  images: {
    unoptimized: true,
  },
};

export default withSimpleAnalytics(nextConfig);
