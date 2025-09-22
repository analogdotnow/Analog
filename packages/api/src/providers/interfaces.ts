export interface ProviderConfig {
  accessToken: string;
  refreshToken: string;
  accountId: string;
}

export type {
  CalendarProvider,
  ResponseToEventInput,
} from "./calendars/interfaces";

export type { ConferencingProvider } from "./conferencing/interfaces";

export type { TaskProvider } from "./tasks/interfaces";
