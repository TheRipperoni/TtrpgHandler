import { Kysely, Migration, MigrationProvider } from 'kysely'
import { TtrpgSchema } from './schema'

const migrations: Record<string, Migration> = {}

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations
  },
}

migrations['001'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('reroll')
      .addColumn('cid', 'varchar', (col) => col.primaryKey())
      .addColumn('author', 'varchar', (col) => col.notNull())
      .addColumn('original_class', 'varchar', (col) => col.notNull())
      .addColumn('new_class', 'varchar', (col) => col.notNull())
      .execute()
    await db.schema
      .createTable('sub_state')
      .addColumn('service', 'varchar', (col) => col.primaryKey())
      .addColumn('cursor', 'integer', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('reroll').execute()
    await db.schema.dropTable('sub_state').execute()
  },
}

migrations['002'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('character')
      .addColumn('author', 'varchar', (col) => col.primaryKey())
      .addColumn('gold', 'integer', (col) => col.notNull())
      .addColumn('level', 'integer', (col) => col.notNull())
      .addColumn('experience', 'integer', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('character').execute()
  },
}

migrations['003'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('duel')
      .addColumn('player1', 'varchar', (col) => col.notNull())
      .addColumn('player2', 'varchar', (col) => col.notNull())
      .addColumn('status', 'integer', (col) => col.notNull())
      .addColumn('cid', 'varchar', (col) => col.primaryKey())
      .addColumn('winner', 'varchar')
      .addColumn('gold', 'integer', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('duel').execute()
  },
}

migrations['004'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .alterTable('duel')
      .addColumn('uri', 'varchar')
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.alterTable('duel').dropColumn('uri').execute()
  },
}

migrations['005'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('ancestry')
      .addColumn('name', 'varchar', (col) => col.primaryKey())
      .addColumn('description', 'varchar', (col) => col.notNull())
      .execute()
    await db.schema
      .alterTable('character')
      .addColumn('ancestry', 'varchar')
      .execute()
    await db.schema
      .alterTable('character')
      .addColumn('class', 'varchar')
      .execute()
    await db.schema
      .createTable('class')
      .addColumn('name', 'varchar', (col) => col.primaryKey())
      .addColumn('description', 'varchar', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema
      .alterTable('character')
      .dropColumn('ancestry')
      .execute()
    await db.schema
      .alterTable('character')
      .dropColumn('class')
      .execute()
    await db.schema
      .dropTable('ancestry')
      .execute()
    await db.schema
      .dropTable('class')
      .execute()
  },
}

migrations['006'] = {
  async up(db: Kysely<TtrpgSchema>) {
    await db.schema
      .alterTable('character')
      .addColumn('status', 'integer', (col) => col.notNull().defaultTo(1))
      .execute()
  },
  async down(db: Kysely<TtrpgSchema>) {
    await db.schema
      .alterTable('character')
      .dropColumn('status')
      .execute()
  },
}

migrations['007'] = {
  async up(db: Kysely<TtrpgSchema>) {
    await db.schema
      .alterTable('character')
      .addColumn('secondary_class', 'varchar')
      .execute()
    await db.schema
      .alterTable('duel')
      .addColumn('duel_type', 'varchar')
      .execute()
    await db.schema
      .alterTable('duel')
      .addColumn('player1_convo_id', 'varchar')
      .execute()
    await db.schema
      .alterTable('duel')
      .addColumn('player1_convo_choice', 'varchar')
      .execute()
    await db.schema
      .alterTable('duel')
      .addColumn('player2_convo_id', 'varchar')
      .execute()
    await db.schema
      .alterTable('duel')
      .addColumn('player2_convo_choice', 'varchar')
      .execute()
    await db.schema
      .alterTable('duel')
      .addColumn('root_uri', 'varchar')
      .execute()
    await db.schema
      .alterTable('duel')
      .addColumn('root_cid', 'varchar')
      .execute()
    await db.schema
      .alterTable('duel')
      .addColumn('created_at', 'varchar')
      .execute()
  },
  async down(db: Kysely<TtrpgSchema>) {
    await db.schema
      .alterTable('character')
      .dropColumn('secondary_class')
      .execute()
    await db.schema
      .alterTable('duel')
      .dropColumn('duel_type')
      .execute()
    await db.schema
      .alterTable('duel')
      .dropColumn('player1_convo_id')
      .execute()
    await db.schema
      .alterTable('duel')
      .dropColumn('player1_convo_choice')
      .execute()
    await db.schema
      .alterTable('duel')
      .dropColumn('player2_convo_id')
      .execute()
    await db.schema
      .alterTable('duel')
      .dropColumn('player2_convo_choice')
      .execute()
    await db.schema
      .alterTable('duel')
      .dropColumn('created_at')
      .execute()
  },
}

migrations['008'] = {
  async up(db: Kysely<TtrpgSchema>) {
    await db.schema
      .alterTable('duel')
      .addColumn('lang', 'varchar')
      .execute()
  },
  async down(db: Kysely<TtrpgSchema>) {
    await db.schema
      .alterTable('duel')
      .dropColumn('lang')
      .execute()
  },
}

migrations['009'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('questing_party')
      .addColumn('party_id', 'varchar', (col) => col.primaryKey())
      .addColumn('party_leader', 'varchar', (col) => col.notNull())
      .addColumn('party_size', 'integer', (col) => col.notNull())
      .execute()
    await db.schema
      .createTable('questing_party_invite')
      .addColumn('invite_id', 'varchar', (col) => col.primaryKey())
      .addColumn('party_id', 'varchar', (col) => col.notNull())
      .addColumn('character', 'varchar', (col) => col.notNull())
      .addColumn('status', 'integer', (col) => col.notNull())
      .execute()
    await db.schema
      .createTable('questing_party_member')
      .addColumn('party_id', 'varchar', (col) => col.notNull())
      .addColumn('character', 'varchar', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('questing_party').execute()
    await db.schema.dropTable('questing_party_member').execute()
    await db.schema.dropTable('questing_party_invite').execute()
  },
}

migrations['010'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('adventure')
      .addColumn('adventure_id', 'varchar', (col) => col.primaryKey())
      .addColumn('uri', 'varchar', (col) => col.notNull())
      .addColumn('cid', 'varchar', (col) => col.notNull())
      .addColumn('status', 'varchar', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('adventure').execute()
  },
}