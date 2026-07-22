export interface GoogleCalendarErrorDetail {
  domain: string;
  location?: string;
  locationType?: string;
  message: string;
  reason: string;
}

export interface GoogleCalendarErrorBody {
  code: number;
  errors?: GoogleCalendarErrorDetail[];
  message: string;
  status?: string;
}

export interface GoogleCalendarError {
  error: GoogleCalendarErrorBody;
}

export class APIError<
  TStatus extends number | undefined = number | undefined,
  THeaders extends Headers | undefined = Headers | undefined,
  TError extends GoogleCalendarError | undefined =
    | GoogleCalendarError
    | undefined,
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
    super(APIError.makeMessage(status, error, message));
    this.status = status;
    this.headers = headers;
    this.error = error;
  }

  hasReason(reason: string) {
    const errors = this.error?.error.errors;

    if (!errors) {
      return false;
    }

    return errors.some((error) => error.reason === reason);
  }

  private static makeMessage(
    status: number | undefined,
    error: GoogleCalendarError | undefined,
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
    error: GoogleCalendarError | undefined,
    message: string | undefined,
    headers: Headers,
  ): APIError {
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }

    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }

    if (status === 403 && isRateLimitError(error)) {
      return new RateLimitError(status, error, message, headers);
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

    if (status === 412) {
      return new PreconditionFailedError(status, error, message, headers);
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

function isRateLimitError(error: GoogleCalendarError | undefined) {
  const errors = error?.error.errors;

  if (!errors) {
    return false;
  }

  // quotaExceeded (calendar usage limits) is not resolved by backoff, unlike the rate-limit reasons.
  return errors.some(({ reason }) =>
    ["rateLimitExceeded", "userRateLimitExceeded"].includes(reason),
  );
}

function isGoogleCalendarError(value: unknown): value is GoogleCalendarError {
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
    (!("errors" in value.error) ||
      value.error.errors === undefined ||
      Array.isArray(value.error.errors))
  );
}

function parseErrorBody(text: string): GoogleCalendarError | undefined {
  try {
    const parsed: unknown = JSON.parse(text);

    // Non-envelope JSON bodies (proxy errors, arrays, bare strings) fall
    // through to the status-based message instead of crashing downstream.
    if (!isGoogleCalendarError(parsed)) {
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

export class BadRequestError extends APIError<400, Headers> {}

export class AuthenticationError extends APIError<401, Headers> {}

export class PermissionDeniedError extends APIError<403, Headers> {}

export class NotFoundError extends APIError<404, Headers> {}

export class ConflictError extends APIError<409, Headers> {}

export class PreconditionFailedError extends APIError<412, Headers> {}

export class UnprocessableEntityError extends APIError<422, Headers> {}

export class RateLimitError extends APIError<403 | 429, Headers> {}

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
