"use client";

import * as React from "react";

interface ContainerContextValue {
  containerRef: React.RefObject<HTMLDivElement | null>;
  view: {
    columns: number;
    rows?: number;
  };
}

const ContainerContext = React.createContext<ContainerContextValue | null>(
  null,
);

interface ContainerProviderProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  view: {
    columns: number;
    rows?: number;
  };
  children: React.ReactNode;
}

export function ContainerProvider({
  containerRef,
  view,
  children,
}: ContainerProviderProps) {
  "use memo";

  const value = React.useMemo(
    () => ({ containerRef, view }),
    [containerRef, view],
  );

  return <ContainerContext value={value}>{children}</ContainerContext>;
}

export function useContainer() {
  const context = React.use(ContainerContext);

  if (!context) {
    throw new Error("useContainer must be used within a ContainerProvider");
  }

  return context;
}
