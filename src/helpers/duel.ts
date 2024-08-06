import { TtrpgDatabase } from '../db'
import { Duel } from '../db/schema'
import { DUEL_TYPE, JOUST_ACCEPTED, JOUST_CREATED, JOUST_RESOLVED } from '../db/constants'

export enum JOUST_OPTION {
  THRUST = 'thrust',
  FIREBALL = 'fireball',
  CURSE = 'curse',
}

// credits to julia
export const JOUST_OPTION_CLASS_TRANSLATIONS = {
  thrust: {
    'alchemist': 'alchemical bomb',
    'barbarian': 'club opponent',
    'bard': 'shortbow arrow',
    'champion': 'divine smite',
    'cleric': 'harming hands',
    'druid': 'transform and attack',
    'fighter': 'power attack',
    'monk': 'masterful strike',
    'witch': 'lightning bolt',
    'wizard': 'lightning storm',
    'rogue': 'sneak attack',
    'ranger': 'blade flurry',
    'sorcerer': 'shadow bolt',
    'psychic': 'weak strike',
    'kineticist': 'elemental blast',
    'summoner': 'clawed companion',
    'oracle': 'future sight',
    'investigator': 'deceptic blow',
    'magus': 'arcane fists',
    'swashbuckler': 'exemplary attack',
    'thaumaturge': 'summon familiar',
  },
  fireball: {
    'alchemist': 'poison dart',
    'barbarian': 'furious blow',
    'bard': 'dirge of doom',
    'champion': 'touch of corruption',
    'cleric': 'channel smite',
    'druid': 'summon animal companion',
    'fighter': 'point blank shot',
    'monk': 'ki strike',
    'witch': 'hex',
    'wizard': 'fireball',
    'rogue': 'stealth shot',
    'ranger': 'crossbow',
    'sorcerer': 'arcane bolt',
    'psychic': 'psi burst',
    'kineticist': 'critical blast',
    'summoner': 'flying companion',
    'oracle': 'thunderbolt',
    'investigator': 'well planned trap',
    'magus': 'devestating spellstrike',
    'swashbuckler': 'decisive parry',
    'thaumaturge': 'spout esoteric lore',
  },
  curse: {
    'alchemist': 'mutagen strike',
    'barbarian': 'overhead smash',
    'bard': 'vicious mockery',
    'champion': 'cruel vengeance',
    'cleric': 'sap life',
    'druid': 'tap into nature',
    'fighter': 'snagging strike',
    'monk': 'elemental fist',
    'witch': 'curse',
    'wizard': 'ice spear',
    'rogue': 'poisoned blade',
    'ranger': 'quick shot',
    'sorcerer': 'lava plume',
    'psychic': 'brain drain',
    'kineticist': 'impulsive blast',
    'summoner': 'toxic companion',
    'oracle': 'fireball',
    'investigator': 'occultic ritual',
    'magus': 'shooting star',
    'swashbuckler': 'demoralize',
    'thaumaturge': 'exploit vulnerability',
  },
}

export class DuelNotFound extends Error {}

/**
 * get specified duel from the TtrpgDatabase
 * @param cid
 * @param db
 */
export async function getDuelFromDB(cid: string, db: TtrpgDatabase): Promise<Duel> {
  let res: Duel[]
  try {
    res = await db
      .selectFrom('duel')
      .where('cid', 'is', cid)
      .selectAll().execute()
  } catch (e) {
    throw e
  }

  if (res.length != 1) {
    throw new DuelNotFound()
  }

  return res[0]
}

/**
 * Cancel Duel
 * @param cid
 * @param db
 */
export async function cancelDuelFromDB(cid: string, db: TtrpgDatabase) {
  await db.updateTable('duel')
    .set({
      status: 9,
    })
    .where('cid', 'is', cid).execute()
}

/**
 * Gets characters allocated gold in duels
 * @param subject
 * @param db
 */
export async function getCharacterAllocatedGold(subject: string,
  db: TtrpgDatabase,
): Promise<number> {
  const res = await db
    .selectFrom('duel')
    .where('player1', 'is', subject)
    .where('status', 'is', 0)
    .select('gold').execute()
  let totalGold: number = 0
  res.forEach((entry) => totalGold += entry.gold)
  return totalGold
}

/**
 *
 * @param db
 * @param opt
 */
export async function resolveDuel(
  db: TtrpgDatabase,
  opt: {
    cid: string,
    winnerDid: string,
    winnerGold: number,
    duelGold: number,
    winnerExperience: number,
    loserDid: string,
    loserGold: number,
    loserExperience: number
  },
) {
  const {
    winnerDid,
    winnerGold,
    duelGold,
    winnerExperience,
    loserDid,
    loserGold,
    loserExperience,
    cid,
  } = opt
  await db.transaction().execute(async (trx) => {
    await trx.updateTable('duel').set({
      winner: winnerDid,
      status: 1,
    }).where('cid', 'is', cid).execute()
    await trx.updateTable('character')
      .set({
        gold: winnerGold + duelGold,
        experience: winnerExperience + 10,
      })
      .where('author', 'is', winnerDid)
      .execute()
    await trx.updateTable('character')
      .set({
        gold: loserGold - duelGold,
        experience: loserExperience + 1,
      })
      .where('author', 'is', loserDid)
      .execute()
  })
}

