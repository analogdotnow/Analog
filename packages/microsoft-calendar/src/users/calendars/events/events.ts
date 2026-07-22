import type { MicrosoftCalendar } from "../../../client";
import type { ListMoreInput } from "../../../interfaces";
import { Attachments } from "./attachments";
import { Extensions } from "./extensions";
import { Instances } from "./instances";
import type {
  CalendarCreateEventInput,
  CalendarCreateEventResponse,
  CalendarDeleteEventInput,
  CalendarEventAcceptInput,
  CalendarEventCancelInput,
  CalendarEventDeclineInput,
  CalendarEventDeltaInput,
  CalendarEventDeltaResponse,
  CalendarEventDismissReminderInput,
  CalendarEventForwardInput,
  CalendarEventGetCalendarInput,
  CalendarEventGetCalendarResponse,
  CalendarEventGetCountInput,
  CalendarEventGetCountResponse,
  CalendarEventPermanentDeleteInput,
  CalendarEventSnoozeReminderInput,
  CalendarEventTentativelyAcceptInput,
  CalendarGetEventInput,
  CalendarGetEventResponse,
  CalendarListEventInput,
  CalendarListEventResponse,
  CalendarUpdateEventInput,
  CalendarUpdateEventResponse,
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
    params: CalendarListEventInput,
  ): Promise<CalendarListEventResponse> {
    return this.client.get<CalendarListEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events`,
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

  async listMore(params: ListMoreInput): Promise<CalendarListEventResponse> {
    return this.client.get<CalendarListEventResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: CalendarCreateEventInput,
  ): Promise<CalendarCreateEventResponse> {
    return this.client.post<CalendarCreateEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarEventGetCountInput,
  ): Promise<CalendarEventGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delta(
    params: CalendarEventDeltaInput,
  ): Promise<CalendarEventDeltaResponse> {
    return this.client.get<CalendarEventDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/microsoft.graph.delta()`,
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

  async deltaMore(params: ListMoreInput): Promise<CalendarEventDeltaResponse> {
    return this.client.get<CalendarEventDeltaResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async delete(params: CalendarDeleteEventInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(params: CalendarGetEventInput): Promise<CalendarGetEventResponse> {
    return this.client.get<CalendarGetEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: CalendarUpdateEventInput,
  ): Promise<CalendarUpdateEventResponse> {
    return this.client.patch<CalendarUpdateEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async getCalendar(
    params: CalendarEventGetCalendarInput,
  ): Promise<CalendarEventGetCalendarResponse> {
    return this.client.get<CalendarEventGetCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/calendar`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async accept(params: CalendarEventAcceptInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.accept`,
      undefined,
      {
        sendResponse: params.sendResponse,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async cancel(params: CalendarEventCancelInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.cancel`,
      undefined,
      {
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async decline(params: CalendarEventDeclineInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.decline`,
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
    params: CalendarEventDismissReminderInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.dismissReminder`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async forward(params: CalendarEventForwardInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.forward`,
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
    params: CalendarEventPermanentDeleteInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async snoozeReminder(
    params: CalendarEventSnoozeReminderInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.snoozeReminder`,
      undefined,
      {
        newReminderTime: params.newReminderTime,
      },
      params.signal,
      params.headers,
    );
  }

  async tentativelyAccept(
    params: CalendarEventTentativelyAcceptInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.tentativelyAccept`,
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
