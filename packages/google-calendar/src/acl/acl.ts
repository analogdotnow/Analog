import type { GoogleCalendar } from "../client";
import type {
  DeleteAclInput,
  GetAclInput,
  GetAclResponse,
  InsertAclInput,
  InsertAclResponse,
  ListAclInput,
  ListAclResponse,
  PatchAclInput,
  PatchAclResponse,
  UpdateAclInput,
  UpdateAclResponse,
  WatchAclInput,
  WatchAclResponse,
} from "./interfaces";

export class Acl {
  constructor(private readonly client: GoogleCalendar) {}

  async list(params: ListAclInput): Promise<ListAclResponse> {
    return this.client.get<ListAclResponse>(
      `/calendars/${encodeURIComponent(params.calendarId)}/acl`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        showDeleted: params.showDeleted,
        syncToken: params.syncToken,
      },
      params.signal,
      params.headers,
    );
  }

  async insert(params: InsertAclInput): Promise<InsertAclResponse> {
    return this.client.post<InsertAclResponse>(
      `/calendars/${encodeURIComponent(params.calendarId)}/acl`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        sendNotifications: params.sendNotifications,
      },
      {
        role: params.role,
        scope: params.scope,
      },
      params.signal,
      params.headers,
    );
  }

  async watch(params: WatchAclInput): Promise<WatchAclResponse> {
    return this.client.post<WatchAclResponse>(
      `/calendars/${encodeURIComponent(params.calendarId)}/acl/watch`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
        showDeleted: params.showDeleted,
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

  async delete(params: DeleteAclInput): Promise<void> {
    return this.client.delete(
      `/calendars/${encodeURIComponent(params.calendarId)}/acl/${encodeURIComponent(params.ruleId)}`,
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
      true,
    );
  }

  async get(params: GetAclInput): Promise<GetAclResponse> {
    return this.client.get<GetAclResponse>(
      `/calendars/${encodeURIComponent(params.calendarId)}/acl/${encodeURIComponent(params.ruleId)}`,
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

  async patch(params: PatchAclInput): Promise<PatchAclResponse> {
    return this.client.patch<PatchAclResponse>(
      `/calendars/${encodeURIComponent(params.calendarId)}/acl/${encodeURIComponent(params.ruleId)}`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        sendNotifications: params.sendNotifications,
      },
      {
        role: params.role,
        scope: params.scope,
      },
      params.signal,
      params.headers,
    );
  }

  async update(params: UpdateAclInput): Promise<UpdateAclResponse> {
    return this.client.put<UpdateAclResponse>(
      `/calendars/${encodeURIComponent(params.calendarId)}/acl/${encodeURIComponent(params.ruleId)}`,
      {
        alt: params.alt,
        fields: params.fields,
        key: params.key,
        prettyPrint: params.prettyPrint,
        quotaUser: params.quotaUser,
        userIp: params.userIp,
        sendNotifications: params.sendNotifications,
      },
      {
        role: params.role,
        scope: params.scope,
      },
      params.signal,
      params.headers,
    );
  }
}
