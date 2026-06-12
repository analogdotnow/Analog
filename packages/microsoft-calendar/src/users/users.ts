import type { MicrosoftCalendar } from "../client";
import { Calendar } from "./calendar";
import { CalendarGroups } from "./calendar-groups";
import { CalendarView } from "./calendar-view";
import { Calendars } from "./calendars";
import { Events } from "./events";

export class Users {
  public readonly calendar: Calendar;
  public readonly calendarGroups: CalendarGroups;
  public readonly calendarView: CalendarView;
  public readonly calendars: Calendars;
  public readonly events: Events;

  constructor(private readonly client: MicrosoftCalendar) {
    this.calendar = new Calendar(client);
    this.calendarGroups = new CalendarGroups(client);
    this.calendarView = new CalendarView(client);
    this.calendars = new Calendars(client);
    this.events = new Events(client);
  }
}
