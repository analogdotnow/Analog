"use client";

import * as React from "react";
import { MotionValue, PanInfo, useMotionValue } from "motion/react";

export interface UseHorizontalResizableOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  left: MotionValue<number>;
  width: MotionValue<number>;
  disabled?: boolean;
  onResizeStart?: (direction: "left" | "right") => void;
  onLeftResizeEnd?: (delta: number) => void;
  onRightResizeEnd?: (delta: number) => void;
}

export function useHorizontalResizable({
  containerRef,
  left,
  width,
  disabled = false,
  onResizeStart,
  onLeftResizeEnd: onLeftResizeEndCallback,
  onRightResizeEnd: onRightResizeEndCallback,
}: UseHorizontalResizableOptions) {
  "use memo";

  const isResizingRef = React.useRef(false);

  const originX = useMotionValue(0);
  const relativeX = useMotionValue(0);
  const initialWidth = useMotionValue(width.get());

  const onResizeLeftStart = (e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    e.preventDefault();

    isResizingRef.current = true;
    onResizeStart?.("left");

    document.body.style.cursor = "col-resize";

    const rect = containerRef.current.getBoundingClientRect();

    initialWidth.set(width.get());
    originX.set(info.point.x - info.offset.x - rect.left);
  };

  const onResizeRightStart = (e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    e.preventDefault();

    isResizingRef.current = true;
    onResizeStart?.("right");

    document.body.style.cursor = "col-resize";

    const rect = containerRef.current.getBoundingClientRect();

    initialWidth.set(width.get());
    originX.set(info.point.x - info.offset.x - rect.left);
  };

  const onResizeLeft = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    if (!isResizingRef.current) {
      isResizingRef.current = true;

      initialWidth.set(width.get());
      originX.set(info.point.x - info.offset.x - rect.left);
    }

    relativeX.set(info.point.x - rect.left);
    width.set(initialWidth.get() - (relativeX.get() - originX.get()));
    left.set(relativeX.get() - originX.get());
  };

  const onResizeRight = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    if (!isResizingRef.current) {
      isResizingRef.current = true;

      initialWidth.set(width.get());
      originX.set(info.point.x - info.offset.x - rect.left);
    }

    relativeX.set(info.point.x - rect.left);
    width.set(initialWidth.get() + (relativeX.get() - originX.get()));
  };

  const onResizeLeftEnd = () => {
    isResizingRef.current = false;

    document.body.style.removeProperty("cursor");

    onLeftResizeEndCallback?.(relativeX.get() - originX.get());

    originX.set(0);
    relativeX.set(0);
    left.set(0);
    initialWidth.set(0);
  };

  const onResizeRightEnd = () => {
    isResizingRef.current = false;

    document.body.style.removeProperty("cursor");

    onRightResizeEndCallback?.(relativeX.get() - originX.get());

    originX.set(0);
    relativeX.set(0);
    left.set(0);
    initialWidth.set(0);
  };

  return {
    left: {
      onPanStart: onResizeLeftStart,
      onPan: onResizeLeft,
      onPanEnd: onResizeLeftEnd,
    },
    right: {
      onPanStart: onResizeRightStart,
      onPan: onResizeRight,
      onPanEnd: onResizeRightEnd,
    },
  };
}
