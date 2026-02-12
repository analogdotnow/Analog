"use client";

import { AnimatePresence, motion } from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";

import { useToggleWindowsExpanded, useWindowsExpanded } from "@/store/hooks";

export function CommandWindowOverlay() {
  "use memo";

  const visible = useWindowsExpanded();
  const toggleExpanded = useToggleWindowsExpanded();

  useHotkeys("x", () => toggleExpanded());
  useHotkeys("escape", () => toggleExpanded(), { enabled: visible });

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.85, 0, 0.15, 1] }}
          className="fixed inset-0 z-0 bg-background/80 backdrop-blur-sm"
        />
      ) : null}
    </AnimatePresence>
  );
}
