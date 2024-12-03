export interface TtrpgRequest {
  author: string
  text: string
  uri: string
  cid: string
  lang: string
  rootUri: string
  rootCid: string
  parentCid: string | undefined
  parentUri: string | undefined
}

export enum RequestType {
  REROLL,
  CREATE_DUEL,
  ACCEPT_DUEL,
  REJECT_DUEL,
  FETCH_OPEN_DUELS,
  STATS,
  LIST_ANCESTRIES,
  CHOOSE_ANCESTRY,
  UNSUBSCRIBE,
  RESUBSCRIBE,
  CANCEL_ALL_DUELS,
  CHOOSE_SECONDARY_CLASS,
  JOUST,
  INVALID,
  GIVE_GOLD,
  LIST_COMMANDS,
  CREATE_PARTY,
  INVITE_TO_PARTY,
}