import {
  getConvoForMembers,
  getMessages, getProfile,
  postReply,
  postReplyWithEmbed, postReplyWithFacets,
  sendMessage,
} from '../agent'
import { TtrpgRequest } from '../vo/ttrpgRequest'
import { Character, Duel } from '../db/schema'
import { BskyAgent, RichText } from '@atproto/api'
import {
  CharacterManager,
} from './character-service'
import {
  cancelAllProposedDuels,
  cancelDuelFromDB,
  createAdvancedDuelInDb,
  createDuelInDb,
  DuelNotFound,
  fetchOpenDuelsInDb,
  getCharacterAllocatedGold,
  getDuelFromDB,
  JOUST_OPTION, JOUST_OPTION_CLASS_TRANSLATIONS,
  resolveDuel, resolveJoust,
  updateAdvancedDuelToAccepted,
  updateJoustWithConvoIDs,
  updatePlayerOneJoustChoiceInDB, updatePlayerTwoJoustChoiceInDB,
} from '../helpers/duel'
import {
  ALL_PROPOSED_DUELS_CANCELLED_TEXT,
  CHALLENGED_GM_TEXT,
  CHALLENGED_NOT_ENOUGH_GOLD_PENDING_TEXT,
  CHALLENGED_NOT_ENOUGH_GOLD_TEXT,
  CHALLENGED_NOT_SUBSCRIBED_TEXT,
  DUEL_ALREADY_RESOLVED_TEXT,
  DUEL_SUCCESSFULLY_CANCELLED_TEXT,
  INITIATOR_NOT_ENOUGH_GOLD_PENDING_TEXT,
  INITIATOR_NOT_ENOUGH_GOLD_TEXT,
  INITIATOR_NOT_SUBSCRIBED_TEXT,
  INVALID_DUEL_GOLD_TEXT,
  JOUST_ALREADY_RESOLVED_TEXT,
  JOUST_CHOICE_ACCEPTED,
  JOUST_SUCCESSFULLY_CANCELLED_TEXT,
  NOT_SUBSCRIBED_TEXT,
  SELF_CHALLENGED_TEXT,
} from '../constants'

import { TtrpgDatabase } from '../db'
import { logger } from '../util/logger'
import { DUEL_TYPE, JOUST_CANCELED, JOUST_RESOLVED } from '../db/constants'

import { isMessageView } from '@atproto/api/dist/client/types/chat/bsky/convo/defs'
import { detectFacets } from '@atproto/api/dist/rich-text/detection'
import { Facet } from '@atproto/api/src/rich-text/detection'

interface Mention {
  did: string

  [k: string]: unknown
}

function isMention(v: any): v is Mention {
  return (
    v.$type === 'app.bsky.richtext.facet#mention'
  )
}

export class DuelManager {
  constructor(
    private db: TtrpgDatabase,
    private agent: BskyAgent,
    private characterManager: CharacterManager,
  ) {}

  /**
   * get specified duel from the database
   * @param cid
   */
  async getDuel(cid: string | undefined): Promise<Duel> {
    if (cid === undefined) {
      throw new Error('dnr')
    }

    return getDuelFromDB(cid, this.db)
  }

