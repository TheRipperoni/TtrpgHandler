import { TtrpgDatabase } from './db'
import { CronJob } from 'cron'
import { sql } from 'kysely'
import { logger } from './util/logger'

export class DailyAllowance {
  cronJob: CronJob;

  constructor(private db: TtrpgDatabase) {
    this.cronJob = new CronJob('0 0 * * * ', async () => {
      try {
        await this.giveAllowance();
      } catch (e) {
        logger.error('Error giving daily allowance')
        logger.error(e);
      }
    })
  }

  async run() {
    // Start job
    if (!this.cronJob.running) {
      this.cronJob.start();
    }
  }


  async giveAllowance() {
    await sql`update character set gold = gold + 15`.execute(this.db)
  }
}