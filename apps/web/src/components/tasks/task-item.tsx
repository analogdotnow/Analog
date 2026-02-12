"use client";

import * as React from "react";
import {
  Reorder,
  useDragControls,
  useMotionValue,
  type DragControls,
} from "motion/react";

import { Button } from "@/components/ui/button";
import type { Task } from "./interfaces";

interface TaskItemProps {
  item: Task;
}

export function TaskItem({ item }: TaskItemProps) {
  "use memo";

  const y = useMotionValue(0);
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      style={{ y }}
      dragListener={false}
      dragControls={dragControls}
    >
      <span>{item.title}</span>
      <ReorderHandle dragControls={dragControls} />
    </Reorder.Item>
  );
}

interface ReorderHandleProps {
  dragControls: DragControls;
}

export function ReorderHandle({ dragControls }: ReorderHandleProps) {
  return <Button onPointerDown={(event) => dragControls.start(event)}></Button>;
}
