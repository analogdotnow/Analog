"use client";

import * as React from "react";
import { MicIcon } from "lucide-react";
import { Variants } from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import { CalendarEvent } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { EventPreview } from "./event-preview";
import {
  Window,
  WindowContent,
  WindowFooter,
  WindowHeader,
  WindowTitle,
} from "./window";

interface SignalViewProps {
  className?: string;
  events: CalendarEvent[];
}

const VARIANTS: Variants = {
  default: {
    height: "calc(var(--spacing) * 30)",
    width: "var(--container-xs)",
    opacity: 1,
  },
  expanded: {
    height: "auto",
    width: "100%",
    opacity: 1,
  },
};

export function SignalView({ className, events }: SignalViewProps) {
  const [state, setState] = React.useState<"default" | "expanded">("expanded");

  useHotkeys("v", () => {
    setState("expanded");
  });

  return (
    <Window
      className={cn("max-h-48 max-w-md", className)}
      variants={VARIANTS}
      initial="default"
      animate={state}
    >
      <WindowHeader>
        <WindowTitle>Signal</WindowTitle>
      </WindowHeader>
      <WindowContent>
        <div className="flex flex-col gap-2">
          <Input
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
            placeholder="..."
          />
          <EventPreview
            className={cn("hidden", state === "expanded" && "block")}
            events={events}
          />
        </div>
      </WindowContent>
      <WindowFooter>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-2 rounded-md ps-2 pe-1 text-xs shadow-none dark:bg-neutral-700/40"
        >
          <MicIcon className="size-4" />
          Voice
          <KeyboardShortcut className="bg-neutral-700 text-neutral-400">
            V
          </KeyboardShortcut>
        </Button>
      </WindowFooter>
    </Window>
  );
}
