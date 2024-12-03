import { TtrpgRequest } from '../vo/ttrpgRequest'
import { did, getProfile, postReplyWithLang } from '../agent'
import { Character, Duel, QuestingParty, QuestingPartyInvite, Reroll } from '../db/schema'
import { AppBskyActorGetProfile, BskyAgent, Label } from '@atproto/api'
import {
  ACCEPT_DUELIST_NO_CHARACTER,
  ACCEPT_PARTY_INVITE_NO_CHARACTER,
  ACCEPT_RECIPIENT_NO_CHARACTER,
  ALREADY_UNSUBBED_TEXT, CHALLENGED_GM_TEXT, CHALLENGED_NOT_SUBSCRIBED_TEXT,
  CHARACTER_IS_ACTIVE_TEXT,
  CHARACTER_IS_DEACTIVATED_TEXT,
  CLASS_LABELS,
  CLASS_LABELS_LOCALE,
  COMMON_ANCESTRIES,
  COMMON_ANCESTRIES_LOCALE,
  CREATE_PARTY_ERROR,
  DONATION_ERROR,
  DONATION_SUCCESSFUL,
  DONOR_NOT_ENOUGH_GOLD_TEXT,
  DONOR_NOT_SUBSCRIBED_TEXT,
  DUEL_ALREADY_RESOLVED_TEXT,
  DUEL_ERROR,
  DUEL_INITIATED, DUEL_SUCCESSFULLY_CANCELLED_TEXT,
  DUEL_WINNER,
  FIRST_REROLL_TEXT,
  GENERIC_ERROR_TEXT,
  GET_STATS_P1, INITIATOR_NOT_SUBSCRIBED_TEXT,
  INVALID_DUEL_GOLD_TEXT,
  INVITE_ERROR,
  JOUST_ALREADY_RESOLVED_TEXT,
  JOUST_SUCCESSFULLY_CANCELLED_TEXT,
  LEVEL_THRESHOLDS,
  LIST_ANCESTRIES_ADDITIONAL_OPTIONS,
  LIST_ANCESTRIES_TEMPLATE,
  LIST_ANCESTRIES_UNEXPECTED_ERROR,
  LIST_COMMANDS_ERROR,
  LIST_COMMANDS_TEXT_P1,
  LIST_COMMANDS_TEXT_P2,
  LIST_COMMANDS_TEXT_P3,
  MAX_REROLLS_REACHED_TEXT,
  NOT_DEACTIVATED_TEXT,
  NOT_PARTY_LEADER_TEXT,
  NOT_SUBSCRIBED_TEXT,
  PARTY_CREATED_SUCCESSFUL,
  PARTY_INVITE_ACCEPTED_TEXT,
  PARTY_INVITE_CREATED,
  PARTY_NOT_EXIST_TEXT,
  PARTY_SIZE_LIMIT_REACHED_TEXT,
  RARE_ANCESTRIES,
  RARE_ANCESTRIES_LOCALE,
  RECIPIENT_NOT_SUBSCRIBED_TEXT,
  SAME_CLASS_TWICE,
  SECOND_REROLL_TEXT,
  SECONDARY_CLASS_ALREADY_CHOSEN_TEXT, SELF_CHALLENGED_TEXT,
  SELF_DONOR_TEXT,
  SUCCESSFULLY_RESUBBED_TEXT,
  SUCCESSFULLY_UNSUBBED_TEXT,
  UNCOMMON_ANCESTRIES,
  UNCOMMON_ANCESTRIES_LOCALE,
  USER_NOT_SUBSCRIBED_TEXT,
} from '../constants'
import {
  acceptPartyInviteDb, cancelPartyInviteFromDb,
  CharacterAlreadyExistsError,
  CharacterNotFoundError,
  chooseAncestryForCharacter,
  createCharacterDB, createPartyDb, createPartyInviteDb,
  deactivateCharInDb,
  fetchRerollsFromDB,
  getCharacterFromDB, getPartyFromDB, getPartyInviteFromDB,
  insertRerollAttemptIntoDB,
  levelUpCharInDB, PartyNotFoundError,
  reactivateCharInDb, transferGoldInDB,
  updateCharacterClass,
  updateSecondaryClassForCharacter,
} from '../helpers/character'
import { emitNewLabel, emitOverideLabel, emitRemovalLabel } from '../util/ozone-util'
import {
  cancelDuelFromDB,
  cancelOutstandingDuels,
  createDuelInDb,
  DuelNotFound,
  getCharacterAllocatedGold, resolveDuel,
} from '../helpers/duel'
import crypto from 'crypto'
import { TtrpgDatabase } from '../db'
import { logger } from '../util/logger'
import { CHAR_DEACTIVATED, DUEL_TYPE, JOUST_CANCELED, JOUST_RESOLVED } from '../db/constants'

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
    const lang = req.lang
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    const profile = await getProfile(this.agent, subject)
    const existingLabel = await this.getCharacterClassLabel(profile)
    if (existingLabel === undefined) {
      await postReplyWithLang(NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    let character = await this.getCharacter(subject)
    if (character === null) {
      await postReplyWithLang(NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    let responseText = GET_STATS_P1[lang]

    if (character.secondary_class === null) {
      if (lang == 'pt') {
        responseText += `\nClasse: ${character.class}`
      } else {
        responseText += `\nClass: ${character.class}`
      }
    } else {
      if (lang == 'pt') {
        responseText += `\nClasse primária:${character.class}\nClasse secundária:${character.secondary_class}`
      } else {
        responseText += `\nPrimary Class: ${character.class}\nSecondary Class: ${character.secondary_class}`
      }
    }
    if (character.ancestry !== null) {
      if (lang == 'pt') {
        responseText += `\nAncestrais: ${character.ancestry}`
      } else {
        responseText += `\nAncestry: ${character.ancestry}`
      }
    }
    if (lang == 'pt') {
      responseText += `\nNível: ${character.level}\nExperiência: ${character.experience}\nOuro: ${character.gold}`
    } else {
      responseText += `\nLevel: ${character.level}\nExperience: ${character.experience}\nGold: ${character.gold}`
    }

    await postReplyWithLang(responseText, uri, cid, rootUri, rootCid, lang, this.agent)
  }

  async levelUp(character: Character, displayName: string, uri: string, cid: string,
    rootUri: string, rootCid: string, lang: string,
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

    let responseText: string
    if (lang == 'pt') {
      responseText = `Parabéns ${displayName}, você subiu de nível para o nível ${level + 1}!`
    } else {
      responseText = `Congratulations ${displayName}, you have leveled up to level ${level + 1}!`
    }
    await postReplyWithLang(responseText, uri, cid, rootUri, rootCid, lang, this.agent)
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

  async getPartyInvite(uri: string): Promise<QuestingPartyInvite | null> {
    try {
      return await getPartyInviteFromDB(this.db, uri)
    } catch (e) {
      if (e instanceof PartyNotFoundError) {
        return null
      } else {
        throw e
      }
    }
  }

  async getParty(party_id: string): Promise<QuestingParty | null> {
    try {
      return await getPartyFromDB(this.db, party_id)
    } catch (e) {
      if (e instanceof PartyNotFoundError) {
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
    const lang = req.lang
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const text = req.text.toLowerCase()

    let character = await this.getCharacter(subject)

    const profile = await getProfile(this.agent, subject)
    const label = await this.getCharacterClassLabel(profile)

    if (label === undefined) {
      await postReplyWithLang(NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    if (character === null) {
      await postReplyWithLang(NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    // Disable as new ancestry is being added
    // if (character.ancestry !== null) {
    //   await postReply(ANCESTRY_ALREADY_CHOSEN_TEXT, uri, cid, rootUri, rootCid, this.agent)
    //   return
    // }

    const splitText = text.split(/\s+/)
    const chosenAncestry = splitText[2]

    if (!COMMON_ANCESTRIES_LOCALE[lang].includes(
      chosenAncestry) && !UNCOMMON_ANCESTRIES_LOCALE[lang].includes(chosenAncestry)) {
      if (character.level < 2 || !RARE_ANCESTRIES_LOCALE[lang].includes(chosenAncestry)) {
        let responseText: string
        if (lang == 'pt') {
          responseText = `${chosenAncestry} não é um ancestral válido para escolher.`
        } else {
          responseText = `${chosenAncestry} is not a valid ancestry to choose from.`
        }
        await postReplyWithLang(responseText, uri, cid, rootUri, rootCid, lang, this.agent)
        return
      }
    }

    let new_ancestry: string
    let i = COMMON_ANCESTRIES_LOCALE[lang].indexOf(chosenAncestry)
    if (i !== -1) {
      new_ancestry = COMMON_ANCESTRIES.at(i) ?? 'error'
    } else {
      i = UNCOMMON_ANCESTRIES_LOCALE[lang].indexOf(chosenAncestry)
      if (i !== -1) {
        new_ancestry = UNCOMMON_ANCESTRIES.at(i) ?? 'error'
      } else {
        i = RARE_ANCESTRIES_LOCALE[lang].indexOf(chosenAncestry)
        new_ancestry = RARE_ANCESTRIES.at(i) ?? 'error'
      }
    }
    if (character.ancestry !== null) {
      await emitRemovalLabel(this.agent, subject, [character.ancestry])
    }
    await emitNewLabel(this.agent, subject, new_ancestry)
    await chooseAncestryForCharacter(this.db, subject, new_ancestry)

    let responseText: string
    if (lang == 'pt') {
      responseText = `Parabéns, agora você é um ${chosenAncestry}.`
    } else {
      if ('aeiou'.includes(chosenAncestry.charAt(0))) {
        //Parabéns, agora você é um
        responseText = `Congratulations, you are now an ${chosenAncestry}.`
      } else {
        //Parabéns, agora você é um
        responseText = `Congratulations, you are now a ${chosenAncestry}.`
      }
    }

    await postReplyWithLang(responseText, uri, cid, rootUri, rootCid, lang, this.agent)
  }

  async chooseSecondaryClass(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const lang = req.lang
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const text = req.text.toLowerCase()

    let character = await this.getCharacter(subject)

    if (character === null) {
      await postReplyWithLang(NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }
    if (character.status === CHAR_DEACTIVATED) {
      await postReplyWithLang(CHARACTER_IS_DEACTIVATED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    if (character.secondary_class !== null) {
      await postReplyWithLang(SECONDARY_CLASS_ALREADY_CHOSEN_TEXT[lang], uri, cid, rootUri, rootCid,
        lang, this.agent,
      )
      return
    }

    const splitText = text.split(/\s+/)
    const chosenClass = splitText[2]

    if (!CLASS_LABELS_LOCALE[lang].includes(chosenClass)) {
      let responseText: string
      if (lang == 'pt') {
        responseText = `${chosenClass} não é uma classe válida para escolher.`
      } else {
        responseText = `${chosenClass} is not a valid class to choose from.`
      }
      await postReplyWithLang(responseText, uri, cid, rootUri, rootCid, lang, this.agent)
      return
    }

    let new_class: string
    let i = CLASS_LABELS_LOCALE[lang].indexOf(chosenClass)
    new_class = CLASS_LABELS.at(i) ?? 'error'

    if (character.class == new_class) {
      await postReplyWithLang(SAME_CLASS_TWICE[lang], uri, cid, rootUri, rootCid, lang, this.agent)
      return
    }

    await emitNewLabel(this.agent, subject, new_class)
    await updateSecondaryClassForCharacter(this.db, subject, new_class)

    let responseText: string
    if (lang == 'pt') {
      responseText = `Parabéns, agora você é um ${character.class}/${chosenClass}.`
    } else {
      if ('aeiou'.includes(character.class.charAt(0))) {
        //Parabéns, agora você é um
        responseText = `Congratulations, you are now an ${character.class}/${chosenClass}.`
      } else {
        //Parabéns, agora você é um
        responseText = `Congratulations, you are now a ${character.class}/${chosenClass}.`
      }
    }
    await postReplyWithLang(responseText, uri, cid, rootUri, rootCid, lang, this.agent)
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
    const lang = req.lang
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
        await postReplyWithLang(ALREADY_UNSUBBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
          this.agent,
        )
        return
      }
    }


    let labelsToRemove: string[] = []
    existingLabels.forEach((label) => {
      labelsToRemove.push(label.val)
    })

    await cancelOutstandingDuels(this.db, subject)
    await emitRemovalLabel(this.agent, subject, labelsToRemove)
    await postReplyWithLang(SUCCESSFULLY_UNSUBBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
      this.agent,
    )
  }

  async resubscribe(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const lang = req.lang
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    let character = await this.getCharacter(subject)

    if (character === null) {
      await postReplyWithLang(NOT_DEACTIVATED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    if (character.status === 1) {
      await postReplyWithLang(CHARACTER_IS_ACTIVE_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
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

    await postReplyWithLang(SUCCESSFULLY_RESUBBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
      this.agent,
    )
  }

  async listAncestries(req: TtrpgRequest) {
    const cid = req.cid
    const uri = req.uri
    const lang = req.lang
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    let character: Character | null
    try {
      character = await this.getCharacter(req.author)
    } catch (e) {
      logger.error(`Error encountered: ${e.message}`)
      await postReplyWithLang(LIST_ANCESTRIES_UNEXPECTED_ERROR[lang], req.uri, req.cid, req.rootUri,
        req.rootCid,
        lang, this.agent,
      )
      return
    }

    if (character === null) {
      await postReplyWithLang(NOT_SUBSCRIBED_TEXT[lang], req.uri, req.cid, req.rootUri, req.rootCid,
        lang, this.agent,
      )
      return
    }

    let responseText = LIST_ANCESTRIES_TEMPLATE[lang]
    let i = 0
    COMMON_ANCESTRIES_LOCALE[lang].forEach((ancestry) => {
      if (i > 0) {
        responseText += `, `
      }
      responseText += `${ancestry}`
      i += 1
    })
    UNCOMMON_ANCESTRIES_LOCALE[lang].forEach((ancestry) => {
      responseText += `, `
      responseText += `${ancestry}`
    })
    let res = await postReplyWithLang(responseText, uri, cid, rootUri, rootCid, lang, this.agent)

    if (character.level > 1) {
      let j = 0
      let responseText2 = LIST_ANCESTRIES_ADDITIONAL_OPTIONS[lang]
      RARE_ANCESTRIES_LOCALE[lang].forEach((ancestry) => {
        if (j > 0) {
          responseText2 += `, `
        }
        responseText2 += `${ancestry}`
        j += 1
      })
      await postReplyWithLang(responseText2, res.uri, res.cid, rootUri, rootCid, lang, this.agent)
    }

    return
  }

  async listCommands(req: TtrpgRequest) {
    const cid = req.cid
    const lang = req.lang
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    let character: Character | null
    try {
      character = await this.getCharacter(req.author)
    } catch (e) {
      logger.error(`Error encountered: ${e.message}`)
      await postReplyWithLang(LIST_COMMANDS_ERROR[lang], req.uri, req.cid, req.rootUri,
        req.rootCid,
        lang, this.agent,
      )
      return
    }

    if (character === null) {
      await postReplyWithLang(NOT_SUBSCRIBED_TEXT[lang], req.uri, req.cid, req.rootUri, req.rootCid,
        lang, this.agent,
      )
      return
    }

    let res = await postReplyWithLang(LIST_COMMANDS_TEXT_P1[lang], uri, cid, rootUri, rootCid, lang,
      this.agent,
    )
    res = await postReplyWithLang(LIST_COMMANDS_TEXT_P2[lang], res.uri, res.cid, rootUri, rootCid,
      lang, this.agent,
    )
    res = await postReplyWithLang(LIST_COMMANDS_TEXT_P3[lang], res.uri, res.cid, rootUri, rootCid,
      lang, this.agent,
    )
    return
  }

  async createParty(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const lang = req.lang
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    const profile1 = await getProfile(this.agent, subject)
    const player1Label = await this.getCharacterClassLabel(profile1)
    if (player1Label === undefined) {
      await postReplyWithLang(DONOR_NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    let character1 = await this.getCharacter(subject)

    if (character1 === null) {
      await postReplyWithLang(USER_NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    try {
      await createPartyDb(this.db, {
        party_id: rootUri,
        subject: subject,
      })
      await postReplyWithLang(PARTY_CREATED_SUCCESSFUL[lang], uri, cid, rootUri,
        rootCid, lang, this.agent,
      )

    } catch (e) {
      logger.error(`Error creating party: ${e.message}`)
      await postReplyWithLang(CREATE_PARTY_ERROR[lang], uri, cid, rootUri,
        rootCid, lang, this.agent,
      )
    }
  }

  async createPartyInvite(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const lang = req.lang
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    const profile1 = await getProfile(this.agent, subject)
    const player1Label = await this.getCharacterClassLabel(profile1)
    if (player1Label === undefined) {
      await postReplyWithLang(DONOR_NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    let party = await this.getParty(rootUri)

    if (party === null) {
      await postReplyWithLang(PARTY_NOT_EXIST_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    } else if (party.party_leader != subject) {
      await postReplyWithLang(NOT_PARTY_LEADER_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    } else if (party.party_leader != subject) {
      await postReplyWithLang(NOT_PARTY_LEADER_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    } else if (party.party_size >= 4) {
      await postReplyWithLang(PARTY_SIZE_LIMIT_REACHED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    const text = req.text

    const splitText = text.split(/\s+/)

    const challengedPlayerHandle = splitText[2].substring(1)

    if (challengedPlayerHandle === 'bskyttrpg.bsky.social') {
      await postReplyWithLang(CHALLENGED_GM_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    const profile2 = await getProfile(this.agent, challengedPlayerHandle)
    const player2Label = await this.getCharacterClassLabel(profile2)
    if (player2Label === undefined) {
      await postReplyWithLang(CHALLENGED_NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid,
        lang, this.agent,
      )
      return
    }

    if (subject == profile2.data.did) {
      await postReplyWithLang(SELF_CHALLENGED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    let character2 = await this.getCharacter(profile2.data.did)

    if (character2 === null) {
      await postReplyWithLang(CHALLENGED_NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid,
        lang, this.agent,
      )
      return
    }

    const replyResponse = await postReplyWithLang(PARTY_INVITE_CREATED[lang], uri, cid, rootUri,
      rootCid, lang,
      this.agent,
    )

    try {
      await this.insertNewPartyInvite(profile2.data.did, rootUri, replyResponse.uri)
    } catch (e) {
      logger.error(`Error inserting new party invite: ${e.message}`)
      await postReplyWithLang(INVITE_ERROR[lang], replyResponse.uri, replyResponse.cid, rootUri,
        rootCid, lang, this.agent,
      )
    }
  }

  async insertNewPartyInvite(player: string, party_id: string, invite_id: string) {
    await createPartyInviteDb(this.db, {
      party_id: party_id,
      subject: player,
      invite_id: invite_id,
    })
  }

  async acceptPartyInvite(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const lang = req.lang
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const parentUri = req.parentUri

    if (parentUri === undefined) {
      return
    }

    let partyInvite: QuestingPartyInvite | null
    try {
      partyInvite = await this.getPartyInvite(parentUri)
    } catch (e) {
      if (e instanceof DuelNotFound) {
        return
      } else {
        logger.error(
          `Error encountered getting party invite in accept duel.\nReq: ${req}\nerror:${e.message}`)
        return
      }
    }
    if (partyInvite === null) {
      return
    }

    //If user who posted accept isn't challenged or duel already resolved
    if (partyInvite.character != subject) {
      return
    } else if (partyInvite.status != 0) {
      return
    }

    const character1 = await this.getCharacter(subject)
    if (character1 === null) {
      await postReplyWithLang(ACCEPT_PARTY_INVITE_NO_CHARACTER[lang], uri, cid, rootUri, rootCid,
        lang,
        this.agent,
      )
      return
    }

    const replyResponse = await postReplyWithLang(PARTY_INVITE_ACCEPTED_TEXT[lang], uri, cid,
      rootUri, rootCid, lang,
      this.agent,
    )

    try {
      await acceptPartyInviteDb(this.db, {
        party_id: rootUri,
        subject: subject,
        invite_id: partyInvite.invite_id,
      })
    } catch (e) {
      logger.error(`Error accepting new party invite: ${e.message}`)
      await postReplyWithLang(INVITE_ERROR[lang], replyResponse.uri, replyResponse.cid, rootUri,
        rootCid, lang, this.agent,
      )
    }
  }

  async rejectPartyInvite(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const uri = req.uri
    const lang = req.lang
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const parentCid = req.parentCid
    const parentUri = req.parentUri

    if (parentUri === undefined) {
      return
    }

    let partyInvite: QuestingPartyInvite | null
    try {
      partyInvite = await this.getPartyInvite(parentUri)
    } catch (e) {
      if (e instanceof DuelNotFound) {
        logger.info('Duel not found')
        return
      } else {
        logger.error(`Error encountered getting duel: ${e.message}`)
        return
      }
    }
    if (partyInvite === null) {
      logger.info('Duel is null')
      return
    }

    try {
      await cancelPartyInviteFromDb(partyInvite.invite_id, this.db)
    } catch (e) {
      logger.error(`Error encountered cancelling duel from db: ${e.message}`)
      throw e
    }

    await postReplyWithLang(DUEL_SUCCESSFULLY_CANCELLED_TEXT[lang], uri, cid, rootUri, rootCid,
      lang, this.agent,
    )
  }

  async giveGold(req: TtrpgRequest) {
    const subject = req.author
    const cid = req.cid
    const lang = req.lang
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri
    const text = req.text

    const splitText = text.split(/\s+/)
    const otherPlayerHandler = splitText[2].substring(1)


    const profile1 = await getProfile(this.agent, subject)
    const player1Label = await this.getCharacterClassLabel(profile1)
    if (player1Label === undefined) {
      await postReplyWithLang(DONOR_NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    const profile2 = await getProfile(this.agent, otherPlayerHandler)
    const player2Label = await this.getCharacterClassLabel(profile2)
    if (player2Label === undefined) {
      await postReplyWithLang(RECIPIENT_NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    if (subject == profile2.data.did) {
      await postReplyWithLang(SELF_DONOR_TEXT[lang], uri, cid, rootUri, rootCid, lang, this.agent)
      return
    }

    let character1 = await this.getCharacter(subject)
    let character2 = await this.getCharacter(profile2.data.did)

    if (character1 === null) {
      await postReplyWithLang(DONOR_NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }
    if (character2 === null) {
      await postReplyWithLang(RECIPIENT_NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    let goldAmt = Number.parseFloat(splitText[3])
    if (!Number.isInteger(goldAmt)) {
      await postReplyWithLang(INVALID_DUEL_GOLD_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    const char1AllocatedGold = await getCharacterAllocatedGold(character1.author, this.db)
    const character1AvailableGold = character1.gold - char1AllocatedGold

    if (goldAmt < 1) {
      await postReplyWithLang(INVALID_DUEL_GOLD_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    } else if (character1AvailableGold < goldAmt) {
      await postReplyWithLang(DONOR_NOT_ENOUGH_GOLD_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    const replyResponse = await postReplyWithLang(DONATION_SUCCESSFUL[lang], uri, cid, rootUri,
      rootCid, lang, this.agent,
    )

    try {
      await transferGoldInDB(this.db, character1.author, character2.author, goldAmt)
    } catch (e) {
      logger.error(`Error transferring gold: ${e.message}`)
      await postReplyWithLang(DONATION_ERROR[lang], replyResponse.uri, replyResponse.cid, rootUri,
        rootCid, lang, this.agent,
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
    const lang = req.lang
    const uri = req.uri
    const rootCid = req.rootCid
    const rootUri = req.rootUri

    const character = await this.getCharacter(req.author)
    if (character === null) {
      await postReplyWithLang(NOT_SUBSCRIBED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    let rerollAttempts: Reroll[]
    try {
      rerollAttempts = await this.getRollAttempts(subject)
    } catch (e) {
      await postReplyWithLang(GENERIC_ERROR_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }

    if (rerollAttempts.length > 1) {
      await postReplyWithLang(MAX_REROLLS_REACHED_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
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
      await postReplyWithLang(FIRST_REROLL_TEXT[lang], uri, cid, rootUri, rootCid, lang, this.agent)
      return
    } else if (rerollAttempts.length === 1) {
      await postReplyWithLang(SECOND_REROLL_TEXT[lang], uri, cid, rootUri, rootCid, lang,
        this.agent,
      )
      return
    }
  }
}