import type { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },};

export default withSimpleAnalytics(nextConfig);
