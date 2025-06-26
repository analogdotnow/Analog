import * as React from "react";
import { CheckIcon, GlobeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const timezones = Intl.supportedValuesOf("timeZone").concat(["UTC"]);

// Pre-compute and normalize the list of time-zones **once** at module load.
// This ensures the relatively expensive `Intl.DateTimeFormat` work only runs a
// single time instead of every render. We also keep a fast lookup `Map` for
// O(1) access during filtering and label retrieval.

interface FormattedTimezone {
  value: string;
  sign: "+" | "-";
  offset: string; // e.g. "+01:00"
  label: string;
  numericOffset: number;
}

const formattedTimezones: FormattedTimezone[] = timezones
  .map((timezone) => {
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(new Date());
    const offset =
      parts.find((part) => part.type === "timeZoneName")?.value || "";
    const modifiedOffset = offset === "GMT" ? "GMT+00:00" : offset;
    const modifiedLabel = timezone
      .replace(/_/g, " ")
      .replaceAll("/", " - ")
      .replace("UTC", "Coordinated Universal Time");

    return {
      value: timezone,
      sign: offset.includes("+") ? "+" : "-",
      offset: modifiedOffset.replace("GMT", "").slice(1),
      label: modifiedLabel,
      numericOffset: Number.parseInt(
        offset.replace("GMT", "").replace("+", "") || "0",
      ),
    } as FormattedTimezone;
  })
  .sort((a, b) => a.numericOffset - b.numericOffset);

// Fast lookup map to avoid repeatedly scanning the array.
const timezoneMap: Map<string, FormattedTimezone> = new Map(
  formattedTimezones.map((tz) => [tz.value, tz]),
);

interface TimezoneSelectProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function TimezoneSelectComponent({
  className,
  value,
  onChange,
  disabled,
}: TimezoneSelectProps) {
  const id = React.useId();
  const [open, setOpen] = React.useState<boolean>(false);
  // Memoise the derived values so they're only recomputed when `value`
  // actually changes. We *avoid* building a brand new list every render –
  // instead we reuse the static `formattedTimezones` array and simply keep
  // the currently selected timezone at the top for nicer UX.
  const { sortedTimezones, displayValue } = React.useMemo(() => {
    if (!value) {
      return {
        sortedTimezones: formattedTimezones,
        displayValue: undefined,
      } as const;
    }

    const current = timezoneMap.get(value);

    // If, for some reason, the provided value is not found just fall back
    // to the original ordering.
    if (!current) {
      return {
        sortedTimezones: formattedTimezones,
        displayValue: undefined,
      } as const;
    }

    return {
      sortedTimezones: [current, ...formattedTimezones.filter((tz) => tz !== current)],
      displayValue: current,
    } as const;
  }, [value]);

  // Custom filter that avoids O(n²) behaviour by leveraging the `timezoneMap`.
  const filterFn = React.useCallback((itemValue: string, search: string) => {
    const timezone = timezoneMap.get(itemValue);
    if (!timezone) return 0;

    const normalizedSearch = search.toLowerCase();
    return (
      itemValue.toLowerCase().includes(normalizedSearch) ||
      timezone.label.toLowerCase().includes(normalizedSearch)
    )
      ? 1
      : 0;
  }, []);

  // Keep a ref to always call the latest `onChange` without
  // forcing a re-render whenever its identity changes.
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (disabled) {
        return;
      }
      setOpen(open);
    },
    [disabled],
  );

  return (
    <div className="flex flex-1">
      <label htmlFor={id} className="sr-only">
        Select a timezone
      </label>
      <Popover open={open && !disabled} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-start gap-2.5 px-1.5", className)}
            disabled={disabled}
          >
            <GlobeIcon className="size-4 text-muted-foreground/80 hover:text-foreground" />
            {displayValue ? (
              <span
              className={cn(
                "space-x-2 truncate text-sm",
                !value && "text-muted-foreground",
              )}
            >
              <span className="pr-2">
                <span className="text-muted-foreground/80">UTC</span>
                <span className="inline-block w-2 text-center text-muted-foreground/80">
                  {displayValue.sign}
                </span>
                <span className="w-24 text-muted-foreground/80">
                  {displayValue.offset}
                </span>
              </span>
              {displayValue.label}
            </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-96 min-w-(--radix-popper-anchor-width) p-0"
          align="end"
          side="bottom"
          sideOffset={4}
        >
          <Command filter={filterFn}>
            <CommandInput
              placeholder="Search timezone..."
              className="h-8 p-0 text-sm"
              // wrapperClassName="[&_svg]:size-4 px-4"
            />
            <CommandList className="max-h-48">
              <CommandEmpty>No timezone found.</CommandEmpty>
              <CommandGroup className="py-1">
                {sortedTimezones.map(
                  ({ value: itemValue, label, offset, sign }) => (
                    <CommandItem
                      key={itemValue}
                      value={itemValue}
                      onSelect={(currentValue) => {
                        if (currentValue !== value) {
                          onChangeRef.current(currentValue);
                          setOpen(false);
                        }
                      }}
                      className="text-sm tabular-nums [&_svg]:size-3.5"
                    >
                      <span>
                        <span className="text-muted-foreground/80">UTC</span>
                        <span className="inline-block w-2 text-center text-muted-foreground/80">
                          {sign}
                        </span>
                        <span className="w-24 text-muted-foreground/80">
                          {offset}
                        </span>
                      </span>
                      <span className="truncate">{label}</span>
                      {value === itemValue ? (
                        <CheckIcon className="ml-auto" />
                      ) : null}
                    </CommandItem>
                  ),
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Memoise the component itself so it only re-renders when the *value* or
// *disabled* flag changes – changing `onChange` identity alone will no longer
// trigger a re-render.
export const TimezoneSelect = React.memo(
  TimezoneSelectComponent,
  (prev, next) =>
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.className === next.className,
);
