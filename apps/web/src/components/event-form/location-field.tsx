import * as React from "react";

import { AddressCombobox } from "@/components/address-combobox";
import { cn } from "@/lib/utils";

type LocationFieldProps = {
  className?: string;
  id?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export function LocationField({
  className,
  value,
  onChange,
  ...props
}: LocationFieldProps) {
  const onAddressChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );

  return (
    <AddressCombobox
      className={cn(
        "scrollbar-hidden field-sizing-content max-h-24 min-h-0 resize-none border-none bg-transparent py-1.5 ps-8 text-sm shadow-none dark:bg-transparent",
        className,
      )}
      value={typeof value === "string" ? value : undefined}
      onValueChange={(val: string) => {
        if (onAddressChange) {
          // Create a synthetic input event-like object for upstream consumers
          const event = {
            target: { value: val },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          onAddressChange(event);
        }
      }}
      onSubmit={(address) => {
        if (onAddressChange) {
          const event = {
            target: { value: address },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          onAddressChange(event);
        }
      }}
      id={props.id}
      name={props.name}
      onBlur={props.onBlur}
      {...props}
    />
  );
}
