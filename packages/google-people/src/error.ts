import type { Status } from "./interfaces";

export interface GooglePeopleErrorDetail {
  "@type": string;
  contactErrors?: Record<string, Status>;
  domain?: string;
  metadata?: Record<string, string>;
  reason?: string;
  [key: string]: unknown;
}

export interface BatchCreateContactsErrorDetails {
  "@type": "type.googleapis.com/google.people.v1.BatchCreateContactsErrorDetails";
  contactErrors?: Record<number, Status>;
}

export interface BatchUpdateContactsErrorDetails {
  "@type": "type.googleapis.com/google.people.v1.BatchUpdateContactsErrorDetails";
  contactErrors?: Record<string, Status>;
}

export interface GooglePeopleErrorInfo extends GooglePeopleErrorDetail {
  "@type": "type.googleapis.com/google.rpc.ErrorInfo";
}

export interface GooglePeopleErrorBody {
  code: number;
  details?: GooglePeopleErrorDetail[];
  message: string;
  status: string;
}

export interface GooglePeopleError {
  error: GooglePeopleErrorBody;
}

export class APIError<
  TStatus extends number | undefined = number | undefined,
  THeaders extends Headers | undefined = Headers | undefined,
  TError extends GooglePeopleError | undefined = GooglePeopleError | undefined,
> extends Error {
  /** HTTP status for the response that caused the error */
  readonly status: TStatus;
  /** HTTP headers for the response that caused the error */
  readonly headers: THeaders;
  /** JSON body of the response that caused the error */
  readonly error: TError;

  constructor(
    status: TStatus,
    error: TError,
    message: string | undefined,
    headers: THeaders,
  ) {
    super(`${APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.error = error;
  }

  private static makeMessage(
    status: number | undefined,
    error: GooglePeopleError | undefined,
    message: string | undefined,
  ) {
    const msg = error?.error.message ?? message;

    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }

  static from(
    status: number,
    error: GooglePeopleError | undefined,
    message: string | undefined,
    headers: Headers,
  ): APIError {
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }

    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }

    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }

    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }

    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }

    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }

    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }

    if (status === 502) {
      return new BadGatewayError(status, error, message, headers);
    }

    if (status === 503) {
      return new ServiceUnavailableError(status, error, message, headers);
    }

    if (status === 504) {
      return new GatewayTimeoutError(status, error, message, headers);
    }

    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }

    if (status === 402) {
      return new PaymentRequiredError(status, error, message, headers);
    }

    if (status === 405) {
      return new MethodNotAllowedError(status, error, message, headers);
    }

    if (status === 408) {
      return new RequestTimeoutError(status, error, message, headers);
    }

    if (status === 410) {
      return new GoneError(status, error, message, headers);
    }

    if (status === 413) {
      return new PayloadTooLargeError(status, error, message, headers);
    }

    if (status === 415) {
      return new UnsupportedMediaTypeError(status, error, message, headers);
    }

    if (status === 428) {
      return new PreconditionRequiredError(status, error, message, headers);
    }

    if (status === 451) {
      return new LegalReasonsError(status, error, message, headers);
    }

    return new APIError(status, error, message, headers);
  }

  static fromResponse(response: Response, text: string) {
    return APIError.from(
      response.status,
      parseErrorBody(text),
      response.statusText,
      response.headers,
    );
  }
}

function isGooglePeopleError(value: unknown): value is GooglePeopleError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "code" in value.error &&
    typeof value.error.code === "number" &&
    "message" in value.error &&
    typeof value.error.message === "string" &&
    (!("details" in value.error) ||
      value.error.details === undefined ||
      Array.isArray(value.error.details))
  );
}

function parseErrorBody(text: string): GooglePeopleError | undefined {
  try {
    const parsed: unknown = JSON.parse(text);

    // Non-envelope JSON bodies (proxy errors, arrays, bare strings) fall
    // through to the status-based message instead of crashing downstream.
    if (!isGooglePeopleError(parsed)) {
      return undefined;
    }

    return parsed;
  } catch {
    return undefined;
  }
}

export class TimeoutError extends APIError<undefined, undefined> {
  constructor(message?: string) {
    super(undefined, undefined, message ?? "Request timed out.", undefined);
  }
}

export class ConnectionError extends APIError<undefined, undefined> {
  constructor(message?: string, cause?: unknown) {
    super(undefined, undefined, message ?? "Connection error.", undefined);
    this.cause = cause;
  }
}

export class RawResponseError extends APIError<number, Headers, undefined> {
  readonly body: Uint8Array;
  readonly contentType: string | null;

  constructor(response: Response, body: Uint8Array) {
    super(response.status, undefined, response.statusText, response.headers);
    this.body = body;
    this.contentType = response.headers.get("Content-Type");
  }
}

export class BadRequestError extends APIError<400, Headers> {}

export class AuthenticationError extends APIError<401, Headers> {}

export class PermissionDeniedError extends APIError<403, Headers> {}

export class NotFoundError extends APIError<404, Headers> {}

export class ConflictError extends APIError<409, Headers> {}

export class UnprocessableEntityError extends APIError<422, Headers> {}

export class RateLimitError extends APIError<429, Headers> {}

export class InternalServerError<
  TStatus extends number = number,
> extends APIError<TStatus, Headers> {}

export class BadGatewayError extends InternalServerError<502> {}

export class ServiceUnavailableError extends InternalServerError<503> {}

export class GatewayTimeoutError extends InternalServerError<504> {}

export class PaymentRequiredError extends APIError<402, Headers> {}

export class MethodNotAllowedError extends APIError<405, Headers> {}

export class RequestTimeoutError extends APIError<408, Headers> {}

export class GoneError extends APIError<410, Headers> {}

export class PayloadTooLargeError extends APIError<413, Headers> {}

export class UnsupportedMediaTypeError extends APIError<415, Headers> {}

export class PreconditionRequiredError extends APIError<428, Headers> {}

export class LegalReasonsError extends APIError<451, Headers> {}
