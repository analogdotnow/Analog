"use client";

import * as React from "react";
import { MicIcon } from "lucide-react";
import { Variants } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import { cn } from "@/lib/utils";
import {
  Window,
  WindowContent,
  WindowFooter,
  WindowHeader,
  WindowTitle,
} from "./window";

interface SignalViewProps {
  className?: string;
}

const VARIANTS: Variants = {
  default: {
    height: "calc(var(--spacing) * 24)",
    width: "var(--container-xs)",
    opacity: 1,
  },
  expanded: {
    height: "auto",
    width: "100%",
    opacity: 1,
  },
};

const STATES = {
  default: {
    left: {},
    right: {},
  },
};

export function SignalView({ className }: SignalViewProps) {
  const [state, setState] = React.useState<"default" | "expanded">("default");

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "v") {
        setState("expanded");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
            placeholder="Enter your prompt"
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
