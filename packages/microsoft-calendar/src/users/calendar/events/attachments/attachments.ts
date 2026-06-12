import type { MicrosoftCalendar } from "../../../../client";
import type {
  DefaultCalendarEventAttachmentCreateUploadSessionInput,
  DefaultCalendarEventAttachmentCreateUploadSessionResponse,
  DefaultCalendarEventAttachmentGetCountInput,
  DefaultCalendarEventAttachmentGetCountResponse,
  DefaultCalendarEventCreateAttachmentInput,
  DefaultCalendarEventCreateAttachmentResponse,
  DefaultCalendarEventDeleteAttachmentInput,
  DefaultCalendarEventGetAttachmentInput,
  DefaultCalendarEventGetAttachmentResponse,
  DefaultCalendarEventListAttachmentInput,
  DefaultCalendarEventListAttachmentResponse,
} from "./interfaces";

export class Attachments {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: DefaultCalendarEventListAttachmentInput,
  ): Promise<DefaultCalendarEventListAttachmentResponse> {
    return this.client.get<DefaultCalendarEventListAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments`,
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
    params: DefaultCalendarEventCreateAttachmentInput,
  ): Promise<DefaultCalendarEventCreateAttachmentResponse> {
    return this.client.post<DefaultCalendarEventCreateAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments`,
      undefined,
      params.attachment,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: DefaultCalendarEventAttachmentGetCountInput,
  ): Promise<DefaultCalendarEventAttachmentGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async createUploadSession(
    params: DefaultCalendarEventAttachmentCreateUploadSessionInput,
  ): Promise<DefaultCalendarEventAttachmentCreateUploadSessionResponse> {
    return this.client.post<DefaultCalendarEventAttachmentCreateUploadSessionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments/microsoft.graph.createUploadSession`,
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

  async delete(
    params: DefaultCalendarEventDeleteAttachmentInput,
  ): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: DefaultCalendarEventGetAttachmentInput,
  ): Promise<DefaultCalendarEventGetAttachmentResponse> {
    return this.client.get<DefaultCalendarEventGetAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendar/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }
}
