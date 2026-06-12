import type {
  Attachment,
  AttachmentCollectionResponse,
  AttachmentItem,
  MicrosoftCalendarRequestOptions,
  UploadSession,
} from "../../../../interfaces";

export interface DefaultCalendarEventListAttachmentInput extends MicrosoftCalendarRequestOptions {
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

export type DefaultCalendarEventListAttachmentResponse =
  AttachmentCollectionResponse;

export interface DefaultCalendarEventCreateAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  attachment: Attachment;
}

export type DefaultCalendarEventCreateAttachmentResponse = Attachment;

export interface DefaultCalendarEventAttachmentGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type DefaultCalendarEventAttachmentGetCountResponse = number;

export interface DefaultCalendarEventAttachmentCreateUploadSessionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  attachmentItem: AttachmentItem;
}

export type DefaultCalendarEventAttachmentCreateUploadSessionResponse =
  UploadSession;

export interface DefaultCalendarEventDeleteAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  attachmentId: string;
  ifMatch?: string;
}

export interface DefaultCalendarEventGetAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  eventId: string;
  attachmentId: string;
  select?: string[];
  expand?: string[];
}

export type DefaultCalendarEventGetAttachmentResponse = Attachment;
