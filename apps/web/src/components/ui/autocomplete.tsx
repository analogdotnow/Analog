import { Autocomplete as AutocompletePrimitive } from "@base-ui-components/react/autocomplete";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function Autocomplete(
  props: React.ComponentProps<typeof AutocompletePrimitive.Root>,
) {
  return <AutocompletePrimitive.Root data-slot="autocomplete" {...props} />;
}

function AutocompleteInput(
  props: React.ComponentProps<typeof AutocompletePrimitive.Input>,
) {
  return (
    <AutocompletePrimitive.Input
      data-slot="autocomplete-input"
      render={<Input />}
      {...props}
    />
  );
}

function AutocompletePopup({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Popup>) {
  return (
    <AutocompletePrimitive.Popup
      data-slot="autocomplete-popup"
      className={cn(
        "max-h-[min(var(--available-height),23rem)] w-(--anchor-width) max-w-(--available-width) scroll-pt-2 scroll-pb-2 overflow-y-auto overscroll-contain rounded-md bg-popover text-popover-foreground shadow-md outline-1 outline-border dark:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

function AutocompletePositioner(
  props: React.ComponentProps<typeof AutocompletePrimitive.Positioner>,
) {
  return (
    <AutocompletePrimitive.Portal>
      <AutocompletePrimitive.Positioner
        data-slot="autocomplete-positioner"
        {...props}
      />
    </AutocompletePrimitive.Portal>
  );
}

function AutocompleteList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.List>) {
  return (
    <AutocompletePrimitive.List
      data-slot="autocomplete-list"
      className={cn("not-empty:p-1.5", className)}
      {...props}
    />
  );
}

function AutocompleteEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Empty>) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
      className={cn(
        "flex items-center justify-center text-sm text-muted-foreground not-empty:py-3",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Item>) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        "rounded-md px-3 py-1.5 text-sm data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteGroup({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Group>) {
  return (
    <AutocompletePrimitive.Group
      data-slot="autocomplete-group"
      className={cn("block pb-2", className)}
      {...props}
    />
  );
}

function AutocompleteGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.GroupLabel>) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="autocomplete-group-label"
      className={cn(
        "bg-popover py-2 pl-3 text-sm font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteCollection({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Collection>) {
  return (
    <AutocompletePrimitive.Collection
      data-slot="autocomplete-collection"
      {...props}
    />
  );
}

function AutocompleteStatus({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Status>) {
  return (
    <AutocompletePrimitive.Status
      data-slot="autocomplete-status"
      className={cn(
        "my-3 px-4.5 text-sm text-muted-foreground empty:m-0 empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteClear({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Clear>) {
  return (
    <AutocompletePrimitive.Clear
      data-slot="autocomplete-clear"
      className={cn(className)}
      {...props}
    >
      {children ?? <XIcon className="h-4 w-4 text-muted-foreground" />}
    </AutocompletePrimitive.Clear>
  );
}

function AutocompleteRow({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Row>) {
  return (
    <AutocompletePrimitive.Row
      data-slot="autocomplete-row"
      className={cn(className)}
      {...props}
    />
  );
}

function AutocompleteTrigger({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Trigger>) {
  return (
    <AutocompletePrimitive.Trigger
      data-slot="autocomplete-trigger"
      className={cn(className)}
      render={<Button variant="outline" />}
      {...props}
    />
  );
}

export {
  Autocomplete,
  AutocompleteClear,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePositioner,
  AutocompleteRow,
  AutocompleteStatus,
  AutocompleteTrigger,
};
