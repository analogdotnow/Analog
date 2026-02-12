import * as React from "react";
import { useMotionValue, useTransform, useVelocity } from "motion/react";

interface Size {
  width: number | undefined;
  height: number | undefined;
}

const initialSize: Size = {
  width: undefined,
  height: undefined,
};

export function useResizeValues<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T | null>,
) {
  const previousSize = React.useRef<Size>({ ...initialSize });
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  React.useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (typeof window === "undefined" || !("ResizeObserver" in window)) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      const newWidth = extractSize(entry, "inlineSize");
      const newHeight = extractSize(entry, "blockSize");

      const hasChanged =
        previousSize.current.width !== newWidth ||
        previousSize.current.height !== newHeight;

      if (hasChanged) {
        previousSize.current.width = newWidth;
        previousSize.current.height = newHeight;

        width.set(newWidth ?? 0);
        height.set(newHeight ?? 0);
      }
    });

    observer.observe(ref.current, { box: "content-box" });

    return () => {
      observer.disconnect();
    };
  }, [ref, width, height]);

  return { width, height };
}

function extractSize(
  entry: ResizeObserverEntry,
  sizeType: keyof ResizeObserverSize,
): number | undefined {
  if (!entry["contentBoxSize"]) {
    return entry.contentRect[sizeType === "inlineSize" ? "width" : "height"];
  }

  return Array.isArray(entry["contentBoxSize"])
    ? entry["contentBoxSize"][0][sizeType]
    : // @ts-expect-error Support Firefox's non-standard behavior
      (entry["contentBoxSize"][sizeType] as number);
}

export function useIsResizing(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  const { width } = useResizeValues(containerRef);
  const velocity = useVelocity(width);

  return useTransform(velocity, (velocity) => velocity > 0);
}
