import SqliteDb from 'better-sqlite3'
import { Kysely, Migrator, SqliteDialect } from 'kysely'
import { migrationProvider } from './migrations'
import { FirehoseSchema, TtrpgSchema } from './schema'

export const createTtrpgDb = (location: string): TtrpgDatabase => {
  return new Kysely<TtrpgSchema>({
    dialect: new SqliteDialect({
      database: new SqliteDb(location),
    }),
  })
}

export const createFirehoseDb = (location: string): FirehoseDatabase => {
  return new Kysely<FirehoseSchema>({
    dialect: new SqliteDialect({
      database: new SqliteDb(location),
    }),
  })
}

export const migrateTtrpgToLatest = async (db: TtrpgDatabase) => {
  const migrator = new Migrator({ db, provider: migrationProvider })
  const { error } = await migrator.migrateToLatest()
  if (error) throw error
}

export const migrateFirehoseToLatest = async (db: TtrpgDatabase) => {
  const migrator = new Migrator({ db, provider: migrationProvider })
  const { error } = await migrator.migrateToLatest()
  if (error) throw error
}

export type TtrpgDatabase = Kysely<TtrpgSchema>
export type FirehoseDatabase = Kysely<FirehoseSchema>
export class Database {
}