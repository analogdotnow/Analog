import * as React from "react";

interface ContainerSize {
  width: number;
  height: number;
}

export function useContainerSize(
  containerRef: React.RefObject<HTMLElement | null>,
): ContainerSize {
  const [size, setSize] = React.useState<ContainerSize>({
    width: 0,
    height: 0,
  });

  // Track the current element to detect when ref.current changes
  const [element, setElement] = React.useState<HTMLElement | null>(null);

  // Sync element state with ref on every render
  React.useLayoutEffect(() => {
    setElement(containerRef.current);
  });

  // Observe the element when it changes
  React.useLayoutEffect(() => {
    if (!element) {
      return;
    }

    const { width, height } = element.getBoundingClientRect();

    setSize({ width, height });

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return size;
}
