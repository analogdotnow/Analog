import type { MicrosoftCalendar } from "../../../client";
import type { ListMoreInput } from "../../../interfaces";
import { Attachments } from "./attachments";
import { Extensions } from "./extensions";
import { Instances } from "./instances";
import type {
  DefaultCalendarCreateEventInput,
  DefaultCalendarCreateEventResponse,
  DefaultCalendarDeleteEventInput,
  DefaultCalendarEventAcceptInput,
  DefaultCalendarEventCancelInput,
  DefaultCalendarEventDeclineInput,
  DefaultCalendarEventDeltaInput,
  DefaultCalendarEventDeltaResponse,
  DefaultCalendarEventDismissReminderInput,
  DefaultCalendarEventForwardInput,
  DefaultCalendarEventGetCalendarInput,
  DefaultCalendarEventGetCalendarResponse,
  DefaultCalendarEventGetCountInput,
  DefaultCalendarEventGetCountResponse,
  DefaultCalendarEventPermanentDeleteInput,
  DefaultCalendarEventSnoozeReminderInput,
  DefaultCalendarEventTentativelyAcceptInput,
  DefaultCalendarGetEventInput,
  DefaultCalendarGetEventResponse,
  DefaultCalendarListEventInput,
  DefaultCalendarListEventResponse,
  DefaultCalendarUpdateEventInput,
  DefaultCalendarUpdateEventResponse,
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
    params: DefaultCalendarListEventInput,
  ): Promise<DefaultCalendarListEventResponse> {
    return this.client.get<DefaultCalendarListEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events`,
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

  async listMore(
    params: ListMoreInput,
  ): Promise<DefaultCalendarListEventResponse> {
    return this.client.get<DefaultCalendarListEventResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: DefaultCalendarCreateEventInput,
  ): Promise<DefaultCalendarCreateEventResponse> {
    return this.client.post<DefaultCalendarCreateEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: DefaultCalendarEventGetCountInput,
  ): Promise<DefaultCalendarEventGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delta(
    params: DefaultCalendarEventDeltaInput,
  ): Promise<DefaultCalendarEventDeltaResponse> {
    return this.client.get<DefaultCalendarEventDeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/microsoft.graph.delta()`,
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

  async deltaMore(
    params: ListMoreInput,
  ): Promise<DefaultCalendarEventDeltaResponse> {
    return this.client.get<DefaultCalendarEventDeltaResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async delete(params: DefaultCalendarDeleteEventInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: DefaultCalendarGetEventInput,
  ): Promise<DefaultCalendarGetEventResponse> {
    return this.client.get<DefaultCalendarGetEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: DefaultCalendarUpdateEventInput,
  ): Promise<DefaultCalendarUpdateEventResponse> {
    return this.client.patch<DefaultCalendarUpdateEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async getCalendar(
    params: DefaultCalendarEventGetCalendarInput,
  ): Promise<DefaultCalendarEventGetCalendarResponse> {
    return this.client.get<DefaultCalendarEventGetCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/calendar`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async accept(params: DefaultCalendarEventAcceptInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.accept`,
      undefined,
      {
        sendResponse: params.sendResponse,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async cancel(params: DefaultCalendarEventCancelInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.cancel`,
      undefined,
      {
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async decline(params: DefaultCalendarEventDeclineInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.decline`,
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
    params: DefaultCalendarEventDismissReminderInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.dismissReminder`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async forward(params: DefaultCalendarEventForwardInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.forward`,
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
    params: DefaultCalendarEventPermanentDeleteInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async snoozeReminder(
    params: DefaultCalendarEventSnoozeReminderInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.snoozeReminder`,
      undefined,
      {
        newReminderTime: params.newReminderTime,
      },
      params.signal,
      params.headers,
    );
  }

  async tentativelyAccept(
    params: DefaultCalendarEventTentativelyAcceptInput,
  ): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.tentativelyAccept`,
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
