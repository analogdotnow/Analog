import type { GoogleCalendar } from "../client";
import type {
  ClearCalendarsInput,
  DeleteCalendarsInput,
  GetCalendarsInput,
  GetCalendarsResponse,
  InsertCalendarsInput,
  InsertCalendarsResponse,
  PatchCalendarsInput,
  PatchCalendarsResponse,
  UpdateCalendarsInput,
  UpdateCalendarsResponse,
} from "./interfaces";

export class Calendars {
  constructor(private readonly client: GoogleCalendar) {}

  async insert(params: InsertCalendarsInput): Promise<InsertCalendarsResponse> {
    return this.client.post<InsertCalendarsResponse>(
      `/calendars`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
      },
      {
        conferenceProperties: params.conferenceProperties,
        description: params.description,
        location: params.location,
        summary: params.summary,
        timeZone: params.timeZone,
      },
      params.signal,
    );
  }

  async delete(params: DeleteCalendarsInput): Promise<void> {
    return this.client.delete(
      `/calendars/${encodeURIComponent(params.calendarId)}`,
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

  async get(params: GetCalendarsInput): Promise<GetCalendarsResponse> {
    return this.client.get<GetCalendarsResponse>(
      `/calendars/${encodeURIComponent(params.calendarId)}`,
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

  async patch(params: PatchCalendarsInput): Promise<PatchCalendarsResponse> {
    return this.client.patch<PatchCalendarsResponse>(
      `/calendars/${encodeURIComponent(params.calendarId)}`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
      },
      {
        conferenceProperties: params.conferenceProperties,
        description: params.description,
        location: params.location,
        summary: params.summary,
        timeZone: params.timeZone,
      },
      params.signal,
    );
  }

  async update(params: UpdateCalendarsInput): Promise<UpdateCalendarsResponse> {
    return this.client.put<UpdateCalendarsResponse>(
      `/calendars/${encodeURIComponent(params.calendarId)}`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
      },
      {
        conferenceProperties: params.conferenceProperties,
        description: params.description,
        location: params.location,
        summary: params.summary,
        timeZone: params.timeZone,
      },
      params.signal,
    );
  }

  async clear(params: ClearCalendarsInput): Promise<void> {
    return this.client.post(
      `/calendars/${encodeURIComponent(params.calendarId)}/clear`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
      },
      undefined,
      params.signal,
    );
  }
}
