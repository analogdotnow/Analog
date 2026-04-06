"use client";

import * as React from "react";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { QueryClient } from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
  removeOldestQuery,
} from "@tanstack/react-query-persist-client";
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

const persister = createAsyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : null,
  throttleTime: 1000,
  retry: removeOldestQuery,
  serialize: (data) => superjson.stringify(data),
  deserialize: (data) => superjson.parse(data),
});

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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, buster: "06-04-2026" }}
    >
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </PersistQueryClientProvider>
  );
}
