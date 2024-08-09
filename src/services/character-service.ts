import { TtrpgRequest } from '../vo/ttrpgRequest'
import { did, getProfile, postReply } from '../agent'
import { Character, Reroll } from '../db/schema'
import { AppBskyActorGetProfile, BskyAgent, Label } from '@atproto/api'
import {
  ALREADY_UNSUBBED_TEXT,
  ANCESTRY_ALREADY_CHOSEN_TEXT,
  CHALLENGED_GM_TEXT, CHALLENGED_NOT_ENOUGH_GOLD_PENDING_TEXT, CHALLENGED_NOT_ENOUGH_GOLD_TEXT,
  CHALLENGED_NOT_SUBSCRIBED_TEXT,
  CHARACTER_IS_ACTIVE_TEXT,
  CHARACTER_IS_DEACTIVATED_TEXT,
  CLASS_LABELS,
  COMMON_ANCESTRIES, DONOR_NOT_ENOUGH_GOLD_TEXT, DONOR_NOT_SUBSCRIBED_TEXT,
  FIRST_REROLL_TEXT,
  GENERIC_ERROR_TEXT, INITIATOR_NOT_ENOUGH_GOLD_PENDING_TEXT,
  INITIATOR_NOT_ENOUGH_GOLD_TEXT,
  INITIATOR_NOT_SUBSCRIBED_TEXT,
  INVALID_DUEL_GOLD_TEXT,
  LEVEL_THRESHOLDS,
  LIST_ANCESTRIES_TEMPLATE,
  LIST_COMMANDS_TEXT_P1,
  LIST_COMMANDS_TEXT_P2, LIST_COMMANDS_TEXT_P3,
  MAX_REROLLS_REACHED_TEXT,
  NOT_DEACTIVATED_TEXT,
  NOT_SUBSCRIBED_TEXT, RARE_ANCESTRIES, RECIPIENT_NOT_SUBSCRIBED_TEXT,
  SECOND_REROLL_TEXT,
  SECONDARY_CLASS_ALREADY_CHOSEN_TEXT,
  SELF_CHALLENGED_TEXT, SELF_DONOR_TEXT,
  SUCCESSFULLY_RESUBBED_TEXT,
  SUCCESSFULLY_UNSUBBED_TEXT, UNCOMMON_ANCESTRIES,
} from '../constants'
import {
  CharacterAlreadyExistsError,
  CharacterNotFoundError,
  chooseAncestryForCharacter,
  createCharacterDB,
  deactivateCharInDb,
  fetchRerollsFromDB,
  getCharacterFromDB,
  insertRerollAttemptIntoDB,
  levelUpCharInDB,
  reactivateCharInDb, transferGoldInDB,
  updateCharacterClass,
  updateSecondaryClassForCharacter,
} from '../helpers/character'
import { emitNewLabel, emitOverideLabel, emitRemovalLabel } from '../util/ozone-util'
import { cancelOutstandingDuels, getCharacterAllocatedGold } from '../helpers/duel'
import crypto from 'crypto'
import { TtrpgDatabase } from '../db'
import { logger } from '../util/logger'
import { CHAR_DEACTIVATED } from '../db/constants'

export class CharacterManager {
  constructor(
    private db: TtrpgDatabase,
    private agent: BskyAgent,
  ) {}

  /**
   *
   * @param subject
   */
  async initCharacter(subject: string) {
    const character = await this.getCharacter(subject)
    if (character !== null) {
      return
    }

    let hexAnswer = crypto.createHash('sha256').update(subject).digest('hex')
    let indexAnswer = parseInt(hexAnswer, 16) % CLASS_LABELS.length
    let chosenLabel: string = CLASS_LABELS.at(indexAnswer)!


    try {
      await this.createCharacter(subject, chosenLabel)
    } catch (e) {
      if (e instanceof CharacterAlreadyExistsError) {
        return
      } else {
        throw e
      }
    }
    await emitNewLabel(this.agent, subject, chosenLabel)
  }

