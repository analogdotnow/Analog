import * as React from "react";

const POINTER_QUERY = "(pointer: fine)";

let mediaQueryList: MediaQueryList | null = null;

const subscribers = new Set<() => void>();

function ensureMedia() {
  if (mediaQueryList || typeof window === "undefined") {
    return;
  }

  mediaQueryList = window.matchMedia(POINTER_QUERY);

  mediaQueryList.addEventListener("change", () => {
    for (const subscriber of subscribers) {
      subscriber();
    }
  });
}

function getSnapshot() {
  ensureMedia();

  return mediaQueryList?.matches ?? false;
}

function subscribe(callback: () => void) {
  ensureMedia();

  subscribers.add(callback);

  return () => {
    subscribers.delete(callback);
  };
}

export const usePointerType = () => {
  const isFine = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  return isFine ? "mouse" : "touch";
};
