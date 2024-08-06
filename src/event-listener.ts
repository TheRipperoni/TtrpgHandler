import {
  createFirehoseDb,
  createTtrpgDb,
  FirehoseDatabase,
  migrateTtrpgToLatest,
  TtrpgDatabase,
} from './db'
import { Config } from './config'
import { getAgent } from './agent'
import { EventHandler } from './event-handler'
import { EventCrawler } from './event-crawler'
import { DailyAllowance } from './daily-allowance'
import { logger } from './util/logger'
import { MessageCrawler } from './message-crawler'

export class TtrpgEventListener {
  constructor(
    private ttrpgDb: TtrpgDatabase,
    private firehoseDb: FirehoseDatabase,
    private cfg: Config,
    private handler: EventHandler,
    private crawler: EventCrawler,
    private dailyAllowanceJob: DailyAllowance,
    private messageCrawler: MessageCrawler
  ) {}

  static async create(cfg: Config) {
    const ttrpgDb = createTtrpgDb(cfg.ttrpgSqliteLocation)
    const firehoseDb = createFirehoseDb(cfg.firehoseSqliteLocation)
    const dailyAllowanceJob = new DailyAllowance(ttrpgDb)
    const agent = await getAgent()
    const handler = new EventHandler(ttrpgDb, agent)
    const crawler = new EventCrawler(firehoseDb, handler)
    const messageCrawler = new MessageCrawler(agent, ttrpgDb)
    return new TtrpgEventListener(ttrpgDb, firehoseDb, cfg, handler, crawler, dailyAllowanceJob, messageCrawler)
  }

  async start() {
    await migrateTtrpgToLatest(this.ttrpgDb)
    this.dailyAllowanceJob.run().catch((e) => {
      logger.error(`Daily Allowance Job Has Crashed: ${e.toString()}`)
    })
    this.crawler.run().catch((e) => {
      logger.error(`Event Crawler Job Has Crashed: ${e.toString()}`)
    })
    this.messageCrawler.run().catch((e) => {
      logger.error(`Message Crawler Job Has Crashed: ${e.toString()}`)
    })
  }
}

export default TtrpgEventListener
