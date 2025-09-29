// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIPromise } from "./core/api-promise";
import * as Errors from "./core/error";
import * as Uploads from "./core/uploads";
import type {
  BodyInit,
  RequestInfo,
  RequestInit,
} from "./internal/builtin-types";
import { type Fetch } from "./internal/builtin-types";
import { getPlatformHeaders } from "./internal/detect-platform";
import { castToError, isAbortError } from "./internal/errors";
import { HeadersLike, NullableHeaders, buildHeaders } from "./internal/headers";
import type { APIResponseProps } from "./internal/parse";
import * as qs from "./internal/qs";
import * as Opts from "./internal/request-options";
import {
  FinalRequestOptions,
  RequestOptions,
} from "./internal/request-options";
import * as Shims from "./internal/shims";
import type {
  FinalizedRequestInit,
  HTTPMethod,
  MergedRequestInit,
  PromiseOrValue,
} from "./internal/types";
import { readEnv } from "./internal/utils/env";
import {
  formatRequestDetails,
  loggerFor,
  parseLogLevel,
  type LogLevel,
  type Logger,
} from "./internal/utils/log";
import { path } from "./internal/utils/path";
import { sleep } from "./internal/utils/sleep";
import { uuid4 } from "./internal/utils/uuid";
import {
  isAbsoluteURL,
  isEmptyObj,
  safeJSON,
  validatePositiveInteger,
} from "./internal/utils/values";
import {
  ConnectionListParams,
  ConnectionListResponse,
  Connections,
} from "./resources/connections";
import * as ContactGroupsAPI from "./resources/contact-groups";
import {
  ContactGroup,
  ContactGroupCreateParams,
  ContactGroupListParams,
  ContactGroupListResponse,
  ContactGroups,
} from "./resources/contact-groups";
import {
  ContactGroupsBatchGet,
  ContactGroupsBatchGetListParams,
  ContactGroupsBatchGetListResponse,
  Status,
} from "./resources/contact-groups-batch-get";
import {
  ContactDeletePhotoParams,
  ContactDeletePhotoResponse,
  Contacts,
} from "./resources/contacts";
import {
  CopyOtherContactToMyContactsGroup,
  CopyOtherContactToMyContactsGroupCopyParams,
} from "./resources/copy-other-contact-to-my-contacts-group";
import {
  DeleteContact,
  DeleteContactDeleteParams,
} from "./resources/delete-contact";
import * as API from "./resources/index";
import {
  MembersModify,
  MembersModifyModifyParams,
  MembersModifyModifyResponse,
} from "./resources/members-modify";
import {
  OtherContactListParams,
  OtherContactListResponse,
  OtherContacts,
} from "./resources/other-contacts";
import {
  OtherContactsSearch,
  OtherContactsSearchSearchParams,
  SearchResponse,
} from "./resources/other-contacts-search";
import {
  PeopleBatchCreateContactCreateParams,
  PeopleBatchCreateContactCreateResponse,
  PeopleBatchCreateContacts,
  PersonResponse,
} from "./resources/people-batch-create-contacts";
import {
  Empty,
  PeopleBatchDeleteContactDeleteBatchParams,
  PeopleBatchDeleteContacts,
} from "./resources/people-batch-delete-contacts";
import {
  PeopleBatchGet,
  PeopleBatchGetRetrieveParams,
  PeopleBatchGetRetrieveResponse,
} from "./resources/people-batch-get";
import {
  PeopleBatchUpdateContactUpdateBatchParams,
  PeopleBatchUpdateContactUpdateBatchResponse,
  PeopleBatchUpdateContacts,
} from "./resources/people-batch-update-contacts";
import * as PeopleCreateContactAPI from "./resources/people-create-contact";
import {
  FieldMetadata,
  PeopleCreateContact,
  PeopleCreateContactCreateParams,
  PersonMerged,
  Source,
  type Date,
} from "./resources/people-create-contact";
import {
  PeopleListDirectoryPeople,
  PeopleListDirectoryPersonListParams,
  PeopleListDirectoryPersonListResponse,
} from "./resources/people-list-directory-people";
import {
  PeopleSearchContactSearchParams,
  PeopleSearchContacts,
} from "./resources/people-search-contacts";
import {
  PeopleSearchDirectoryPeople,
  PeopleSearchDirectoryPersonSearchParams,
  PeopleSearchDirectoryPersonSearchResponse,
} from "./resources/people-search-directory-people";
import * as TopLevelAPI from "./resources/top-level";
import {
  DeleteResourceParams,
  RetrieveResourceParams,
  UpdateResourceParams,
} from "./resources/top-level";
import {
  UpdateContact,
  UpdateContactUpdateParams,
} from "./resources/update-contact";
import {
  UpdateContactPhoto,
  UpdateContactPhotoUpdateParams,
  UpdateContactPhotoUpdateResponse,
} from "./resources/update-contact-photo";
import { VERSION } from "./version";

