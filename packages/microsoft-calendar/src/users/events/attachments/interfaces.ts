import type {
  Attachment,
  AttachmentCollectionResponse,
  AttachmentItem,
  MicrosoftCalendarRequestOptions,
  UploadSession,
} from "../../../interfaces";

export interface ListAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
  count?: boolean;
  orderby?: string[];
  select?: string[];
  expand?: string[];
}

export type ListAttachmentResponse = AttachmentCollectionResponse;

export interface CreateAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  attachment: Attachment;
}

export type CreateAttachmentResponse = Attachment;

export interface AttachmentGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type AttachmentGetCountResponse = number;

export interface AttachmentCreateUploadSessionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  attachmentItem: AttachmentItem;
}

export type AttachmentCreateUploadSessionResponse = UploadSession;

export interface DeleteAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  attachmentId: string;
  ifMatch?: string;
}

export interface GetAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  attachmentId: string;
  select?: string[];
  expand?: string[];
}

export type GetAttachmentResponse = Attachment;
