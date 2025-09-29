import * as React from "react";
import { atom, useAtomValue } from "jotai";
import { motion, type Variants } from "motion/react";

import { selectedEventIdsAtom } from "@/atoms/selected-events";
import { cn } from "@/lib/utils";
import { CommandBar, CreateEventInput } from "../ai-input/create-event-input";
import { EventForm } from "../event-form/event-form";
import { Action, ActionButton, ActionShortcut } from "../signal/actions";
import { Window } from "./window";

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

const EVENT_INPUT_VARIANTS: Variants = {
  default: {
    opacity: 1,
  },
  expanded: {
    opacity: 0,
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
    <div
      className={cn(
        "absolute bottom-8 left-1/2 z-50 w-lg max-w-screen -translate-x-1/2",
        className,
      )}
    >
      <Window
        className="w-full"
        variants={VARIANTS}
        initial="default"
        animate={state}
      >
        <div className="flex flex-col p-2 inset-fade-shadow-light">
          <motion.div
            variants={EVENT_INPUT_VARIANTS}
            initial="default"
            animate={state}
          >
            {/* <CommandBar>
              <CreateEventInput />
            </CommandBar> */}
          </motion.div>
          <motion.div
            variants={EVENT_FORM_VARIANTS}
            initial="default"
            animate={state}
          >
            <EventForm />
          </motion.div>
        </div>
      </Window>
      <EventActions />
    </div>
  );
}

export function EventActions() {
  return (
    <div className="flex flex-col p-2 inset-fade-shadow-light">
      <div className="flex w-full gap-2">
        <ActionButton onClick={() => {}}>
          Voice
          <ActionShortcut>V</ActionShortcut>
        </ActionButton>
      </div>
    </div>
  );
}