  async acceptDuel(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const parentCid = req.parentCid

    let duel: Duel | null
    try {
      duel = await this.getDuel(parentCid)
    } catch (e) {
      if (e instanceof DuelNotFound) {
        return
      } else {
        logger.error(
          `Error encountered getting duel in accept duel.\nReq: ${req}\nerror:${e.message}`)
        return
      }
    }
    if (duel === null) {
      return
    }

    //If user who posted accept isn't challenged or duel already resolved
    if (!(duel.player2 === subject && duel.status === 0)) {
      return
    }

    if (duel.duel_type === 'joust') {
      return await this.acceptAdvancedDuel(req, duel)
    }

    const profile1 = await getProfile(this.agent, duel.player1)
    const profile2 = await getProfile(this.agent, duel.player2)

    const rndInt = Math.floor(Math.random() * 2)

    const character1 = await this.characterManager.getCharacter(duel.player1)
    if (character1 === null) {
      await postReply('Duelist Initiator does not have a character', uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }
    const character2 = await this.characterManager.getCharacter(duel.player2)
    if (character2 === null) {
      await postReply('Duelist Acceptor does not have a character', uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }

    let winner: Character
    let loser: Character
    let winnerDisplay: string
    let char1Display: string
    let char2Display: string

    if (profile1.data.displayName === undefined) {
      char1Display = profile1.data.handle
    } else {
      char1Display = profile1.data.displayName
    }
    if (profile2.data.displayName === undefined) {
      char2Display = profile2.data.handle
    } else {
      char2Display = profile2.data.displayName
    }

    if (rndInt === 0) {
      winner = character1
      winnerDisplay = char1Display
      loser = character2
    } else {
      winner = character2
      winnerDisplay = char2Display
      loser = character1
    }

    await resolveDuel(this.db, {
      cid: parentCid!,
      winnerDid: winner.author,
      winnerGold: winner.gold,
      duelGold: duel.gold,
      winnerExperience: winner.experience,
      loserDid: loser.author,
      loserGold: loser.gold,
      loserExperience: loser.experience,
    })

    const responseText = `The winner is ${winnerDisplay}`
    await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)

    this.characterManager.levelUp(character1, char1Display, uri, cid, rootUri, rootCid)
      .catch((e) => {
        logger.error(`Error for level up ${character1.author} with error: ${e.message}`)
      })
    this.characterManager.levelUp(character2, char2Display, uri, cid, rootUri, rootCid)
      .catch((e) => {
        logger.error(`Error for level up ${character2.author} with error: ${e.message}`)
      })
  }

  async acceptAdvancedDuel(req: TtrpgRequest, duel: Duel) {
    logger.debug(`Accepting advancing duel for`)
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const parentCid = req.parentCid
    const parentUri = req.parentUri

    const character1 = await this.characterManager.getCharacter(duel.player1)
    if (character1 === null) {
      await postReply('Duelist Initiator does not have a character', uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }
    const character2 = await this.characterManager.getCharacter(duel.player2)
    if (character2 === null) {
      await postReply('Duelist Acceptor does not have a character', uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }

    await updateAdvancedDuelToAccepted(this.db, parentCid!, parentUri!)
    const responseText = `Both players should receive a DM from this account, follow instructions there for the next step.`
    await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)

    return await this.sendAdvancedDuelMessages(character1, character2, duel)
  }

  private buildJoustMessage(handle: string, character: Character) {
    let thrust: string
    let fireball: string
    let curse: string
    // if (character.secondary_class === null) {
    thrust = JOUST_OPTION_CLASS_TRANSLATIONS.thrust[character.class]
    fireball = JOUST_OPTION_CLASS_TRANSLATIONS.fireball[character.class]
    curse = JOUST_OPTION_CLASS_TRANSLATIONS.curse[character.class]
    // } else {
    //   const rndArray: number[] = [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2), Math.floor(Math.random() * 2)]
    //   if (rndArray[0] === 0) {
    //     thrust = JOUST_OPTION_CLASS_TRANSLATIONS.thrust[character.class]
    //   } else {
    //     thrust = JOUST_OPTION_CLASS_TRANSLATIONS.thrust[character.secondary_class]
    //   }
    //   if (rndArray[1] === 0) {
    //     fireball = JOUST_OPTION_CLASS_TRANSLATIONS.fireball[character.class]
    //   } else {
    //     fireball = JOUST_OPTION_CLASS_TRANSLATIONS.fireball[character.secondary_class]
    //   }
    //   if (rndArray[2] === 0) {
    //     curse = JOUST_OPTION_CLASS_TRANSLATIONS.curse[character.class]
    //   } else {
    //     curse = JOUST_OPTION_CLASS_TRANSLATIONS.curse[character.secondary_class]
    //   }
    // }

    const requestText: string = `You have engaged in a joust with @${handle}.
Please respond by sending both this player's handle and the number for the action selected.
Actions available:
1. ${thrust}
2. ${fireball}
3. ${curse}
Example:
@${handle} one
@${handle} 1`
    return requestText
  }

  async sendAdvancedDuelMessages(characterOne: Character, characterTwo: Character, duel: Duel) {
    const playerOneConvo = await getConvoForMembers(this.agent, characterOne.author)
    const playerOneConvoId: string = playerOneConvo.data.convo.id
    const playerTwoConvo = await getConvoForMembers(this.agent, characterTwo.author)
    const playerTwoConvoId: string = playerTwoConvo.data.convo.id

    const profile1 = await getProfile(this.agent, characterOne.author)
    const profile2 = await getProfile(this.agent, characterTwo.author)
    const requestText1: string = this.buildJoustMessage(profile2.data.handle, characterOne)
    const requestText2: string = this.buildJoustMessage(profile1.data.handle, characterTwo)
    await sendMessage(this.agent, playerOneConvoId, requestText1)
    await sendMessage(this.agent, playerTwoConvoId, requestText2)

    await updateJoustWithConvoIDs(this.db, duel.cid, duel.uri!, playerOneConvoId, playerTwoConvoId)
  }

  async resolveJoust(joust: Duel) {
    if (joust.player1_convo_choice !== null && joust.player2_convo_choice !== null) {
      const profile1 = await getProfile(this.agent, joust.player1)
      const profile2 = await getProfile(this.agent, joust.player2)

      const character1 = await this.characterManager.getCharacter(joust.player1)
      if (character1 === null) {
        logger.error('Character 1 not found')
        return
      }
      const character2 = await this.characterManager.getCharacter(joust.player2)
      if (character2 === null) {
        logger.error('Character 2 not found')
        return
      }

      let winner: Character
      let loser: Character
      let winnerDisplay: string
      let loserDisplay: string
      let winningMove: string
      let char1Display: string
      let char2Display: string

      if (profile1.data.displayName === undefined || profile1.data.displayName == '') {
        char1Display = profile1.data.handle
      } else {
        char1Display = profile1.data.displayName
      }
      if (profile2.data.displayName === undefined || profile2.data.displayName == '') {
        char2Display = profile2.data.handle
      } else {
        char2Display = profile2.data.displayName
      }

      if (joust.player1_convo_choice == joust.player2_convo_choice) {
        winningMove = 'pure luck'

        const rndInt = Math.floor(Math.random() * 2)
        if (rndInt === 1) {
          winner = character1
          winnerDisplay = char1Display
          loser = character2
          loserDisplay = char2Display
        } else {
          winner = character2
          winnerDisplay = char2Display
          loser = character1
          loserDisplay = char1Display
        }
      } else {
        const p1 = joust.player1_convo_choice!
        const p2 = joust.player2_convo_choice!

        if (p1 == JOUST_OPTION.THRUST) {
          if (p2 == JOUST_OPTION.FIREBALL) {
            winningMove = JOUST_OPTION_CLASS_TRANSLATIONS.fireball[character2.class]
            winner = character2
            winnerDisplay = char2Display
            loser = character1
            loserDisplay = char1Display
          } else {
            winningMove = JOUST_OPTION_CLASS_TRANSLATIONS.thrust[character1.class]
            winner = character1
            winnerDisplay = char1Display
            loser = character2
            loserDisplay = char2Display
          }
        } else if (p1 == JOUST_OPTION.FIREBALL) {
          if (p2 == JOUST_OPTION.THRUST) {
            winningMove = JOUST_OPTION_CLASS_TRANSLATIONS.fireball[character1.class]
            winner = character1
            winnerDisplay = char1Display
            loser = character2
            loserDisplay = char2Display
          } else {
            winningMove = JOUST_OPTION_CLASS_TRANSLATIONS.curse[character2.class]
            winner = character2
            winnerDisplay = char2Display
            loser = character1
            loserDisplay = char1Display
          }
        } else {
          if (p2 == JOUST_OPTION.FIREBALL) {
            winningMove = JOUST_OPTION_CLASS_TRANSLATIONS.curse[character1.class]
            winner = character1
            winnerDisplay = char1Display
            loser = character2
            loserDisplay = char2Display
          } else {
            winningMove = JOUST_OPTION_CLASS_TRANSLATIONS.thrust[character2.class]
            winner = character2
            winnerDisplay = char2Display
            loser = character1
            loserDisplay = char1Display
          }
        }
      }

      await resolveJoust(this.db, {
        cid: joust.cid,
        winnerDid: winner.author,
        winnerGold: winner.gold,
        duelGold: joust.gold,
        winnerExperience: winner.experience,
        loserDid: loser.author,
        loserGold: loser.gold,
        loserExperience: loser.experience,
      })

      const responseText = `${winnerDisplay} used ${winningMove} and won the joust!\nParticipants @${profile1.data.handle}, @${profile2.data.handle}`
      let rt = new RichText({ text: responseText }, {})
      let facets: Facet[] = detectFacets(rt.unicodeText)!

      if (winnerDisplay == profile1.data.handle) {
        facets[0].features[0].did = character1.author
        facets[1].features[0].did = character2.author
        facets[2].features[0].did = character1.author
      } else {
        facets[0].features[0].did = character1.author
        facets[1].features[0].did = character2.author
      }
      await postReplyWithFacets(responseText, joust.uri!, joust.cid, joust.root_uri!, joust.root_cid!,
        this.agent, facets
      )

      this.characterManager.levelUp(character1, char1Display, joust.uri!, joust.cid,
          joust.root_uri!, joust.root_cid!,
        )
        .catch((e) => {
          logger.error(`Error for level up ${character1.author} with error: ${e.message}`)
        })
      this.characterManager.levelUp(character2, char2Display, joust.uri!, joust.cid,
          joust.root_uri!, joust.root_cid!,
        )
        .catch((e) => {
          logger.error(`Error for level up ${character2.author} with error: ${e.message}`)
        })
    }
  }

  standardizeJoustChoice(text: string): string|null {
    let result: string|null = null
    const splitText = text.toLowerCase().split(/\s+/)
    const choice = splitText[1]
    let thrustChoices = ['thrust', '1', 'one']
    let fireballChoices = ['fireball', '2', 'two']
    let curseChoices = ['curse', '3', 'three']

    if (splitText.length >= 2) {
      if (thrustChoices.includes(choice)) {
        result = JOUST_OPTION.THRUST
      } else if (fireballChoices.includes(choice)) {
        result = JOUST_OPTION.FIREBALL
      } else if (curseChoices.includes(choice)) {
        result = JOUST_OPTION.CURSE
      }
    }
    return result
  }

  async processJoustMessages(joust: Duel) {
    if (joust.player1_convo_id === null || joust.player2_convo_id === null) {
      logger.error('Error occurred in joust crawler. A player convo id is null')
      return
    }
    const joustDate = new Date(joust.created_at!)
    if (joust.player1_convo_choice === null) {
      const playerOneMessageResponse = await getMessages(this.agent, joust.player1_convo_id)
      const playerOneMessages = playerOneMessageResponse.data.messages
      let choice: string | null = null
      for (const message of playerOneMessages) {
        if (isMessageView(message)
          && message.sender.did === joust.player1
          && message.facets !== undefined) {
          const messageDate = new Date(message.sentAt)
          if (messageDate > joustDate) {
            message.facets.forEach((facet) => {
              facet.features.forEach((feature) => {
                if (isMention(feature) && feature.did === joust.player2) {
                  choice = this.standardizeJoustChoice(message.text)
                }
              })
            })
          }
        }
      }

      if (choice !== null) {
        await updatePlayerOneJoustChoiceInDB(this.db, joust.cid, joust.uri!, choice)
        await sendMessage(this.agent, joust.player1_convo_id, JOUST_CHOICE_ACCEPTED)
      }
    }
    if (joust.player2_convo_choice === null) {
      const playerTwoMessageResponse = await getMessages(this.agent, joust.player2_convo_id)
      const playerTwoMessages = playerTwoMessageResponse.data.messages
      let choice: string | null = null
      for (const message of playerTwoMessages) {
        if (isMessageView(message)
          && message.sender.did === joust.player2
          && message.facets !== undefined) {
          const messageDate = new Date(message.sentAt)
          if (messageDate > joustDate) {
            message.facets.forEach((facet) => {
              facet.features.forEach((feature) => {
                if (isMention(feature) && feature.did === joust.player1) {
                  choice = this.standardizeJoustChoice(message.text)
                }
              })
            })
          }
        }
      }

      if (choice !== null) {
        await updatePlayerTwoJoustChoiceInDB(this.db, joust.cid, joust.uri!, choice)
        await sendMessage(this.agent, joust.player2_convo_id, JOUST_CHOICE_ACCEPTED)
      }
    }
  }

  async cancelDuel(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const parentCid = req.parentCid

    let duel: Duel | null
    try {
      duel = await this.getDuel(parentCid)
    } catch (e) {
      if (e instanceof DuelNotFound) {
        logger.info('Duel not found')
        return
      } else {
        logger.error(`Error encountered getting duel: ${e.message}`)
        return
      }
    }
    if (duel === null) {
      logger.info('Duel is null')
      return
    }

    if ((duel.player2 === subject || duel.player1 === subject) && (duel.duel_type === DUEL_TYPE.BASIC && duel.status !== 0)) {
      logger.info('Duel already resolved')
      await postReply(DUEL_ALREADY_RESOLVED_TEXT, uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }

    if ((duel.player2 === subject || duel.player1 === subject) && (duel.duel_type === DUEL_TYPE.JOUST && [JOUST_CANCELED,
      JOUST_RESOLVED].includes(duel.status))) {
      await postReply(JOUST_ALREADY_RESOLVED_TEXT, uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }

    if (!((duel.player2 === subject || duel.player1 === subject) && duel.status === 0)) {
      return
    }

    try {
      logger.info(`Attempt cancel duel from db ${duel.cid}`)
      await cancelDuelFromDB(duel.cid, this.db)
    } catch (e) {
      logger.error(`Error encountered cancelling duel from db: ${e.message}`)
      throw e
    }

    if (duel.duel_type == DUEL_TYPE.JOUST) {
      await postReply(JOUST_SUCCESSFULLY_CANCELLED_TEXT, uri, cid, rootUri, rootCid, this.agent)
    } else {
      await postReply(DUEL_SUCCESSFULLY_CANCELLED_TEXT, uri, cid, rootUri, rootCid, this.agent)
    }
  }

  async cancelAllDuels(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    let character: Character | null
    try {
      logger.info(`Getting character for ${req.author}`)
      character = await this.characterManager.getCharacter(req.author)
    } catch (e) {
      logger.error(`Error encountered getting character: ${e.message}`)
      throw e
    }

    if (character === null) {
      await postReply(NOT_SUBSCRIBED_TEXT, req.uri, req.cid, req.rootUri, req.rootCid, this.agent)
      return
    }

    await cancelAllProposedDuels(this.db, subject)
    await postReply(ALL_PROPOSED_DUELS_CANCELLED_TEXT, uri, cid, rootUri, rootCid, this.agent)
  }

  async createDuel(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const text = req.text

    const splitText = text.split(/\s+/)

    const challengedPlayerHandle = splitText[2].substring(1)

    if (challengedPlayerHandle === 'bskyttrpg.bsky.social') {
      await postReply(CHALLENGED_GM_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const profile1 = await getProfile(this.agent, subject)
    const player1Label = await this.characterManager.getCharacterClassLabel(profile1)
    if (player1Label === undefined) {
      await postReply(INITIATOR_NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const profile2 = await getProfile(this.agent, challengedPlayerHandle)
    const player2Label = await this.characterManager.getCharacterClassLabel(profile2)
    if (player2Label === undefined) {
      await postReply(CHALLENGED_NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    if (subject == profile2.data.did) {
      await postReply(SELF_CHALLENGED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    let character1 = await this.characterManager.getCharacter(subject)
    let character2 = await this.characterManager.getCharacter(profile2.data.did)

    if (character1 === null) {
      await postReply(INITIATOR_NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (character2 === null) {
      await postReply(CHALLENGED_NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    let duelGoldAmt = Number.parseFloat(splitText[3])
    if (!Number.isInteger(duelGoldAmt)) {
      await postReply(INVALID_DUEL_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const character1AvailableGold = await this.getAvailableGold(character1)
    const character2AvailableGold = await this.getAvailableGold(character2)

    if (duelGoldAmt < 1) {
      await postReply(INVALID_DUEL_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (character1.gold < duelGoldAmt) {
      await postReply(INITIATOR_NOT_ENOUGH_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (character2.gold < duelGoldAmt) {
      await postReply(CHALLENGED_NOT_ENOUGH_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (character1AvailableGold < duelGoldAmt) {
      await postReply(INITIATOR_NOT_ENOUGH_GOLD_PENDING_TEXT, uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }
    if (character2AvailableGold < duelGoldAmt) {
      await postReply(CHALLENGED_NOT_ENOUGH_GOLD_PENDING_TEXT, uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }

    const responseText = `Duel has been initiated. Challenged player please reply either "Accept" or "Reject" after approximately 10 seconds. Duel Initiator may also reply "Reject" to cancel.`
    const replyResponse = await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)

    try {
      await this.insertNewDuel(subject, profile2.data.did, duelGoldAmt, replyResponse.cid,
        replyResponse.uri,
      )
    } catch (e) {
      logger.error(`Error inserting new duel: ${e.message}`)
      await postReply(
        'Something has gone wrong creating the duel, please reach out to @ripperoni.com',
        replyResponse.uri, replyResponse.cid, rootUri, rootCid, this.agent,
      )
    }
  }

  async insertNewDuel(player1Did: string, player2Did: string, goldAmt: number, cid: string,
    uri: string,
  ) {
    await createDuelInDb(this.db, {
      player1Did: player1Did,
      player2Did: player2Did,
      goldAmt: goldAmt,
      cid: cid,
      uri: uri,
    })
  }

  async getOpenDuels(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    let character: Character | null
    try {
      character = await this.characterManager.getCharacter(req.author)
    } catch (e) {
      logger.error(`Error encountered getting character: ${e.message}`)
      await postReply('Unexpected error encountered', req.uri, req.cid, req.rootUri, req.rootCid,
        this.agent,
      )
      return
    }

    if (character === null) {
      await postReply(NOT_SUBSCRIBED_TEXT, req.uri, req.cid, req.rootUri, req.rootCid, this.agent)
      return
    }

    const duels = await fetchOpenDuelsInDb(this.db, subject)
    if (duels.length == 0) {
      await postReply('You have no open duels at the moment.', uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }

    let responseUri: string = uri
    let responseCid: string = cid
    for (const duel of duels) {
      if (duel.uri !== null) {
        const responseText = await this.buildFetchDuelResp(duel)
        let response = await postReplyWithEmbed(responseText, responseUri, responseCid, rootUri,
          rootCid, this.agent, { uri: duel.uri, cid: duel.cid },
        )
        responseUri = response.uri
        responseCid = response.cid
      }
    }
  }

  /**
   * Build the fetch open duels response text
   * @param duel
   */
  async buildFetchDuelResp(duel: Duel) {
    let responseText: string = `You have ${duel.gold} gold allocated in an open duel with `
    const profile = await this.agent.getProfile({ actor: duel.player2 })
    if (profile.data.displayName === undefined) {
      responseText += `${profile.data.handle}\n`
    } else {
      responseText += `${profile.data.displayName}\n`
    }
    return responseText
  }

  /**
   * Get available gold for the character passed factoring in open duels
   * @param character
   */
  async getAvailableGold(character: Character): Promise<number> {
    const reservedGold = await getCharacterAllocatedGold(character.author, this.db)
    return character.gold - reservedGold
  }

  async createJoust(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const text = req.text

    const splitText = text.split(/\s+/)
    const challengedPlayerHandle = splitText[2].substring(1)

    if (challengedPlayerHandle === 'bskyttrpg.bsky.social') {
      await postReply(CHALLENGED_GM_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    } else if (subject === challengedPlayerHandle) {
      await postReply(SELF_CHALLENGED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const characterOne = await this.characterManager.getCharacter(subject)
    if (characterOne === null) {
      await postReply(NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const profile2 = await getProfile(this.agent, challengedPlayerHandle)
    const characterTwo = await this.characterManager.getCharacter(profile2.data.did)
    if (characterTwo === null) {
      await postReply(CHALLENGED_NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    let duelGoldAmt = Number.parseFloat(splitText[3])
    if (!Number.isInteger(duelGoldAmt)) {
      await postReply(INVALID_DUEL_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const character1AvailableGold = await this.getAvailableGold(characterOne)
    const character2AvailableGold = await this.getAvailableGold(characterTwo)

    if (duelGoldAmt < 1) {
      await postReply(INVALID_DUEL_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (characterOne.gold < duelGoldAmt) {
      await postReply(INITIATOR_NOT_ENOUGH_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (characterTwo.gold < duelGoldAmt) {
      await postReply(CHALLENGED_NOT_ENOUGH_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (character1AvailableGold < duelGoldAmt) {
      await postReply(INITIATOR_NOT_ENOUGH_GOLD_PENDING_TEXT, uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }
    if (character2AvailableGold < duelGoldAmt) {
      await postReply(CHALLENGED_NOT_ENOUGH_GOLD_PENDING_TEXT, uri, cid, rootUri, rootCid,
        this.agent,
      )
      return
    }

    const responseText = `Joust has been initiated. Challenged player please reply either "Accept" or "Reject" after approximately 10 seconds. Joust Initiator may also reply "Reject" to cancel. DMs must be open to this bot in order to joust.`
    const replyResponse = await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)

    try {
      await createAdvancedDuelInDb(this.db, {
        cid: replyResponse.cid,
        goldAmt: duelGoldAmt,
        player1Did: subject,
        player2Did: characterTwo.author,
        uri: replyResponse.uri,
        rootUri: rootUri,
        rootCid: rootCid,
      })
    } catch (e) {
      logger.error(`Error inserting new joust: ${e.message}`)
      await postReply(
        'Something has gone wrong creating the joust, please reach out to @ripperoni.com',
        replyResponse.uri, replyResponse.cid, rootUri, rootCid, this.agent,
      )
    }
  }
}


