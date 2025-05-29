import { Client } from "@microsoft/microsoft-graph-client";
import type {
  Calendar,
  CalendarGroup,
  Event,
  MeetingTimeSuggestionsResult,
  ScheduleInformation,
} from "@microsoft/microsoft-graph-types";

import { CALENDAR_DEFAULTS } from "../constants/calendar";

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
   * @returns Array of Microsoft Graph Event objects
   */
  async events(
    calendarId: string,
    timeMin?: string,
    timeMax?: string,
  ): Promise<Event[]> {
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

    return response.value;
  }

  /**
   * Creates a new event in the specified calendar
   *
   * @param calendarId - The calendar identifier
   * @param eventData - Event data using Microsoft Graph Event type
   * @returns The created Microsoft Graph Event object
   */
  async createEvent(
    calendarId: string,
    eventData: Omit<
      Event,
      "id" | "changeKey" | "createdDateTime" | "lastModifiedDateTime"
    >,
  ): Promise<Event> {
    const apiPath =
      calendarId === "primary"
        ? "/me/calendar/events"
        : `/me/calendars/${calendarId}/events`;

    return (await this.graphClient.api(apiPath).post(eventData)) as Event;
  }

  /**
   * Updates an existing event
   *
   * @param calendarId - The calendar identifier
   * @param eventId - The event identifier
   * @param eventData - Partial event data for updates using Microsoft Graph Event type
   * @returns The updated Microsoft Graph Event object
   */
  async updateEvent(
    calendarId: string,
    eventId: string,
    eventData: Partial<Event>,
  ): Promise<Event> {
    const apiPath =
      calendarId === "primary"
        ? `/me/calendar/events/${eventId}`
        : `/me/calendars/${calendarId}/events/${eventId}`;

    return (await this.graphClient.api(apiPath).patch(eventData)) as Event;
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
    return (await this.graphClient
      .api("/me/findMeetingTimes")
      .post(requestData)) as MeetingTimeSuggestionsResult;
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
    const response = await this.graphClient
      .api("/me/calendar/getSchedule")
      .post(requestData);

    return response.value;
  }

  /**
   * Gets the calendar view (expanded recurring events) for a time range
   *
   * @param calendarId - The calendar identifier
   * @param startTime - Start time for the calendar view
   * @param endTime - End time for the calendar view
   * @returns Array of Microsoft Graph Event objects including expanded recurring instances
   */
  async calendarView(
    calendarId: string,
    startTime: string,
    endTime: string,
  ): Promise<Event[]> {
    const apiPath =
      calendarId === "primary"
        ? "/me/calendar/calendarView"
        : `/me/calendars/${calendarId}/calendarView`;

    const response = await this.graphClient
      .api(apiPath)
      .query({ startDateTime: startTime, endDateTime: endTime })
      .get();

    return response.value;
  }

  /**
   * Gets reminder view showing events with upcoming reminders
   *
   * @param startTime - Start time for the reminder view
   * @param endTime - End time for the reminder view
   * @returns Array of Microsoft Graph Event objects with reminder information
   */
  async reminderView(startTime: string, endTime: string): Promise<Event[]> {
    const response = await this.graphClient
      .api("/me/calendar/events")
      .filter(
        `reminderFireTime ge ${startTime} and reminderFireTime le ${endTime}`,
      )
      .select("id,subject,start,end,reminderMinutesBeforeStart,isReminderOn")
      .get();

    return response.value.filter((event: Event) => event.isReminderOn);
  }
}
