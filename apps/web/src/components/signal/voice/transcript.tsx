"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface TranscriptProps {
  transcript: string;
  isTranscribing: boolean;
  className?: string;
}

export function Transcript({
  transcript,
  isTranscribing,
  className,
}: TranscriptProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when transcript updates
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div
      className={cn("flex max-h-32 flex-col gap-2 overflow-hidden", className)}
    >
      <div
        ref={scrollRef}
        className={cn(
          "max-h-24 min-h-16 overflow-y-auto text-sm leading-relaxed",
          !transcript && "flex items-start justify-start text-muted-foreground",
        )}
      >
        <span>{transcript}</span>
      </div>
    </div>
  );
}
