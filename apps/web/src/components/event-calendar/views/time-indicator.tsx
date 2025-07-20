import { Temporal } from "temporal-polyfill";

import { useCurrentTimeIndicator } from "../hooks/use-current-time-indicator";

interface TimeIndicatorProps {
  date: Temporal.PlainDate;
}

export function TimeIndicator({ date }: TimeIndicatorProps) {
  const { currentTimePosition, currentTimeVisible } =
    useCurrentTimeIndicator(date);

  if (!currentTimeVisible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20"
      style={{ top: `${currentTimePosition}%` }}
    >
      <div className="relative flex items-center gap-0.5">
        <div className="absolute left-0.5 h-3.5 w-1 rounded-full bg-red-500/90"></div>
        <div className="h-0.5 w-1.5"></div>
        <div className="h-0.5 w-full rounded-r-full bg-red-500/90"></div>
      </div>
    </div>
  );
}

interface TimeIndicatorBackgroundProps {
  date: Temporal.PlainDate;
}

export function TimeIndicatorBackground({
  date,
}: TimeIndicatorBackgroundProps) {
  const { currentTimePosition, formattedTime } = useCurrentTimeIndicator(date);

  return (
    <div
      className="pointer-events-none absolute right-0 left-0"
      style={{ top: `${currentTimePosition}%` }}
    >
      <div className="relative flex items-center">
        <div className="absolute flex h-4 w-20 items-center justify-end border-r border-transparent">
          <p className="z-[1000] pe-2 text-[10px] font-medium text-red-500/80 tabular-nums sm:pe-4 sm:text-xs">
            {formattedTime}
          </p>
        </div>
        <div className="h-0.5 w-20"></div>
        <div className="h-0.5 grow bg-red-500/10"></div>
      </div>
    </div>
  );
}
