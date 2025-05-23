"use client";

import type { ReactNode } from "react";
import { TRPCReactProvider } from "@/lib/trpc/client";
import { ThemeProvider } from "@/components/ui/theme-provider";

export function Providers(props: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TRPCReactProvider>{props.children}</TRPCReactProvider>
    </ThemeProvider>
  );
}
