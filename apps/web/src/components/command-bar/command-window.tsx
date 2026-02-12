"use client";

import * as React from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";

import { useContainerSize } from "@/hooks/use-container-size";
import { cn } from "@/lib/utils";
import { useSelectedEventList, useWindowsExpanded } from "@/store/hooks";
import { CommandWindowOverlay } from "../overlay-toggle";
import type { StackWindowEntry } from "./interfaces";
import { StackedWindowContainer } from "./stacked-window";
import {
  WindowLayoutProvider,
  useWindowLayout,
} from "./window-layout-provider";
import { WindowStackProvider, useWindowStack } from "./window-stack-provider";
import { BulkActionWindow } from "./windows/bulk-action-window";
import { EventWindow } from "./windows/event-window";

const BULK_ACTION_HEIGHT = 56;

const STACK_CONTAINER_VARIANTS: Variants = {
  default: { y: 0 },
  shifted: { y: -BULK_ACTION_HEIGHT },
};

const BULK_ACTION_VARIANTS: Variants = {
  initial: { y: BULK_ACTION_HEIGHT, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: BULK_ACTION_HEIGHT, opacity: 0 },
};

interface WindowStackProps {
  className?: string;
}

export function WindowStack({ className }: WindowStackProps) {
  "use memo";

  return (
    <WindowStackProvider>
      <WindowLayoutProvider>
        <CommandWindowOverlay />
        <WindowStackLayout className={className} />
      </WindowLayoutProvider>
    </WindowStackProvider>
  );
}

interface WindowStackLayoutProps {
  className?: string;
}

function WindowStackLayout({ className }: WindowStackLayoutProps) {
  "use memo";

  const manager = useWindowStack();
  const selectedEvents = useSelectedEventList();
  const isExpanded = useWindowsExpanded();
  const { depths, offsets } = useWindowLayout();

  return (
    <div
      className={cn(
        "absolute bottom-0 left-1/2 z-10 w-[calc(var(--container-lg)+var(--spacing)*4)] max-w-screen -translate-x-1/2",
        isExpanded ? "top-4 overflow-hidden" : "h-fit",
        className,
      )}
    >
      <WindowStackContainer className={cn(className)}>
        {manager.arrangedWindows.map((entry, index) => (
          <MeasuredStackEntry
            key={entry.id}
            entry={entry}
            depth={depths[index]!}
            expandedOffsetY={offsets[index]!}
          />
        ))}
      </WindowStackContainer>
      <AnimatePresence>
        {selectedEvents.length > 1 && !isExpanded ? (
          <motion.div
            className="absolute bottom-2 left-1/2 -translate-x-1/2"
            variants={BULK_ACTION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <BulkActionWindow />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface WindowStackContainerProps {
  children: React.ReactNode;
  className?: string;
}

function WindowStackContainer({
  children,
  className,
}: WindowStackContainerProps) {
  "use memo";

  const isExpanded = useWindowsExpanded();
  const selectedEvents = useSelectedEventList();
  const { contentHeight } = useWindowLayout();

  return (
    // <ScrollArea className={cn("absolute", isExpanded ? "min-h-full" : "h-fit")} scrollFade>
    <motion.div
      className={cn(
        "absolute bottom-4",
        isExpanded
          ? "h-(--content-height) min-h-full w-[calc(var(--container-lg)+var(--spacing)*4)]"
          : "left-1/2 h-fit w-lg max-w-screen -translate-x-1/2",
        className,
      )}
      style={{ "--content-height": `${contentHeight}px` }}
      variants={STACK_CONTAINER_VARIANTS}
      animate={!isExpanded && selectedEvents.length > 1 ? "shifted" : "default"}
    >
      {children}
    </motion.div>
    // </ScrollArea>
  );
}

interface MeasuredStackEntryProps {
  entry: StackWindowEntry;
  depth: number;
  expandedOffsetY: number;
}

function MeasuredStackEntry({
  entry,
  depth,
  expandedOffsetY,
}: MeasuredStackEntryProps) {
  "use memo";

  const windowRef = React.useRef<HTMLDivElement>(null);
  const { height } = useContainerSize(windowRef);
  const { setMeasuredHeight, removeMeasuredHeight } = useWindowLayout();

  React.useEffect(() => {
    if (height > 0) {
      setMeasuredHeight(entry.id, height);
    }

    return () => {
      removeMeasuredHeight(entry.id);
    };
  }, [entry.id, height, setMeasuredHeight, removeMeasuredHeight]);

  return (
    <StackedWindowContainer
      entryId={entry.id}
      depth={depth}
      expandedOffsetY={expandedOffsetY}
    >
      {entry.type === "event" ? <EventWindow ref={windowRef} /> : null}
    </StackedWindowContainer>
  );
}
