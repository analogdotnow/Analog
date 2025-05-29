import { Client } from "@microsoft/microsoft-graph-client";
import type {
  Calendar,
  CalendarGroup,
  Event,
  MeetingTimeSuggestionsResult,
  ScheduleInformation,
} from "@microsoft/microsoft-graph-types";

import { CALENDAR_DEFAULTS } from "../constants/calendar";
import { dateHelpers } from "../utils/date-helpers";
import type { CreateEventInput, UpdateEventInput } from "./shared";

/**
 * Configuration options for the Microsoft Calendar provider
 */
interface MicrosoftCalendarProviderOptions {
  /** Microsoft Graph API access token */
  accessToken: string;
}

/**
 * Microsoft Calendar provider that integrates with Microsoft Graph Calendar API
 *
 * All methods return native Microsoft Graph types for maximum compatibility.
 *
 * @example
 * ```typescript
 * const provider = new MicrosoftCalendarProvider({
 *   accessToken: "your-access-token"
 * });
 *
 * // Get all calendars
 * const calendars = await provider.calendars();
 *
 * // Create a new event
 * const event = await provider.createEvent("calendar-id", {
 *   subject: "Team Meeting",
 *   start: {
 *     dateTime: "2024-01-15T10:00:00",
 *     timeZone: "UTC"
 *   },
 *   end: {
 *     dateTime: "2024-01-15T11:00:00",
 *     timeZone: "UTC"
 *   },
 *   attendees: [{
 *     emailAddress: { address: "user@example.com" },
 *     type: "required"
 *   }]
 * });
 * ```
 */
export class MicrosoftCalendarProvider {
  private graphClient: Client;

