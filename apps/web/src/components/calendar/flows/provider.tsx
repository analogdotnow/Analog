import { DeleteEventAttendeeDialog } from "./delete-event/delete-event-attendee-dialog";
import { DeleteQueueProvider } from "./delete-event/delete-queue-provider";
import { DeleteRecurringEventDialog } from "./delete-event/delete-recurring-event-dialog";
import { UpdateEventAttendeeDialog } from "./update-event/update-event-attendee-dialog";
import { UpdateQueueProvider } from "./update-event/update-queue-provider";
import { UpdateRecurringEventDialog } from "./update-event/update-recurring-event-dialog";

interface FlowsProviderProps {
  children: React.ReactNode;
}

export function FlowsProvider({ children }: FlowsProviderProps) {
  return (
    <UpdateQueueProvider>
      <UpdateEventAttendeeDialog />
      <UpdateRecurringEventDialog />
      <DeleteQueueProvider>
        <DeleteEventAttendeeDialog />
        <DeleteRecurringEventDialog />
        {children}
      </DeleteQueueProvider>
    </UpdateQueueProvider>
  );
}
