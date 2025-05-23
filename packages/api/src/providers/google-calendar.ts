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
}
