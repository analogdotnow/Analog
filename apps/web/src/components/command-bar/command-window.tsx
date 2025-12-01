"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { AnimatePresence, motion, type Variants } from "motion/react";

import { selectedEventIdsAtom } from "@/atoms/selected-events";
import { cn } from "@/lib/utils";
import { StackedWindow } from "./stacked-window";
import { useWindowStack } from "./use-window-stack";
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

interface CommandWindowProps {
  className?: string;
}

export function CommandWindow({ className }: CommandWindowProps) {
  "use memo";

  const manager = useWindowStack();
  const selectedEvents = useAtomValue(selectedEventIdsAtom);

  return (
    <div
      className={cn(
        "absolute bottom-0 left-1/2 h-fit w-lg max-w-screen -translate-x-1/2",
        className,
      )}
    >
      <motion.div
        className={cn(
          "absolute bottom-0 left-1/2 h-fit w-lg max-w-screen -translate-x-1/2",
          className,
        )}
        variants={STACK_CONTAINER_VARIANTS}
        animate={selectedEvents.length > 1 ? "shifted" : "default"}
      >
        {manager.arrangedWindows.map((entry, index) => (
          <StackedWindow
            key={entry.id}
            windows={manager.arrangedWindows}
            entryId={entry.id}
            index={index}
          >
            {entry.type === "event" ? <EventWindow /> : null}
          </StackedWindow>
        ))}
      </motion.div>
      <AnimatePresence>
        {selectedEvents.length > 1 ? (
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

// export function EventActions() {
//   return (
//     <div className="flex flex-col pt-2">
//       <div className="flex w-full gap-2">
//         <CommandAction onClick={() => {}}>
//           <MicrophoneIcon className="size-4 opacity-60" />
//           <span className="sr-only">Voice</span>
//         </CommandAction>
//         <CommandBar className="w-full">
//           <CommandBarInput placeholder="Command..." />
//         </CommandBar>
//       </div>
//     </div>
//   );
// }
