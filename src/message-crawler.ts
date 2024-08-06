import { Duel } from './db/schema'
import {
  DUEL_TYPE,
  JOUST_ACCEPTED,
} from './db/constants'
import { BskyAgent } from '@atproto/api'
import { TtrpgDatabase } from './db'
import { DuelManager } from './services/duel-service'
import { logger } from './util/logger'
import { CharacterManager } from './services/character-service'

export class MessageCrawler {
  private characterManager: CharacterManager
  private duelManager: DuelManager

  constructor(
    private agent: BskyAgent,
    private db: TtrpgDatabase
  ) {
    this.characterManager = new CharacterManager(db, agent)
    this.duelManager = new DuelManager(db, agent, this.characterManager)
  }

  async run() {
    while (true) {
      await new Promise(f => setTimeout(f, 10000))
      await this.crawl()
    }
  }

  async crawl() {
    return this.checkActiveJousts()
  }

  async checkActiveJousts() {
    const activeJousts: Duel[] = await this.db.selectFrom('duel').selectAll()
      .where('duel_type', '=', DUEL_TYPE.JOUST)
      .where('status', '=', JOUST_ACCEPTED).execute()

    for (const activeJoust of activeJousts) {
      this.duelManager.processJoustMessages(activeJoust).then(() => {
        this.duelManager.resolveJoust(activeJoust).catch((e) => {
          logger.error(
            `Error occurred from joust crawler\nError: ${e.toString()}`)
        })
      }).catch((e) => {
        logger.error(
          `Error occurred from duel manager with joust uri ${activeJoust.uri}\nError: ${e.toString()}`)
      })
    }
  }
}
