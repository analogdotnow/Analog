import type { GoogleCalendar } from "../client";
import type {
  GetSettingsInput,
  GetSettingsResponse,
  ListSettingsInput,
  ListSettingsResponse,
  WatchSettingsInput,
  WatchSettingsResponse,
} from "./interfaces";

export class Settings {
  constructor(private readonly client: GoogleCalendar) {}

  async list(params: ListSettingsInput): Promise<ListSettingsResponse> {
    return this.client.get<ListSettingsResponse>(
      `/users/me/settings`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        syncToken: params.syncToken,
      },
      params.signal,
      params.headers,
    );
  }

  async watch(params: WatchSettingsInput): Promise<WatchSettingsResponse> {
    return this.client.post<WatchSettingsResponse>(
      `/users/me/settings/watch`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        syncToken: params.syncToken,
      },
      {
        address: params.address,
        expiration: params.expiration,
        id: params.id,
        params: params.params,
        payload: params.payload,
        token: params.token,
        type: params.type,
      },
      params.signal,
      params.headers,
    );
  }

  async get(params: GetSettingsInput): Promise<GetSettingsResponse> {
    return this.client.get<GetSettingsResponse>(
      `/users/me/settings/${encodeURIComponent(params.setting)}`,
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
