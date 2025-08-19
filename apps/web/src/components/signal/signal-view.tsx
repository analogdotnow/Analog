"use client";

import * as React from "react";
import { UIMessage } from "@ai-sdk/react";
import { ExternalLink } from "lucide-react";
import { Variants } from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";

import * as Icons from "@/components/icons";
import { Button } from "@/components/ui/button";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import { cn } from "@/lib/utils";
import { EventCollectionItem } from "../calendar/hooks/event-collection";
import { ActionButton, ActionShortcut } from "./actions";
import { EventPreview } from "./calendar/event-preview";
import { useActiveEvent } from "./hooks/use-active-event";
import { useUpcomingEvent } from "./hooks/use-upcoming-event";
import {
  Window,
  WindowContent,
  WindowFooter,
  WindowHeader,
  WindowTitle,
} from "./window";

interface SignalViewProps {
  className?: string;
  items: EventCollectionItem[];
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

export function SignalView({ className, items }: SignalViewProps) {
  const [state, setState] = React.useState<"default" | "expanded">("expanded");

  const { nextEvent, ongoingEvent } = useUpcomingEvent({ events: items });
  const { activeEvent } = useActiveEvent({ ongoingEvent, nextEvent });

  // Join event hotkey
  const handleJoinEvent = () => {
    const meetingUrl = activeEvent?.event.conference?.video?.joinUrl?.value;

    if (meetingUrl) {
      window.open(meetingUrl, "_blank", "noopener,noreferrer");
    }
  };

  useHotkeys(
    "j",
    () => {
      handleJoinEvent();
    },
    { scopes: ["signal-view"] },
  );

  return (
    <Window
      className={cn("max-w-md", className)}
      variants={VARIANTS}
      initial="default"
      animate={state}
    >
      <WindowHeader>
        <WindowTitle>Signal</WindowTitle>
      </WindowHeader>
      <WindowContent>
        <div className="flex flex-col gap-2 p-3">
          <EventPreview
            className={cn("hidden", state === "expanded" && "flex")}
            nextEvent={nextEvent}
            ongoingEvent={ongoingEvent}
          />
        </div>
      </WindowContent>
      <WindowFooter>
        <div className="flex w-full gap-2">
          {activeEvent
            ? activeEvent.event.conference?.video?.joinUrl?.value && (
                <ActionButton onClick={handleJoinEvent}>
                  <>
                    <ExternalLink className="size-4" />
                    Join
                    <ActionShortcut>J</ActionShortcut>
                  </>
                </ActionButton>
              )
            : null}
        </div>
      </WindowFooter>
    </Window>
  );
}
