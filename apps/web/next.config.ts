import type { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSimpleAnalytics(nextConfig);