export type { Logger, LogLevel } from "./internal/utils/log";

export interface ClientOptions {
  accessToken: string;

  /**
   * Override the default base URL for the API, e.g., "https://api.example.com/v2/"
   *
   * Defaults to process.env['GOOGLE_PEOPLE_BASE_URL'].
   */
  baseURL?: string | null | undefined;

  /**
   * The maximum amount of time (in milliseconds) that the client should wait for a response
   * from the server before timing out a single request.
   *
   * Note that request timeouts are retried by default, so in a worst-case scenario you may wait
   * much longer than this timeout before the promise succeeds or fails.
   *
   * @unit milliseconds
   */
  timeout?: number | undefined;
  /**
   * Additional `RequestInit` options to be passed to `fetch` calls.
   * Properties will be overridden by per-request `fetchOptions`.
   */
  fetchOptions?: MergedRequestInit | undefined;

  /**
   * Specify a custom `fetch` function implementation.
   *
   * If not provided, we expect that `fetch` is defined globally.
   */
  fetch?: Fetch | undefined;

  /**
   * The maximum number of times that the client will retry a request in case of a
   * temporary failure, like a network error or a 5XX error from the server.
   *
   * @default 2
   */
  maxRetries?: number | undefined;

  /**
   * Default headers to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * header to `null` in request options.
   */
  defaultHeaders?: HeadersLike | undefined;

  /**
   * Default query parameters to include with every request to the API.
   *
   * These can be removed in individual requests by explicitly setting the
   * param to `undefined` in request options.
   */
  defaultQuery?: Record<string, string | undefined> | undefined;

  /**
   * Set the log level.
   *
   * Defaults to process.env['GOOGLE_PEOPLE_LOG'] or 'warn' if it isn't set.
   */
  logLevel?: LogLevel | undefined;

  /**
   * Set the logger.
   *
   * Defaults to globalThis.console.
   */
  logger?: Logger | undefined;
}

/**
 * API Client for interfacing with the Google People API.
 */
export class GooglePeople {
  accessToken: string;

  baseURL: string;
  maxRetries: number;
  timeout: number;
  logger: Logger | undefined;
  logLevel: LogLevel | undefined;
  fetchOptions: MergedRequestInit | undefined;

  private fetch: Fetch;
  #encoder: Opts.RequestEncoder;
  protected idempotencyHeader?: string;
  private _options: ClientOptions;

  /**
   * API Client for interfacing with the Google People API.
   *
   * @param {string} opts.accessToken
   * @param {string} [opts.baseURL=process.env['GOOGLE_PEOPLE_BASE_URL'] ?? https://people.googleapis.com/] - Override the default base URL for the API.
   * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   */
  constructor({
    baseURL = readEnv("GOOGLE_PEOPLE_BASE_URL"),
    accessToken,
    ...opts
  }: ClientOptions) {
    if (accessToken === undefined) {
      throw new Errors.GooglePeopleError(
        "Missing required client option accessToken; you need to instantiate the GooglePeople client with an accessToken option, like new GooglePeople({ accessToken: 'My Access Token' }).",
      );
    }

    const options: ClientOptions = {
      accessToken,
      ...opts,
      baseURL: baseURL || `https://people.googleapis.com/`,
    };

    this.baseURL = options.baseURL!;
    this.timeout =
      options.timeout ?? GooglePeople.DEFAULT_TIMEOUT /* 1 minute */;
    this.logger = options.logger ?? console;
    const defaultLogLevel = "warn";
    // Set default logLevel early so that we can log a warning in parseLogLevel.
    this.logLevel = defaultLogLevel;
    this.logLevel =
      parseLogLevel(options.logLevel, "ClientOptions.logLevel", this) ??
      parseLogLevel(
        readEnv("GOOGLE_PEOPLE_LOG"),
        "process.env['GOOGLE_PEOPLE_LOG']",
        this,
      ) ??
      defaultLogLevel;
    this.fetchOptions = options.fetchOptions;
    this.maxRetries = options.maxRetries ?? 2;
    this.fetch = options.fetch ?? Shims.getDefaultFetch();
    this.#encoder = Opts.FallbackEncoder;

    this._options = options;

    this.accessToken = accessToken;
  }

  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(options: Partial<ClientOptions>): this {
    const client = new (this.constructor as any as new (
      props: ClientOptions,
    ) => typeof this)({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      accessToken: this.accessToken,
      ...options,
    });
    return client;
  }

