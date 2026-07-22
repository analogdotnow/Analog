import { ContactGroups } from "./contact-groups";
import {
  APIError,
  ConnectionError,
  RawResponseError,
  TimeoutError,
} from "./error";
import type {
  GooglePeopleRawQueryParams,
  GooglePeopleRawRequestOptions,
  QueryParams,
} from "./interfaces";
import { OtherContacts } from "./other-contacts";
import { People } from "./people";

type JsonQueryParams = GooglePeopleRawQueryParams;

export class GooglePeople {
  private static readonly BASE_URL = "https://people.googleapis.com/";

  public readonly contactGroups: ContactGroups;
  public readonly otherContacts: OtherContacts;
  public readonly people: People;

  constructor(private readonly accessToken?: string) {
    this.contactGroups = new ContactGroups(this);
    this.otherContacts = new OtherContacts(this);
    this.people = new People(this);
  }

  private buildUrl(path: string, params?: QueryParams) {
    const url = new URL(`.${path}`, GooglePeople.BASE_URL);

    url.searchParams.set("$.xgafv", "2");

    if (!params) {
      url.searchParams.set("alt", "json");
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

    url.searchParams.delete("$alt");
    url.searchParams.delete("callback");
    url.searchParams.delete("$callback");
    url.searchParams.set("alt", "json");
    return url;
  }

  private buildHeaders(body?: unknown, customHeaders?: HeadersInit) {
    const headers = new Headers(customHeaders);

    if (this.accessToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    if (body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  }

  private async fetch(url: URL, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (error) {
      GooglePeople.throwTransportError(error, init.signal);
    }
  }

  private static throwTransportError(
    error: unknown,
    signal?: AbortSignal | null,
  ): never {
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

  async raw(
    path: string,
    options: GooglePeopleRawRequestOptions,
  ): Promise<Response> {
    const response = await this.fetch(this.buildUrl(path, options.params), {
      method: options.method,
      headers: this.buildHeaders(options.body, options.headers),
      ...(options.body !== undefined
        ? { body: JSON.stringify(options.body) }
        : {}),
      signal: options.signal,
    });

    if (!response.ok) {
      const contentType = response.headers.get("Content-Type");

      if (
        contentType !== null &&
        contentType.split(";")[0]?.trim().toLowerCase().endsWith("json")
      ) {
        throw APIError.fromResponse(
          response,
          await this.readResponse(response, options.signal),
        );
      }

      throw new RawResponseError(
        response,
        await this.readResponseBytes(response, options.signal),
      );
    }

    return response;
  }

  async get<T>(
    path: string,
    params?: JsonQueryParams,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "GET",
      headers: this.buildHeaders(),
      signal,
    });

    return this.parseResponse(response, signal);
  }

  async post<T>(
    path: string,
    params?: JsonQueryParams,
    body?: unknown,
    signal?: AbortSignal,
    allowEmpty?: boolean,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "POST",
      headers: this.buildHeaders(body),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response, signal, allowEmpty);
  }

  async put<T>(
    path: string,
    params?: JsonQueryParams,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "PUT",
      headers: this.buildHeaders(body),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response, signal);
  }

  async patch<T>(
    path: string,
    params?: JsonQueryParams,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "PATCH",
      headers: this.buildHeaders(body),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal,
    });

    return this.parseResponse(response, signal);
  }

  async delete<T>(
    path: string,
    params?: JsonQueryParams,
    signal?: AbortSignal,
    allowEmpty?: boolean,
  ): Promise<T> {
    const response = await this.fetch(this.buildUrl(path, params), {
      method: "DELETE",
      headers: this.buildHeaders(),
      signal,
    });

    return this.parseResponse(response, signal, allowEmpty);
  }

  private async parseResponse(
    response: Response,
    signal?: AbortSignal,
    allowEmpty?: boolean,
  ) {
    const text = await this.readResponse(response, signal);

    if (!response.ok) {
      throw APIError.fromResponse(response, text);
    }

    if (!text) {
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
      GooglePeople.throwTransportError(error, signal);
    }
  }

  private async readResponseBytes(response: Response, signal?: AbortSignal) {
    try {
      return new Uint8Array(await response.arrayBuffer());
    } catch (error) {
      GooglePeople.throwTransportError(error, signal);
    }
  }
}
