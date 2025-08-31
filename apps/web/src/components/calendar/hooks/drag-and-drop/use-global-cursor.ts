import * as React from "react";

export function useGlobalCursor() {
  const setCursor = React.useCallback((cursor: string) => {
    document.body.style.cursor = cursor;
  }, []);

  const resetCursor = React.useCallback(() => {
    document.body.style.removeProperty("cursor");
  }, []);

  return {
    setCursor,
    resetCursor,
  };
}