  /**
   * Check whether the base URL is set to its default.
   */
  #baseURLOverridden(): boolean {
    return this.baseURL !== "https://people.googleapis.com/";
  }

  /**
   * Delete an existing contact group owned by the authenticated user by specifying a
   * contact group resource name. Mutate requests for the same user should be sent
   * sequentially to avoid increased latency and failures.
   */
  deleteResource(
    resourceName: string,
    params: TopLevelAPI.DeleteResourceParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<unknown> {
    const {
      $,
      access_token,
      alt,
      callback,
      deleteContacts,
      fields,
      key,
      oauth_token,
      prettyPrint,
      quotaUser,
      upload_protocol,
      uploadType,
    } = params ?? {};
    return this.delete(path`/v1/${resourceName}`, {
      query: {
        $,
        access_token,
        alt,
        callback,
        deleteContacts,
        fields,
        key,
        oauth_token,
        prettyPrint,
        quotaUser,
        upload_protocol,
        uploadType,
      },
      ...options,
    });
  }

  /**
   * Provides information about a person by specifying a resource name. Use
   * `people/me` to indicate the authenticated user. The request returns a 400 error
   * if 'personFields' is not specified.
   */
  retrieveResource(
    resourceName: string,
    query: TopLevelAPI.RetrieveResourceParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PeopleCreateContactAPI.PersonMerged> {
    return this.get(path`/v1/${resourceName}`, { query, ...options });
  }

  /**
   * Update the name of an existing contact group owned by the authenticated user.
   * Updated contact group names must be unique to the users contact groups.
   * Attempting to create a group with a duplicate name will return a HTTP 409 error.
   * Mutate requests for the same user should be sent sequentially to avoid increased
   * latency and failures.
   */
  updateResource(
    resourceName: string,
    params: TopLevelAPI.UpdateResourceParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ContactGroupsAPI.ContactGroup> {
    const {
      $,
      access_token,
      alt,
      callback,
      fields,
      key,
      oauth_token,
      prettyPrint,
      quotaUser,
      upload_protocol,
      uploadType,
      ...body
    } = params ?? {};
    return this.put(path`/v1/${resourceName}`, {
      query: {
        $,
        access_token,
        alt,
        callback,
        fields,
        key,
        oauth_token,
        prettyPrint,
        quotaUser,
        upload_protocol,
        uploadType,
      },
      body,
      ...options,
    });
  }

  protected defaultQuery(): Record<string, string | undefined> | undefined {
    return this._options.defaultQuery;
  }

  protected validateHeaders({ values, nulls }: NullableHeaders) {
    return;
  }

  protected async authHeaders(
    opts: FinalRequestOptions,
  ): Promise<NullableHeaders | undefined> {
    return buildHeaders([{ Authorization: `Bearer ${this.accessToken}` }]);
  }

  protected stringifyQuery(query: Record<string, unknown>): string {
    return qs.stringify(query, { arrayFormat: "comma" });
  }

  private getUserAgent(): string {
    return `${this.constructor.name}/JS ${VERSION}`;
  }

  protected defaultIdempotencyKey(): string {
    return `stainless-node-retry-${uuid4()}`;
  }

  protected makeStatusError(
    status: number,
    error: Object,
    message: string | undefined,
    headers: Headers,
  ): Errors.APIError {
    return Errors.APIError.generate(status, error, message, headers);
  }

  buildURL(
    path: string,
    query: Record<string, unknown> | null | undefined,
    defaultBaseURL?: string | undefined,
  ): string {
    const baseURL =
      (!this.#baseURLOverridden() && defaultBaseURL) || this.baseURL;
    const url = isAbsoluteURL(path)
      ? new URL(path)
      : new URL(
          baseURL +
            (baseURL.endsWith("/") && path.startsWith("/")
              ? path.slice(1)
              : path),
        );

    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }

    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query as Record<string, unknown>);
    }

    return url.toString();
  }

  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  protected async prepareOptions(options: FinalRequestOptions): Promise<void> {}

  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  protected async prepareRequest(
    request: RequestInit,
    { url, options }: { url: string; options: FinalRequestOptions },
  ): Promise<void> {}

  get<Rsp>(
    path: string,
    opts?: PromiseOrValue<RequestOptions>,
  ): APIPromise<Rsp> {
    return this.methodRequest("get", path, opts);
  }

  post<Rsp>(
    path: string,
    opts?: PromiseOrValue<RequestOptions>,
  ): APIPromise<Rsp> {
    return this.methodRequest("post", path, opts);
  }

  patch<Rsp>(
    path: string,
    opts?: PromiseOrValue<RequestOptions>,
  ): APIPromise<Rsp> {
    return this.methodRequest("patch", path, opts);
  }

  put<Rsp>(
    path: string,
    opts?: PromiseOrValue<RequestOptions>,
  ): APIPromise<Rsp> {
    return this.methodRequest("put", path, opts);
  }

  delete<Rsp>(
    path: string,
    opts?: PromiseOrValue<RequestOptions>,
  ): APIPromise<Rsp> {
    return this.methodRequest("delete", path, opts);
  }

  private methodRequest<Rsp>(
    method: HTTPMethod,
    path: string,
    opts?: PromiseOrValue<RequestOptions>,
  ): APIPromise<Rsp> {
    return this.request(
      Promise.resolve(opts).then((opts) => {
        return { method, path, ...opts };
      }),
    );
  }

  request<Rsp>(
    options: PromiseOrValue<FinalRequestOptions>,
    remainingRetries: number | null = null,
  ): APIPromise<Rsp> {
    return new APIPromise(
      this,
      this.makeRequest(options, remainingRetries, undefined),
    );
  }

  private async makeRequest(
    optionsInput: PromiseOrValue<FinalRequestOptions>,
    retriesRemaining: number | null,
    retryOfRequestLogID: string | undefined,
  ): Promise<APIResponseProps> {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }

    await this.prepareOptions(options);

    const { req, url, timeout } = await this.buildRequest(options, {
      retryCount: maxRetries - retriesRemaining,
    });

    await this.prepareRequest(req, { url, options });

    /** Not an API request ID, just for correlating local log entries. */
    const requestLogID =
      "log_" + ((Math.random() * (1 << 24)) | 0).toString(16).padStart(6, "0");
    const retryLogStr =
      retryOfRequestLogID === undefined
        ? ""
        : `, retryOf: ${retryOfRequestLogID}`;
    const startTime = Date.now();

    loggerFor(this).debug(
      `[${requestLogID}] sending request`,
      formatRequestDetails({
        retryOfRequestLogID,
        method: options.method,
        url,
        options,
        headers: req.headers,
      }),
    );

    if (options.signal?.aborted) {
      throw new Errors.APIUserAbortError();
    }

    const controller = new AbortController();
    const response = await this.fetchWithTimeout(
      url,
      req,
      timeout,
      controller,
    ).catch(castToError);
    const headersTime = Date.now();

    if (response instanceof globalThis.Error) {
      const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
      if (options.signal?.aborted) {
        throw new Errors.APIUserAbortError();
      }
      // detect native connection timeout errors
      // deno throws "TypeError: error sending request for url (https://example/): client error (Connect): tcp connect error: Operation timed out (os error 60): Operation timed out (os error 60)"
      // undici throws "TypeError: fetch failed" with cause "ConnectTimeoutError: Connect Timeout Error (attempted address: example:443, timeout: 1ms)"
      // others do not provide enough information to distinguish timeouts from other connection errors
      const isTimeout =
        isAbortError(response) ||
        /timed? ?out/i.test(
          String(response) +
            ("cause" in response ? String(response.cause) : ""),
        );
      if (retriesRemaining) {
        loggerFor(this).info(
          `[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`,
        );
        loggerFor(this).debug(
          `[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`,
          formatRequestDetails({
            retryOfRequestLogID,
            url,
            durationMs: headersTime - startTime,
            message: response.message,
          }),
        );
        return this.retryRequest(
          options,
          retriesRemaining,
          retryOfRequestLogID ?? requestLogID,
        );
      }
      loggerFor(this).info(
        `[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`,
      );
      loggerFor(this).debug(
        `[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`,
        formatRequestDetails({
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: response.message,
        }),
      );
      if (isTimeout) {
        throw new Errors.APIConnectionTimeoutError();
      }
      throw new Errors.APIConnectionError({ cause: response });
    }

    const responseInfo = `[${requestLogID}${retryLogStr}] ${req.method} ${url} ${
      response.ok ? "succeeded" : "failed"
    } with status ${response.status} in ${headersTime - startTime}ms`;

    if (!response.ok) {
      const shouldRetry = await this.shouldRetry(response);
      if (retriesRemaining && shouldRetry) {
        const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;

        // We don't need the body of this response.
        await Shims.CancelReadableStream(response.body);
        loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
        loggerFor(this).debug(
          `[${requestLogID}] response error (${retryMessage})`,
          formatRequestDetails({
            retryOfRequestLogID,
            url: response.url,
            status: response.status,
            headers: response.headers,
            durationMs: headersTime - startTime,
          }),
        );
        return this.retryRequest(
          options,
          retriesRemaining,
          retryOfRequestLogID ?? requestLogID,
          response.headers,
        );
      }

      const retryMessage = shouldRetry
        ? `error; no more retries left`
        : `error; not retryable`;

      loggerFor(this).info(`${responseInfo} - ${retryMessage}`);

      const errText = await response
        .text()
        .catch((err: any) => castToError(err).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? undefined : errText;

      loggerFor(this).debug(
        `[${requestLogID}] response error (${retryMessage})`,
        formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          message: errMessage,
          durationMs: Date.now() - startTime,
        }),
      );

      const err = this.makeStatusError(
        response.status,
        errJSON,
        errMessage,
        response.headers,
      );
      throw err;
    }

    loggerFor(this).info(responseInfo);
    loggerFor(this).debug(
      `[${requestLogID}] response start`,
      formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        durationMs: headersTime - startTime,
      }),
    );

    return {
      response,
      options,
      controller,
      requestLogID,
      retryOfRequestLogID,
      startTime,
    };
  }

  async fetchWithTimeout(
    url: RequestInfo,
    init: RequestInit | undefined,
    ms: number,
    controller: AbortController,
  ): Promise<Response> {
    const { signal, method, ...options } = init || {};
    if (signal) signal.addEventListener("abort", () => controller.abort());

    const timeout = setTimeout(() => controller.abort(), ms);

    const isReadableBody =
      ((globalThis as any).ReadableStream &&
        options.body instanceof (globalThis as any).ReadableStream) ||
      (typeof options.body === "object" &&
        options.body !== null &&
        Symbol.asyncIterator in options.body);

    const fetchOptions: RequestInit = {
      signal: controller.signal as any,
      ...(isReadableBody ? { duplex: "half" } : {}),
      method: "GET",
      ...options,
    };
    if (method) {
      // Custom methods like 'patch' need to be uppercased
      // See https://github.com/nodejs/undici/issues/2294
      fetchOptions.method = method.toUpperCase();
    }

    try {
      // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
      return await this.fetch.call(undefined, url, fetchOptions);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async shouldRetry(response: Response): Promise<boolean> {
    // Note this is not a standard header.
    const shouldRetryHeader = response.headers.get("x-should-retry");

    // If the server explicitly says whether or not to retry, obey.
    if (shouldRetryHeader === "true") return true;
    if (shouldRetryHeader === "false") return false;

    // Retry on request timeouts.
    if (response.status === 408) return true;

    // Retry on lock timeouts.
    if (response.status === 409) return true;

    // Retry on rate limits.
    if (response.status === 429) return true;

    // Retry internal errors.
    if (response.status >= 500) return true;

    return false;
  }

  private async retryRequest(
    options: FinalRequestOptions,
    retriesRemaining: number,
    requestLogID: string,
    responseHeaders?: Headers | undefined,
  ): Promise<APIResponseProps> {
    let timeoutMillis: number | undefined;

    // Note the `retry-after-ms` header may not be standard, but is a good idea and we'd like proactive support for it.
    const retryAfterMillisHeader = responseHeaders?.get("retry-after-ms");
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }

    // About the Retry-After header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
    const retryAfterHeader = responseHeaders?.get("retry-after");
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1000;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }

    // If the API asks us to wait a certain amount of time (and it's a reasonable amount),
    // just do what it says, but otherwise calculate a default
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1000)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(
        retriesRemaining,
        maxRetries,
      );
    }
    await sleep(timeoutMillis);

    return this.makeRequest(options, retriesRemaining - 1, requestLogID);
  }

  private calculateDefaultRetryTimeoutMillis(
    retriesRemaining: number,
    maxRetries: number,
  ): number {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8.0;

    const numRetries = maxRetries - retriesRemaining;

    // Apply exponential backoff, but not more than the max.
    const sleepSeconds = Math.min(
      initialRetryDelay * Math.pow(2, numRetries),
      maxRetryDelay,
    );

    // Apply some jitter, take up to at most 25 percent of the retry time.
    const jitter = 1 - Math.random() * 0.25;

    return sleepSeconds * jitter * 1000;
  }

  async buildRequest(
    inputOptions: FinalRequestOptions,
    { retryCount = 0 }: { retryCount?: number } = {},
  ): Promise<{ req: FinalizedRequestInit; url: string; timeout: number }> {
    const options = { ...inputOptions };
    const { method, path, query, defaultBaseURL } = options;

    const url = this.buildURL(
      path!,
      query as Record<string, unknown>,
      defaultBaseURL,
    );
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const { bodyHeaders, body } = this.buildBody({ options });
    const reqHeaders = await this.buildHeaders({
      options: inputOptions,
      method,
      bodyHeaders,
      retryCount,
    });

    const req: FinalizedRequestInit = {
      method,
      headers: reqHeaders,
      ...(options.signal && { signal: options.signal }),
      ...((globalThis as any).ReadableStream &&
        body instanceof (globalThis as any).ReadableStream && {
          duplex: "half",
        }),
      ...(body && { body }),
      ...((this.fetchOptions as any) ?? {}),
      ...((options.fetchOptions as any) ?? {}),
    };

    return { req, url, timeout: options.timeout };
  }

  private async buildHeaders({
    options,
    method,
    bodyHeaders,
    retryCount,
  }: {
    options: FinalRequestOptions;
    method: HTTPMethod;
    bodyHeaders: HeadersLike;
    retryCount: number;
  }): Promise<Headers> {
    let idempotencyHeaders: HeadersLike = {};
    if (this.idempotencyHeader && method !== "get") {
      if (!options.idempotencyKey)
        options.idempotencyKey = this.defaultIdempotencyKey();
      idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
    }

    const headers = buildHeaders([
      idempotencyHeaders,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(retryCount),
        ...(options.timeout
          ? {
              "X-Stainless-Timeout": String(Math.trunc(options.timeout / 1000)),
            }
          : {}),
        ...getPlatformHeaders(),
      },
      await this.authHeaders(options),
      this._options.defaultHeaders,
      bodyHeaders,
      options.headers,
    ]);

    this.validateHeaders(headers);

    return headers.values;
  }

  private buildBody({
    options: { body, headers: rawHeaders },
  }: {
    options: FinalRequestOptions;
  }): {
    bodyHeaders: HeadersLike;
    body: BodyInit | undefined;
  } {
    if (!body) {
      return { bodyHeaders: undefined, body: undefined };
    }
    const headers = buildHeaders([rawHeaders]);
    if (
      // Pass raw type verbatim
      ArrayBuffer.isView(body) ||
      body instanceof ArrayBuffer ||
      body instanceof DataView ||
      (typeof body === "string" &&
        // Preserve legacy string encoding behavior for now
        headers.values.has("content-type")) ||
      // `Blob` is superset of `File`
      ((globalThis as any).Blob && body instanceof (globalThis as any).Blob) ||
      // `FormData` -> `multipart/form-data`
      body instanceof FormData ||
      // `URLSearchParams` -> `application/x-www-form-urlencoded`
      body instanceof URLSearchParams ||
      // Send chunked stream (each chunk has own `length`)
      ((globalThis as any).ReadableStream &&
        body instanceof (globalThis as any).ReadableStream)
    ) {
      return { bodyHeaders: undefined, body: body as BodyInit };
    } else if (
      typeof body === "object" &&
      (Symbol.asyncIterator in body ||
        (Symbol.iterator in body &&
          "next" in body &&
          typeof body.next === "function"))
    ) {
      return {
        bodyHeaders: undefined,
        body: Shims.ReadableStreamFrom(body as AsyncIterable<Uint8Array>),
      };
    } else {
      return this.#encoder({ body, headers });
    }
  }

  static GooglePeople = this;
  static DEFAULT_TIMEOUT = 60000; // 1 minute

  static GooglePeopleError = Errors.GooglePeopleError;
  static APIError = Errors.APIError;
  static APIConnectionError = Errors.APIConnectionError;
  static APIConnectionTimeoutError = Errors.APIConnectionTimeoutError;
  static APIUserAbortError = Errors.APIUserAbortError;
  static NotFoundError = Errors.NotFoundError;
  static ConflictError = Errors.ConflictError;
  static RateLimitError = Errors.RateLimitError;
  static BadRequestError = Errors.BadRequestError;
  static AuthenticationError = Errors.AuthenticationError;
  static InternalServerError = Errors.InternalServerError;
  static PermissionDeniedError = Errors.PermissionDeniedError;
  static UnprocessableEntityError = Errors.UnprocessableEntityError;

  static toFile = Uploads.toFile;

  contactGroups: API.ContactGroups = new API.ContactGroups(this);
  contactGroupsBatchGet: API.ContactGroupsBatchGet =
    new API.ContactGroupsBatchGet(this);
  otherContacts: API.OtherContacts = new API.OtherContacts(this);
  otherContactsSearch: API.OtherContactsSearch = new API.OtherContactsSearch(
    this,
  );
  peopleBatchCreateContacts: API.PeopleBatchCreateContacts =
    new API.PeopleBatchCreateContacts(this);
  peopleBatchDeleteContacts: API.PeopleBatchDeleteContacts =
    new API.PeopleBatchDeleteContacts(this);
  peopleBatchGet: API.PeopleBatchGet = new API.PeopleBatchGet(this);
  peopleBatchUpdateContacts: API.PeopleBatchUpdateContacts =
    new API.PeopleBatchUpdateContacts(this);
  peopleCreateContact: API.PeopleCreateContact = new API.PeopleCreateContact(
    this,
  );
  peopleListDirectoryPeople: API.PeopleListDirectoryPeople =
    new API.PeopleListDirectoryPeople(this);
  peopleSearchContacts: API.PeopleSearchContacts = new API.PeopleSearchContacts(
    this,
  );
  peopleSearchDirectoryPeople: API.PeopleSearchDirectoryPeople =
    new API.PeopleSearchDirectoryPeople(this);
  connections: API.Connections = new API.Connections(this);
  membersModify: API.MembersModify = new API.MembersModify(this);
  copyOtherContactToMyContactsGroup: API.CopyOtherContactToMyContactsGroup =
    new API.CopyOtherContactToMyContactsGroup(this);
  deleteContact: API.DeleteContact = new API.DeleteContact(this);
  contacts: API.Contacts = new API.Contacts(this);
  updateContact: API.UpdateContact = new API.UpdateContact(this);
  updateContactPhoto: API.UpdateContactPhoto = new API.UpdateContactPhoto(this);
}

