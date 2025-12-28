import * as React from "react";

interface ContainerSize {
  width: number;
  height: number;
}

export function useContainerSize(
  containerRef: React.RefObject<HTMLElement | null>,
): ContainerSize {
  const observerRef = React.useRef<ResizeObserver | null>(null);
  const [size, setSize] = React.useState<ContainerSize>({
    width: 0,
    height: 0,
  });

  const measure = React.useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const { width, height } = containerRef.current.getBoundingClientRect();

    setSize({ width, height });
  }, [containerRef]);

  React.useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }

    measure();

    if (!observerRef.current) {
      observerRef.current = new ResizeObserver(() => {
        measure();
      });
    }

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [containerRef, measure]);

  return size;
}
