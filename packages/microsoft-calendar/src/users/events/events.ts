import type { MicrosoftCalendar } from "../../client";
import { Attachments } from "./attachments";
import { Extensions } from "./extensions";
import { Instances } from "./instances";
import type {
  AcceptInput,
  CancelInput,
  CreateEventInput,
  CreateEventResponse,
  DeclineInput,
  DeleteEventInput,
  DeltaInput,
  DeltaResponse,
  DismissReminderInput,
  EventGetCalendarInput,
  EventGetCalendarResponse,
  ForwardInput,
  GetCountInput,
  GetCountResponse,
  GetEventInput,
  GetEventResponse,
  ListEventInput,
  ListEventResponse,
  PermanentDeleteInput,
  SnoozeReminderInput,
  TentativelyAcceptInput,
  UpdateEventInput,
  UpdateEventResponse,
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

  async list(params: ListEventInput): Promise<ListEventResponse> {
    return this.client.get<ListEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/events`,
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

  async create(params: CreateEventInput): Promise<CreateEventResponse> {
    return this.client.post<CreateEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/events`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async $count(params: GetCountInput): Promise<GetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/events/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async delta(params: DeltaInput): Promise<DeltaResponse> {
    return this.client.get<DeltaResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/microsoft.graph.delta()`,
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

  async delete(params: DeleteEventInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(params: GetEventInput): Promise<GetEventResponse> {
    return this.client.get<GetEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async update(params: UpdateEventInput): Promise<UpdateEventResponse> {
    return this.client.patch<UpdateEventResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}`,
      undefined,
      params.event,
      params.signal,
      params.headers,
    );
  }

  async getCalendar(
    params: EventGetCalendarInput,
  ): Promise<EventGetCalendarResponse> {
    return this.client.get<EventGetCalendarResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/calendar`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }

  async accept(params: AcceptInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.accept`,
      undefined,
      {
        sendResponse: params.sendResponse,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async cancel(params: CancelInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.cancel`,
      undefined,
      {
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async decline(params: DeclineInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.decline`,
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

  async dismissReminder(params: DismissReminderInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.dismissReminder`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async forward(params: ForwardInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.forward`,
      undefined,
      {
        toRecipients: params.toRecipients,
        comment: params.comment,
      },
      params.signal,
      params.headers,
    );
  }

  async permanentDelete(params: PermanentDeleteInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.permanentDelete`,
      undefined,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async snoozeReminder(params: SnoozeReminderInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.snoozeReminder`,
      undefined,
      {
        newReminderTime: params.newReminderTime,
      },
      params.signal,
      params.headers,
    );
  }

  async tentativelyAccept(params: TentativelyAcceptInput): Promise<void> {
    return this.client.post(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/microsoft.graph.tentativelyAccept`,
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
