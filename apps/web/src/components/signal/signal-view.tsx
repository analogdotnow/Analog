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
import { EventCollectionItem } from "../event-calendar/hooks/event-collection";
import { ActionButton, ActionShortcut } from "./actions";
import { EventPreview } from "./calendar/event-preview";
import { useActiveEvent } from "./calendar/use-active-event";
import { useNextEvent } from "./calendar/use-next-event";
import { Chat } from "./chat";
import { ConnectAccount } from "./connect-account";
import { Transcript } from "./voice/transcript";
import { useTranscribe } from "./voice/use-transcribe";
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

  const { isTranscribing, transcript, handleTranscriptionToggle } =
    useTranscribe({
      onTranscript: (transcript) => {
        console.log("New transcript:", transcript);
      },
    });

  const events = items.map((item) => item.event);
  const { nextEvent, ongoingEvent } = useNextEvent({ events });
  const { activeEvent } = useActiveEvent({ ongoingEvent, nextEvent });

  const [messages, setMessages] = React.useState<UIMessage[]>([]);
  const [signal, setSignal] = React.useState<AbortSignal>(
    new AbortController().signal,
  );

  // Join event hotkey
  const handleJoinEvent = () => {
    const meetingUrl = activeEvent?.conference?.joinUrl;

    if (meetingUrl) {
      window.open(meetingUrl, "_blank", "noopener,noreferrer");
    }
  };

  useHotkeys(
    "v",
    () => {
      handleTranscriptionToggle();
    },
    { scopes: ["signal-view"] },
  );

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
            className={cn("hidden", state === "expanded" && "block")}
            nextEvent={nextEvent}
            ongoingEvent={ongoingEvent}
          />
          <ConnectAccount
            className={cn("hidden", state === "expanded" && "block")}
          />
          {/* <Input
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
            placeholder="..."
          /> */}
          <Transcript
            transcript={transcript}
            isTranscribing={isTranscribing}
            className={cn("hidden", state === "expanded" && "block")}
          />
          {messages.length > 0 && (
            <Chat
              signal={signal}
              initialMessages={messages}
              onFinish={() => setMessages([])}
            />
          )}
        </div>
      </WindowContent>
      <WindowFooter>
        <div className="flex w-full gap-2">
          <ActionButton onClick={handleTranscriptionToggle}>
            {!isTranscribing ? (
              <>
                <Icons.Mic className="size-4" />
                Voice
                <ActionShortcut>V</ActionShortcut>
              </>
            ) : (
              <>
                Cancel
                <ActionShortcut>Esc</ActionShortcut>
              </>
            )}
          </ActionButton>
          {activeEvent && activeEvent.conference?.joinUrl && (
            <ActionButton onClick={handleJoinEvent}>
              <>
                <ExternalLink className="size-4" />
                Join
                <ActionShortcut>J</ActionShortcut>
              </>
            </ActionButton>
          )}
        </div>
      </WindowFooter>
    </Window>
  );
}
