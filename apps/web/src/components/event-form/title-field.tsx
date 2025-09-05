import * as React from "react";

import { Input } from "@/components/ui/input";

interface TitleFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled: boolean;
}

export const TitleField = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled,
}: TitleFieldProps) => {
  const onInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    },
    [],
  );

  return (
    <Input
      id={id}
      name={name}
      className="h-8 border-none bg-transparent px-3.5 text-base shadow-none dark:bg-transparent"
      value={value}
      onBlur={onBlur}
      onChange={onInputChange}
      onKeyDown={onKeyDown}
      placeholder="Title"
      disabled={disabled}
    />
  );
};
