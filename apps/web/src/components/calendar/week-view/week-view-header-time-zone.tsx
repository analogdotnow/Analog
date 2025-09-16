import * as React from "react";
import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { SolarTerminatorMap } from "@/components/solar-terminator-map";
import { TimeZoneAwareGlobeIcon } from "@/components/timezone-aware-globe-icon";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useZonedDateTime } from "../context/datetime-provider";
import { format, formatTime } from "@/lib/utils/format";
import { getTimeZones } from "@vvo/tzdb";
import { currentDateAtom } from "@/atoms/view-preferences";
import { startOfDay, toDate } from "@repo/temporal";

interface HeaderTimeZoneProps {
  timeZone: string;
}

function getLabel(timeZoneId: string) {
  const timeZone = getTimeZones().find((tz) => tz.name === timeZoneId);

  return timeZone?.abbreviation;
}

export function WeekViewHeaderTimeZone({ timeZone }: HeaderTimeZoneProps) {
  const currentDate = useAtomValue(currentDateAtom);
  const settings = useAtomValue(calendarSettingsAtom);

  const label = React.useMemo(() => {
    const abbreviation = getLabel(timeZone);

    if (abbreviation) {
      return abbreviation;
    }

    const start = startOfDay(currentDate, { timeZone });
    const value = toDate(start, { timeZone });

    const parts = new Intl.DateTimeFormat(settings.locale, {
      timeZoneName: "short",
      timeZone,
    }).formatToParts(value);

    return parts.find((part) => part.type === "timeZoneName")?.value ?? " ";
  }, [currentDate, settings.locale, timeZone]);
  
  return (
    <div className="max-[479px]:sr-only flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="justify-start ps-0.5 py-0.5 min-w-10 sm:min-w-12 max-w-full px-0 pe-0 text-end h-fit text-xs leading-3.5 rounded-sm data-[state=open]:bg-accent dark:data-[state=open]:bg-accent/50">  
           <div className="mask-r-from-80% mask-r-to-90% min-w-full">
            <span className="min-w-full pe-2 text-end">{label}</span>
           </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-(--radix-popper-anchor-width) p-0 select-none dark" align="start">
          <SolarTerminatorMap timeZone={timeZone} date={currentDate} />
          <Separator orientation="horizontal" className="bg-primary/10" />
          <TimeZoneContent className="px-2 py-2" timeZone={timeZone} date={currentDate} />

        </PopoverContent>
      </Popover>
    </div>
  );
}

function getShortName(timeZone: string, dateTime: Temporal.ZonedDateTime) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(toDate(dateTime, { timeZone }));
  return parts.find((part) => part.type === "timeZoneName")?.value || "";
}

function getDisplayValue(timeZoneId: string, dateTime: Temporal.ZonedDateTime) {
  const modifiedLabel = timeZoneId
    .replace(/_/g, " ")
    .replaceAll("/", " - ")
    .replace("UTC", "Coordinated Universal Time");
  
  const timeZone = getTimeZones({
    includeUtc: true,
  }).find((tz) => tz.name === timeZoneId);

  console.log(JSON.stringify(timeZone, null, 2));
  return {
    id: timeZoneId,
    abbreviation: timeZone?.abbreviation ?? getShortName(timeZoneId, dateTime).replace("GMT", "UTC"),
    name: timeZone?.alternativeName ?? modifiedLabel,
    city: timeZone?.mainCities[0],
    offset: {
      sign: dateTime.offsetNanoseconds < 0 ? "-" : "+",
      label: dateTime.offset,
      value: dateTime.offsetNanoseconds,
    }
  };
}

interface TimeZoneContentProps {
  className?: string;
  timeZone: string;
  date: Temporal.PlainDate;
}

function TimeZoneContent({ className, timeZone, date }: TimeZoneContentProps) {
  const displayValue = React.useMemo(() => getDisplayValue(timeZone, date.toZonedDateTime(timeZone)), [timeZone, date]);

  return (
    <div className={cn("flex gap-2 items-start", className)}>
      <TimeZoneAwareGlobeIcon
        offset={displayValue.offset.value}
        className="size-4 text-muted-foreground hover:text-foreground"
      />
      <div className="flex flex-col gap-0.5 grow">
       <div className="flex gap-1">
        <span className="text-sm font-medium">{displayValue.city ?? displayValue.name}</span>
        {/* <OffsetDisplay timeZone={timeZone} /> */}
       </div>
       <div className="flex gap-1">
       <span className="text-xs font-medium text-muted-foreground/70">{displayValue.name}</span>
        <span className="text-xs font-medium text-muted-foreground/70">({displayValue.offset.label})</span>
       </div>
      </div>
      <TimeDisplay timeZone={timeZone} />
    </div>
  );
}

interface OffsetDisplayProps {
  timeZone: string;
}

function OffsetDisplay({ timeZone }: OffsetDisplayProps) {
  const now = useZonedDateTime();

  const offset = React.useMemo(() => {
    const offsetInMinutes = Temporal.Duration.from({
      nanoseconds: now.withTimeZone(timeZone).offsetNanoseconds - now.offsetNanoseconds,
    }).total({ unit: "minute" });

    const isEarlier = offsetInMinutes < 0;

    if (offsetInMinutes === 0) {
      return null;
    }

    return `${isEarlier ? "-" : "+"}${(Math.abs(offsetInMinutes) / 60).toFixed(0)}h${(Math.abs(offsetInMinutes) % 60) > 0 ? `and ${(Math.abs(offsetInMinutes) % 60).toFixed(0)} m` : ""}`;
  }, [now, timeZone]);

  if (timeZone === now.timeZoneId || !offset) {
    return null;
  }

  return <span className="text-xs font-medium text-muted-foreground/70">({offset})</span>;
}

interface TimeDisplayProps {
  className?: string;
  timeZone: string;
}

function TimeDisplay({ className, timeZone }: TimeDisplayProps) {
  const { use12Hour } = useAtomValue(calendarSettingsAtom);

  const currentTime = useZonedDateTime();

  const time = React.useMemo(() => {
    return currentTime.withTimeZone(timeZone);
  }, [currentTime, timeZone]);

  return (
    <div className={cn("flex flex-col gap-0.5 items-end", className)}>
      <span className="text-xs font-medium">{formatTime({ value: time, use12Hour, locale: "en" })}</span>
      <span className="text-xs font-medium text-muted-foreground/70">{format(time, "MMM D", "en", timeZone)}</span>  
    </div>
  );
}