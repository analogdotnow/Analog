"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TranscriptProps {
  transcript: string;
  isTranscribing: boolean;
  isPaused?: boolean;
  className?: string;
}

export function Transcript({ 
  transcript, 
  isTranscribing, 
  isPaused = false, 
  className 
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
      className={cn(
        "flex flex-col gap-2 max-h-32 overflow-hidden",
        className
      )}
    >
      <div
        ref={scrollRef}
        className={cn(
          "min-h-16 max-h-24 overflow-y-auto text-sm leading-relaxed",
          !transcript && "flex items-start justify-start text-muted-foreground"
        )}
      >
        <span>
          {transcript}
        </span>
      </div>
    </div>
  );
} 