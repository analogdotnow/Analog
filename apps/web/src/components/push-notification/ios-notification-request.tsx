import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function IOSNotificationRequest({
  isOpen = true,
  onOpenChange,
  onSuccess,
  onError,
}: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
  onError?: (error: Error) => void;
}) {
  const handleEnableNotifications = () => {
    if (!("Notification" in window)) {
      return;
    }

    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          onSuccess();
        } else {
          onError?.(new Error("Notification permission denied"));
        }
      })
      .catch((error) => {
        onError?.(error);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Push Notifications</DialogTitle>
          <DialogDescription>
            To receive notifications on your iOS device, please enable push
            notifications in your settings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleEnableNotifications}>
            Enable Notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
