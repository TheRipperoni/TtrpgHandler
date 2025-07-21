import { TtrpgDatabase } from '../db'
import { Adventure } from '../db/schema'

export class AdventureNotFound extends Error {}

/**
 * get specified adventure from the TtrpgDatabase
 * @param uri
 * @param cid
 * @param db
 */
export async function getAdventureFromDb(uri: string, cid: string, db: TtrpgDatabase): Promise<Adventure> {
  let res: Adventure[]
  try {
    res = await db
      .selectFrom('adventure')
      .where('uri', 'is', uri)
      .where('cid', 'is', cid)
      .selectAll().execute()
  } catch (e) {
    throw e
  }

  if (res.length != 1) {
    throw new AdventureNotFound()
  }

  return res[0]
}
//
// /**
//  * Cancel Duel
//  * @param cid
//  * @param db
//  */
// export async function cancelDuelFromDB(cid: string, db: TtrpgDatabase) {
//   await db.updateTable('duel')
//     .set({
//       status: 9,
//     })
//     .where('cid', 'is', cid).execute()
// }
//
// /**
//  * Gets characters allocated gold in duels
//  * @param subject
//  * @param db
//  */
// export async function getCharacterAllocatedGold(subject: string,
//   db: TtrpgDatabase,
// ): Promise<number> {
//   const res = await db
//     .selectFrom('duel')
//     .where('player1', 'is', subject)
//     .where('status', 'is', 0)
//     .select('gold').execute()
//   let totalGold: number = 0
//   res.forEach((entry) => totalGold += entry.gold)
//   return totalGold
// }
//
// /**
//  *
//  * @param db
//  * @param opt
//  */
// export async function resolveDuel(
//   db: TtrpgDatabase,
//   opt: {
//     cid: string,
//     winnerDid: string,
//     winnerGold: number,
//     duelGold: number,
//     winnerExperience: number,
//     loserDid: string,
//     loserGold: number,
//     loserExperience: number
//   },
// ) {
//   const {
//     winnerDid,
//     winnerGold,
//     duelGold,
//     winnerExperience,
//     loserDid,
//     loserGold,
//     loserExperience,
//     cid,
//   } = opt
//   await db.transaction().execute(async (trx) => {
//     await trx.updateTable('duel').set({
//       winner: winnerDid,
//       status: 1,
//     }).where('cid', 'is', cid).execute()
//     await trx.updateTable('character')
//       .set({
//         gold: winnerGold + duelGold,
//         experience: winnerExperience + 10,
//       })
//       .where('author', 'is', winnerDid)
//       .execute()
//     await trx.updateTable('character')
//       .set({
//         gold: loserGold - duelGold,
//         experience: loserExperience + 1,
//       })
//       .where('author', 'is', loserDid)
//       .execute()
//   })
// }
//
// export async function resolveJoust(
//   db: TtrpgDatabase,
//   opt: {
//     cid: string,
//     winnerDid: string,
//     winnerGold: number,
//     duelGold: number,
//     winnerExperience: number,
//     loserDid: string,
//     loserGold: number,
//     loserExperience: number
//   },
// ) {
//   const {
//     winnerDid,
//     winnerGold,
//     duelGold,
//     winnerExperience,
//     loserDid,
//     loserGold,
//     loserExperience,
//     cid,
//   } = opt
//   await db.transaction().execute(async (trx) => {
//     await trx.updateTable('duel').set({
//       winner: winnerDid,
//       status: JOUST_RESOLVED,
//     }).where('cid', 'is', cid).execute()
//     await trx.updateTable('character')
//       .set({
//         gold: winnerGold + duelGold,
//         experience: winnerExperience + 50,
//       })
//       .where('author', 'is', winnerDid)
//       .execute()
//     await trx.updateTable('character')
//       .set({
//         gold: loserGold - duelGold,
//         experience: loserExperience + 1,
//       })
//       .where('author', 'is', loserDid)
//       .execute()
//   })
// }
//
// /**
//  *
//  * @param db
//  * @param cid
//  * @param uri
//  */
// export async function updateAdvancedDuelToAccepted(db: TtrpgDatabase, cid: string, uri: string) {
//   await db.updateTable('duel')
//     .set('status', JOUST_ACCEPTED)
//     .where('cid', '=', cid)
//     .where('uri', '=', uri)
//     .execute()
// }
//
// export async function updateJoustWithConvoIDs(db: TtrpgDatabase, cid: string, uri: string, p1ConID,
//   p2ConId,
// ) {
//   await db.updateTable('duel')
//     .set('player1_convo_id', p1ConID)
//     .set('player2_convo_id', p2ConId)
//     .where('cid', '=', cid)
//     .where('uri', '=', uri)
//     .execute()
// }
//
// export async function createDuelInDb(
//   db: TtrpgDatabase,
//   opt: {
//     player1Did: string,
//     player2Did: string,
//     goldAmt: number,
//     cid: string,
//     uri: string,
//     lang: string,
//   },
// ) {
//   const { player1Did, player2Did, goldAmt, cid, uri, lang } = opt
//   const newDuelEntry: Duel = {
//     player1: player1Did,
//     player2: player2Did,
//     winner: null,
//     gold: goldAmt,
//     status: 0,
//     cid: cid,
//     uri: uri,
//     duel_type: 'basic',
//     player1_convo_id: null,
//     player1_convo_choice: null,
//     player2_convo_id: null,
//     player2_convo_choice: null,
//     created_at: new Date().toISOString(),
//     root_uri: null,
//     root_cid: null,
//     lang: lang,
//   }
//
//   await db.insertInto('duel')
//     .values(newDuelEntry)
//     .onConflict((oc) => oc.doNothing())
//     .execute()
// }
//
// export async function fetchOpenDuelsInDb(db: TtrpgDatabase, subject: string): Promise<Duel[]> {
//   let duels: Duel[]
//   duels = await db.selectFrom('duel')
//     .where('player1', 'is', subject)
//     .where('status', 'is', 0).selectAll().execute()
//   return duels
// }
//
// export async function fetchJoustsInProgressInDb(db: TtrpgDatabase,
//   subject: string,
// ): Promise<Duel[]> {
//   let duels: Duel[]
//   duels = await db.selectFrom('duel')
//     .where('player1', 'is', subject)
//     .where('duel_type', 'is', DUEL_TYPE.JOUST)
//     .where('status', 'is', JOUST_ACCEPTED).selectAll().execute()
//   return duels
// }
//
// export async function cancelOutstandingDuels(db: TtrpgDatabase, subject: string): Promise<Duel[]> {
//   let duels: Duel[] = []
//   await db.updateTable('duel')
//     .set('status', 9)
//     .where('player1', 'is', subject)
//     .where('status', 'is', 0)
//     .execute()
//   await db.updateTable('duel')
//     .set('status', 9)
//     .where('player2', 'is', subject)
//     .where('status', 'is', 0)
//     .execute()
//   return duels
// }
//
// export async function cancelAllProposedDuels(db: TtrpgDatabase, subject: string): Promise<Duel[]> {
//   let duels: Duel[] = []
//   await db.updateTable('duel')
//     .set('status', 9)
//     .where('player1', 'is', subject)
//     .where('status', 'in', [0, 3])
//     .execute()
//   return duels
// }
//
// export async function getDuel(db: TtrpgDatabase, uri: string): Promise<Duel[]> {
//   return await db.selectFrom('duel')
//     .where('uri', 'is', uri)
//     .selectAll().execute()
// }
//
// export async function createAdvancedDuelInDb(
//   db: TtrpgDatabase,
//   opt: {
//     player1Did: string,
//     player2Did: string,
//     goldAmt: number,
//     cid: string,
//     uri: string,
//     rootCid: string,
//     rootUri: string,
//     lang: string,
//   },
// ) {
//   const { player1Did, player2Did, goldAmt, cid, uri, rootUri, rootCid, lang } = opt
//   const newDuelEntry: Duel = {
//     player1: player1Did,
//     player2: player2Did,
//     winner: null,
//     gold: goldAmt,
//     status: JOUST_CREATED,
//     cid: cid,
//     uri: uri,
//     duel_type: 'joust',
//     player1_convo_id: null,
//     player1_convo_choice: null,
//     player2_convo_id: null,
//     player2_convo_choice: null,
//     created_at: new Date().toISOString(),
//     root_uri: rootUri,
//     root_cid: rootCid,
//     lang: lang,
//   }
//
//   await db.insertInto('duel')
//     .values(newDuelEntry)
//     .onConflict((oc) => oc.doNothing())
//     .execute()
// }
//
// export async function updatePlayerOneJoustChoiceInDB(db: TtrpgDatabase, cid: string, uri: string,
//   choice: string,
// ) {
//   await db.updateTable('duel')
//     .set('player1_convo_choice', choice)
//     .where('uri', 'is', uri)
//     .where('cid', 'is', cid)
//     .execute()
// }
//
// export async function updatePlayerTwoJoustChoiceInDB(db: TtrpgDatabase, cid: string, uri: string,
//   choice: string,
// ) {
//   await db.updateTable('duel')
//     .set('player2_convo_choice', choice)
//     .where('uri', 'is', uri)
//     .where('cid', 'is', cid)
//     .execute()
// }