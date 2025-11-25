"use client";

import type { ReactNode } from "react";
import { Provider as JotaiProvider } from "jotai";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { jotaiStore } from "@/atoms/store";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TRPCReactProvider } from "@/lib/trpc/client";
import { CounterStoreProvider } from "@/stores/counter-store-provider";

export function Providers(props: Readonly<{ children: ReactNode }>) {
  return (
    <NuqsAdapter>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <JotaiProvider store={jotaiStore}>
          <CounterStoreProvider>
            <TRPCReactProvider>{props.children}</TRPCReactProvider>
          </CounterStoreProvider>
        </JotaiProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
