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
  role?: string;
  scope?: { type?: string; value?: string };
}

export type AclRuleInput = Omit<AclRule, "etag" | "id" | "kind">;

export interface ListAclInput extends GoogleCalendarRequestOptions {
  calendarId: string;
  maxResults?: number;
  pageToken?: string;
  showDeleted?: boolean;
  syncToken?: string;
}

export type ListAclResponse = Acl;

export interface InsertAclInput
  extends GoogleCalendarRequestOptions, AclRuleInput {
  calendarId: string;
  sendNotifications?: boolean;
}

export type InsertAclResponse = AclRule;

export interface WatchAclInput
  extends GoogleCalendarRequestOptions, ChannelInput {
  calendarId: string;
  maxResults?: number;
  pageToken?: string;
  showDeleted?: boolean;
  syncToken?: string;
}

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
  sendNotifications?: boolean;
}

export type UpdateAclResponse = AclRule;
