import dotenv from 'dotenv'
import TtrpgEventListener from './event-listener'
import { logger } from './util/logger'

const run = async () => {
  dotenv.config()
  const eventListener = await TtrpgEventListener.create({
    ttrpgSqliteLocation: process.env.TTRPG_SQLITE_LOCATION!,
    firehoseSqliteLocation: process.env.FIREHOSE_SQLITE_LOCATION!,
  })
  await eventListener.start()
  logger.info('TTRPG Event Listener Running')
}

run()
