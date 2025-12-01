"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { windowStateAtom } from "@/atoms/window-state";
import { EventForm } from "@/components/event-form/event-form";
import { cn } from "@/lib/utils";
import { ContextView } from "../context-view";
import { Window } from "../window";

const CONTAINER_VARIANTS = {
  default: {
    // height: "calc(var(--spacing) * 30)",
    width: "var(--container-sm)",
  },
  expanded: {
    height: "calc(19.25rem + 2px)",
    width: "var(--container-lg)",
  },
};

function useDelayedValue(value: "default" | "expanded", delay: number) {
  const [delayedValue, setDelayedValue] = React.useState(value);

  React.useEffect(() => {
    if (value === "default") {
      const id = setTimeout(() => setDelayedValue("default"), delay);

      return () => clearTimeout(id);
    }

    setDelayedValue("expanded");
  }, [value, delay]);

  return delayedValue;
}

export function EventWindow() {
  "use memo";

  const state = useAtomValue(windowStateAtom);

  const delayedState = useDelayedValue(state, 1000);

  return (
    <Window
      className={cn(
        "absolute bottom-0 left-1/2 h-12 w-lg max-w-screen -translate-x-1/2 overflow-hidden transition-[height] duration-500",
      )}
      variants={CONTAINER_VARIANTS}
      initial="default"
      animate={state}
    >
      <div className="size-full inset-fade-shadow-light" data-state={state}>
        <React.Activity mode={state === "default" ? "visible" : "hidden"}>
          <div className="absolute inset-0 p-2">
            <div className="opacity-100 transition-opacity delay-100 duration-500 ease-in-out in-data-[state=expanded]:opacity-0">
              <ContextView />
            </div>
          </div>
        </React.Activity>
        <React.Activity
          mode={delayedState === "expanded" ? "visible" : "hidden"}
        >
          <div className="absolute inset-0 p-2">
            <div className="opacity-0 transition-opacity delay-100 duration-200 ease-in-out in-data-[state=expanded]:opacity-100">
              <EventForm />
            </div>
          </div>
        </React.Activity>
      </div>
    </Window>
  );
}
