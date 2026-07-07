import * as React from "react";
import { useTransform, useVelocity } from "motion/react";

import { useMotionElementSize } from "@/hooks/use-motion-element-size";

export function useIsResizing(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  const { width } = useMotionElementSize(containerRef);
  const velocity = useVelocity(width);

  return useTransform(velocity, (velocity) => velocity !== 0);
}
