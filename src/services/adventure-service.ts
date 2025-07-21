import { Adventure } from '../db/schema'

import { TtrpgDatabase } from '../db'
import { getAdventureFromDb } from '../helpers/adventure'

export class AdventureManager {
  constructor(
    private db: TtrpgDatabase,
  ) {}

  /**
   * get specified adventure from the database
   * @param uri
   * @param cid
   */
  async getAdventure(uri: string | undefined, cid: string | undefined): Promise<Adventure> {
    if (cid === undefined || uri === undefined) {
      throw new Error('dnr')
    }

    return getAdventureFromDb(uri, cid, this.db)
  }

  async voteOnAction() {

  }

  async takeAction() {

  }

  async initCombat() {

  }

  async takeActionInCombat() {

  }
}


