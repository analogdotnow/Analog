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
  onSuccess,
  isOpen = true,
  onOpenChange,
}: {
  onSuccess: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const handleEnableNotifications = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          onSuccess();
        }
      });
    }
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
