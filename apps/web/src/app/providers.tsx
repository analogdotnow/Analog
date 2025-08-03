"use client";

import type { ReactNode } from "react";
import { Provider as JotaiProvider } from "jotai";

import { jotaiStore } from "@/atoms/store";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function Providers(props: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <JotaiProvider store={jotaiStore}>
        <TRPCReactProvider>{props.children}</TRPCReactProvider>
      </JotaiProvider>
    </ThemeProvider>
  );
}
