"use client";

import * as React from "react";
import { Reorder } from "motion/react";

import type { Task } from "./interfaces";
import { TaskItem } from "./task-item";

const initialItems: Task[] = [
  { id: "1", title: "🍅 Tomato" },
  { id: "2", title: "🥒 Cucumber" },
  { id: "3", title: "🧀 Cheese" },
  { id: "4", title: "🥬 Lettuce" },
];

export function TaskList() {
  "use memo";

  const [items, setItems] = React.useState(initialItems);

  return (
    <Reorder.Group axis="y" onReorder={setItems} values={items}>
      {items.map((item) => (
        <TaskItem key={item.id} item={item} />
      ))}
    </Reorder.Group>
  );
}
