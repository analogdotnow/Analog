import type {
  Attachment,
  AttachmentCollectionResponse,
  AttachmentItem,
  MicrosoftCalendarRequestOptions,
  UploadSession,
} from "../../../../interfaces";

export interface GroupCalendarEventListAttachmentInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
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

export type GroupCalendarEventListAttachmentResponse =
  AttachmentCollectionResponse;

export interface GroupCalendarEventCreateAttachmentInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  attachment: Attachment;
}

export type GroupCalendarEventCreateAttachmentResponse = Attachment;

export interface GroupCalendarEventAttachmentGetCountInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type GroupCalendarEventAttachmentGetCountResponse = number;

export interface GroupCalendarEventAttachmentCreateUploadSessionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  attachmentItem: AttachmentItem;
}

export type GroupCalendarEventAttachmentCreateUploadSessionResponse =
  UploadSession;

export interface GroupCalendarEventDeleteAttachmentInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  attachmentId: string;
  ifMatch?: string;
}

export interface GroupCalendarEventGetAttachmentInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  attachmentId: string;
  select?: string[];
  expand?: string[];
}

export type GroupCalendarEventGetAttachmentResponse = Attachment;
