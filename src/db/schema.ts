export type TtrpgSchema = {
  reroll: Reroll
  sub_state: SubState
  character: Character
  duel: Duel
  ancestry: Ancestry
  class: Class
}

export type FirehoseSchema = {
  post: Post
  sub_state: SubState
  repo_like: RepoLike
}

export type RepoLike = {
  uri: string,
  cid: string,
  author: string,
  indexedAt: string,
  status: number
}


export type Post = {
  uri: string
  cid: string
  author: string
  parentUri: string | null
  parentCid: string | null
  rootUri: string
  rootCid: string
  indexedAt: string
  status: number
  text: string
}

export type Reroll = {
  cid: string
  author: string
  original_class: string
  new_class: string
}

export type SubState = {
  service: string
  cursor: number
}

export type Character = {
  author: string
  class: string
  secondary_class: string | null
  gold: number
  level: number
  experience: number
  ancestry: string | null
  status: number
}

export type Duel = {
  player1: string
  player2: string
  winner: string | null
  gold: number
  status: number
  cid: string
  uri: string | null
  duel_type: string
  player1_convo_id: string | null
  player1_convo_choice: string | null
  player2_convo_id: string | null
  player2_convo_choice: string | null
  created_at: string | null,
  root_uri: string | null,
  root_cid: string | null,
}

export type Ancestry = {
  name: string
  description: string
}

export type Class = {
  name: string
  description: string
}