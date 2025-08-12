import { generateOpenApiDocument } from "trpc-to-openapi";

import { env } from "@repo/env/client";

import { appRouter } from "./root";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Analog API",
  version: "1.0.0",
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${env.NEXT_PUBLIC_VERCEL_URL}`,

  securitySchemes: {
    apiKey: {
      type: "apiKey",
      in: "header",
      name: "x-api-key",
    },
  },
});