export async function resolveJoust(
  db: TtrpgDatabase,
  opt: {
    cid: string,
    winnerDid: string,
    winnerGold: number,
    duelGold: number,
    winnerExperience: number,
    loserDid: string,
    loserGold: number,
    loserExperience: number
  },
) {
  const {
    winnerDid,
    winnerGold,
    duelGold,
    winnerExperience,
    loserDid,
    loserGold,
    loserExperience,
    cid,
  } = opt
  await db.transaction().execute(async (trx) => {
    await trx.updateTable('duel').set({
      winner: winnerDid,
      status: JOUST_RESOLVED,
    }).where('cid', 'is', cid).execute()
    await trx.updateTable('character')
      .set({
        gold: winnerGold + duelGold,
        experience: winnerExperience + 50,
      })
      .where('author', 'is', winnerDid)
      .execute()
    await trx.updateTable('character')
      .set({
        gold: loserGold - duelGold,
        experience: loserExperience + 1,
      })
      .where('author', 'is', loserDid)
      .execute()
  })
}

/**
 *
 * @param db
 * @param cid
 * @param uri
 */
export async function updateAdvancedDuelToAccepted(db: TtrpgDatabase, cid: string, uri: string) {
  await db.updateTable('duel')
    .set('status', JOUST_ACCEPTED)
    .where('cid', '=', cid)
    .where('uri', '=', uri)
    .execute()
}

export async function updateJoustWithConvoIDs(db: TtrpgDatabase, cid: string, uri: string, p1ConID,
  p2ConId,
) {
  await db.updateTable('duel')
    .set('player1_convo_id', p1ConID)
    .set('player2_convo_id', p2ConId)
    .where('cid', '=', cid)
    .where('uri', '=', uri)
    .execute()
}

export async function createDuelInDb(
  db: TtrpgDatabase,
  opt: {
    player1Did: string,
    player2Did: string,
    goldAmt: number,
    cid: string,
    uri: string
  },
) {
  const { player1Did, player2Did, goldAmt, cid, uri } = opt
  const newDuelEntry: Duel = {
    player1: player1Did,
    player2: player2Did,
    winner: null,
    gold: goldAmt,
    status: 0,
    cid: cid,
    uri: uri,
    duel_type: 'basic',
    player1_convo_id: null,
    player1_convo_choice: null,
    player2_convo_id: null,
    player2_convo_choice: null,
    created_at: new Date().toISOString(),
    root_uri: null,
    root_cid: null,
  }

  await db.insertInto('duel')
    .values(newDuelEntry)
    .onConflict((oc) => oc.doNothing())
    .execute()
}

export async function fetchOpenDuelsInDb(db: TtrpgDatabase, subject: string): Promise<Duel[]> {
  let duels: Duel[]
  duels = await db.selectFrom('duel')
    .where('player1', 'is', subject)
    .where('status', 'is', 0).selectAll().execute()
  return duels
}

export async function fetchJoustsInProgressInDb(db: TtrpgDatabase,
  subject: string,
): Promise<Duel[]> {
  let duels: Duel[]
  duels = await db.selectFrom('duel')
    .where('player1', 'is', subject)
    .where('duel_type', 'is', DUEL_TYPE.JOUST)
    .where('status', 'is', JOUST_ACCEPTED).selectAll().execute()
  return duels
}

export async function cancelOutstandingDuels(db: TtrpgDatabase, subject: string): Promise<Duel[]> {
  let duels: Duel[] = []
  await db.updateTable('duel')
    .set('status', 9)
    .where('player1', 'is', subject)
    .where('status', 'is', 0)
    .execute()
  await db.updateTable('duel')
    .set('status', 9)
    .where('player2', 'is', subject)
    .where('status', 'is', 0)
    .execute()
  return duels
}

export async function cancelAllProposedDuels(db: TtrpgDatabase, subject: string): Promise<Duel[]> {
  let duels: Duel[] = []
  await db.updateTable('duel')
    .set('status', 9)
    .where('player1', 'is', subject)
    .where('status', 'in', [0, 3])
    .execute()
  return duels
}

export async function createAdvancedDuelInDb(
  db: TtrpgDatabase,
  opt: {
    player1Did: string,
    player2Did: string,
    goldAmt: number,
    cid: string,
    uri: string,
    rootCid: string,
    rootUri: string,
  },
) {
  const { player1Did, player2Did, goldAmt, cid, uri, rootUri, rootCid } = opt
  const newDuelEntry: Duel = {
    player1: player1Did,
    player2: player2Did,
    winner: null,
    gold: goldAmt,
    status: JOUST_CREATED,
    cid: cid,
    uri: uri,
    duel_type: 'joust',
    player1_convo_id: null,
    player1_convo_choice: null,
    player2_convo_id: null,
    player2_convo_choice: null,
    created_at: new Date().toISOString(),
    root_uri: rootUri,
    root_cid: rootCid,
  }

  await db.insertInto('duel')
    .values(newDuelEntry)
    .onConflict((oc) => oc.doNothing())
    .execute()
}

export async function updatePlayerOneJoustChoiceInDB(db: TtrpgDatabase, cid: string, uri: string,
  choice: string,
) {
  await db.updateTable('duel')
    .set('player1_convo_choice', choice)
    .where('uri', 'is', uri)
    .where('cid', 'is', cid)
    .execute()
}

export async function updatePlayerTwoJoustChoiceInDB(db: TtrpgDatabase, cid: string, uri: string,
  choice: string,
) {
  await db.updateTable('duel')
    .set('player2_convo_choice', choice)
    .where('uri', 'is', uri)
    .where('cid', 'is', cid)
    .execute()
}