GooglePeople.ContactGroups = ContactGroups;
GooglePeople.ContactGroupsBatchGet = ContactGroupsBatchGet;
GooglePeople.OtherContacts = OtherContacts;
GooglePeople.OtherContactsSearch = OtherContactsSearch;
GooglePeople.PeopleBatchCreateContacts = PeopleBatchCreateContacts;
GooglePeople.PeopleBatchDeleteContacts = PeopleBatchDeleteContacts;
GooglePeople.PeopleBatchGet = PeopleBatchGet;
GooglePeople.PeopleBatchUpdateContacts = PeopleBatchUpdateContacts;
GooglePeople.PeopleCreateContact = PeopleCreateContact;
GooglePeople.PeopleListDirectoryPeople = PeopleListDirectoryPeople;
GooglePeople.PeopleSearchContacts = PeopleSearchContacts;
GooglePeople.PeopleSearchDirectoryPeople = PeopleSearchDirectoryPeople;
GooglePeople.Connections = Connections;
GooglePeople.MembersModify = MembersModify;
GooglePeople.CopyOtherContactToMyContactsGroup =
  CopyOtherContactToMyContactsGroup;
GooglePeople.DeleteContact = DeleteContact;
GooglePeople.Contacts = Contacts;
GooglePeople.UpdateContact = UpdateContact;
GooglePeople.UpdateContactPhoto = UpdateContactPhoto;

