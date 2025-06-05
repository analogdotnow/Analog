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
      <Button {...props} disabled>
        <Bell />
      </Button>
    );
  }
  return (
    <Button {...props} className={cn("relative", props.className)}>
      <Bell />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {count}
        </span>
      )}
    </Button>
  );
};
