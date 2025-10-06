import { useLiveQuery } from "@tanstack/react-db";

type UseLiveQueryFallbackOptions<TData> = {
  initialData?: TData;
};

//

export function useLiveQueryWithFallback(
  queryOrCollection: Parameters<typeof useLiveQuery>[0],
  depsOrOptions?: Array<unknown> | UseLiveQueryFallbackOptions<unknown>,
  maybeOptions?: UseLiveQueryFallbackOptions<unknown>,
) {
  const hasDeps = Array.isArray(depsOrOptions);
  const deps = hasDeps ? (depsOrOptions as Array<unknown>) : undefined;
  const options = (hasDeps ? maybeOptions : depsOrOptions) as
    | UseLiveQueryFallbackOptions<unknown>
    | undefined;

  const args =
    deps === undefined
      ? [queryOrCollection]
      : [queryOrCollection, deps];

  const result = useLiveQuery(
    ...(args as Parameters<typeof useLiveQuery>),
  );

  if (!result.isReady && options?.initialData !== undefined) {
    return {
      ...result,
      data: options.initialData,
    } as ReturnType<typeof useLiveQuery>;
  }

  return result;
}
