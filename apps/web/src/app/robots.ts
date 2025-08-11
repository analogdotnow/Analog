import type { MetadataRoute } from "next";

import { URLS } from "@/lib/urls";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog", "/blog/*", "/privacy", "/terms", "/login"],
      disallow: ["/calendar", "/calendar/*", "/api/*", "/auth/*", "/_next/*"],
    },
    sitemap: `${URLS.SITE}/sitemap.xml`,
  };
}
