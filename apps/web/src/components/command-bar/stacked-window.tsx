"use client";

import * as React from "react";
import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

export interface EventWindowEntry {
  id: string;
  type: "event";
  eventId: string;
}

export type StackWindowEntry = EventWindowEntry;

// Keep the stacking animation 2D; 3D transforms break backdrop-filter composition in browsers.
const STACK_VARIANTS: Variants = {
  active: {
    y: 0,
    scale: 1,
    zIndex: 10,
  },
  behind: (index: number) => {
    const depth = index + 1;

    return {
      y: depth * 16,
      scale: 1 - Math.min(depth * 0.04, 0.12),
      zIndex: 10 - depth,
    };
  },
  // Hover variants to keep animations centralized
  hoverActive: {},
  hoverBehind: (index: number) => {
    return {
      scale: (1 - Math.min((index + 1) * 0.04, 0.12)) * 1.02,
    };
  },
};

interface StackedWindowProps {
  windows: StackWindowEntry[];
  entryId: string;
  index: number;
  children: React.ReactNode;
}

export function StackedWindow({
  windows,
  entryId,
  index,
  children,
}: StackedWindowProps) {
  "use memo";

  const activeId = windows[0]?.id ?? null;
  const isActive = entryId === activeId;
  const stackIndex = windows.length - 1 - index;

  return (
    <motion.div
      variants={STACK_VARIANTS}
      animate={isActive ? "active" : "behind"}
      custom={stackIndex}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      whileHover={isActive ? "hoverActive" : "hoverBehind"}
      className="absolute inset-x-0 bottom-4 flex justify-center"
    >
      <div
        className={cn("", !isActive && "pointer-events-none")}
        aria-hidden={isActive ? undefined : true}
        inert={!isActive}
      >
        {/* <div className="absolute inset-0 bg-red-500" /> */}
        {children}
      </div>
    </motion.div>
  );
}
