export interface DateInput {
  dateTime: string;
  timeZone: string;
}

export interface Calendar {
  id: string;
  provider: string;
  name: string;
  primary: boolean;
}

export interface Task {
  id: string;
  provider: string;
  title: string;
  description?: string;
  due?: string;
  completed?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: DateInput;
  end: DateInput;
  allDay?: boolean;
  location?: string;
  status?: string;
  htmlLink?: string;
  color?: string;
}

export interface ProviderOptions {
  accessToken: string;
}

export interface CalendarProvider {
  providerId: "google" | "microsoft";
  calendars(): Promise<Calendar[]>;
  createCalendar(
    calendar: Omit<Calendar, "id" | "provider">,
  ): Promise<Calendar>;
  updateCalendar(
    calendarId: string,
    calendar: Partial<Calendar>,
  ): Promise<Calendar>;
  deleteCalendar(calendarId: string): Promise<void>;
  events(
    calendarId: string,
    timeMin?: string,
    timeMax?: string,
  ): Promise<CalendarEvent[]>;
  createEvent(
    calendarId: string,
    event: Omit<CalendarEvent, "id">,
  ): Promise<CalendarEvent>;
  updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<CalendarEvent>,
  ): Promise<CalendarEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
}


export interface TaskProvider {
  providerId: "google" | "microsoft";
  tasks(): Promise<Task[]>;
  createTask(task: Omit<Task, "id">): Promise<Task>;
  updateTask(taskId: string, task: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
}