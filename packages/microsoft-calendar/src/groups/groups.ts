import type { MicrosoftCalendar } from "../client";
import { Calendar } from "./calendar";
import { CalendarView } from "./calendar-view";
import { Events } from "./events";

export class Groups {
  public readonly calendar: Calendar;
  public readonly calendarView: CalendarView;
  public readonly events: Events;

  constructor(private readonly client: MicrosoftCalendar) {
    this.calendar = new Calendar(client);
    this.calendarView = new CalendarView(client);
    this.events = new Events(client);
  }
}
