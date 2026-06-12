import type { MicrosoftCalendar } from "../../../client";
import type {
  AttachmentCreateUploadSessionInput,
  AttachmentCreateUploadSessionResponse,
  AttachmentGetCountInput,
  AttachmentGetCountResponse,
  CreateAttachmentInput,
  CreateAttachmentResponse,
  DeleteAttachmentInput,
  GetAttachmentInput,
  GetAttachmentResponse,
  ListAttachmentInput,
  ListAttachmentResponse,
} from "./interfaces";

export class Attachments {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(params: ListAttachmentInput): Promise<ListAttachmentResponse> {
    return this.client.get<ListAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/attachments`,
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
    params: CreateAttachmentInput,
  ): Promise<CreateAttachmentResponse> {
    return this.client.post<CreateAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/attachments`,
      undefined,
      params.attachment,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: AttachmentGetCountInput,
  ): Promise<AttachmentGetCountResponse> {
    return this.client.number(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/attachments/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async createUploadSession(
    params: AttachmentCreateUploadSessionInput,
  ): Promise<AttachmentCreateUploadSessionResponse> {
    return this.client.post<AttachmentCreateUploadSessionResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/attachments/microsoft.graph.createUploadSession`,
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

  async delete(params: DeleteAttachmentInput): Promise<void> {
    return this.client.delete(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(params: GetAttachmentInput): Promise<GetAttachmentResponse> {
    return this.client.get<GetAttachmentResponse>(
      `/users/${encodeURIComponent(params.userId)}/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }
}
