import type {
  CollectionConfig,
  DeleteMutationFnParams,
  InsertMutationFnParams,
  PendingMutation,
  SyncConfig,
  UpdateMutationFnParams,
} from '@tanstack/db'
import type { IndexColumn, PgTable } from 'drizzle-orm/pg-core'
import type { PgliteDatabase } from 'drizzle-orm/pglite'
import { eq, inArray } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'

export function drizzleCollectionOptions<Table extends PgTable>({
  startSync = true,
  ...config
}: {
  // eslint-disable-next-line ts/no-explicit-any
  db: PgliteDatabase<any>
  table: Table
  primaryColumn: IndexColumn
  onInsert?: (params: InsertMutationFnParams<Table['$inferSelect'], string>) => Promise<void>
  onUpdate?: (params: UpdateMutationFnParams<Table['$inferSelect'], string>) => Promise<void>
  onDelete?: (params: DeleteMutationFnParams<Table['$inferSelect'], string>) => Promise<void>
  startSync?: boolean
  // eslint-disable-next-line ts/no-explicit-any
  prepare?: () => Promise<any> | any
  sync: (
    params: Pick<
      Parameters<SyncConfig<Table['$inferSelect'], string>['sync']>[0],
      'write' | 'collection'
    >
  ) => Promise<void>
}): CollectionConfig<Table['$inferSelect'], string> & {
  utils: {
    runSync: () => Promise<void>
  }
} {
  type SyncParams = Parameters<SyncConfig<Table['$inferSelect'], string>['sync']>[0]

  // Sync params can be null while running PGLite migrations
  const { promise: syncParams, resolve: resolveSyncParams }
    = Promise.withResolvers<SyncParams>()

  async function runMutations(mutations: PendingMutation[]): Promise<void> {
    const { begin, write, commit } = await syncParams
    begin()
    mutations.forEach((m) => {
      write({ type: m.type, value: m.modified })
    })
    commit()
  }

  async function onDrizzleInsert(data: (typeof config.table.$inferInsert)[]): Promise<void> {
    // @ts-expect-error drizzle types
    await config.db.insert(config.table).values(data).onConflictDoNothing()
  }

  async function onDrizzleUpdate(id: string, changes: Partial<typeof config.table.$inferSelect>): Promise<void> {
    await config.db
      .update(config.table)
      .set(changes)
      .where(eq(config.primaryColumn, id))
  }

  async function onDrizzleDelete(ids: string[]): Promise<void> {
    await config.db
      .delete(config.table)
      .where(inArray(config.primaryColumn, ids))
  }

  const getSyncParams = async (): Promise<Pick<SyncParams, 'write' | 'collection'>> => {
    const params = await syncParams

    return {
      write: async (p) => {
        params.begin()
        try {
          if (p.type === 'insert') {
            await onDrizzleInsert([p.value])
          }
          else if (p.type === 'update') {
            await onDrizzleUpdate(
              params.collection.getKeyFromItem(p.value),
              p.value,
            )
          }
          else if (p.type === 'delete') {
            await onDrizzleDelete([params.collection.getKeyFromItem(p.value)])
          }

          console.log("SYNCING", p.type);
          try {
            params.write(p)
          } catch (error) {
          }
        }
        finally {
          params.commit()
        }
      },
      collection: params.collection,
    }
  }

  return {
    startSync: true,
    sync: {
      sync: async (params) => {
        try {
          resolveSyncParams(params)
          await config.prepare?.()
          params.begin()
          // @ts-expect-error drizzle types
          const dbs = await config.db.select().from(config.table)
          dbs.forEach((db) => {
            
            params.write({ type: 'insert', value: db })
          })
          params.commit()
          if (config.sync && startSync) {
            await config.sync(await getSyncParams())
          }
        }
        finally {
          params.markReady()
        }
      },
    },
    gcTime: 0,
    schema: createSelectSchema(config.table),
    getKey: t => t[config.primaryColumn.name] as string,
    onDelete: async (params) => {
      await onDrizzleDelete(params.transaction.mutations.map(m => m.key))
      const result = await config.onDelete?.(params)
      await runMutations(params.transaction.mutations)
      return result
    },
    onInsert: async (params) => {
      await onDrizzleInsert(
        params.transaction.mutations.map(m => m.modified),
      )
      const result = await config.onInsert?.(params)
      await runMutations(params.transaction.mutations)
      return result
    },
    onUpdate: async (params) => {
      await Promise.all(
        params.transaction.mutations.map(m =>
          onDrizzleUpdate(m.key, m.changes),
        ),
      )
      const result = await config.onUpdate?.(params)
      await runMutations(params.transaction.mutations)
      return result
    },
    utils: {
      runSync: async () => {
        const params = await getSyncParams()

        // To wait the first sync
        await params.collection.stateWhenReady()

        await config.sync(params)
      },
    },
  }
}