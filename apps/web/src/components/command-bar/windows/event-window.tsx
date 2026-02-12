"use client";

import * as React from "react";

import { ContextView } from "@/components/command-bar/context-view";
import { Window } from "@/components/command-bar/window";
import { EventForm } from "@/components/event-form/event-form";
import { cn } from "@/lib/utils";
import { useWindowState } from "@/store/hooks";

const CONTAINER_VARIANTS = {
  xs: {
    height: "calc(var(--spacing) * 12)",
    width: "var(--container-sm)",
  },
  sm: {
    height: "calc(var(--spacing) * 16)",
    width: "var(--container-md)",
  },
  md: {
    height: "calc(var(--spacing) * 20)",
    width: "var(--container-lg)",
  },
  lg: {
    height: "calc(19.25rem + 2px)",
    width: "var(--container-lg)",
  },
};

function useDelayedValue(value: "xs" | "lg", delay: number) {
  const [delayedValue, setDelayedValue] = React.useState(value);

  React.useEffect(() => {
    if (value === "xs") {
      const id = setTimeout(() => setDelayedValue("xs"), delay);

      return () => clearTimeout(id);
    }

    setDelayedValue("lg");
  }, [value, delay]);

  return delayedValue;
}

interface EventWindowProps {
  ref?: React.Ref<HTMLDivElement>;
}

export function EventWindow({ ref }: EventWindowProps) {
  "use memo";

  const state = useWindowState();
  const delayedState = useDelayedValue(state, 1000);

  return (
    <Window
      ref={ref}
      className={cn(
        "absolute bottom-0 left-1/2 h-12 w-lg max-w-screen -translate-x-1/2 overflow-hidden transition-[height] duration-500",
      )}
      variants={CONTAINER_VARIANTS}
      initial="xs"
      animate={state}
    >
      <div className="size-full inset-fade-shadow-light" data-state={state}>
        <React.Activity mode={state === "xs" ? "visible" : "hidden"}>
          <div className="absolute inset-0 p-2">
            <div className="flex flex-col gap-2 opacity-100 transition-opacity delay-100 duration-500 ease-in-out in-data-[state=lg]:opacity-0">
              <ContextView />
              {/* <div className="flex justify-between gap-2">
                <Button variant="ghost" size="xs" className="ps-1 pe-2">
                  <ArrowLeftIcon className="size-4" />
                  Show in Gmail
                </Button>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="xs" className="px-2">
                    Decline
                  </Button>
                  <Button variant="ghost" size="xs" className="px-2">
                    Maybe
                  </Button>
                  <Button variant="ghost" size="xs" className="px-2">
                    Accept
                  </Button>
                </div>
              </div> */}
            </div>
          </div>
        </React.Activity>
        <React.Activity mode={delayedState === "lg" ? "visible" : "hidden"}>
          <div className="absolute inset-0 p-2">
            <div className="opacity-0 transition-opacity delay-100 duration-200 ease-in-out in-data-[state=lg]:opacity-100">
              <EventForm />
            </div>
          </div>
        </React.Activity>
      </div>
    </Window>
  );
}
