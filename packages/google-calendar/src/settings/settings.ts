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
    );
  }
}
