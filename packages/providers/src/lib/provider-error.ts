export class ProviderError extends Error {
  code: string;
  operation: string;
  context?: Record<string, unknown>;
  originalError: unknown;
  constructor(
    error: Error & { code?: string },
    operation: string,
    context?: Record<string, unknown>,
  ) {
    super(error?.message ?? "An unknown error occurred");
    this.name = "ProviderError";
    this.code = error?.code ?? "UNKNOWN_ERROR";
    this.operation = operation;
    this.context = context;
    this.originalError = error;
  }
}

export class ResourceDeletedError extends ProviderError {
  constructor(
    operation: string,
    context?: Record<string, unknown>,
  ) {
    const error = new Error("The requested resource has been deleted") as Error & { code?: string };
    error.code = "RESOURCE_DELETED";
    super(error, operation, context);
    this.name = "ResourceDeletedError";
  }
}
