import type { MicrosoftCalendar } from "../../../../client";
import type { ListMoreInput } from "../../../../interfaces";
import type {
  CalendarEventAttachmentCreateUploadSessionInput,
  CalendarEventAttachmentCreateUploadSessionResponse,
  CalendarEventAttachmentGetCountInput,
  CalendarEventAttachmentGetCountResponse,
  CalendarEventCreateAttachmentInput,
  CalendarEventCreateAttachmentResponse,
  CalendarEventDeleteAttachmentInput,
  CalendarEventGetAttachmentInput,
  CalendarEventGetAttachmentResponse,
  CalendarEventListAttachmentInput,
  CalendarEventListAttachmentResponse,
} from "./interfaces";

export class Attachments {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: CalendarEventListAttachmentInput,
  ): Promise<CalendarEventListAttachmentResponse> {
    return this.client.get<CalendarEventListAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments`,
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
  ): Promise<CalendarEventListAttachmentResponse> {
    return this.client.get<CalendarEventListAttachmentResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: CalendarEventCreateAttachmentInput,
  ): Promise<CalendarEventCreateAttachmentResponse> {
    return this.client.post<CalendarEventCreateAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments`,
      undefined,
      params.attachment,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarEventAttachmentGetCountInput,
  ): Promise<CalendarEventAttachmentGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async createUploadSession(
    params: CalendarEventAttachmentCreateUploadSessionInput,
  ): Promise<CalendarEventAttachmentCreateUploadSessionResponse> {
    return this.client.post<CalendarEventAttachmentCreateUploadSessionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments/microsoft.graph.createUploadSession`,
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

  async delete(params: CalendarEventDeleteAttachmentInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: CalendarEventGetAttachmentInput,
  ): Promise<CalendarEventGetAttachmentResponse> {
    return this.client.get<CalendarEventGetAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }
}