  async getStats(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    const profile = await getProfile(this.agent, subject)
    const existingLabel = await this.getCharacterClassLabel(profile)
    if (existingLabel === undefined) {
      await postReply(NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    let character = await this.getCharacter(subject)
    if (character === null) {
      await postReply(NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    let responseText: string = `Your current stats`

    if (character.secondary_class === null) {
      responseText += `\nClass: ${character.class}`
    } else {
      responseText += `\nPrimary Class: ${character.class}\nSecondary Class: ${character.secondary_class}`
    }
    if (character.ancestry !== null) {
      responseText += `\nAncestry: ${character.ancestry}`
    }
    responseText += `\nLevel: ${character.level}\nExperience: ${character.experience}\nGold: ${character.gold}`

    await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)
  }

  async levelUp(character: Character, displayName: string, uri: string, cid: string,
    rootUri: string, rootCid: string,
  ): Promise<boolean> {
    const exp = character.experience
    const level = character.level

    const expThreshold = LEVEL_THRESHOLDS[level + 1]

    if (exp >= expThreshold) {
      try {
        await levelUpCharInDB(this.db, character.author, character.level)
      } catch (e) {
        return false
      }
    } else {
      return false
    }

    const responseText = `Congratulations ${displayName}, you have leveled up to level ${level + 1}!`
    await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)
    return true
  }

  async createCharacter(subject: string, charClass: string) {
    const gold = 15
    const level = 1
    const experience = 0
    const status = 1
    return createCharacterDB(this.db, { subject, charClass, gold, level, experience, status })
  }

  /**
   * Get Character Information
   * @param actor - DID for the user
   */
  async getCharacter(actor: string): Promise<Character | null> {
    try {
      return await getCharacterFromDB(this.db, actor)
    } catch (e) {
      if (e instanceof CharacterNotFoundError) {
        return null
      } else {
        throw e
      }
    }
  }

  async chooseAncestry(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const text = req.text.toLowerCase()

    let character = await this.getCharacter(subject)

    const profile = await getProfile(this.agent, subject)
    const label = await this.getCharacterClassLabel(profile)

    if (label === undefined) {
      await postReply(NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    if (character === null) {
      await postReply(NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    // Disable as new ancestry is being added
    // if (character.ancestry !== null) {
    //   await postReply(ANCESTRY_ALREADY_CHOSEN_TEXT, uri, cid, rootUri, rootCid, this.agent)
    //   return
    // }

    const splitText = text.split(/\s+/)
    const chosenAncestry = splitText[2]

    if (!COMMON_ANCESTRIES.includes(chosenAncestry) && !UNCOMMON_ANCESTRIES.includes(chosenAncestry)) {
      if(character.level < 2 || !RARE_ANCESTRIES.includes(chosenAncestry) ) {
        let responseText = `${chosenAncestry} is not a valid ancestry to choose from.`
        await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)
        return
      }
    }

    if (character.ancestry !== null) {
      await emitRemovalLabel(this.agent, subject, [character.ancestry])
    }
    await emitNewLabel(this.agent, subject, chosenAncestry)
    await chooseAncestryForCharacter(this.db, subject, chosenAncestry)

    let responseText: string
    if ('aeiou'.includes(chosenAncestry.charAt(0))) {
      responseText = `Congratulations, you are now an ${chosenAncestry}.`
    } else {
      responseText = `Congratulations, you are now a ${chosenAncestry}.`
    }
    await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)
  }

  async chooseSecondaryClass(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const text = req.text.toLowerCase()

    let character = await this.getCharacter(subject)

    if (character === null) {
      await postReply(NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (character.status === CHAR_DEACTIVATED) {
      await postReply(CHARACTER_IS_DEACTIVATED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    if (character.secondary_class !== null) {
      await postReply(SECONDARY_CLASS_ALREADY_CHOSEN_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const splitText = text.split(/\s+/)
    const chosenClass = splitText[2]

    if (!CLASS_LABELS.includes(chosenClass)) {
      let responseText = `${chosenClass} is not a valid class to choose from.`
      await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (character.class == chosenClass) {
      let responseText = `You cannot choose the same class twice.`
      await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    await emitNewLabel(this.agent, subject, chosenClass)
    await updateSecondaryClassForCharacter(this.db, subject, chosenClass)

    let responseText: string
    if ('aeiou'.includes(character.class.charAt(0))) {
      responseText = `Congratulations, you are now an ${character.class}/${chosenClass}.`
    } else {
      responseText = `Congratulations, you are now a ${character.class}/${chosenClass}.`
    }
    await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)
  }

  /**
   * Get current label for provided profile
   * @param profile
   */
  async getCharacterClassLabel(profile: AppBskyActorGetProfile.Response): Promise<Label | undefined> {
    let existingLabel: Label | undefined
    profile.data.labels?.forEach(function(label) {
      if (label.src === did && CLASS_LABELS.includes(label.val)) {
        existingLabel = label
        return
      }
    })

    return existingLabel
  }

  async getAllLabels(profile: AppBskyActorGetProfile.Response): Promise<Label[]> {
    let existingLabels: Label[] = []
    profile.data.labels?.forEach(function(label) {
      if (label.src === did) {
        existingLabels.push(label)
      }
    })

    return existingLabels
  }

  async unsubscribe(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    const profile = await getProfile(this.agent, subject)
    const existingLabels = await this.getAllLabels(profile)

    let character = await this.getCharacter(subject)
    if (character !== null && character.status === 1) {
      await deactivateCharInDb(this.db, subject)
    } else {
      if (existingLabels.length === 0) {
        await postReply(ALREADY_UNSUBBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
        return
      }
    }


    let labelsToRemove: string[] = []
    existingLabels.forEach((label) => {
      labelsToRemove.push(label.val)
    })

    await cancelOutstandingDuels(this.db, subject)
    await emitRemovalLabel(this.agent, subject, labelsToRemove)
    await postReply(SUCCESSFULLY_UNSUBBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
  }

  async resubscribe(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    let character = await this.getCharacter(subject)

    if (character === null) {
      await postReply(NOT_DEACTIVATED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    if (character.status === 1) {
      await postReply(CHARACTER_IS_ACTIVE_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    await reactivateCharInDb(this.db, subject)

    const classLabel = character.class
    const ancestry = character.ancestry

    await emitNewLabel(this.agent, subject, classLabel)
    if (ancestry !== null) {
      await emitNewLabel(this.agent, subject, ancestry)
    }
    if (character.secondary_class !== null) {
      await emitNewLabel(this.agent, subject, character.secondary_class)
    }

    await postReply(SUCCESSFULLY_RESUBBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
  }

  async listAncestries(req: TtrpgRequest) {
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    let character: Character | null
    try {
      character = await this.getCharacter(req.author)
    } catch (e) {
      logger.error(`Error encountered: ${e.message}`)
      await postReply('Unexpected error encountered', req.uri, req.cid, req.rootUri, req.rootCid,
        this.agent,
      )
      return
    }

    if (character === null) {
      await postReply(NOT_SUBSCRIBED_TEXT, req.uri, req.cid, req.rootUri, req.rootCid, this.agent)
      return
    }

    let responseText = LIST_ANCESTRIES_TEMPLATE
    let i = 0
    COMMON_ANCESTRIES.forEach((ancestry) => {
      if (i > 0) {
        responseText += `, `
      }
      responseText += `${ancestry}`
      i += 1
    })
    UNCOMMON_ANCESTRIES.forEach((ancestry) => {
      responseText += `, `
      responseText += `${ancestry}`
    })
    let res = await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)

    if (character.level > 1) {
      let j = 0
      let responseText2 = "Additional options: "
      RARE_ANCESTRIES.forEach((ancestry) => {
        if (j > 0) {
          responseText2 += `, `
        }
        responseText2 += `${ancestry}`
        j += 1
      })
      await postReply(responseText2, res.uri, res.cid, rootUri, rootCid, this.agent)
    }

    return
  }

  async listCommands(req: TtrpgRequest) {
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    let character: Character | null
    try {
      character = await this.getCharacter(req.author)
    } catch (e) {
      logger.error(`Error encountered: ${e.message}`)
      await postReply('Unexpected error encountered', req.uri, req.cid, req.rootUri, req.rootCid,
        this.agent,
      )
      return
    }

    if (character === null) {
      await postReply(NOT_SUBSCRIBED_TEXT, req.uri, req.cid, req.rootUri, req.rootCid, this.agent)
      return
    }

    let res = await postReply(LIST_COMMANDS_TEXT_P1, uri, cid, rootUri, rootCid, this.agent)
    res = await postReply(LIST_COMMANDS_TEXT_P2, res.uri, res.cid, rootUri, rootCid, this.agent)
    res = await postReply(LIST_COMMANDS_TEXT_P3, res.uri, res.cid, rootUri, rootCid, this.agent)
    return
  }

  async giveGold(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const text = req.text

    const splitText = text.split(/\s+/)
    const otherPlayerHandler = splitText[2].substring(1)


    const profile1 = await getProfile(this.agent, subject)
    const player1Label = await this.getCharacterClassLabel(profile1)
    if (player1Label === undefined) {
      await postReply(DONOR_NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const profile2 = await getProfile(this.agent, otherPlayerHandler)
    const player2Label = await this.getCharacterClassLabel(profile2)
    if (player2Label === undefined) {
      await postReply(RECIPIENT_NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    if (subject == profile2.data.did) {
      await postReply(SELF_DONOR_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    let character1 = await this.getCharacter(subject)
    let character2 = await this.getCharacter(profile2.data.did)

    if (character1 === null) {
      await postReply(DONOR_NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
    if (character2 === null) {
      await postReply(RECIPIENT_NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    let goldAmt = Number.parseFloat(splitText[3])
    if (!Number.isInteger(goldAmt)) {
      await postReply(INVALID_DUEL_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const char1AllocatedGold = await getCharacterAllocatedGold(character1.author, this.db)
    const character1AvailableGold = character1.gold - char1AllocatedGold

    if (goldAmt < 1) {
      await postReply(INVALID_DUEL_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    } else if (character1AvailableGold < goldAmt) {
      await postReply(DONOR_NOT_ENOUGH_GOLD_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    const responseText = `Gold has been successfully donated.`
    const replyResponse = await postReply(responseText, uri, cid, rootUri, rootCid, this.agent)

    try {
      await transferGoldInDB(this.db, character1.author, character2.author, goldAmt)
    } catch (e) {
      logger.error(`Error transferring gold: ${e.message}`)
      await postReply(
        'Something has gone wrong donating gold, please reach out to @ripperoni.com',
        replyResponse.uri, replyResponse.cid, rootUri, rootCid, this.agent,
      )
    }
  }

  async getRollAttempts(subject: string) {
    return await fetchRerollsFromDB(this.db, subject)
  }

  async insertRerollAttempt(subject: string, existingLabel: string, newLabel: string,
    cid: string,
  ) {
    await insertRerollAttemptIntoDB(this.db,
      {
        subject: subject,
        existingLabel: existingLabel,
        newLabel: newLabel,
        cid: cid,
      },
    )
  }

  async reroll(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    const character = await this.getCharacter(req.author)
    if (character === null) {
      await postReply(NOT_SUBSCRIBED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    let rerollAttempts: Reroll[]
    try {
      rerollAttempts = await this.getRollAttempts(subject)
    } catch (e) {
      await postReply(GENERIC_ERROR_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    if (rerollAttempts.length > 1) {
      await postReply(MAX_REROLLS_REACHED_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }

    let existingLabels: string[] = []
    if (rerollAttempts.length == 0) {
      existingLabels.push(character.class)
    } else {
      rerollAttempts.forEach((reroll) => {
        existingLabels.push(reroll.original_class)
        existingLabels.push(reroll.new_class)
      })
    }
    if (character.secondary_class !== null && !existingLabels.includes(character.secondary_class)) {
      existingLabels.push(character.secondary_class)
    }

    let newLabel = character.class
    while (existingLabels.includes(newLabel)) {
      const rndInt = Math.floor(Math.random() * CLASS_LABELS.length)
      newLabel = CLASS_LABELS.at(rndInt)!
    }

    await this.insertRerollAttempt(subject, character.class, newLabel, cid)
    await updateCharacterClass(this.db, subject, newLabel)
    await emitOverideLabel(this.agent, subject, newLabel, character.class)

    if (rerollAttempts.length === 0) {
      await postReply(FIRST_REROLL_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    } else if (rerollAttempts.length === 1) {
      await postReply(SECOND_REROLL_TEXT, uri, cid, rootUri, rootCid, this.agent)
      return
    }
  }
}