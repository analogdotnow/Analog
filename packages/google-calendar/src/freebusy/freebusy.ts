import type { GoogleCalendar } from "../client";
import type { QueryFreebusyInput, QueryFreebusyResponse } from "./interfaces";

export class Freebusy {
  constructor(private readonly client: GoogleCalendar) {}

  async query(params: QueryFreebusyInput): Promise<QueryFreebusyResponse> {
    return this.client.post<QueryFreebusyResponse>(
      `/freeBusy`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
      },
      {
        calendarExpansionMax: params.calendarExpansionMax,
        groupExpansionMax: params.groupExpansionMax,
        items: params.items,
        timeMax: params.timeMax,
        timeMin: params.timeMin,
        timeZone: params.timeZone,
      },
      params.signal,
    );
  }
}
