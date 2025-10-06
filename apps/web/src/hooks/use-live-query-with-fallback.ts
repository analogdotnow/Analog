import { useLiveQuery, type UseLiveQueryStatus } from "@tanstack/react-db";
import type {
  Collection,
  CollectionStatus,
  Context,
  GetResult,
  InitialQueryBuilder,
  LiveQueryCollectionConfig,
  QueryBuilder,
} from "@tanstack/db";

type UseLiveQueryFallbackOptions<TData> = {
  initialData?: TData;
};

export function useLiveQueryWithFallback<TContext extends Context>(
  queryFn: (q: InitialQueryBuilder) => QueryBuilder<TContext>,
  depsOrOptions?:
    | Array<unknown>
    | UseLiveQueryFallbackOptions<Array<GetResult<TContext>>>,
  options?: UseLiveQueryFallbackOptions<Array<GetResult<TContext>>>,
): {
  state: Map<string | number, GetResult<TContext>>;
  data: Array<GetResult<TContext>>;
  collection: Collection<GetResult<TContext>, string | number, {}>;
  status: CollectionStatus;
  isLoading: boolean;
  isReady: boolean;
  isIdle: boolean;
  isError: boolean;
  isCleanedUp: boolean;
  isEnabled: true;
};

export function useLiveQueryWithFallback<TContext extends Context>(
  queryFn: (q: InitialQueryBuilder) => QueryBuilder<TContext> | undefined | null,
  depsOrOptions?:
    | Array<unknown>
    | UseLiveQueryFallbackOptions<Array<GetResult<TContext>> | undefined>,
  options?:
    | UseLiveQueryFallbackOptions<Array<GetResult<TContext>> | undefined>,
): {
  state: Map<string | number, GetResult<TContext>> | undefined;
  data: Array<GetResult<TContext>> | undefined;
  collection:
    | Collection<GetResult<TContext>, string | number, {}>
    | undefined;
  status: UseLiveQueryStatus;
  isLoading: boolean;
  isReady: boolean;
  isIdle: boolean;
  isError: boolean;
  isCleanedUp: boolean;
  isEnabled: boolean;
};

export function useLiveQueryWithFallback<TContext extends Context>(
  queryFn: (q: InitialQueryBuilder) => LiveQueryCollectionConfig<TContext> | undefined | null,
  depsOrOptions?:
    | Array<unknown>
    | UseLiveQueryFallbackOptions<Array<GetResult<TContext>> | undefined>,
  options?:
    | UseLiveQueryFallbackOptions<Array<GetResult<TContext>> | undefined>,
): {
  state: Map<string | number, GetResult<TContext>> | undefined;
  data: Array<GetResult<TContext>> | undefined;
  collection:
    | Collection<GetResult<TContext>, string | number, {}>
    | undefined;
  status: UseLiveQueryStatus;
  isLoading: boolean;
  isReady: boolean;
  isIdle: boolean;
  isError: boolean;
  isCleanedUp: boolean;
  isEnabled: boolean;
};

export function useLiveQueryWithFallback<
  TResult extends object,
  TKey extends string | number,
  TUtils extends Record<string, any>,
>(
  queryFn: (q: InitialQueryBuilder) => Collection<TResult, TKey, TUtils> | undefined | null,
  depsOrOptions?:
    | Array<unknown>
    | UseLiveQueryFallbackOptions<Array<TResult> | undefined>,
  options?: UseLiveQueryFallbackOptions<Array<TResult> | undefined>,
): {
  state: Map<TKey, TResult> | undefined;
  data: Array<TResult> | undefined;
  collection: Collection<TResult, TKey, TUtils> | undefined;
  status: UseLiveQueryStatus;
  isLoading: boolean;
  isReady: boolean;
  isIdle: boolean;
  isError: boolean;
  isCleanedUp: boolean;
  isEnabled: boolean;
};

export function useLiveQueryWithFallback<
  TContext extends Context,
  TResult extends object,
  TKey extends string | number,
  TUtils extends Record<string, any>,
>(
  queryFn: (
    q: InitialQueryBuilder,
  ) =>
    | QueryBuilder<TContext>
    | LiveQueryCollectionConfig<TContext>
    | Collection<TResult, TKey, TUtils>
    | undefined
    | null,
  depsOrOptions?:
    | Array<unknown>
    | UseLiveQueryFallbackOptions<
        Array<GetResult<TContext>> | Array<TResult> | undefined
      >,
  options?:
    | UseLiveQueryFallbackOptions<
        Array<GetResult<TContext>> | Array<TResult> | undefined
      >,
): {
  state:
    | Map<string | number, GetResult<TContext>>
    | Map<TKey, TResult>
    | undefined;
  data: Array<GetResult<TContext>> | Array<TResult> | undefined;
  collection:
    | Collection<GetResult<TContext>, string | number, {}>
    | Collection<TResult, TKey, TUtils>
    | undefined;
  status: UseLiveQueryStatus;
  isLoading: boolean;
  isReady: boolean;
  isIdle: boolean;
  isError: boolean;
  isCleanedUp: boolean;
  isEnabled: boolean;
};

export function useLiveQueryWithFallback<TContext extends Context>(
  config: LiveQueryCollectionConfig<TContext>,
  depsOrOptions?:
    | Array<unknown>
    | UseLiveQueryFallbackOptions<Array<GetResult<TContext>>>,
  options?: UseLiveQueryFallbackOptions<Array<GetResult<TContext>>>,
): {
  state: Map<string | number, GetResult<TContext>>;
  data: Array<GetResult<TContext>>;
  collection: Collection<GetResult<TContext>, string | number, {}>;
  status: CollectionStatus;
  isLoading: boolean;
  isReady: boolean;
  isIdle: boolean;
  isError: boolean;
  isCleanedUp: boolean;
  isEnabled: true;
};

export function useLiveQueryWithFallback<
  TResult extends object,
  TKey extends string | number,
  TUtils extends Record<string, any>,
>(
  liveQueryCollection: Collection<TResult, TKey, TUtils>,
  options?: UseLiveQueryFallbackOptions<Array<TResult>>,
): {
  state: Map<TKey, TResult>;
  data: Array<TResult>;
  collection: Collection<TResult, TKey, TUtils>;
  status: CollectionStatus;
  isLoading: boolean;
  isReady: boolean;
  isIdle: boolean;
  isError: boolean;
  isCleanedUp: boolean;
  isEnabled: true;
};

export function useLiveQueryWithFallback(
  queryOrCollection: unknown,
  depsOrOptions?: Array<unknown> | UseLiveQueryFallbackOptions<unknown>,
  maybeOptions?: UseLiveQueryFallbackOptions<unknown>,
) {
  const hasDeps = Array.isArray(depsOrOptions);
  const deps = hasDeps ? (depsOrOptions as Array<unknown>) : undefined;
  const options = (hasDeps ? maybeOptions : depsOrOptions) as
    | UseLiveQueryFallbackOptions<unknown>
    | undefined;

  const result = useLiveQuery(
    queryOrCollection as Parameters<typeof useLiveQuery>[0],
    ...(deps === undefined ? [] : [deps]),
  );

  if (!result.isReady && options?.initialData !== undefined) {
    return {
      ...result,
      data: options.initialData,
    };
  }

  return result;
}
