import { useCallback, useId, useMemo, useState } from "react";
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

const formattedTimezones = timezones
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
    };
  })
  .sort((a, b) => a.numericOffset - b.numericOffset);

type TimezoneSelectProps = {
  className?: string;
  value: string;
  onChange: (value: string) => void;
};

export function TimezoneSelect({
  className,
  value,
  onChange,
}: TimezoneSelectProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const sortedTimezones = useMemo(() => {
    if (value) {
      return [
        ...formattedTimezones.filter((timezone) => timezone.value === value),
        ...formattedTimezones.filter((timezone) => timezone.value !== value),
      ];
    }
    return formattedTimezones;
  }, [value]);

  const filterFn = useCallback(
    (value: string, search: string) => {
      const timezone = sortedTimezones.find((tz) => tz.value === value);
      if (!timezone) return 0;

      const normalizedValue = value.toLowerCase();
      const normalizedLabel = timezone.label.toLowerCase();
      const normalizedSearch = search.toLowerCase();

      return normalizedValue.includes(normalizedSearch) ||
        normalizedLabel.includes(normalizedSearch)
        ? 1
        : 0;
    },
    [sortedTimezones],
  );

  const displayValue = useMemo(() => {
    const timezone = sortedTimezones.find((tz) => tz.value === value);
    if (!timezone) return { value, sign: "", offset: "", label: "" };
    return timezone;
  }, [value, sortedTimezones]);

  return (
    <div className="flex flex-1">
      <label htmlFor={id} className="sr-only">
        Select a timezone
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-start gap-2.5 px-1.5", className)}
          >
            <GlobeIcon className="size-4 text-muted-foreground/80 hover:text-foreground" />
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
                          onChange(currentValue);
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
