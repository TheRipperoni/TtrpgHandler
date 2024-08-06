import {
  AppBskyActorGetProfile,
  BskyAgent,
  ChatBskyConvoGetConvoForMembers,
  ChatBskyConvoGetMessages,
} from '@atproto/api'
import 'dotenv/config'
import { logger } from './util/logger'
import { Facet } from '@atproto/api/src/rich-text/detection'

export class FailedToSend extends Error {}

export const DM_SERVICE_HEADERS = {
  'atproto-proxy': 'did:web:api.bsky.chat#bsky_chat',
}

export const getAgent = async () => {
  const agent = new BskyAgent({
    service: process.env.BSKY_SERVICE ?? 'https://bsky.social',
  })

  await agent.login({
    identifier: 'bskyttrpg.bsky.social',
    password: process.env.AGENT_PASSWORD ?? '',
  })
  return agent
}

export const did = 'did:plc:hysbs7znfgxyb4tsvetzo4sk'

BskyAgent.configure({
  appLabelers: [did],
})

export const postReply = async (text: string,
  uri: string,
  cid: string,
  rootUri: string,
  rootCid: string,
  agent: BskyAgent,
): Promise<{ uri: string; cid: string }> => {
  return await agent.post({
    text: text,
    reply: {
      root: {
        uri: rootUri,
        cid: rootCid,
      },
      parent: {
        uri: uri,
        cid: cid,
      },
    },
  })
}

export const postReplyWithFacets = async (text: string,
  uri: string,
  cid: string,
  rootUri: string,
  rootCid: string,
  agent: BskyAgent,
  facets: Facet[]
): Promise<{ uri: string; cid: string }> => {
  return await agent.post({
    text: text,
    reply: {
      root: {
        uri: rootUri,
        cid: rootCid,
      },
      parent: {
        uri: uri,
        cid: cid,
      },
    },
    facets: facets,
  })
}

export const postReplyWithEmbed = async (text: string,
  uri: string,
  cid: string,
  rootUri: string,
  rootCid: string,
  agent: BskyAgent,
  embedRecord: { uri: string, cid: string },
): Promise<{ uri: string; cid: string }> => {
  return await agent.post({
    text: text,
    reply: {
      root: {
        uri: rootUri,
        cid: rootCid,
      },
      parent: {
        uri: uri,
        cid: cid,
      },
    },
    embed: {
      $type: 'app.bsky.embed.record',
      record: embedRecord,
    },
  })
}

export const getConvoForMembers = async (agent: BskyAgent,
  player: string,
): Promise<ChatBskyConvoGetConvoForMembers.Response> => {
  return await agent.api.chat.bsky.convo.getConvoForMembers({ members: [did, player] },
    { headers: DM_SERVICE_HEADERS },
  )
}

export const sendMessage = async (agent: BskyAgent, convoId: string,
  text: string,
) => {
  const response = await agent.api.chat.bsky.convo.sendMessage(
    {
      convoId: convoId,
      message: {
        text: text,
      },
    },
    {
      encoding: 'application/json',
      headers: DM_SERVICE_HEADERS,
    },
  )
  if (!response.success) {
    logger.error(`Failed to send message to convoId: ${convoId}`)
    logger.error(response.data)
    throw new FailedToSend()
  }
}

export const getMessages = async (agent: BskyAgent,
  convoId: string,
): Promise<ChatBskyConvoGetMessages.Response> => {
  return await agent.api.chat.bsky.convo.getMessages({ convoId: convoId }, {
    headers: DM_SERVICE_HEADERS,
  })
}

/**
 * Gets the profile from BSKY
 * @param agent
 * @param actor - DID for the user
 */
export const getProfile = async (agent: BskyAgent,
  actor: string,
): Promise<AppBskyActorGetProfile.Response> => {
  const profile = await agent.getProfile({ actor: actor })
  if (!profile.success) {
    logger.error(`Unable to locate ${actor}'s profile`)
    throw new Error('Unable to locate player\'s profile')
  }

  return profile
}