export declare namespace GooglePeople {
  export type RequestOptions = Opts.RequestOptions;

  export {
    type DeleteResourceParams as DeleteResourceParams,
    type RetrieveResourceParams as RetrieveResourceParams,
    type UpdateResourceParams as UpdateResourceParams,
  };

  export {
    ContactGroups as ContactGroups,
    type ContactGroup as ContactGroup,
    type ContactGroupListResponse as ContactGroupListResponse,
    type ContactGroupCreateParams as ContactGroupCreateParams,
    type ContactGroupListParams as ContactGroupListParams,
  };

  export {
    ContactGroupsBatchGet as ContactGroupsBatchGet,
    type Status as Status,
    type ContactGroupsBatchGetListResponse as ContactGroupsBatchGetListResponse,
    type ContactGroupsBatchGetListParams as ContactGroupsBatchGetListParams,
  };

  export {
    OtherContacts as OtherContacts,
    type OtherContactListResponse as OtherContactListResponse,
    type OtherContactListParams as OtherContactListParams,
  };

  export {
    OtherContactsSearch as OtherContactsSearch,
    type SearchResponse as SearchResponse,
    type OtherContactsSearchSearchParams as OtherContactsSearchSearchParams,
  };

  export {
    PeopleBatchCreateContacts as PeopleBatchCreateContacts,
    type PersonResponse as PersonResponse,
    type PeopleBatchCreateContactCreateResponse as PeopleBatchCreateContactCreateResponse,
    type PeopleBatchCreateContactCreateParams as PeopleBatchCreateContactCreateParams,
  };

