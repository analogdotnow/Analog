import { format } from "@formkit/tempo";

import { useCalendarSettings } from "@/atoms/calendar-settings";
import { HOURS } from "./constants";

const HOURS_LEGACY = HOURS.map((hour) => {
  const date = new Date();

  date.setHours(hour.hour);
  date.setMinutes(hour.minute);

  return date;
});

export function Timeline() {
  const { use12Hour } = useCalendarSettings();

  return (
    <div className="grid auto-cols-fr border-r border-border/70">
      {HOURS_LEGACY.map((hour, index) => (
        <div
          key={hour.toString()}
          className="relative min-h-[var(--week-cells-height)] border-b border-border/70 last:border-b-0"
        >
          {index > 0 && (
            <span className="absolute -top-3 left-0 flex h-6 w-20 max-w-full items-center justify-end bg-background pe-2 text-[10px] font-medium text-muted-foreground/70 tabular-nums sm:pe-4 sm:text-xs">
              {use12Hour
                ? format({
                    date: hour,
                    format: "h aaa",
                  })
                : format({
                    date: hour,
                    format: "HH:mm",
                  })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
