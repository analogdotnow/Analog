import { GoogleCalendar } from "@repo/google-calendar";

interface GoogleCalendarProviderOptions {
  accessToken: string;
}

export class GoogleCalendarProvider {
  private client: GoogleCalendar;

  constructor({ accessToken }: GoogleCalendarProviderOptions) {
    this.client = new GoogleCalendar({
      accessToken,
    });
  }

  async calendars() {
    const { items } = await this.client.users.me.calendarList.list();

    return (
      items?.map((calendar) => ({
        id: calendar.id,
        provider: "google",
        name: calendar.summary,
        primary: calendar.primary,
      })) ?? []
    );
  }

  async events(calendarId: string, timeMin?: string, timeMax?: string) {
    const { items } = await this.client.calendars.events.list(calendarId, {
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
    });

    return (
      items?.map((event) => {
        const isAllDay = !event.start?.dateTime;

        let start: string;
        let end: string;

        if (isAllDay) {
          start = event.start?.date ? `${event.start.date}T00:00:00` : "";
          end = event.end?.date ? `${event.end.date}T00:00:00` : "";
        } else {
          start = event.start?.dateTime || "";
          end = event.end?.dateTime || "";
        }

        return {
          id: event.id || "",
          title: event.summary || "Untitled Event",
          description: event.description,
          start,
          end,
          allDay: isAllDay,
          location: event.location,
          status: event.status,
          htmlLink: event.htmlLink,
          colorId: event.colorId,
        };
      }) ?? []
    );
  }
}
