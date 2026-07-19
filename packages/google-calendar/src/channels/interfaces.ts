import type { GoogleCalendarRequestOptions } from "../interfaces";

export interface StopChannelsInput extends GoogleCalendarRequestOptions {
  id: string;
  resourceId: string;
  token?: string;
}