  export {
    PeopleBatchDeleteContacts as PeopleBatchDeleteContacts,
    type Empty as Empty,
    type PeopleBatchDeleteContactDeleteBatchParams as PeopleBatchDeleteContactDeleteBatchParams,
  };

  export {
    PeopleBatchGet as PeopleBatchGet,
    type PeopleBatchGetRetrieveResponse as PeopleBatchGetRetrieveResponse,
    type PeopleBatchGetRetrieveParams as PeopleBatchGetRetrieveParams,
  };

  export {
    PeopleBatchUpdateContacts as PeopleBatchUpdateContacts,
    type PeopleBatchUpdateContactUpdateBatchResponse as PeopleBatchUpdateContactUpdateBatchResponse,
    type PeopleBatchUpdateContactUpdateBatchParams as PeopleBatchUpdateContactUpdateBatchParams,
  };

  export {
    PeopleCreateContact as PeopleCreateContact,
    type Date as Date,
    type FieldMetadata as FieldMetadata,
    type PersonMerged as PersonMerged,
    type Source as Source,
    type PeopleCreateContactCreateParams as PeopleCreateContactCreateParams,
  };

  export {
    PeopleListDirectoryPeople as PeopleListDirectoryPeople,
    type PeopleListDirectoryPersonListResponse as PeopleListDirectoryPersonListResponse,
    type PeopleListDirectoryPersonListParams as PeopleListDirectoryPersonListParams,
  };

