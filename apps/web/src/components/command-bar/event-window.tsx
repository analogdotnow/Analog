import * as React from "react";
import { cn } from "@/lib/utils";
import { EventForm } from "../event-form/event-form";
import { Window } from "./window";
import { atom, useAtomValue } from "jotai";
import { selectedEventIdsAtom } from "@/atoms/selected-events";
import { motion, type Variants } from "motion/react";

const VARIANTS: Variants = {
  default: {
    height: "calc(var(--spacing) * 30)",
    width: "var(--container-xs)",
    opacity: 1,
  },
  expanded: {
    height: "auto",
    width: "var(--container-lg)",
    opacity: 1,
  },
};

const EVENT_FORM_VARIANTS: Variants = {
  default: {
    opacity: 0,
  },
  expanded: {
    opacity: 1,
  },
};


export const windowStateAtom = atom<"default" | "expanded">((get) => {
  const events = get(selectedEventIdsAtom);
  return events.length > 0 ? "expanded" : "default";
});

interface EventWindowProps {
  className?: string;
}

export function EventWindow({ className }: EventWindowProps) {
  const state = useAtomValue(windowStateAtom);

  return (
    <Window
      className={cn("absolute bottom-0 z-50 w-lg max-w-screen", className)}
      variants={VARIANTS}
      initial="default"
      animate={state}
    >
      <div className="flex flex-col p-2 inset-fade-shadow-light">
         <motion.div
          variants={EVENT_FORM_VARIANTS}
          initial="default"
          animate={state}
        >
          <EventForm />
        </motion.div>
      </div>
    </Window>
  );
}

export function EventActions() {
  return (
    <div className="flex flex-col p-2 inset-fade-shadow-light">
      <EventForm />
    </div>
  );
}