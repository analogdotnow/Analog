"use client";

import * as React from "react";
import {
  PanInfo,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";

import { useContainer } from "@/components/calendar/context/container-provider";
import { TaskDisplayItem } from "@/lib/display-item";
import { useSetDraggingEventId } from "@/store/hooks";
import { TaskItem } from "./task-item";

interface DraggableTaskItemProps {
  item: TaskDisplayItem;
  // TODO: use view for different drag behaviors when implementing mutation
  view: "month" | "week" | "day";
}

export function DraggableTaskItem({ item }: DraggableTaskItemProps) {
  const { containerRef } = useContainer();

  const relativeCursorPositionRef = React.useRef<{
    x: number;
    y: number;
  } | null>(null);

  const top = useMotionValue(0);
  const left = useMotionValue(0);
  const transform = useMotionTemplate`translate(${left}px,${top}px)`;

  const setDraggingEventId = useSetDraggingEventId();

  const onDragStart = (e: PointerEvent, info: PanInfo) => {
    e.preventDefault();

    setDraggingEventId(item.id);

    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    relativeCursorPositionRef.current = {
      x: info.point.x - rect.left,
      y: info.point.y - rect.top,
    };
  };

  const onDrag = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || !relativeCursorPositionRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    const relativeX = info.point.x - rect.left;
    const relativeY = info.point.y - rect.top;

    left.set(relativeX - relativeCursorPositionRef.current.x);
    top.set(relativeY - relativeCursorPositionRef.current.y);
  };

  const onDragEnd = () => {
    setDraggingEventId(null);

    // TODO: implement task move mutation

    relativeCursorPositionRef.current = null;
  };

  React.useLayoutEffect(() => {
    top.set(0);
    left.set(0);
  }, [top, left, item.start, item.end]);

  return (
    <motion.div className="size-full touch-none" style={{ transform }}>
      <TaskItem item={item}>
        <motion.div
          className="absolute inset-0 touch-none"
          onPanStart={onDragStart}
          onPan={onDrag}
          onPanEnd={onDragEnd}
        />
      </TaskItem>
    </motion.div>
  );
}
