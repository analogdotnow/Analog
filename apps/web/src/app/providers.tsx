"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { TRPCReactProvider } from "@/lib/trpc/client";
import { TauriProvider } from "@/providers/tauri-provider";

export function Providers(props: Readonly<{ children: ReactNode }>) {
  return (
    <TauriProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TRPCReactProvider>{props.children}</TRPCReactProvider>
      </ThemeProvider>
    </TauriProvider>
  );
}
