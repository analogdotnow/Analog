"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ViewsContextValue {
  value: string;
  setValue: (value: string) => void;
}

const ViewsContext = React.createContext<ViewsContextValue | null>(null);

function useViews() {
  "use memo";

  const context = React.useContext(ViewsContext);

  if (!context) {
    throw new Error("useViews must be used within <Views>");
  }

  return context;
}

interface ViewsProps extends React.ComponentProps<"div"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function Views({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
  ...props
}: ViewsProps) {
  "use memo";

  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? "",
  );

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange],
  );

  const contextValue = React.useMemo(
    () => ({ value, setValue }),
    [value, setValue],
  );

  return (
    <ViewsContext.Provider value={contextValue}>
      <div data-slot="views" className={cn(className)} {...props}>
        {children}
      </div>
    </ViewsContext.Provider>
  );
}

interface ViewProps extends React.ComponentProps<"div"> {
  value: string;
  forceMount?: boolean;
}

function View({
  value,
  forceMount = false,
  children,
  className,
  ...props
}: ViewProps) {
  "use memo";

  const { value: activeValue } = useViews();
  const isActive = value === activeValue;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      data-slot="view"
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      hidden={!isActive}
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ViewTrigger
interface ViewTriggerProps extends React.ComponentProps<"button"> {
  value: string;
}

function ViewTrigger({
  value,
  children,
  className,
  onClick,
  ...props
}: ViewTriggerProps) {
  "use memo";

  const { value: activeValue, setValue } = useViews();
  const isActive = value === activeValue;

  return (
    <button
      type="button"
      data-slot="view-trigger"
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      aria-pressed={isActive}
      onClick={(e) => {
        setValue(value);
        onClick?.(e);
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  );
}

export { Views, View, ViewTrigger, useViews };
export type { ViewsProps, ViewProps, ViewTriggerProps };
