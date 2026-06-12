import type { MicrosoftCalendar } from "../../client";
import { Attachments } from "./attachments";
import { Extensions } from "./extensions";
import { Instances } from "./instances";
import type {
  GroupCreateEventInput,
  GroupCreateEventResponse,
  GroupDeleteEventInput,
  GroupEventAcceptInput,
  GroupEventCancelInput,
  GroupEventDeclineInput,
  GroupEventDeltaInput,
  GroupEventDeltaResponse,
  GroupEventDismissReminderInput,
  GroupEventForwardInput,
  GroupEventGetCalendarInput,
  GroupEventGetCalendarResponse,
  GroupEventGetCountInput,
  GroupEventGetCountResponse,
  GroupEventPermanentDeleteInput,
  GroupEventSnoozeReminderInput,
  GroupEventTentativelyAcceptInput,
  GroupGetEventInput,
  GroupGetEventResponse,
  GroupListEventInput,
  GroupListEventResponse,
  GroupUpdateEventInput,
  GroupUpdateEventResponse,
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

  async list(params: GroupListEventInput): Promise<GroupListEventResponse> {
    return this.client.get<GroupListEventResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events`,
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
    params: GroupCreateEventInput,
  ): Promise<GroupCreateEventResponse> {
    return this.client.post<GroupCreateEventResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: GroupEventGetCountInput,
  ): Promise<GroupEventGetCountResponse> {
    return this.client.number(
      `/groups/${encodeURIComponent(params.groupId)}/events/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delta(params: GroupEventDeltaInput): Promise<GroupEventDeltaResponse> {
    return this.client.get<GroupEventDeltaResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/microsoft.graph.delta()`,
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

  async delete(params: GroupDeleteEventInput): Promise<void> {
    return this.client.delete(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(params: GroupGetEventInput): Promise<GroupGetEventResponse> {
    return this.client.get<GroupGetEventResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(
    params: GroupUpdateEventInput,
  ): Promise<GroupUpdateEventResponse> {
    return this.client.patch<GroupUpdateEventResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async getCalendar(
    params: GroupEventGetCalendarInput,
  ): Promise<GroupEventGetCalendarResponse> {
    return this.client.get<GroupEventGetCalendarResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/calendar`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async accept(params: GroupEventAcceptInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.accept`,
      undefined,
      {
        sendResponse: params.sendResponse,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async cancel(params: GroupEventCancelInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.cancel`,
      undefined,
      {
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async decline(params: GroupEventDeclineInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.decline`,
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

  async dismissReminder(params: GroupEventDismissReminderInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.dismissReminder`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async forward(params: GroupEventForwardInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.forward`,
      undefined,
      {
        toRecipients: params.toRecipients,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async permanentDelete(params: GroupEventPermanentDeleteInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async snoozeReminder(params: GroupEventSnoozeReminderInput): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.snoozeReminder`,
      undefined,
      {
        newReminderTime: params.newReminderTime,
      },
      params.signal,
      params.headers,
    );
  }

  async tentativelyAccept(
    params: GroupEventTentativelyAcceptInput,
  ): Promise<void> {
    return this.client.post(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.tentativelyAccept`,
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
