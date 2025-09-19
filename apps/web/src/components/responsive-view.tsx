"use client";

import * as React from "react";
import { useState } from "react";
import { Drawer as VaulDrawer } from "vaul";

import { Drawer, DrawerPortal, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { RightSidebar } from "./right-sidebar";

interface ResponsiveViewProps {
  children: React.ReactNode;
}

function convertRemToPixels(rem: number) {
  if (typeof window === "undefined") {
    return rem * 16;
  }

  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function ResponsiveView({ children }: ResponsiveViewProps) {
  const snapPoints = React.useMemo(
    () => [`${convertRemToPixels(7)}px`, 0.4, 0.7],
    [],
  );
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]!);

  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <RightSidebar variant="inset" side="right" className="select-none">
        {children}
      </RightSidebar>
    );
  }

  return (
    <Drawer
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      modal={false}
      open
    >
      <DrawerPortal>
        <VaulDrawer.Content
          data-testid="content"
          className="border-b-none fixed right-0 bottom-0 left-0 mx-[-1px] flex h-full max-h-[97%] flex-col rounded-t-[10px] border bg-background select-none"
        >
          <div className="mx-auto mt-3 mb-2 h-[6px] w-[36px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />

          <DrawerTitle className="hidden">Event Form</DrawerTitle>
          {children}
        </VaulDrawer.Content>
      </DrawerPortal>
    </Drawer>
  );
}
