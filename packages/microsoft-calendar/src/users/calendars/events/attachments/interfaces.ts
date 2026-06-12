import type {
  Attachment,
  AttachmentCollectionResponse,
  AttachmentItem,
  MicrosoftCalendarRequestOptions,
  UploadSession,
} from "../../../../interfaces";

export interface CalendarEventListAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
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

export type CalendarEventListAttachmentResponse = AttachmentCollectionResponse;

export interface CalendarEventCreateAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  attachment: Attachment;
}

export type CalendarEventCreateAttachmentResponse = Attachment;

export interface CalendarEventAttachmentGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type CalendarEventAttachmentGetCountResponse = number;

export interface CalendarEventAttachmentCreateUploadSessionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  attachmentItem: AttachmentItem;
}

export type CalendarEventAttachmentCreateUploadSessionResponse = UploadSession;

export interface CalendarEventDeleteAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  attachmentId: string;
  ifMatch?: string;
}

export interface CalendarEventGetAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarId: string;
  eventId: string;
  attachmentId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarEventGetAttachmentResponse = Attachment;
