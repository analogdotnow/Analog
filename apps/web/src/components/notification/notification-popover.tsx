import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { useUnreadNotificationList } from "./hooks/useUnreadNotificationList";
import { NotificationButton } from "./notification-button";

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const { notifications, isLoading } = useUnreadNotificationList(open);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <NotificationButton />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="max-h-[90vh] w-[520px] cursor-default overflow-auto p-4"
      >
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notifications</h4>
          <Separator />
          <div className="space-y-3">
            {isLoading && <NotificationContentSkeleton />}
            {!isLoading && notifications?.length === 0 && (
              <div className="text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            )}
            {notifications?.map(
              ({ notification, notification_source_event }) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between space-x-2 rounded-md p-2 hover:bg-muted"
                >
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    <div>
                      {notification_source_event && (
                        <a
                          href={notification_source_event.eventId}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View Event
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const NotificationContentSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
};