  export {
    PeopleSearchContacts as PeopleSearchContacts,
    type PeopleSearchContactSearchParams as PeopleSearchContactSearchParams,
  };

  export {
    PeopleSearchDirectoryPeople as PeopleSearchDirectoryPeople,
    type PeopleSearchDirectoryPersonSearchResponse as PeopleSearchDirectoryPersonSearchResponse,
    type PeopleSearchDirectoryPersonSearchParams as PeopleSearchDirectoryPersonSearchParams,
  };

  export {
    Connections as Connections,
    type ConnectionListResponse as ConnectionListResponse,
    type ConnectionListParams as ConnectionListParams,
  };

  export {
    MembersModify as MembersModify,
    type MembersModifyModifyResponse as MembersModifyModifyResponse,
    type MembersModifyModifyParams as MembersModifyModifyParams,
  };

  export {
    CopyOtherContactToMyContactsGroup as CopyOtherContactToMyContactsGroup,
    type CopyOtherContactToMyContactsGroupCopyParams as CopyOtherContactToMyContactsGroupCopyParams,
  };

  export {
    DeleteContact as DeleteContact,
    type DeleteContactDeleteParams as DeleteContactDeleteParams,
  };

  export {
    Contacts as Contacts,
    type ContactDeletePhotoResponse as ContactDeletePhotoResponse,
    type ContactDeletePhotoParams as ContactDeletePhotoParams,
  };

  export {
    UpdateContact as UpdateContact,
    type UpdateContactUpdateParams as UpdateContactUpdateParams,
  };

  export {
    UpdateContactPhoto as UpdateContactPhoto,
    type UpdateContactPhotoUpdateResponse as UpdateContactPhotoUpdateResponse,
    type UpdateContactPhotoUpdateParams as UpdateContactPhotoUpdateParams,
  };
}