  /**
   * Creates a new Microsoft Calendar provider instance
   */
  constructor({ accessToken }: MicrosoftCalendarProviderOptions) {
    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => accessToken,
      },
    });
  }

  /**
   * Retrieves all calendars for the current user
   *
   * @returns Array of Microsoft Graph Calendar objects
   */
  async calendars(): Promise<Calendar[]> {
    const response = await this.graphClient.api("/me/calendars").get();
    return response.value;
  }

  /**
   * Creates a new calendar
   *
   * @param calendarData - Calendar data using Microsoft Graph Calendar type
   * @returns The created Microsoft Graph Calendar object
   */
  async createCalendar(
    calendarData: Omit<Calendar, "id" | "changeKey" | "isDefaultCalendar">,
  ): Promise<Calendar> {
    return (await this.graphClient
      .api("/me/calendars")
      .post(calendarData)) as Calendar;
  }

  /**
   * Retrieves all calendar groups for the current user
   *
   * @returns Array of Microsoft Graph CalendarGroup objects
   */
  async calendarGroups(): Promise<CalendarGroup[]> {
    const response = await this.graphClient.api("/me/calendarGroups").get();
    return response.value;
  }

  /**
   * Creates a new calendar group
   *
   * @param groupData - Calendar group data using Microsoft Graph CalendarGroup type
   * @returns The created Microsoft Graph CalendarGroup object
   */
  async createCalendarGroup(
    groupData: Omit<CalendarGroup, "id" | "changeKey">,
  ): Promise<CalendarGroup> {
    return (await this.graphClient
      .api("/me/calendarGroups")
      .post(groupData)) as CalendarGroup;
  }

  /**
   * Retrieves events from a specific calendar
   *
   * @param calendarId - The calendar identifier
   * @param timeMin - Optional start time filter (ISO 8601 string)
   * @param timeMax - Optional end time filter (ISO 8601 string)
   * @returns Array of transformed Event objects
   */
  async events(calendarId: string, timeMin?: string, timeMax?: string) {
    const defaultTimeMin = new Date();
    const defaultTimeMax = new Date(
      Date.now() +
        CALENDAR_DEFAULTS.TIME_RANGE_DAYS_FUTURE * 24 * 60 * 60 * 1000,
    );

    const startTime = timeMin || defaultTimeMin.toISOString();
    const endTime = timeMax || defaultTimeMax.toISOString();

    const apiPath =
      calendarId === "primary"
        ? "/me/calendar/events"
        : `/me/calendars/${calendarId}/events`;

    const response = await this.graphClient
      .api(apiPath)
      .filter(
        `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`,
      )
      .orderby("start/dateTime")
      .top(CALENDAR_DEFAULTS.MAX_EVENTS_PER_CALENDAR)
      .get();

    return (response.value as Event[]).map((event: Event) =>
      this.transformMicrosoftEvent(event),
    );
  }

  /**
   * Creates a new event in the specified calendar
   *
   * @param calendarId - The calendar identifier
   * @param event - Event data using CreateEventInput interface
   * @returns The created transformed Event object
   */
  async createEvent(calendarId: string, event: CreateEventInput) {
    const microsoftEvent: Omit<
      Event,
      "id" | "changeKey" | "createdDateTime" | "lastModifiedDateTime"
    > = {
      subject: event.title,
      body: event.description
        ? {
            contentType: "text",
            content: event.description,
          }
        : undefined,
      start: event.start,
      end: event.end,
      isAllDay: event.allDay || false,
      location: event.location
        ? {
            displayName: event.location,
          }
        : undefined,
    };

    console.log("start", event.start);
    console.log("end", event.end);
    console.log({ event, microsoftEvent });

    const apiPath =
      calendarId === "primary"
        ? "/me/calendar/events"
        : `/me/calendars/${calendarId}/events`;

    const createdEvent = (await this.graphClient
      .api(apiPath)
      .post(microsoftEvent)) as Event;

    return this.transformMicrosoftEvent(createdEvent);
  }

  /**
   * Updates an existing event
   *
   * @param calendarId - The calendar identifier
   * @param eventId - The event identifier
   * @param event - Partial event data for updates using UpdateEventInput interface
   * @returns The updated transformed Event object
   */
  async updateEvent(
    calendarId: string,
    eventId: string,
    event: UpdateEventInput,
  ) {
    const microsoftEvent: Partial<Event> = {};

    if (event.title !== undefined) {
      microsoftEvent.subject = event.title;
    }
    if (event.description !== undefined) {
      microsoftEvent.body = event.description
        ? {
            contentType: "text",
            content: event.description,
          }
        : undefined;
    }
    if (event.start !== undefined) {
      microsoftEvent.start = event.start;
    }
    if (event.end !== undefined) {
      microsoftEvent.end = event.end;
    }
    if (event.allDay !== undefined) {
      microsoftEvent.isAllDay = event.allDay;
    }
    if (event.location !== undefined) {
      microsoftEvent.location = event.location
        ? {
            displayName: event.location,
          }
        : undefined;
    }

    const apiPath =
      calendarId === "primary"
        ? `/me/calendar/events/${eventId}`
        : `/me/calendars/${calendarId}/events/${eventId}`;

    const updatedEvent = (await this.graphClient
      .api(apiPath)
      .patch(microsoftEvent)) as Event;
    return this.transformMicrosoftEvent(updatedEvent);
  }

  /**
   * Deletes an event from the calendar
   *
   * @param calendarId - The calendar identifier
   * @param eventId - The event identifier
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    const apiPath =
      calendarId === "primary"
        ? `/me/calendar/events/${eventId}`
        : `/me/calendars/${calendarId}/events/${eventId}`;

    await this.graphClient.api(apiPath).delete();
  }

  /**
   * Finds available meeting times based on attendee availability
   *
   * @param requestData - Meeting time search parameters following Microsoft Graph findMeetingTimes API schema
   * @returns Microsoft Graph MeetingTimeSuggestionsResult object
   */
  async findMeetingTimes(requestData: {
    attendees?: Array<{
      type: "required" | "optional" | "resource";
      emailAddress: {
        name?: string;
        address: string;
      };
    }>;
    timeConstraint?: {
      activityDomain?: "work" | "personal" | "unrestricted" | "unknown";
      timeSlots?: Array<{
        start: { dateTime: string; timeZone: string };
        end: { dateTime: string; timeZone: string };
      }>;
    };
    meetingDuration?: string;
    maxCandidates?: number;
    isOrganizerOptional?: boolean;
    returnSuggestionReasons?: boolean;
    minimumAttendeePercentage?: number;
    locationConstraint?: {
      isRequired?: boolean;
      suggestLocation?: boolean;
      locations?: Array<{
        resolveAvailability?: boolean;
        displayName?: string;
      }>;
    };
  }): Promise<MeetingTimeSuggestionsResult> {
    const findMeetingTimesRequest: typeof requestData = requestData;

    return (await this.graphClient
      .api("/me/findMeetingTimes")
      .post(findMeetingTimesRequest)) as MeetingTimeSuggestionsResult;
  }

  /**
   * Gets the free/busy schedule for specified users and resources
   *
   * @param requestData - Free/busy query parameters following Microsoft Graph getSchedule API schema
   * @returns Array of Microsoft Graph ScheduleInformation objects
   */
  async getFreeBusySchedule(requestData: {
    schedules: string[];
    startTime: { dateTime: string; timeZone: string };
    endTime: { dateTime: string; timeZone: string };
    availabilityViewInterval?: number;
  }): Promise<ScheduleInformation[]> {
    const getScheduleRequest: typeof requestData = requestData;

    const response = await this.graphClient
      .api("/me/calendar/getSchedule")
      .post(getScheduleRequest);

    return response.value;
  }

  /**
   * Gets the calendar view (expanded recurring events) for a time range
   *
   * @param calendarId - The calendar identifier
   * @param startTime - Start time for the calendar view
   * @param endTime - End time for the calendar view
   * @returns Array of transformed Event objects including expanded recurring instances
   */
  async calendarView(calendarId: string, startTime: string, endTime: string) {
    const apiPath =
      calendarId === "primary"
        ? "/me/calendar/calendarView"
        : `/me/calendars/${calendarId}/calendarView`;

    const response = await this.graphClient
      .api(apiPath)
      .query({ startDateTime: startTime, endDateTime: endTime })
      .get();

    return (response.value as Event[]).map((event: Event) =>
      this.transformMicrosoftEvent(event),
    );
  }

  /**
   * Gets reminder view showing events with upcoming reminders
   *
   * @param startTime - Start time for the reminder view
   * @param endTime - End time for the reminder view
   * @returns Array of transformed Event objects with reminder information
   */
  async reminderView(startTime: string, endTime: string) {
    const response = await this.graphClient
      .api("/me/calendar/events")
      .filter(
        `reminderFireTime ge ${startTime} and reminderFireTime le ${endTime}`,
      )
      .select("id,subject,start,end,reminderMinutesBeforeStart,isReminderOn")
      .get();

    return (response.value as Event[])
      .filter((event: Event) => event.isReminderOn)
      .map((event: Event) => this.transformMicrosoftEvent(event));
  }

  /**
   * Transforms a Microsoft Graph Event object into a standardized format
   *
   * @param microsoftEvent - The Microsoft Graph Event object
   * @returns Transformed event object with consistent property names
   */
  private transformMicrosoftEvent(microsoftEvent: Event) {
    const isAllDay = microsoftEvent.isAllDay || false;

    // Parse start and end times
    const start = microsoftEvent.start?.dateTime
      ? new Date(microsoftEvent.start.dateTime)
      : new Date();

    const end = microsoftEvent.end?.dateTime
      ? new Date(microsoftEvent.end.dateTime)
      : new Date();

    return {
      id: microsoftEvent.id || "",
      title: microsoftEvent.subject || "Untitled Event",
      description: microsoftEvent.body?.content || microsoftEvent.bodyPreview,
      start,
      end,
      allDay: isAllDay,
      location:
        microsoftEvent.location?.displayName ||
        microsoftEvent.location?.address?.street,
      status: microsoftEvent.showAs,
      webLink: microsoftEvent.webLink,
      importance: microsoftEvent.importance,
      sensitivity: microsoftEvent.sensitivity,
      reminderMinutesBeforeStart: microsoftEvent.reminderMinutesBeforeStart,
      isReminderOn: microsoftEvent.isReminderOn,
      organizer: microsoftEvent.organizer?.emailAddress,
      attendees: microsoftEvent.attendees?.map((attendee) => ({
        name: attendee.emailAddress?.name,
        email: attendee.emailAddress?.address,
        status: attendee.status?.response,
        type: attendee.type,
      })),
    };
  }
}
