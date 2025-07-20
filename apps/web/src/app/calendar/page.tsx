import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@repo/auth/server";

import { CalendarLayout } from "@/components/calendar-layout";
import { DateProvider } from "@/components/event-calendar/context/date-provider";
import { ZonedDateTimeProvider } from "@/components/event-calendar/context/datetime-provider";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <ZonedDateTimeProvider>
      <DateProvider>
        <CalendarLayout />
      </DateProvider>
    </ZonedDateTimeProvider>
  );
}
