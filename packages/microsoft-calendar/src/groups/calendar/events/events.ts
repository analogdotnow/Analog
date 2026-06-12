import type { MicrosoftCalendar } from "../../../client";
import { Attachments } from "./attachments";
import { Extensions } from "./extensions";
import { Instances } from "./instances";
import type {
  GroupCalendarCreateEventInput,
  GroupCalendarCreateEventResponse,
  GroupCalendarDeleteEventInput,
  GroupCalendarEventAcceptInput,
  GroupCalendarEventCancelInput,
  GroupCalendarEventDeclineInput,
  GroupCalendarEventDeltaInput,
  GroupCalendarEventDeltaResponse,
  GroupCalendarEventDismissReminderInput,
  GroupCalendarEventForwardInput,
  GroupCalendarEventGetCalendarInput,
  GroupCalendarEventGetCalendarResponse,
  GroupCalendarEventGetCountInput,
  GroupCalendarEventGetCountResponse,
  GroupCalendarEventPermanentDeleteInput,
  GroupCalendarEventSnoozeReminderInput,
  GroupCalendarEventTentativelyAcceptInput,
  GroupCalendarGetEventInput,
  GroupCalendarGetEventResponse,
  GroupCalendarListEventInput,
  GroupCalendarListEventResponse,
  GroupCalendarUpdateEventInput,
  GroupCalendarUpdateEventResponse,
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
    params: GroupCalendarListEventInput,
  ): Promise<GroupCalendarListEventResponse> {
    return this.client.get<GroupCalendarListEventResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events`,
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
    params: GroupCalendarCreateEventInput,
  ): Promise<GroupCalendarCreateEventResponse> {
    return this.client.post<GroupCalendarCreateEventResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: GroupCalendarEventGetCountInput,
  ): Promise<GroupCalendarEventGetCountResponse> {
    return this.client.number(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delta(
    params: GroupCalendarEventDeltaInput,
  ): Promise<GroupCalendarEventDeltaResponse> {
    return this.client.get<GroupCalendarEventDeltaResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/microsoft.graph.delta()`,
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

  async delete(params: GroupCalendarDeleteEventInput): Promise<void> {
    return this.client.delete(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: GroupCalendarGetEventInput,
  ): Promise<GroupCalendarGetEventResponse> {
    return this.client.get<GroupCalendarGetEventResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: GroupCalendarUpdateEventInput,
  ): Promise<GroupCalendarUpdateEventResponse> {
    return this.client.patch<GroupCalendarUpdateEventResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async getCalendar(
    params: GroupCalendarEventGetCalendarInput,
  ): Promise<GroupCalendarEventGetCalendarResponse> {
    return this.client.get<GroupCalendarEventGetCalendarResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/calendar`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async accept(params: GroupCalendarEventAcceptInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.accept`,
      undefined,
      {
        sendResponse: params.sendResponse,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async cancel(params: GroupCalendarEventCancelInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.cancel`,
      undefined,
      {
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async decline(params: GroupCalendarEventDeclineInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.decline`,
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
    params: GroupCalendarEventDismissReminderInput,
  ): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.dismissReminder`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async forward(params: GroupCalendarEventForwardInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.forward`,
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
    params: GroupCalendarEventPermanentDeleteInput,
  ): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async snoozeReminder(
    params: GroupCalendarEventSnoozeReminderInput,
  ): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.snoozeReminder`,
      undefined,
      {
        newReminderTime: params.newReminderTime,
      },
      params.signal,
      params.headers,
    );
  }

  async tentativelyAccept(
    params: GroupCalendarEventTentativelyAcceptInput,
  ): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/microsoft.graph.tentativelyAccept`,
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
