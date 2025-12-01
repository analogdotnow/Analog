"use client";

import * as React from "react";

import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

interface DescriptionFieldProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Textarea>,
  "onChange"
> {
  onChange: (value: string) => void;
}

export function DescriptionField({
  className,
  onChange,
  ...props
}: DescriptionFieldProps) {
  const ref = useAutoResizeTextarea(120);

  const onTextareaChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );

  return (
    <Textarea
      className={cn(
        "scrollbar-hidden field-sizing-content max-h-20 min-h-0 resize-none border-none bg-transparent py-1.5 ps-8 font-medium shadow-none dark:bg-transparent",
        className,
      )}
      ref={ref}
      placeholder="Description"
      rows={1}
      onChange={onTextareaChange}
      {...props}
    />
  );
}
