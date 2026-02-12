"use client";

import * as React from "react";
import { MotionValue, PanInfo, useMotionValue } from "motion/react";

export interface UseVerticalResizableOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  top: MotionValue<number>;
  height: MotionValue<number>;
  disabled?: boolean;
  onResizeStart?: (direction: "top" | "bottom") => void;
  onTopResizeEnd?: (delta: number) => void;
  onBottomResizeEnd?: (delta: number) => void;
}

export function useVerticalResizable({
  containerRef,
  top,
  height,
  disabled = false,
  onResizeStart,
  onTopResizeEnd: onTopResizeEndCallback,
  onBottomResizeEnd: onBottomResizeEndCallback,
}: UseVerticalResizableOptions) {
  "use memo";

  const isResizingRef = React.useRef(false);

  const originY = useMotionValue(0);
  const relativeY = useMotionValue(0);
  const initialHeight = useMotionValue(height.get());

  const onResizeTopStart = (e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    e.preventDefault();

    onResizeStart?.("top");

    document.body.style.cursor = "row-resize";

    if (isResizingRef.current) {
      return;
    }

    isResizingRef.current = true;

    const rect = containerRef.current.getBoundingClientRect();

    initialHeight.set(height.get());
    originY.set(info.point.y - info.offset.y - rect.top);
  };

  const onResizeBottomStart = (e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    e.preventDefault();

    onResizeStart?.("bottom");

    document.body.style.cursor = "row-resize";

    if (isResizingRef.current) {
      return;
    }

    isResizingRef.current = true;

    const rect = containerRef.current.getBoundingClientRect();

    initialHeight.set(height.get());
    originY.set(info.point.y - info.offset.y - rect.top);
  };

  const onResizeTop = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    if (!isResizingRef.current) {
      isResizingRef.current = true;

      initialHeight.set(height.get());
      originY.set(info.point.y - info.offset.y - rect.top);
    }

    relativeY.set(info.point.y - rect.top);

    const delta = relativeY.get() - originY.get();

    height.set(initialHeight.get() - delta);
    top.set(delta);
  };

  const onResizeBottom = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    if (!isResizingRef.current) {
      isResizingRef.current = true;

      initialHeight.set(height.get());
      originY.set(info.point.y - info.offset.y - rect.top);
    }

    relativeY.set(info.point.y - rect.top);

    const delta = relativeY.get() - originY.get();

    height.set(initialHeight.get() + delta);
  };

  const onResizeTopEnd = () => {
    isResizingRef.current = false;

    document.body.style.removeProperty("cursor");

    onTopResizeEndCallback?.(relativeY.get() - originY.get());

    originY.set(0);
    relativeY.set(0);
    initialHeight.set(0);
  };

  const onResizeBottomEnd = () => {
    isResizingRef.current = false;

    document.body.style.removeProperty("cursor");

    onBottomResizeEndCallback?.(relativeY.get() - originY.get());

    originY.set(0);
    relativeY.set(0);
  };

  return {
    top: {
      onPanStart: onResizeTopStart,
      onPan: onResizeTop,
      onPanEnd: onResizeTopEnd,
    },
    bottom: {
      onPanStart: onResizeBottomStart,
      onPan: onResizeBottom,
      onPanEnd: onResizeBottomEnd,
    },
  };
}
