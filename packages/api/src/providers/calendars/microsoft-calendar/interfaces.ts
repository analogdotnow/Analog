import type { Event } from "@microsoft/microsoft-graph-types";

export interface MicrosoftEvent extends Event {
  "@removed": {
    reason?: string | undefined;
  };
  "@odata.nextLink"?: string | undefined;
  "@odata.deltaLink"?: string | undefined;
}
