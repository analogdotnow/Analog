import { ContactGroups } from "./contact-groups";
import { APIError } from "./error";
import type { QueryParams } from "./interfaces";
import { OtherContacts } from "./other-contacts";
import { People } from "./people";

export class GooglePeople {
  private static readonly BASE_URL = "https://people.googleapis.com/";

  public readonly contactGroups: ContactGroups;
  public readonly otherContacts: OtherContacts;
  public readonly people: People;

  constructor(private readonly accessToken: string) {
    this.contactGroups = new ContactGroups(this);
    this.otherContacts = new OtherContacts(this);
    this.people = new People(this);
  }

  private buildUrl(path: string, params?: QueryParams) {
    const url = new URL(`.${path}`, GooglePeople.BASE_URL);

    url.searchParams.set("$.xgafv", "2");

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

  async get<T>(
    path: string,
    params?: QueryParams,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await fetch(this.buildUrl(path, params), {
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
    const response = await fetch(this.buildUrl(path, params), {
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
    const response = await fetch(this.buildUrl(path, params), {
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
    const response = await fetch(this.buildUrl(path, params), {
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
    const response = await fetch(this.buildUrl(path, params), {
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
      return;
    }

    return JSON.parse(text);
  }
}
