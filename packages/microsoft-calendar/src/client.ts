import { APIError, ConnectionError, TimeoutError } from "./error";
import { Groups } from "./groups";
import type { QueryParams, RequestHeaders } from "./interfaces";
import { Users } from "./users";

export class MicrosoftCalendar {
  private static readonly BASE_URL = "https://graph.microsoft.com/v1.0";
  private static readonly ORIGIN_URL = "https://graph.microsoft.com";

  public readonly groups: Groups;
  public readonly users: Users;

  constructor(private readonly accessToken: string) {
    this.groups = new Groups(this);
    this.users = new Users(this);
  }

  private buildUrl(path: string, params?: QueryParams) {
    // Microsoft Graph absolute URLs (@odata.nextLink / @odata.deltaLink) are used as-is.
    // A userId of "me" maps to the /me alias; "me" is never a valid user id
    // or userPrincipalName, so the rewrite cannot collide with a real user.
    const url = new URL(
      path.startsWith("https://")
        ? path
        : `${MicrosoftCalendar.BASE_URL}${path.startsWith("/users/me/") ? path.slice("/users".length) : path}`,
    );

    if (url.origin !== MicrosoftCalendar.ORIGIN_URL) {
      throw new Error("Absolute URLs must use the Microsoft Graph origin");
    }

    if (!params) {
      return url;
    }

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        url.searchParams.set(key, value.map((item) => String(item)).join(","));
        continue;
      }

      url.searchParams.set(key, String(value));
    }

    return url;
  }

  private buildHeaders(headers?: RequestHeaders, contentType?: string) {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      ...(contentType ? { "Content-Type": contentType } : {}),
      ...headers,
    };
  }

  private async fetch(url: URL, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (error) {
      MicrosoftCalendar.throwTransportError(error, init.signal);
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

  private async parseResponse(response: Response) {
    const text = await response.text();

    if (!response.ok) {
      throw APIError.fromResponse(response, text);
    }

    if (!text) {
      // Deletes and event actions respond 202/204 with no body; an empty body
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

  private async parseText(response: Response): Promise<string> {
    const text = await response.text();

    if (!response.ok) {
      throw APIError.fromResponse(response, text);
    }

    return text;
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

    return this.parseResponse(response);
  }

  async post<T>(
    path: string,
    params?: QueryParams,
    body?: unknown,
    signal?: AbortSignal,
    headers?: RequestHeaders,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "POST",
      headers: this.buildHeaders(
        headers,
        body ? "application/json" : undefined,
      ),
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
    headers?: RequestHeaders,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "PATCH",
      headers: this.buildHeaders(
        headers,
        body ? "application/json" : undefined,
      ),
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response);
  }

  async delete<T>(
    path: string,
    params?: QueryParams,
    signal?: AbortSignal,
    headers?: RequestHeaders,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "DELETE",
      headers: this.buildHeaders(headers),
      signal,
    });

    return this.parseResponse(response);
  }

  async number(
    path: string,
    params?: QueryParams,
    signal?: AbortSignal,
    headers?: RequestHeaders,
  ): Promise<number> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "GET",
      headers: this.buildHeaders(headers),
      signal,
    });

    const text = await this.parseText(response);
    const value = Number(text);

    if (!text || !Number.isFinite(value)) {
      throw new APIError(
        response.status,
        undefined,
        "Expected a numeric response body",
        response.headers,
      );
    }

    return value;
  }
}
