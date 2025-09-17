import { live } from '@electric-sql/pglite/live'
import { PGliteWorker } from '@electric-sql/pglite/worker'
import { PgDialect } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/pglite'
import { IDB_NAME } from './settings'
import migrations from '../drizzle/migrations/export.json'
import * as schema from '../drizzle/schema'
import { PGlite } from '@electric-sql/pglite'

export async function initializeDb() {
  const client = await PGliteWorker.create(
    new Worker(new URL('./pglite.worker.ts', import.meta.url), {
      type: 'module'
    }),
    {
      extensions: {
        live
      }
    }
  )
  const db = drizzle(client as unknown as PGlite, { schema })


  try {
    // @ts-expect-error drizzle types
    await new PgDialect().migrate(migrations, db._.session, IDB_NAME)
  } catch (error) {
    console.error(`❌ Local database failed to sync: ${error}`)
  }

  return { db }
}