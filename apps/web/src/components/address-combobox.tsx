"use client";

import * as React from "react";
import { LinkIcon, MapIcon } from "@heroicons/react/16/solid";
import { Command as CommandPrimitive } from "cmdk";
import { LoaderCircle } from "lucide-react";

import { CopyButton } from "@/components/event-form/copy-button";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { usePlacesSearch } from "./use-places-search";

type AddressItem = { value: string; label: string };

function googleMapsSearchLink(value: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

function detectLocationType(value: string): "text" | "url" {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return "url";
  }

  return "text";
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

interface AddressComboboxProps {
  onSubmit?: (address: string) => void;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  id?: string;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function AddressCombobox({
  onSubmit,
  className,
  value,
  onValueChange,
  id,
  name,
  onBlur,
}: AddressComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const debouncedSearch = useDebounce(value ?? "", 300);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data, isFetching } = usePlacesSearch({
    input: debouncedSearch,
    language: "en",
  });

  const items: AddressItem[] = React.useMemo(
    () =>
      (data?.suggestions ?? []).map((p) => ({
        value: p.placePrediction?.placeId ?? "",
        label: p.placePrediction?.text?.text ?? "",
      })),
    [data],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        inputRef.current?.blur();
      }
    },
    [],
  );

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      const selected = items.find((i) => i.value === currentValue);

      if (!selected) {
        return;
      }

      onValueChange?.(selected.label);

      inputRef.current?.blur();

      onSubmit?.(selected.label);
    },
    [items, onValueChange, onSubmit],
  );

  const locationType = detectLocationType(value ?? "");

  return (
    <Command shouldFilter={false} className="overflow-visible">
      <div className="group/address-input relative flex items-center">
        <CommandPrimitive.Input
          ref={inputRef}
          id={id}
          name={name}
          placeholder="Location"
          value={value}
          onInput={(e) => {
            onValueChange?.(e.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={(e) => {
            setOpen(false);
            onBlur?.(e);
          }}
          className={cn(
            "flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-0.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "placeholder:font-light",
            "peer/address-input group-hover/address-input:not-focus:pr-20",
            className,
          )}
        />
        {value?.trim().length ? (
          <div className="absolute inset-y-0 right-1 z-10 hidden items-center gap-1 group-hover/address-input:flex peer-hover/address-input:flex peer-focus/address-input:hidden">
            <CopyButton
              value={value ?? ""}
              disabled={!value || value.trim().length === 0}
            >
              <span className="sr-only">Copy address</span>
            </CopyButton>
            {locationType === "text" ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 text-muted-foreground"
              >
                <a
                  href={googleMapsSearchLink(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapIcon className="size-4" />
                  <span className="sr-only">Open in Google Maps</span>
                </a>
              </Button>
            ) : (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 text-muted-foreground"
              >
                <a href={value} target="_blank" rel="noopener noreferrer">
                  <LinkIcon className="size-4" />
                  <span className="sr-only">Open link</span>
                </a>
              </Button>
            )}
          </div>
        ) : null}
      </div>
      <div className="relative">
        {open && debouncedSearch ? (
          <CommandList className="absolute top-1.5 z-50 w-full rounded-md border border-border bg-background">
            {isFetching && !items.length ? (
              <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>No address found.</CommandEmpty>
                <CommandGroup>
                  {items.map((item, i) => {
                    const [first, rest] = item.label.split(/,(.+)/);
                    return (
                      <CommandItem
                        key={`${item.value}-${item.label}-${i}`}
                        value={item.value}
                        onSelect={handleSelect}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex items-baseline gap-1 truncate"
                      >
                        {first}
                        <span
                          key={rest}
                          className="truncate text-xs text-muted-foreground"
                        >
                          {rest}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        ) : null}
      </div>
    </Command>
  );
}
