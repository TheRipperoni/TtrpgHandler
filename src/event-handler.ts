import { RequestType, TtrpgRequest } from './vo/ttrpgRequest'
import {
  DuelManager,
} from './services/duel-service'
import { CharacterManager } from './services/character-service'
import { BskyAgent } from '@atproto/api'
import { logger } from './util/logger'
import { TtrpgDatabase } from './db'
import { Post } from './db/schema'
import { LANGUAGES } from './constants'
import { getDuel } from './helpers/duel'

export class EventHandler {
  characterManager: CharacterManager
  duelManager: DuelManager

  constructor(public db: TtrpgDatabase, agent: BskyAgent) {
    this.characterManager = new CharacterManager(db, agent)
    this.duelManager = new DuelManager(db, agent, this.characterManager)
  }

  async initCharacter(subject: string) {
    logger.info(`Judging init character: ${subject}`)
    await this.characterManager.initCharacter(subject)
  }

  async judge(req: TtrpgRequest) {
    logger.info(`Judging request: ${req.uri}`)
    const requestType = await this.parseJudgeRequest(req)

    switch (requestType) {
      case RequestType.LIST_COMMANDS:
        await this.characterManager.listCommands(req)
        break
      case RequestType.REROLL:
        await this.characterManager.reroll(req)
        break
      case RequestType.ACCEPT_DUEL:
        if (req.parentUri !== undefined) {
          const duels = await getDuel(this.db, req.parentUri)
          if (duels.length > 0) {
            await this.duelManager.acceptDuel(req)
          } else {
            await this.characterManager.acceptPartyInvite(req)
          }
        }
        break
      case RequestType.CREATE_DUEL:
        await this.duelManager.createDuel(req)
        break
      case RequestType.REJECT_DUEL:
        if (req.parentUri !== undefined) {
          const duels = await getDuel(this.db, req.parentUri)
          if (duels.length > 0) {
            await this.duelManager.cancelDuel(req)
          } else {
            await this.characterManager.rejectPartyInvite(req)
          }
        }
        break
      case RequestType.FETCH_OPEN_DUELS:
        await this.duelManager.getOpenDuels(req)
        break
      case RequestType.STATS:
        await this.characterManager.getStats(req)
        break
      case RequestType.LIST_ANCESTRIES:
        await this.characterManager.listAncestries(req)
        break
      case RequestType.UNSUBSCRIBE:
        await this.characterManager.unsubscribe(req)
        break
      case RequestType.RESUBSCRIBE:
        await this.characterManager.resubscribe(req)
        break
      case RequestType.CANCEL_ALL_DUELS:
        await this.duelManager.cancelAllDuels(req)
        break
      case RequestType.CHOOSE_ANCESTRY:
        await this.characterManager.chooseAncestry(req)
        break
      case RequestType.CHOOSE_SECONDARY_CLASS:
        await this.characterManager.chooseSecondaryClass(req)
        break
      case RequestType.JOUST:
        await this.duelManager.createJoust(req)
        break
      case RequestType.GIVE_GOLD:
        await this.characterManager.giveGold(req)
        break
      case RequestType.CREATE_PARTY:
        await this.characterManager.createParty(req)
        break
      case RequestType.INVITE_TO_PARTY:
        await this.characterManager.createPartyInvite(req)
        break
      default:
        break
    }
  }

  async transformPostToTtrpg(post: Post) {
    let lang = post.lang ?? 'en'
    if (!LANGUAGES.includes(lang)) {
      lang = 'en'
    }
    let transformedRequest: TtrpgRequest = {
      author: post.author,
      text: post.text,
      uri: post.uri,
      lang: lang,
      cid: post.cid,
      rootUri: post.rootUri,
      rootCid: post.rootCid,
      parentCid: post.parentCid ?? undefined,
      parentUri: post.parentUri ?? undefined,
    }
    return transformedRequest
  }

  async judgePost(post: Post) {
    logger.info(`Judging post request: ${post.uri}`)
    const req = await this.transformPostToTtrpg(post)
    await this.judge(req)
  }

  private async parseJudgeRequest(req: TtrpgRequest): Promise<RequestType> {
    const lowerText = req.text.toLowerCase()
    const splitText = lowerText.split(/\s+/)

    const firstWord: string = splitText[0]
    const secondWord: string = splitText[1]

    if (firstWord === '@bskyttrpg.bsky.social') {
      switch (secondWord) {
        case 'reroll':
          return RequestType.REROLL
        case 'openduels':
          return RequestType.FETCH_OPEN_DUELS
        case 'stats':
          return RequestType.STATS
        case 'duel':
          return RequestType.CREATE_DUEL
        case 'joust':
          return RequestType.JOUST
        case 'listancestries':
          return RequestType.LIST_ANCESTRIES
        case 'chooseancestry':
          return RequestType.CHOOSE_ANCESTRY
        case 'choosesecondclass':
          return RequestType.CHOOSE_SECONDARY_CLASS
        case 'unsubscribe':
          return RequestType.UNSUBSCRIBE
        case 'resubscribe':
          return RequestType.RESUBSCRIBE
        case 'cancelallduels':
          return RequestType.CANCEL_ALL_DUELS
        case 'listcommands':
          return RequestType.LIST_COMMANDS
        case 'givegold':
          return RequestType.GIVE_GOLD
        case 'createparty':
          return RequestType.CREATE_PARTY
        case 'sendinvite':
          return RequestType.INVITE_TO_PARTY
        default:
          return RequestType.INVALID
      }
    }

    if (firstWord.startsWith('accept') || firstWord.startsWith('aceit') || firstWord === 'a') {
      return RequestType.ACCEPT_DUEL
    }

    if (firstWord.startsWith('cancel') || firstWord === 'c'
      || firstWord.startsWith('reject') || firstWord.startsWith('rejeit') || firstWord === 'r') {
      return RequestType.REJECT_DUEL
    }

    return RequestType.INVALID
  }
}