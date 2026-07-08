import * as React from "react";
import { useTransform, useVelocity } from "motion/react";

import { useMotionElementSize } from "@/hooks/use-motion-element-size";

export function useIsResizing(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  const { width, height } = useMotionElementSize(containerRef);
  const widthVelocity = useVelocity(width);
  const heightVelocity = useVelocity(height);

  return useTransform(
    [widthVelocity, heightVelocity],
    ([widthVelocity, heightVelocity]) =>
      widthVelocity !== 0 || heightVelocity !== 0,
  );
}
