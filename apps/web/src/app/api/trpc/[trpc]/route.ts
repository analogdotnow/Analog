import type { NextRequest } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createContext } from "@repo/api";
import { env } from "@repo/env/server";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      try {
        return await createContext({ headers: req.headers });
      } catch (error) {
        console.error("Failed to create context:", error);
        // Re-throw the error to let tRPC handle it properly
        throw error;
      }
    },
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
            console.error("Full error:", error);
            console.error("Error stack:", error.stack);
            console.error("Error cause:", error.cause);
          }
        : ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
            console.error("Error code:", error.code);
            console.error("Error cause:", error.cause);
          },
  });

export { handler as GET, handler as POST };
