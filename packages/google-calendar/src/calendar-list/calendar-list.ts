import type { GoogleCalendar } from "../client";
import type {
  DeleteCalendarListInput,
  GetCalendarListInput,
  GetCalendarListResponse,
  InsertCalendarListInput,
  InsertCalendarListResponse,
  ListCalendarListInput,
  ListCalendarListResponse,
  PatchCalendarListInput,
  PatchCalendarListResponse,
  UpdateCalendarListInput,
  UpdateCalendarListResponse,
  WatchCalendarListInput,
  WatchCalendarListResponse,
} from "./interfaces";

export class CalendarList {
  constructor(private readonly client: GoogleCalendar) {}

  async list(params: ListCalendarListInput): Promise<ListCalendarListResponse> {
    return this.client.get<ListCalendarListResponse>(
      `/users/me/calendarList`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        maxResults: params.maxResults,
        minAccessRole: params.minAccessRole,
        pageToken: params.pageToken,
        showDeleted: params.showDeleted,
        showHidden: params.showHidden,
        syncToken: params.syncToken,
      },
      params.signal,
    );
  }

  async insert(
    params: InsertCalendarListInput,
  ): Promise<InsertCalendarListResponse> {
    return this.client.post<InsertCalendarListResponse>(
      `/users/me/calendarList`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        colorRgbFormat: params.colorRgbFormat,
      },
      {
        backgroundColor: params.backgroundColor,
        colorId: params.colorId,
        conferenceProperties: params.conferenceProperties,
        defaultReminders: params.defaultReminders,
        foregroundColor: params.foregroundColor,
        hidden: params.hidden,
        id: params.id,
        notificationSettings: params.notificationSettings,
        selected: params.selected,
        summaryOverride: params.summaryOverride,
      },
      params.signal,
    );
  }

  async watch(
    params: WatchCalendarListInput,
  ): Promise<WatchCalendarListResponse> {
    return this.client.post<WatchCalendarListResponse>(
      `/users/me/calendarList/watch`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        maxResults: params.maxResults,
        minAccessRole: params.minAccessRole,
        pageToken: params.pageToken,
        showDeleted: params.showDeleted,
        showHidden: params.showHidden,
        syncToken: params.syncToken,
      },
      {
        address: params.address,
        expiration: params.expiration,
        id: params.id,
        kind: params.kind,
        params: params.params,
        payload: params.payload,
        resourceId: params.resourceId,
        token: params.token,
        type: params.type,
      },
      params.signal,
    );
  }

  async delete(params: DeleteCalendarListInput): Promise<void> {
    return this.client.delete(
      `/users/me/calendarList/${encodeURIComponent(params.calendarId)}`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
      },
      params.signal,
    );
  }

  async get(params: GetCalendarListInput): Promise<GetCalendarListResponse> {
    return this.client.get<GetCalendarListResponse>(
      `/users/me/calendarList/${encodeURIComponent(params.calendarId)}`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
      },
      params.signal,
    );
  }

  async patch(
    params: PatchCalendarListInput,
  ): Promise<PatchCalendarListResponse> {
    return this.client.patch<PatchCalendarListResponse>(
      `/users/me/calendarList/${encodeURIComponent(params.calendarId)}`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        colorRgbFormat: params.colorRgbFormat,
      },
      {
        backgroundColor: params.backgroundColor,
        colorId: params.colorId,
        conferenceProperties: params.conferenceProperties,
        defaultReminders: params.defaultReminders,
        foregroundColor: params.foregroundColor,
        hidden: params.hidden,
        notificationSettings: params.notificationSettings,
        selected: params.selected,
        summaryOverride: params.summaryOverride,
      },
      params.signal,
    );
  }

  async update(
    params: UpdateCalendarListInput,
  ): Promise<UpdateCalendarListResponse> {
    return this.client.put<UpdateCalendarListResponse>(
      `/users/me/calendarList/${encodeURIComponent(params.calendarId)}`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        colorRgbFormat: params.colorRgbFormat,
      },
      {
        backgroundColor: params.backgroundColor,
        colorId: params.colorId,
        conferenceProperties: params.conferenceProperties,
        defaultReminders: params.defaultReminders,
        foregroundColor: params.foregroundColor,
        hidden: params.hidden,
        notificationSettings: params.notificationSettings,
        selected: params.selected,
        summaryOverride: params.summaryOverride,
      },
      params.signal,
    );
  }
}
