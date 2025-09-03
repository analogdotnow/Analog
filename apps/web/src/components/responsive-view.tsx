'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { clsx } from 'clsx';
import { useState } from 'react';
import { RightSidebar } from './right-sidebar';
import { Drawer, DrawerPortal, DrawerTitle, DrawerContent } from '@/components/ui/drawer';
import { Drawer as VaulDrawer } from 'vaul';

interface ResponsiveViewProps {
  children: React.ReactNode;
}

function convertRemToPixels(rem: number) {   
  if (typeof window === 'undefined') {
    return rem * 16;
  }
  
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export function ResponsiveView({ children }: ResponsiveViewProps) {
  const snapPoints = React.useMemo(() => [`${convertRemToPixels(7)}px`, 0.4, 0.7], []);
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]!);

  console.log(snapPoints);
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    return (
      <RightSidebar side="right" className="select-none">
        {children}
      </RightSidebar>
    )
  }

  return (
    <Drawer snapPoints={snapPoints} activeSnapPoint={snap} setActiveSnapPoint={setSnap} modal={false} open>
      <DrawerPortal>
        <VaulDrawer.Content
          data-testid="content"
          className="fixed flex border flex-col bg-background border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] mx-[-1px] select-none"
        >
                  <div className="bg-muted mx-auto mt-3 mb-2 h-[6px] w-[36px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />

          <DrawerTitle className="hidden">
            Event Form
          </DrawerTitle>
          {children}
        </VaulDrawer.Content>
      </DrawerPortal>
    </Drawer>
  );
}