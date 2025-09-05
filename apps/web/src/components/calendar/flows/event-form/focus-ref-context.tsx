"use client";

import * as React from "react";

interface FocusRefContextValue {
  focusRef: React.MutableRefObject<boolean>;
}

const FocusRefContext = React.createContext<FocusRefContextValue | null>(null);

interface FocusRefProviderProps {
  children: React.ReactNode;
}

export function FocusRefProvider({ children }: FocusRefProviderProps) {
  const focusRef = React.useRef(false);

  const context = React.useMemo(() => ({ focusRef }), [focusRef]);

  return (
    <FocusRefContext.Provider value={context}>
      {children}
    </FocusRefContext.Provider>
  );
}

export function useFocusRef() {
  const ctx = React.useContext(FocusRefContext);
  if (!ctx) {
    throw new Error("useFocusRef must be used within a FocusRefProvider");
  }
  return ctx.focusRef;
}
