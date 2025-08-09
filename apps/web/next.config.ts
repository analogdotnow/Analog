import type { NextConfig } from "next";
import withSimpleAnalytics from "@simpleanalytics/next/plugin";

import { URLS } from "./src/lib/urls";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/discord",
        destination: URLS.DISCORD,
        permanent: false,
      },
    ];
  },
  async headers() {
    // For routes that are public
    const headers = [
      { key: "Access-Control-Allow-Credentials", value: "true" },
      { key: "Access-Control-Allow-Origin", value: "*" },
      {
        key: "Access-Control-Allow-Methods",
        value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      },
      {
        key: "Access-Control-Allow-Headers",
        value: "Authorization, Content-Type, X-CSRF-Token, X-API-Key",
      },
    ];

    return [
      {
        source: "/api/mcp/:path*",
        headers,
      },
      {
        source: "/api/auth/mcp/:path*",
        headers,
      },
      {
        source: "/api/v1/:path*",
        headers,
      },
      {
        source: "/api/openapi.json",
        headers,
      },
    ];
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    // @ts-expect-error any
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default withSimpleAnalytics(nextConfig);
