"use client";

import * as React from "react";
import { MicIcon, MicOffIcon, PauseIcon, PlayIcon } from "lucide-react";
import { Variants } from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import { CalendarEvent } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { EventPreview } from "./event-preview";
import { Transcript } from "./transcript";
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
  
  const { 
    isTranscribing, 
    isPaused, 
    transcript, 
    handleTranscriptionToggle,
    pauseTranscription,
    resumeTranscription,
  } = useTranscribe({
    onTranscript: (transcript) => {
      console.log("New transcript:", transcript);
    },
  });

  useHotkeys("v", () => {
    handleTranscriptionToggle();
  });

  useHotkeys("space", (e) => {
    if (isTranscribing) {
      e.preventDefault();
      if (isPaused) {
        resumeTranscription();
      } else {
        pauseTranscription();
      }
    }
  });

  const getMainButtonContent = () => {
    if (!isTranscribing) {
      return {
        icon: <MicIcon className="size-4" />,
        text: "Voice",
        className: "",
      };
    }
    
    if (isPaused) {
      return {
        icon: <PlayIcon className="size-4" />,
        text: "Resume",
        className: "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
      };
    }
    
    return {
      icon: <MicOffIcon className="size-4" />,
      text: "Stop",
      className: "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    };
  };

  const handleMainButtonClick = () => {
    if (!isTranscribing) {
      handleTranscriptionToggle();
    } else if (isPaused) {
      resumeTranscription();
    } else {
      handleTranscriptionToggle(); // Stop
    }
  };

  const buttonContent = getMainButtonContent();

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
          <Input
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent"
            placeholder="..."
          />
          <Transcript 
            transcript={transcript}
            isTranscribing={isTranscribing}
            isPaused={isPaused}
            className={cn("hidden", state === "expanded" && "block")}
          />
          <EventPreview
            className={cn("hidden", state === "expanded" && "block")}
            events={events}
          />
        </div>
      </WindowContent>
      <WindowFooter>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 gap-2 rounded-md ps-2 pe-1 text-xs shadow-none dark:bg-neutral-700/40",
              buttonContent.className
            )}
            onClick={handleMainButtonClick}
          >
            {buttonContent.icon}
            {buttonContent.text}
            <KeyboardShortcut className="bg-neutral-700 text-neutral-400">
              V
            </KeyboardShortcut>
          </Button>
          
          {isTranscribing && !isPaused && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-2 rounded-md ps-2 pe-1 text-xs shadow-none dark:bg-neutral-700/40"
              onClick={pauseTranscription}
            >
              <PauseIcon className="size-4" />
              Pause
              <KeyboardShortcut className="bg-neutral-700 text-neutral-400">
                Space
              </KeyboardShortcut>
            </Button>
          )}
        </div>
      </WindowFooter>
    </Window>
  );
}
