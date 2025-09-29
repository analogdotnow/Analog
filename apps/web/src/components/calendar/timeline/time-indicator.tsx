import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { currentDateAtom } from "@/atoms/view-preferences";
import { useCurrentTimeIndicator } from "./use-current-time-indicator";

interface TimeIndicatorProps {
  date: Temporal.PlainDate;
}

export function TimeIndicator({ date }: TimeIndicatorProps) {
  const { position, visible } = useCurrentTimeIndicator({
    date,
  });

  if (!visible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20 select-none"
      style={{ top: `${position}px` }}
      suppressHydrationWarning
    >
      <div className="relative flex items-center gap-0.5">
        <div className="absolute left-0.5 h-3.5 w-1 rounded-full bg-red-500/90"></div>
        <div className="h-0.5 w-1.5"></div>
        <div className="h-0.5 w-full rounded-r-full bg-red-500/90"></div>
      </div>
    </div>
  );
}

export function TimeIndicatorBackground() {
  const date = useAtomValue(currentDateAtom);

  const { position, label } = useCurrentTimeIndicator({
    date,
  });

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 select-none"
      style={{ top: `${position}px` }}
    >
      <div className="relative flex items-center">
        <div className="absolute flex h-4 w-(--timeline-container-width) items-center justify-end">
          <div className="pe-1 text-[10px] font-medium text-red-500/80 tabular-nums sm:pe-4 sm:text-xs">
            <div className="rounded-sm bg-background/20 px-1 backdrop-blur-md">
              {label}
            </div>
          </div>
        </div>
        <div className="h-0.5 w-(--timeline-container-width)"></div>
        <div className="h-0.5 grow bg-red-500/10"></div>
      </div>
    </div>
  );
}
