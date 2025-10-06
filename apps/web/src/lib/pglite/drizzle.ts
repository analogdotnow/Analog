import type {
  CollectionConfig,
  DeleteMutationFnParams,
  InsertMutationFnParams,
  PendingMutation,
  SyncConfig,
  UpdateMutationFnParams,
} from "@tanstack/react-db";
import { eq, inArray } from "drizzle-orm";
import type { IndexColumn, PgTable } from "drizzle-orm/pg-core";
import type { PgliteDatabase } from "drizzle-orm/pglite";

type ParseFn<TRecord, TItem> = (record: TRecord) => TItem;
type SerializeFn<TItem, TRecord> = (item: TItem) => TRecord;

export function drizzleCollectionOptions<
  Table extends PgTable,
  TRecord extends Table["$inferSelect"],
  TItem extends object = TRecord,
>({
  startSync = true,
  ...config
}: {
  id?: string;
  // schema?: StandardSchemaV1
  getKey: (item: TItem) => string | number;
  sync?: SyncConfig<TItem, string>["sync"];
  rowUpdateMode?: "partial" | "full";

  db: PgliteDatabase<Record<string, unknown>>;
  table: Table;
  primaryColumn: IndexColumn;

  onInsert?: (params: InsertMutationFnParams<TItem, string>) => Promise<void>;
  onUpdate?: (params: UpdateMutationFnParams<TItem, string>) => Promise<void>;
  onDelete?: (params: DeleteMutationFnParams<TItem, string>) => Promise<void>;
  startSync?: boolean;
  prepare?: () => Promise<void> | void;
  parse?: ParseFn<TRecord, TItem>;
  serialize?: SerializeFn<TItem, TRecord>;
}): CollectionConfig<TItem, string> & {
  utils: {
    runSync: () => Promise<void>;
  };
} {
  type SyncParams = Parameters<SyncConfig<TItem, string>["sync"]>[0];

  // Sync params can be null while running PGLite migrations
  const { promise: syncParams, resolve: resolveSyncParams } =
    Promise.withResolvers<SyncParams>();

  const parse: ParseFn<TRecord, TItem> =
    config.parse ?? ((value) => value as unknown as TItem);

  const serialize: SerializeFn<TItem, TRecord> =
    config.serialize ?? ((value) => value as unknown as TRecord);

  const normalizeForCollection = (
    value: TItem,
  ): {
    serialized: TRecord;
    parsed: TItem;
  } => {
    const serialized = serialize(value);

    return {
      serialized,
      parsed: parse(serialized),
    };
  };

  async function runMutations(
    mutations: PendingMutation<TItem>[],
  ): Promise<void> {
    const { begin, write, commit } = await syncParams;
    begin();
    mutations.forEach((m) => {
      write({ type: m.type, value: normalizeForCollection(m.modified).parsed });
    });
    commit();
  }

  async function onDrizzleInsert(data: Array<TRecord>): Promise<void> {
    await config.db.insert(config.table).values(data).onConflictDoNothing();
  }

  async function onDrizzleUpdate(id: string, record: TRecord): Promise<void> {
    await config.db
      .update(config.table)
      .set(record)
      .where(eq(config.primaryColumn, id));
  }

  async function onDrizzleDelete(ids: string[]): Promise<void> {
    await config.db
      .delete(config.table)
      .where(inArray(config.primaryColumn, ids));
  }

  const getSyncParams = async (): Promise<
    Pick<SyncParams, "write" | "collection">
  > => {
    const params = await syncParams;

    return {
      write: async (p) => {
        params.begin();
        try {
          const normalized = normalizeForCollection(p.value as TItem);
          const previousNormalized = p.previousValue
            ? normalizeForCollection(p.previousValue as TItem)
            : undefined;

          if (p.type === "insert") {
            await onDrizzleInsert([normalized.serialized]);
          } else if (p.type === "update") {
            await onDrizzleUpdate(
              params.collection.getKeyFromItem(normalized.parsed),
              normalized.serialized,
            );
          } else if (p.type === "delete") {
            await onDrizzleDelete([
              params.collection.getKeyFromItem(normalized.parsed),
            ]);
          }

          try {
            params.write({
              ...p,
              value: normalized.parsed,
              previousValue: previousNormalized?.parsed,
            });
          } catch {
            // ignore
          }
        } finally {
          params.commit();
        }
      },
      collection: params.collection,
    };
  };

  return {
    startSync: true,
    sync: {
      sync: async (params) => {
        try {
          resolveSyncParams(params);
          await config.prepare?.();
          params.begin();
          // @ts-expect-error drizzle types
          const dbs = await config.db.select().from(config.table);
          dbs.forEach((db) => {
            params.write({
              type: "insert",
              value: parse(db as TRecord),
            });
          });
          params.commit();
          if (config.sync && startSync) {
            // @ts-expect-error drizzle types
            await config.sync(await getSyncParams());
          }
        } finally {
          params.markReady();
        }
      },
    },
    gcTime: 0,
    // schema: createSelectSchema(config.table) as StandardSchemaV1,
    getKey: (t) => String(config.getKey(t)),
    onDelete: async (params) => {
      await onDrizzleDelete(params.transaction.mutations.map((m) => m.key));
      const result = await config.onDelete?.(params);
      await runMutations(params.transaction.mutations);
      return result;
    },
    onInsert: async (params) => {
      await onDrizzleInsert(
        params.transaction.mutations.map((m) => serialize(m.modified)),
      );
      const result = await config.onInsert?.(params);
      await runMutations(params.transaction.mutations);
      return result;
    },
    onUpdate: async (params) => {
      await Promise.all(
        params.transaction.mutations.map((m) =>
          onDrizzleUpdate(m.key, serialize(m.modified)),
        ),
      );
      const result = await config.onUpdate?.(params);
      await runMutations(params.transaction.mutations);
      return result;
    },
    utils: {
      runSync: async () => {
        const params = await getSyncParams();

        if (!config.sync) {
          return;
        }

        // To wait the first sync
        await params.collection.stateWhenReady();

        // @ts-expect-error drizzle types
        await config.sync(params);
      },
    },
  };
}
