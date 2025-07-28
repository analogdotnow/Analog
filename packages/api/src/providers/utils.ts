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


export async function withErrorHandler<T>(
  operation: string,
  fn: () => Promise<T> | T,
  context?: Record<string, unknown>,
): Promise<T> {
  try {
    return await Promise.resolve(fn());
  } catch (error: unknown) {
    console.error(`Failed to ${operation}:`, error);

    throw new ProviderError(error as Error, operation, context);
  }
}
