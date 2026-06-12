import type { MicrosoftCalendar } from "../../../../../client";
import type {
  CalendarGroupCalendarEventAttachmentCreateUploadSessionInput,
  CalendarGroupCalendarEventAttachmentCreateUploadSessionResponse,
  CalendarGroupCalendarEventAttachmentGetCountInput,
  CalendarGroupCalendarEventAttachmentGetCountResponse,
  CalendarGroupCalendarEventCreateAttachmentInput,
  CalendarGroupCalendarEventCreateAttachmentResponse,
  CalendarGroupCalendarEventDeleteAttachmentInput,
  CalendarGroupCalendarEventGetAttachmentInput,
  CalendarGroupCalendarEventGetAttachmentResponse,
  CalendarGroupCalendarEventListAttachmentInput,
  CalendarGroupCalendarEventListAttachmentResponse,
} from "./interfaces";

export class Attachments {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: CalendarGroupCalendarEventListAttachmentInput,
  ): Promise<CalendarGroupCalendarEventListAttachmentResponse> {
    return this.client.get<CalendarGroupCalendarEventListAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments`,
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
    params: CalendarGroupCalendarEventCreateAttachmentInput,
  ): Promise<CalendarGroupCalendarEventCreateAttachmentResponse> {
    return this.client.post<CalendarGroupCalendarEventCreateAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments`,
      undefined,
      params.attachment,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: CalendarGroupCalendarEventAttachmentGetCountInput,
  ): Promise<CalendarGroupCalendarEventAttachmentGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async createUploadSession(
    params: CalendarGroupCalendarEventAttachmentCreateUploadSessionInput,
  ): Promise<CalendarGroupCalendarEventAttachmentCreateUploadSessionResponse> {
    return this.client.post<CalendarGroupCalendarEventAttachmentCreateUploadSessionResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments/microsoft.graph.createUploadSession`,
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
    params: CalendarGroupCalendarEventDeleteAttachmentInput,
  ): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: CalendarGroupCalendarEventGetAttachmentInput,
  ): Promise<CalendarGroupCalendarEventGetAttachmentResponse> {
    return this.client.get<CalendarGroupCalendarEventGetAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/calendarGroups/${encodeURIComponent(params.calendarGroupId)}/calendars/${encodeURIComponent(params.calendarId)}/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }
}
