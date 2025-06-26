import { useEffect } from "react";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { QueryClient } from "@tanstack/react-query";
import {
  persistQueryClient,
  removeOldestQuery,
} from "@tanstack/react-query-persist-client";

import { superjson } from "./superjson";

export function usePersistQueryClient(queryClient: QueryClient) {
  useEffect(() => {
    const localStoragePersister = createSyncStoragePersister({
      storage: window.localStorage,
      throttleTime: 1000,
      retry: removeOldestQuery,
      serialize: (data) => superjson.stringify(data),
      deserialize: (data) => superjson.parse(data),
    });

    persistQueryClient({
      queryClient,
      persister: localStoragePersister,
      maxAge: 60 * 60 * 24,
    });
  }, [queryClient]);
}
