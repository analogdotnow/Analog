"use client";

import * as React from "react";
import { MotionValue, PanInfo, useMotionValue } from "motion/react";

export interface UseDraggableOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  left: MotionValue<number>;
  top: MotionValue<number>;
  disabled?: boolean;
  onDragStart?: (event: PointerEvent, info: PanInfo) => void;
  onDrag?: (event: PointerEvent, info: PanInfo) => void;
  onDragEnd: (
    event: PointerEvent,
    info: PanInfo,
    deltaY: number,
    deltaX: number,
  ) => boolean | void;
}

export function useDraggable({
  containerRef,
  left,
  top,
  disabled = false,
  onDragStart: onDragStartCallback,
  onDrag: onDragCallback,
  onDragEnd: onDragEndCallback,
}: UseDraggableOptions) {
  "use memo";

  const originX = useMotionValue(0);
  const originY = useMotionValue(0);
  const relativeX = useMotionValue(0);
  const relativeY = useMotionValue(0);

  const onDragStart = (e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();

    originX.set(info.point.x - info.offset.x - rect.left);
    originY.set(info.point.y - info.offset.y - rect.top);

    onDragStartCallback?.(e, info);
  };

  const onDrag = (e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || disabled) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    relativeX.set(info.point.x - rect.left);
    relativeY.set(info.point.y - rect.top);

    left.set(relativeX.get() - originX.get());
    top.set(relativeY.get() - originY.get());

    onDragCallback?.(e, info);
  };

  const onDragEnd = (e: PointerEvent, info: PanInfo) => {
    const deltaY = relativeY.get() - originY.get();
    const deltaX = relativeX.get() - originX.get();

    const shouldResetPosition = onDragEndCallback(e, info, deltaY, deltaX);

    originX.set(0);
    originY.set(0);
    relativeX.set(0);
    relativeY.set(0);

    if (shouldResetPosition !== false) {
      left.set(0);
      top.set(0);
    }
  };

  return {
    onPanStart: onDragStart,
    onPan: onDrag,
    onPanEnd: onDragEnd,
  };
}
