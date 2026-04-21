import type { Tab } from "@/lib/tab-store";

interface GetNextTabOptions {
  tabs: Tab[];
  pathname: string | undefined;
  direction: "left" | "right" | "close";
}

export function getNextTab({ tabs, pathname, direction }: GetNextTabOptions) {
  const currentIndex = tabs.findIndex((tab) => tab.url === pathname);

  if (direction === "close") {
    if (currentIndex === -1) {
      return undefined;
    }

    if (currentIndex + 1 < tabs.length) {
      return tabs[currentIndex + 1];
    }

    if (currentIndex > 0) {
      return tabs[currentIndex - 1];
    }

    return undefined;
  }

  if (direction === "left") {
    if (currentIndex === -1) {
      return tabs[tabs.length - 1];
    }

    return tabs[(currentIndex - 1 + tabs.length) % tabs.length];
  }

  return currentIndex === -1 ? tabs[0] : tabs[(currentIndex + 1) % tabs.length];
}
