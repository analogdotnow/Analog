import { addDays, endOfDay, subDays } from "date-fns";

export const dateHelpers = {
  formatDateForAPI(date: Date | string, isAllDay: boolean): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isAllDay) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } else {
      return dateObj.toISOString();
    }
  },

  parseGoogleDate(
    googleDate: { date?: string; dateTime?: string },
    isAllDay: boolean,
  ): string {
    if (isAllDay && googleDate.date) {
      return `${googleDate.date}T00:00:00`;
    } else if (googleDate.dateTime) {
      return googleDate.dateTime;
    }
    return new Date().toISOString();
  },

  adjustEndDateForDisplay(
    startDate: Date,
    endDate: Date,
    allDay: boolean,
  ): Date {
    if (!allDay) {
      return endDate;
    }

    const nextDayOfStart = addDays(
      new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      ),
      1,
    );

    if (endDate.getTime() === nextDayOfStart.getTime()) {
      return endOfDay(startDate);
    } else {
      return endOfDay(subDays(endDate, 1));
    }
  },

  prepareDateParams(
    start: string | { dateTime: string; timeZone: string },
    end: string | { dateTime: string; timeZone: string },
    allDay: boolean,
  ) {
    const startDateTime = typeof start === "string" ? start : start.dateTime;
    const endDateTime = typeof end === "string" ? end : end.dateTime;
    const timeZone = typeof start === "object" ? start.timeZone : "UTC";

    if (allDay) {
      const startDate = startDateTime.substring(0, 10);
      let endDate = endDateTime.substring(0, 10);

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      // If same day, extend to next day for all-day events
      if (startDateObj.getTime() === endDateObj.getTime()) {
        const nextDay = addDays(endDateObj, 1);
        endDate = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, "0")}-${String(nextDay.getDate()).padStart(2, "0")}`;
      } else {
        // For multi-day events, add one day to end date
        const nextDay = addDays(endDateObj, 1);
        endDate = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, "0")}-${String(nextDay.getDate()).padStart(2, "0")}`;
      }

      return {
        start: { date: startDate },
        end: { date: endDate },
      };
    } else {
      return {
        start: { dateTime: startDateTime, timeZone: timeZone },
        end: { dateTime: endDateTime, timeZone: timeZone },
      };
    }
  },

  prepareGoogleParams(input: {
    title?: string;
    description?: string;
    location?: string;
    start?: string;
    end?: string;
    allDay?: boolean;
  }) {
    const params: any = {};

    if (input.title !== undefined) params.summary = input.title;
    if (input.description !== undefined) params.description = input.description;
    if (input.location !== undefined) params.location = input.location;

    if (input.start && input.end) {
      const dateParams = this.prepareDateParams(
        input.start,
        input.end,
        input.allDay || false,
      );
      params.start = dateParams.start;
      params.end = dateParams.end;
    }

    return params;
  },

  prepareMicrosoftParams(input: {
    title?: string;
    description?: string;
    location?: string;
    start?: string;
    end?: string;
    allDay?: boolean;
  }) {
    const params: any = {};

    if (input.title !== undefined) params.subject = input.title;
    if (input.description !== undefined) {
      params.body = input.description
        ? {
            contentType: "text",
            content: input.description,
          }
        : undefined;
    }
    if (input.location !== undefined) {
      params.location = input.location
        ? {
            displayName: input.location,
          }
        : undefined;
    }

    if (input.start && input.end) {
      const dateParams = this.prepareDateParams(
        input.start,
        input.end,
        input.allDay || false,
      );
      params.start = dateParams.start;
      params.end = dateParams.end;
    }

    if (input.allDay !== undefined) {
      params.isAllDay = input.allDay;
    }

    return params;
  },
};

export interface GoogleEventDate {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface CalendarEventInput {
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
  location?: string;
}
