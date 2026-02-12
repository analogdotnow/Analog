"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface AutosizeTextareaContainerContextValue {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const AutosizeTextareaContainerContext =
  React.createContext<AutosizeTextareaContainerContextValue | null>(null);
AutosizeTextareaContainerContext.displayName =
  "AutosizeTextareaContainerContext";

export function useAutosizeTextareaContainer() {
  const context = React.useContext(AutosizeTextareaContainerContext);

  if (!context) {
    throw new Error(
      "useAutosizeTextareaContainer must be used within AutosizeTextareaContainer",
    );
  }

  return context;
}

interface AutosizeTextareaContainerProps extends React.ComponentPropsWithoutRef<"div"> {
  ref?: React.RefObject<HTMLDivElement | null>;
}

function AutosizeTextareaContainer({
  className,
  ref,
  ...props
}: AutosizeTextareaContainerProps) {
  "use memo";

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <AutosizeTextareaContainerContext.Provider
      value={{ containerRef: ref ?? containerRef }}
    >
      <div
        ref={ref ?? containerRef}
        data-slot="autosize-textarea"
        className={cn(
          "grid grid-cols-1 after:pointer-events-none after:invisible after:col-start-1 after:col-end-2 after:row-start-1 after:row-end-2 after:whitespace-pre-wrap after:content-[attr(data-replicated-value)_'_'] after:[font:inherit]",
          className,
        )}
        {...props}
      />
    </AutosizeTextareaContainerContext.Provider>
  );
}

interface AutosizeTextareaProps extends React.ComponentProps<"textarea"> {}

function AutosizeTextarea({
  className,
  onInput,
  value,
  defaultValue,
  ...props
}: AutosizeTextareaProps) {
  "use memo";

  const { containerRef } = useAutosizeTextareaContainer();

  React.useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.dataset.replicatedValue = `${value ?? defaultValue ?? ""} `;
  }, [value, defaultValue, containerRef]);

  return (
    <textarea
      data-slot="autosize-textarea-input"
      className={cn(
        "col-start-1 col-end-2 row-start-1 row-end-2 resize-none overflow-hidden",
        className,
      )}
      onInput={(event) => {
        if (containerRef.current) {
          containerRef.current.dataset.replicatedValue = `${event.currentTarget.value} `;
        }

        onInput?.(event);
      }}
      {...props}
    />
  );
}

export { AutosizeTextarea, AutosizeTextareaContainer };
