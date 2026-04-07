"use client";

import * as React from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchStreamLink,
  loggerLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";

import type { AppRouter } from "@repo/api";
import { env } from "@repo/env/tanstack/client";

import { superjson } from "./superjson";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") {
      return "";
    }

    if (env.VITE_VERCEL_URL) {
      return `https://${env.VITE_VERCEL_URL}`;
    }

    return "http://localhost:3000";
  })();

  return `${base}/api/trpc`;
}

interface TRPCReactProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const trpc = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        env.VITE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpBatchStreamLink({
      transformer: superjson,
      url: getUrl(),
      methodOverride: "POST",
      headers: () => {
        const headers = new Headers();

        headers.set("x-trpc-source", "start-react");

        return headers;
      },
    }),
  ],
});

export function TRPCReactProvider({
  children,
  queryClient,
}: Readonly<TRPCReactProviderProps>) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const [trpcClient] = React.useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            env.VITE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: superjson,
          url: getUrl(),
          methodOverride: "POST",
          headers: () => {
            const headers = new Headers();

            headers.set("x-trpc-source", "start-react");

            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
