export interface DateInput {
  dateTime: string;
  timeZone: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  start: DateInput;
  end: DateInput;
  allDay?: boolean;
  location?: string;
  colorId?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  start?: DateInput;
  end?: DateInput;
  allDay?: boolean;
  location?: string;
  colorId?: string;
}
