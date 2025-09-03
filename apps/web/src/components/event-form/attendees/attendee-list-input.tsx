import React from "react";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxInput,
  ComboboxLabel,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

interface AttendeeListInputProps {
  onComplete: (email: string) => void;
  className?: string;
  disabled?: boolean;
  unConfirmed?: boolean;
  onSendInvite?: () => void;
}

export function AttendeeListInput({
  className,
  onComplete,
  disabled,
  unConfirmed,
  onSendInvite,
}: AttendeeListInputProps) {
  const [searchValue, setSearchValue] = React.useState<string>("");

  const onInputChange = React.useCallback(
    (value: string) => {
      setSearchValue(value);

      if (z.string().email().safeParse(value).error) {
        return;
      }

      onComplete(value);
      setSearchValue("");
    },
    [onComplete],
  );

  // const onCancel = React.useCallback(() => {
  //   setSearchValue("");
  // }, []);

  // const touched = searchValue.length > 0;

  // const onSend = React.useCallback(() => {
  //   onInputChange(searchValue);
  //   onSendInvite?.();
  // }, [onInputChange, onSendInvite, searchValue]);

  return (
    <Combobox
      value={searchValue}
      setValue={(value) => {
        setSearchValue(value);
      }}
    >
      <ComboboxLabel className="sr-only" htmlFor="attendees">
        Attendees
      </ComboboxLabel>
      <ComboboxInput
        id="attendees"
        className={cn(
          "h-8 border-none bg-transparent font-medium shadow-none dark:bg-transparent text-sm",
          className,
        )}
        placeholder="Add attendee"
        onChange={(e) => setSearchValue(e.target.value)}
        onBlur={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") {
            return;
          }

          onInputChange(searchValue);
        }}
        disabled={disabled}
      />
      {/* {unConfirmed || touched ? (
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="font-semibold"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="font-semibold"
            size="sm"
            disabled={disabled}
            onClick={onSend}
          >
            Send invite
          </Button>
        </div>
      ) : null} */}
    </Combobox>
  );
}
