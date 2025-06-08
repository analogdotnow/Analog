"use client";

import type { ReactNode } from "react";

import { PushNotificationEffect } from "@/components/push-notification/push-notification-effect";
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
      <TRPCReactProvider>
        <PushNotificationEffect />
        {props.children}
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
