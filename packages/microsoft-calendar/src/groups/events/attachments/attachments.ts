import type { MicrosoftCalendar } from "../../../client";
import type { ListMoreInput } from "../../../interfaces";
import type {
  GroupEventAttachmentCreateUploadSessionInput,
  GroupEventAttachmentCreateUploadSessionResponse,
  GroupEventAttachmentGetCountInput,
  GroupEventAttachmentGetCountResponse,
  GroupEventCreateAttachmentInput,
  GroupEventCreateAttachmentResponse,
  GroupEventDeleteAttachmentInput,
  GroupEventGetAttachmentInput,
  GroupEventGetAttachmentResponse,
  GroupEventListAttachmentInput,
  GroupEventListAttachmentResponse,
} from "./interfaces";

export class Attachments {
  constructor(private readonly client: MicrosoftCalendar) {}

  async list(
    params: GroupEventListAttachmentInput,
  ): Promise<GroupEventListAttachmentResponse> {
    return this.client.get<GroupEventListAttachmentResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/attachments`,
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
  ): Promise<GroupEventListAttachmentResponse> {
    return this.client.get<GroupEventListAttachmentResponse>(
      params.nextLink,
      undefined,
      params.signal,
      params.headers,
    );
  }

  async create(
    params: GroupEventCreateAttachmentInput,
  ): Promise<GroupEventCreateAttachmentResponse> {
    return this.client.post<GroupEventCreateAttachmentResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/attachments`,
      undefined,
      params.attachment,
      params.signal,
      params.headers,
    );
  }

  async $count(
    params: GroupEventAttachmentGetCountInput,
  ): Promise<GroupEventAttachmentGetCountResponse> {
    return this.client.number(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/attachments/$count`,
      {
        $search: params.search,
        $filter: params.filter,
      },
      params.signal,
      params.headers,
    );
  }

  async createUploadSession(
    params: GroupEventAttachmentCreateUploadSessionInput,
  ): Promise<GroupEventAttachmentCreateUploadSessionResponse> {
    return this.client.post<GroupEventAttachmentCreateUploadSessionResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/attachments/microsoft.graph.createUploadSession`,
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

  async delete(params: GroupEventDeleteAttachmentInput): Promise<void> {
    return this.client.delete(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      undefined,
      params.signal,
      {
        ...(params.ifMatch ? { "If-Match": params.ifMatch } : {}),
        ...params.headers,
      },
    );
  }

  async get(
    params: GroupEventGetAttachmentInput,
  ): Promise<GroupEventGetAttachmentResponse> {
    return this.client.get<GroupEventGetAttachmentResponse>(
      `/groups/${encodeURIComponent(params.groupId)}/events/${encodeURIComponent(params.eventId)}/attachments/${encodeURIComponent(params.attachmentId)}`,
      {
        $select: params.select,
        $expand: params.expand,
      },
      params.signal,
      params.headers,
    );
  }
}
