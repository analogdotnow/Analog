"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { LoaderCircle } from "lucide-react";

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

  return (
    <Command shouldFilter={false} className="overflow-visible">
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
          "flex h-8 w-full appearance-none rounded-md border-0 bg-transparent px-3 py-0.5 text-sm outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          "focus:bg-input-focus focus:ring-0 focus-visible:bg-input-focus focus-visible:ring-0 dark:focus:bg-input-focus dark:focus-visible:bg-input-focus",
          "placeholder:font-light",
          className,
        )}
      />
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
