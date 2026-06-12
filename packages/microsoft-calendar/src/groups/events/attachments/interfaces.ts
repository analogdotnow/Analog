import type {
  Attachment,
  AttachmentCollectionResponse,
  AttachmentItem,
  MicrosoftCalendarRequestOptions,
  UploadSession,
} from "../../../interfaces";

export interface GroupEventListAttachmentInput extends MicrosoftCalendarRequestOptions {
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

export type GroupEventListAttachmentResponse = AttachmentCollectionResponse;

export interface GroupEventCreateAttachmentInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  attachment: Attachment;
}

export type GroupEventCreateAttachmentResponse = Attachment;

export interface GroupEventAttachmentGetCountInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type GroupEventAttachmentGetCountResponse = number;

export interface GroupEventAttachmentCreateUploadSessionInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  attachmentItem: AttachmentItem;
}

export type GroupEventAttachmentCreateUploadSessionResponse = UploadSession;

export interface GroupEventDeleteAttachmentInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  attachmentId: string;
  ifMatch?: string;
}

export interface GroupEventGetAttachmentInput extends MicrosoftCalendarRequestOptions {
  groupId: string;
  eventId: string;
  attachmentId: string;
  select?: string[];
  expand?: string[];
}

export type GroupEventGetAttachmentResponse = Attachment;
