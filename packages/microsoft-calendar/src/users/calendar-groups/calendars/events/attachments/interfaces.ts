import type {
  Attachment,
  AttachmentCollectionResponse,
  AttachmentItem,
  MicrosoftCalendarRequestOptions,
  UploadSession,
} from "../../../../../interfaces";

export interface CalendarGroupCalendarEventListAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
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

export type CalendarGroupCalendarEventListAttachmentResponse =
  AttachmentCollectionResponse;

export interface CalendarGroupCalendarEventCreateAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  attachment: Attachment;
}

export type CalendarGroupCalendarEventCreateAttachmentResponse = Attachment;

export interface CalendarGroupCalendarEventAttachmentGetCountInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  search?: string;
  filter?: string;
}

export type CalendarGroupCalendarEventAttachmentGetCountResponse = number;

export interface CalendarGroupCalendarEventAttachmentCreateUploadSessionInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  attachmentItem: AttachmentItem;
}

export type CalendarGroupCalendarEventAttachmentCreateUploadSessionResponse =
  UploadSession;

export interface CalendarGroupCalendarEventDeleteAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  attachmentId: string;
  ifMatch?: string;
}

export interface CalendarGroupCalendarEventGetAttachmentInput extends MicrosoftCalendarRequestOptions {
  userId: string;
  calendarGroupId: string;
  calendarId: string;
  eventId: string;
  attachmentId: string;
  select?: string[];
  expand?: string[];
}

export type CalendarGroupCalendarEventGetAttachmentResponse = Attachment;
