"use client";

import * as React from "react";
import { MotionValue, useMotionTemplate, useMotionValue } from "motion/react";

interface TransformContextValue {
  top: MotionValue<number>;
  left: MotionValue<number>;
  transform: MotionValue<string>;
}

const TransformContext = React.createContext<TransformContextValue | null>(
  null,
);

export function useTransform() {
  const context = React.useContext(TransformContext);

  if (!context) {
    throw new Error("useTransform must be used within a TransformProvider");
  }

  return context;
}

interface TransformProviderProps {
  children: React.ReactNode;
}

export function TransformProvider({ children }: TransformProviderProps) {
  "use memo";

  const top = useMotionValue(0);
  const left = useMotionValue(0);
  const transform = useMotionTemplate`translate(${left}px,${top}px)`;

  return (
    <TransformContext.Provider value={{ top, left, transform }}>
      {children}
    </TransformContext.Provider>
  );
}
