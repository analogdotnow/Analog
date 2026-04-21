import * as React from "react";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { TRPCReactProvider } from "@/lib/trpc/client";
import { getQueryClient } from "@/lib/trpc/query-client";
import { routeTree } from "./routeTree.gen";

interface RootDocumentProps {
  children: React.ReactNode;
}

export function getRouter() {
  const queryClient = getQueryClient();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,

    Wrap: ({ children }: Readonly<RootDocumentProps>) => (
      <TRPCReactProvider queryClient={queryClient}>
        {children}
      </TRPCReactProvider>
    ),
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    wrapQueryClient: false,
  });

  return router;
}

export type AppRouter = ReturnType<typeof getRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
