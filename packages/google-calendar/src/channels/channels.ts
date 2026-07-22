import type { GoogleCalendar } from "../client";
import type { StopChannelsInput } from "./interfaces";

export class Channels {
  constructor(private readonly client: GoogleCalendar) {}

  async stop(params: StopChannelsInput): Promise<void> {
    return this.client.post(
      `/channels/stop`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
      },
      {
        id: params.id,
        resourceId: params.resourceId,
        token: params.token,
      },
      params.signal,
      params.headers,
      true,
    );
  }
}
