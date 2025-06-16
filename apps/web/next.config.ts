import type { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SIMPLE_ANALYTICS_HOSTNAME:
      process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS_HOSTNAME ?? "localhost",
  },
};

export default withSimpleAnalytics(nextConfig);
