"use client";

import * as React from "react";
import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";
import { useWindowsExpanded } from "@/store/hooks";
import { useWindowStack } from "./window-stack-provider";

interface StackCustom {
  depth: number;
  expandedOffsetY: number;
}

// Keep the stacking animation 2D; 3D transforms break backdrop-filter composition in browsers.
const STACK_VARIANTS: Variants = {
  active: {
    y: 0,
    scale: 1,
    zIndex: 10,
  },
  behind: ({ depth }: StackCustom) => ({
    y: -(depth * 24),
    scale: 1 - Math.min(depth * 0.04, 0.12),
    zIndex: 10 - depth,
  }),
  expanded: ({ depth, expandedOffsetY }: StackCustom) => ({
    y: expandedOffsetY,
    scale: 1,
    zIndex: 10 - depth,
  }),
  // Hover variants to keep animations centralized
  hoverActive: {},
  hoverBehind: ({ depth }: StackCustom) => ({
    scale: (1 - Math.min(depth * 0.04, 0.12)) * 1.02,
  }),
};

interface StackedWindowProps {
  entryId: string;
  /** Depth in the stack (0 = active, 1+ = behind) */
  depth: number;
  /** Y offset for expanded mode (bottom-aligned, so negative values push windows up) */
  expandedOffsetY: number;
  children: React.ReactNode;
}

export function StackedWindowContainer({
  entryId,
  depth,
  expandedOffsetY,
  children,
}: StackedWindowProps) {
  "use memo";

  const isExpanded = useWindowsExpanded();
  const { activeWindowId, setActiveWindowId } = useWindowStack();

  const isActive = entryId === activeWindowId;

  return (
    <motion.div
      variants={STACK_VARIANTS}
      animate={isExpanded ? "expanded" : isActive ? "active" : "behind"}
      custom={{ depth, expandedOffsetY }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      whileHover={
        isExpanded ? undefined : isActive ? "hoverActive" : "hoverBehind"
      }
      className={cn(
        "absolute inset-x-0 bottom-0 flex justify-center",
        !isActive && !isExpanded && "cursor-pointer",
      )}
      onClick={() => {
        if (!isActive && !isExpanded) {
          setActiveWindowId(entryId);
        }
      }}
    >
      <div
        className={cn("", !isActive && !isExpanded && "pointer-events-none")}
        aria-hidden={isActive || isExpanded ? undefined : true}
        inert={!isActive && !isExpanded}
      >
        {children}
      </div>
    </motion.div>
  );
}
