"use client";

import * as React from "react";
import { MotionValue, PanInfo, motion } from "motion/react";

import { useContainer } from "@/components/calendar/context/container-provider";

interface DraggableProps {
  top: MotionValue<number>;
  left: MotionValue<number>;
  onDragStart: (event: PointerEvent, info: PanInfo) => void;
  onDrag: (event: PointerEvent, info: PanInfo) => void;
  onDragEnd: (event: PointerEvent, info: PanInfo) => void;
}

export function Draggable({ top, left }: DraggableProps) {
  const { containerRef } = useContainer();

  const relativeCursorPositionRef = React.useRef<{
    x: number;
    y: number;
  } | null>(null);

  const onDragStart = (event: PointerEvent, info: PanInfo) => {
    event.preventDefault();

    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    relativeCursorPositionRef.current = {
      x: info.point.x - rect.left,
      y: info.point.y - rect.top,
    };

    onDragStart(event, info);
  };

  const onDrag = (event: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || !relativeCursorPositionRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    const relativeX = info.point.x - rect.left;
    const relativeY = info.point.y - rect.top;

    left.set(relativeX - relativeCursorPositionRef.current.x);
    top.set(relativeY - relativeCursorPositionRef.current.y);

    onDrag(event, info);
  };

  const onDragEnd = (event: PointerEvent, info: PanInfo) => {
    // TODO: implement task move mutation

    relativeCursorPositionRef.current = null;

    onDragEnd(event, info);
  };

  return (
    <motion.div
      className="absolute inset-0 touch-none"
      onPanStart={onDragStart}
      onPan={onDrag}
      onPanEnd={onDragEnd}
    />
  );
}
