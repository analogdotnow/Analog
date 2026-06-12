import type { MicrosoftCalendar } from "../../../../client";
import { Attachments } from "./attachments";
import { Extensions } from "./extensions";
import { Instances } from "./instances";
import type {
  CalendarGroupCalendarCreateEventInput,
  CalendarGroupCalendarCreateEventResponse,
  CalendarGroupCalendarDeleteEventInput,
  CalendarGroupCalendarEventAcceptInput,
  CalendarGroupCalendarEventCancelInput,
  CalendarGroupCalendarEventDeclineInput,
  CalendarGroupCalendarEventDeltaInput,
  CalendarGroupCalendarEventDeltaResponse,
  CalendarGroupCalendarEventDismissReminderInput,
  CalendarGroupCalendarEventForwardInput,
  CalendarGroupCalendarEventGetCalendarInput,
  CalendarGroupCalendarEventGetCalendarResponse,
  CalendarGroupCalendarEventGetCountInput,
  CalendarGroupCalendarEventGetCountResponse,
  CalendarGroupCalendarEventPermanentDeleteInput,
  CalendarGroupCalendarEventSnoozeReminderInput,
  CalendarGroupCalendarEventTentativelyAcceptInput,
  CalendarGroupCalendarGetEventInput,
  CalendarGroupCalendarGetEventResponse,
  CalendarGroupCalendarListEventInput,
  CalendarGroupCalendarListEventResponse,
  CalendarGroupCalendarUpdateEventInput,
  CalendarGroupCalendarUpdateEventResponse,
} from "./interfaces";

export class Events {
  public readonly attachments: Attachments;
  public readonly extensions: Extensions;
  public readonly instances: Instances;

  constructor(private readonly client: MicrosoftCalendar) {
    this.attachments = new Attachments(client);
    this.extensions = new Extensions(client);
    this.instances = new Instances(client);
  }

  async list(
    params: CalendarGroupCalendarListEventInput,
  ): Promise<CalendarGroupCalendarListEventResponse> {
    return this.client.get<CalendarGroupCalendarListEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events`,
      {
        $top: params.top,
        $skip: params.skip,
        $search: params.search,
        $filter: params.filter,
        $count: params.count,
        $orderby: params.orderby,
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async create(
    params: CalendarGroupCalendarCreateEventInput,
  ): Promise<CalendarGroupCalendarCreateEventResponse> {
    return this.client.post<CalendarGroupCalendarCreateEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarGroupCalendarEventGetCountInput,
  ): Promise<CalendarGroupCalendarEventGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delta(
    params: CalendarGroupCalendarEventDeltaInput,
  ): Promise<CalendarGroupCalendarEventDeltaResponse> {
    return this.client.get<CalendarGroupCalendarEventDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/microsoft.graph.delta()`,
      {
        startDateTime: params.startDateTime,
        endDateTime: params.endDateTime,
        $top: params.top,
        $skip: params.skip,
        $search: params.search,
        $filter: params.filter,
        $count: params.count,
        $select: params.select,
        $orderby: params.orderby,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: CalendarGroupCalendarDeleteEventInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: CalendarGroupCalendarGetEventInput,
  ): Promise<CalendarGroupCalendarGetEventResponse> {
    return this.client.get<CalendarGroupCalendarGetEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: CalendarGroupCalendarUpdateEventInput,
  ): Promise<CalendarGroupCalendarUpdateEventResponse> {
    return this.client.patch<CalendarGroupCalendarUpdateEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async getCalendar(
    params: CalendarGroupCalendarEventGetCalendarInput,
  ): Promise<CalendarGroupCalendarEventGetCalendarResponse> {
    return this.client.get<CalendarGroupCalendarEventGetCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/calendar`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async accept(params: CalendarGroupCalendarEventAcceptInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.accept`,
      undefined,
      {
        sendResponse: params.sendResponse,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async cancel(params: CalendarGroupCalendarEventCancelInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.cancel`,
      undefined,
      {
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async decline(params: CalendarGroupCalendarEventDeclineInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.decline`,
      undefined,
      {
        proposedNewTime: params.proposedNewTime,
        sendResponse: params.sendResponse,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async dismissReminder(
    params: CalendarGroupCalendarEventDismissReminderInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.dismissReminder`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async forward(params: CalendarGroupCalendarEventForwardInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.forward`,
      undefined,
      {
        toRecipients: params.toRecipients,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async permanentDelete(
    params: CalendarGroupCalendarEventPermanentDeleteInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async snoozeReminder(
    params: CalendarGroupCalendarEventSnoozeReminderInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.snoozeReminder`,
      undefined,
      {
        newReminderTime: params.newReminderTime,
      },
      params.signal,
      params.headers,
    );
  }

  async tentativelyAccept(
    params: CalendarGroupCalendarEventTentativelyAcceptInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.tentativelyAccept`,
      undefined,
      {
        proposedNewTime: params.proposedNewTime,
        sendResponse: params.sendResponse,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }
}
