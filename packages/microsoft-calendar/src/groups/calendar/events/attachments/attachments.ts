import type { MicrosoftCalendar } from "../../../../client";
import type { ListMoreInput } from "../../../../interfaces";
import type {
  GroupCalendarEventAttachmentCreateUploadSessionInput,
  GroupCalendarEventAttachmentCreateUploadSessionResponse,
  GroupCalendarEventAttachmentGetCountInput,
  GroupCalendarEventAttachmentGetCountResponse,
  GroupCalendarEventCreateAttachmentInput,
  GroupCalendarEventCreateAttachmentResponse,
  GroupCalendarEventDeleteAttachmentInput,
  GroupCalendarEventGetAttachmentInput,
  GroupCalendarEventGetAttachmentResponse,
  GroupCalendarEventListAttachmentInput,
  GroupCalendarEventListAttachmentResponse,
} from "./interfaces";

export class Attachments {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: GroupCalendarEventListAttachmentInput,
  ): Promise<GroupCalendarEventListAttachmentResponse> {
    return this.client.get<GroupCalendarEventListAttachmentResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments`,
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
  ): Promise<GroupCalendarEventListAttachmentResponse> {
    return this.client.get<GroupCalendarEventListAttachmentResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: GroupCalendarEventCreateAttachmentInput,
  ): Promise<GroupCalendarEventCreateAttachmentResponse> {
    return this.client.post<GroupCalendarEventCreateAttachmentResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments`,
      undefined,
      params.attachment,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: GroupCalendarEventAttachmentGetCountInput,
  ): Promise<GroupCalendarEventAttachmentGetCountResponse> {
    return this.client.number(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async createUploadSession(
    params: GroupCalendarEventAttachmentCreateUploadSessionInput,
  ): Promise<GroupCalendarEventAttachmentCreateUploadSessionResponse> {
    return this.client.post<GroupCalendarEventAttachmentCreateUploadSessionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments/microsoft.graph.createUploadSession`,
      undefined,
      {
        // Graph's createUploadSession action parameter is a documented PascalCase
        // exception among otherwise-camelCase action parameters.
        AttachmentItem: params.attachmentItem,
      },
      params.signal,
      params.headers,
    );
  }

  async delete(params: GroupCalendarEventDeleteAttachmentInput): Promise<void> {
    return this.client.delete(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: GroupCalendarEventGetAttachmentInput,
  ): Promise<GroupCalendarEventGetAttachmentResponse> {
    return this.client.get<GroupCalendarEventGetAttachmentResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }
}
