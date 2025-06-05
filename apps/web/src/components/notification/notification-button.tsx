"use client";

import React from "react";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useUnreadNotificationCount } from "./hooks/useUnreadNotificationCount";

export const NotificationButton = (
  props: React.ComponentPropsWithoutRef<typeof Button>,
) => {
  const { count } = useUnreadNotificationCount();
  if (!count) {
    return (
      <Button
        variant="outline"
        aria-label="View preferences"
        {...props}
        disabled
      >
        <Bell />
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      aria-label="View preferences"
      {...props}
      className={cn("relative", props.className)}
    >
      <Bell />
      {count > 0 && (
        <span className="dark:bg-read-500 absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-600 p-0.5 text-xs text-white">
          {count}
        </span>
      )}
    </Button>
  );
};
