import type {
  Channel,
  ChannelInput,
  GoogleCalendarRequestOptions,
} from "../interfaces";

export interface Acl {
  etag?: string;
  items?: AclRule[];
  kind?: string;
  nextPageToken?: string;
  nextSyncToken?: string;
}

export interface AclRule {
  etag?: string;
  id?: string;
  kind?: string;
  role?: AclRole;
  scope?: {
    type?: "default" | "domain" | "group" | "user";
    value?: string;
  };
}

export type AclRole =
  | "freeBusyReader"
  | "none"
  | "owner"
  | "reader"
  | "writer"
  | "writerWithoutPrivateAccess";

export type AclScopeInput =
  | { type: "default"; value?: never }
  | { type: "domain" | "group" | "user"; value: string };

export interface AclRuleInput {
  role?: AclRole;
  scope?: AclScopeInput;
}

interface AclListOptions {
  calendarId: string;
  maxResults?: number;
  pageToken?: string;
}

type AclSyncOptions =
  | { showDeleted?: boolean; syncToken?: never }
  | { showDeleted?: true; syncToken: string };

export type ListAclInput = GoogleCalendarRequestOptions &
  AclListOptions &
  AclSyncOptions;

export type ListAclResponse = Acl;

export interface InsertAclInput
  extends GoogleCalendarRequestOptions, AclRuleInput {
  calendarId: string;
  role: AclRole;
  scope: AclScopeInput;
  sendNotifications?: boolean;
}

export type InsertAclResponse = AclRule;

export type WatchAclInput = GoogleCalendarRequestOptions &
  ChannelInput &
  AclListOptions &
  AclSyncOptions;

export type WatchAclResponse = Channel;

export interface DeleteAclInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  ruleId: string;
}

export interface GetAclInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  ruleId: string;
}

export type GetAclResponse = AclRule;

export interface PatchAclInput
  extends GoogleCalendarRequestOptions, AclRuleInput {
  calendarId: string;
  ruleId: string;
  sendNotifications?: boolean;
}

export type PatchAclResponse = AclRule;

export interface UpdateAclInput
  extends GoogleCalendarRequestOptions, AclRuleInput {
  calendarId: string;
  ruleId: string;
  scope: AclScopeInput;
  sendNotifications?: boolean;
}

export type UpdateAclResponse = AclRule;
