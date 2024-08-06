import { FirehoseDatabase } from './db'
import { Post, RepoLike } from './db/schema'
import { EventHandler } from './event-handler'
import { logger } from './util/logger'
import { JUDGE_COMPLETED, JUDGE_ERROR, JUDGE_INPROGRESS, NOT_JUDGED } from './db/constants'

export class EventCrawler {

  constructor(
    private db: FirehoseDatabase,
    private handler: EventHandler,
  ) {}

  async run() {
    while (true) {
      await new Promise(f => setTimeout(f, 500))
      await this.crawl()
    }
  }

  async crawl() {
    try {
      const newPosts: Post[] = await this.updatePostToInProgress()
      const newLikes: RepoLike[] = await this.updateLikeToInProgress()

      for (const newPost of newPosts) {
        this.handler.judgePost(newPost).then(() => {
          logger.debug(`Finished judging post ${newPost.uri}`)
          this.updatePostToCompleted(newPost.uri)
        }).catch((e) => {
          logger.error(`Error encountered judging post ${newPost.uri}, error is: ${e}`)
          this.updatePostToError(newPost.uri)
        })
      }

      for (const newLike of newLikes) {
        this.handler.initCharacter(newLike.author).then(() => {
          this.updateLikeToCompleted(newLike.uri)
        }).catch((e) => {
          logger.error(`Error encountered judging like ${newLike.uri}, error is: ${e}`)
          this.updateLikeToError(newLike.uri)
        })
      }

    } catch (e) {
      logger.error(`Error occurred crawling: ${e}`)
    }
  }

  private async updatePostToInProgress(): Promise<Post[]> {
    return await this.db
      .updateTable('post')
      .set('status', JUDGE_INPROGRESS)
      .where('status', '=', NOT_JUDGED)
      .returningAll()
      .execute()
  }

  private async updatePostToCompleted(uri: string) {
    await this.db
      .updateTable('post')
      .set('status', JUDGE_COMPLETED)
      .where('uri', '=', uri)
      .execute()
  }

  private async updatePostToError(uri: string) {
    await this.db
      .updateTable('post')
      .set('status', JUDGE_ERROR)
      .where('uri', '=', uri)
      .execute()
  }

  private async updateLikeToInProgress(): Promise<RepoLike[]> {
    return await this.db
      .updateTable('repo_like')
      .set('status', JUDGE_INPROGRESS)
      .where('status', '=', NOT_JUDGED)
      .returningAll()
      .execute()
  }

  private async updateLikeToCompleted(uri: string) {
    await this.db
      .updateTable('repo_like')
      .set('status', JUDGE_COMPLETED)
      .where('uri', '=', uri)
      .execute()
  }

  private async updateLikeToError(uri: string) {
    await this.db
      .updateTable('repo_like')
      .set('status', JUDGE_ERROR)
      .where('uri', '=', uri)
      .execute()
  }
}
