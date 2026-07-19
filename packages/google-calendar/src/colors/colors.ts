import type { GoogleCalendar } from "../client";
import type { GetColorsInput, GetColorsResponse } from "./interfaces";

export class Colors {
  constructor(private readonly client: GoogleCalendar) {}

  async get(params: GetColorsInput): Promise<GetColorsResponse> {
    return this.client.get<GetColorsResponse>(
      `/colors`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
      },
      params.signal,
      params.headers,
    );
  }
}
