import { Acl } from "./acl";
import { CalendarList } from "./calendar-list";
import { Calendars } from "./calendars";
import { Channels } from "./channels";
import { Colors } from "./colors";
import { APIError, ConnectionError, TimeoutError } from "./error";
import { Events } from "./events";
import { Freebusy } from "./freebusy";
import type { QueryParams, RequestHeaders } from "./interfaces";
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

  constructor(private readonly accessToken?: string) {
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

  private buildHeaders(headers?: RequestHeaders, body?: unknown) {
    const requestHeaders = new Headers(headers);

    if (this.accessToken) {
      requestHeaders.set("Authorization", `Bearer ${this.accessToken}`);
    }

    if (body) {
      requestHeaders.set("Content-Type", "application/json");
    }

    return requestHeaders;
  }

  private async fetch(url: URL, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (error) {
      GoogleCalendar.throwTransportError(error, init.signal);
    }
  }

  private static throwTransportError(
    error: unknown,
    signal?: AbortSignal | null,
  ): never {
    // Aborted fetches reject with signal.reason verbatim, which need not be
    // an Error. AbortSignal.timeout() rejections are also identity-equal to
    // signal.reason, so timeouts classify by name before the identity checks
    // propagate caller-initiated aborts as-is.
    if (!(error instanceof Error)) {
      if (signal?.aborted && error === signal.reason) {
        throw error;
      }

      throw new ConnectionError(undefined, error);
    }

    if (error.name === "AbortError") {
      throw error;
    }

    if (error.name === "TimeoutError") {
      throw new TimeoutError(error.message);
    }

    if (signal?.aborted && error === signal.reason) {
      throw error;
    }

    throw new ConnectionError(error.message, error);
  }

  async get<T>(
    path: string,
    params?: QueryParams,
    signal?: AbortSignal,
    headers?: RequestHeaders,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "GET",
      headers: this.buildHeaders(headers),
      signal,
    });

    return this.parseResponse(response, undefined, signal);
  }

  async post<T>(
    path: string,
    params?: QueryParams,
    body?: unknown,
    signal?: AbortSignal,
    headers?: RequestHeaders,
    allowEmpty?: boolean,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "POST",
      headers: this.buildHeaders(headers, body),
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response, allowEmpty, signal);
  }

  async put<T>(
    path: string,
    params?: QueryParams,
    body?: unknown,
    signal?: AbortSignal,
    headers?: RequestHeaders,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "PUT",
      headers: this.buildHeaders(headers, body),
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response, undefined, signal);
  }

  async patch<T>(
    path: string,
    params?: QueryParams,
    body?: unknown,
    signal?: AbortSignal,
    headers?: RequestHeaders,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "PATCH",
      headers: this.buildHeaders(headers, body),
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response, undefined, signal);
  }

  async delete<T>(
    path: string,
    params?: QueryParams,
    signal?: AbortSignal,
    headers?: RequestHeaders,
    allowEmpty?: boolean,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "DELETE",
      headers: this.buildHeaders(headers),
      signal,
    });

    return this.parseResponse(response, allowEmpty, signal);
  }

  private async parseResponse(
    response: Response,
    allowEmpty?: boolean,
    signal?: AbortSignal,
  ) {
    const text = await this.readResponse(response, signal);

    if (!response.ok) {
      throw APIError.fromResponse(response, text);
    }

    if (!text) {
      // Deletes, calendar clears, ownership transfers, and channel stops can have no body; an empty
      // body on any other success status would otherwise surface as an opaque
      // TypeError once the caller dereferences the missing JSON.
      if (allowEmpty) {
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

  private async readResponse(response: Response, signal?: AbortSignal) {
    try {
      return await response.text();
    } catch (error) {
      GoogleCalendar.throwTransportError(error, signal);
    }
  }
}
