import { Acl } from "./acl";
import { CalendarList } from "./calendar-list";
import { Calendars } from "./calendars";
import { Channels } from "./channels";
import { Colors } from "./colors";
import { APIError, ConnectionError, TimeoutError } from "./error";
import { Events } from "./events";
import { Freebusy } from "./freebusy";
import type { QueryParams } from "./interfaces";
import { Settings } from "./settings";

export class GoogleCalendar {
  private static readonly BASE_URL = "https://www.googleapis.com/calendar/v3/";

  public readonly acl: Acl;
  public readonly calendarList: CalendarList;
  public readonly calendars: Calendars;
  public readonly channels: Channels;
  public readonly colors: Colors;
  public readonly events: Events;
  public readonly freebusy: Freebusy;
  public readonly settings: Settings;

  constructor(private readonly accessToken: string) {
    this.acl = new Acl(this);
    this.calendarList = new CalendarList(this);
    this.calendars = new Calendars(this);
    this.channels = new Channels(this);
    this.colors = new Colors(this);
    this.events = new Events(this);
    this.freebusy = new Freebusy(this);
    this.settings = new Settings(this);
  }

  private buildUrl(path: string, params?: QueryParams) {
    const url = new URL(`.${path}`, GoogleCalendar.BASE_URL);

    if (!params) {
      return url;
    }

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
        continue;
      }

      url.searchParams.set(key, String(value));
    }

    return url;
  }

  private buildHeaders(body?: unknown) {
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${this.accessToken}`);

    if (body) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  }

  private async fetch(url: URL, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (error) {
      const cause = error as { name?: string; message?: string } | undefined;

      // Caller-initiated aborts propagate as-is; AbortSignal.timeout() aborts
      // map to TimeoutError, transport failures (DNS, reset) to ConnectionError.
      if (cause?.name === "AbortError") {
        throw error;
      }

      if (cause?.name === "TimeoutError") {
        throw new TimeoutError(cause.message);
      }

      throw new ConnectionError(cause?.message, error);
    }
  }

  async get<T>(
    path: string,
    params?: QueryParams,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "GET",
      headers: this.buildHeaders(),
      signal,
    });

    return this.parseResponse(response);
  }

  async post<T>(
    path: string,
    params?: QueryParams,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "POST",
      headers: this.buildHeaders(body),
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response);
  }

  async put<T>(
    path: string,
    params?: QueryParams,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "PUT",
      headers: this.buildHeaders(body),
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response);
  }

  async patch<T>(
    path: string,
    params?: QueryParams,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "PATCH",
      headers: this.buildHeaders(body),
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response);
  }

  async delete<T>(
    path: string,
    params?: QueryParams,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "DELETE",
      headers: this.buildHeaders(),
      signal,
    });

    return this.parseResponse(response);
  }

  private async parseResponse(response: Response) {
    const text = await response.text();

    if (!response.ok) {
      throw APIError.fromResponse(response, text);
    }

    if (!text) {
      // Deletes and channel stops respond 202/204 with no body; an empty body
      // on any other success status would otherwise surface as an opaque
      // TypeError once the caller dereferences the missing JSON.
      if (response.status === 202 || response.status === 204) {
        return;
      }

      throw new APIError(
        response.status,
        undefined,
        "Empty response body",
        response.headers,
      );
    }

    return JSON.parse(text);
  }
}
