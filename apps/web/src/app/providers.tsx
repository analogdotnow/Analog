"use client";

import type { ReactNode } from "react";
import { Provider as JotaiProvider } from "jotai";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function Providers(props: Readonly<{ children: ReactNode }>) {
  return (
    <TRPCReactProvider>
      <JotaiProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {props.children}
        </ThemeProvider>
      </JotaiProvider>
    </TRPCReactProvider>
  );
}
