import { Character, Reroll } from '../db/schema'
import { TtrpgDatabase } from '../db'

export class CharacterAlreadyExistsError extends Error {}
export class CharacterNotFoundError extends Error {}

export async function createCharacterDB(
  db: TtrpgDatabase,
  opts: {
    subject: string, charClass: string,
    gold: number, level: number, experience: number, status: number
  },
): Promise<Character> {
  const { subject, charClass, gold, level, experience, status } = opts
  const newEntry: Character = {
    ancestry: null,
    class: charClass,
    author: subject,
    gold: gold,
    level: level,
    experience: experience,
    status: status,
    secondary_class: null,
  }

  const res = await db.insertInto('character')
    .values(newEntry)
    .onConflict((oc) => oc.doNothing())
    .execute()

  if (!res) {
    throw new CharacterAlreadyExistsError()
  }
  return newEntry
}

/**
 * Returns null if character not found
 * @param db
 * @param subject
 */
export async function getCharacterFromDB(db: TtrpgDatabase, subject: string): Promise<Character> {
  const result: Character[] = await db.selectFrom('character')
    .where('author', 'is', subject)
    .selectAll()
    .execute()
  if (result.length !== 1) {
    throw new CharacterNotFoundError()
  }
  return result[0]
}

export async function levelUpCharInDB(db: TtrpgDatabase, subject: string, level: number) {
  await db.updateTable('character')
    .set('level', level + 1)
    .where('author', 'is', subject)
    .execute()
}

export async function transferGoldInDB(db: TtrpgDatabase, donorDid: string, recipientDid, goldAmt: number) {
  await db.transaction().execute(async (trx) => {
    await trx.updateTable('character')
      .set((eb) => ({
        gold: eb('gold', '-', goldAmt)
      }))
      .where('author', 'is', donorDid)
      .execute()
    await trx.updateTable('character')
      .set((eb) => ({
        gold: eb('gold', '+', goldAmt)
      }))
      .where('author', 'is', recipientDid)
      .execute()
  })
}

export async function deactivateCharInDb(db: TtrpgDatabase, subject: string) {
  await db.updateTable('character')
    .set('status', 9)
    .where('author', 'is', subject)
    .execute()
}

export async function reactivateCharInDb(db: TtrpgDatabase, subject: string) {
  await db.updateTable('character')
    .set('status', 1)
    .where('author', 'is', subject)
    .execute()
}

export async function chooseAncestryForCharacter(db: TtrpgDatabase, subject: string,
  chosenAncestry: string,
) {
  await db.updateTable('character')
    .set('ancestry', chosenAncestry)
    .where('author', 'is', subject)
    .execute()
}

export async function updateSecondaryClassForCharacter(db: TtrpgDatabase, subject: string,
  chosenClass: string,
) {
  await db.updateTable('character')
    .set('secondary_class', chosenClass)
    .where('author', 'is', subject)
    .execute()
}

export async function fetchRerollsFromDB(db: TtrpgDatabase, subject: string): Promise<Reroll[]> {
  let res: Reroll[]
  res = await db
    .selectFrom('reroll')
    .where('author', 'is', subject)
    .selectAll().execute()
  return res
}

export async function insertRerollAttemptIntoDB(
  db: TtrpgDatabase,
  opt: {
    subject: string,
    existingLabel: string,
    newLabel: string,
    cid: string
  },
) {
  const newEntry = {
    author: opt.subject, original_class: opt.existingLabel, new_class: opt.newLabel, cid: opt.cid,
  }

  try {
    await db.insertInto('reroll')
      .values(newEntry)
      .onConflict((oc) => oc.doNothing())
      .execute()
  } catch (e) {
    return false
  }

  return true
}

export async function updateCharacterClass(db: TtrpgDatabase, subject: string, rpgClass: string) {
    await db.updateTable('character')
      .set('class', rpgClass)
      .where('author', '=', subject)
      .execute()
}