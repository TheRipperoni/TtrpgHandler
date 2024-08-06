import { did } from '../agent'
import { BskyAgent } from '@atproto/api'
import { logger } from './logger'

const ozoneEnabled: boolean = process.env.OZONE_ENABLED == '1' || false

export async function emitOverideLabel(agent: BskyAgent, subject: string, newLabel: string,
  oldLabel: string,
) {
  if (!ozoneEnabled) {
    logger.error(`Ozone is disabled`)
    return
  }
  logger.info(`Emitting override label for ${subject} with new ${newLabel} old ${oldLabel}`)
  return await agent
    .withProxy('atproto_labeler', did)
    .api.tools.ozone.moderation.emitEvent({
      event: {
        $type: 'tools.ozone.moderation.defs#modEventLabel',
        createLabelVals: [newLabel],
        negateLabelVals: [oldLabel],
      }, subject: {
        $type: 'com.atproto.admin.defs#repoRef', did: subject,
      }, createdBy: did, createdAt: new Date().toISOString(), subjectBlobCids: [],
    })
}

export async function emitNewLabel(agent: BskyAgent, subject: string, newLabel: string) {
  if (!ozoneEnabled) {
    logger.error(`Ozone is disabled`)
    return
  }
  logger.info(`Emitting new label for ${subject} with ${newLabel}`)
  return await agent
    .withProxy('atproto_labeler', did)
    .api.tools.ozone.moderation.emitEvent({
      event: {
        $type: 'tools.ozone.moderation.defs#modEventLabel',
        createLabelVals: [newLabel],
        negateLabelVals: [],
      }, subject: {
        $type: 'com.atproto.admin.defs#repoRef', did: subject,
      }, createdBy: did, createdAt: new Date().toISOString(), subjectBlobCids: [],
    })
}

export async function emitRemovalLabel(agent: BskyAgent, subject: string,
  labelsToRemove: string[],
) {
  if (!ozoneEnabled) {
    logger.error(`Ozone is disabled`)
    return
  }
  logger.info(`Emitting remove label for ${subject} with ${labelsToRemove.toString()}`)
  return await agent
    .withProxy('atproto_labeler', did)
    .api.tools.ozone.moderation.emitEvent({
      event: {
        $type: 'tools.ozone.moderation.defs#modEventLabel',
        createLabelVals: [],
        negateLabelVals: labelsToRemove,
      }, subject: {
        $type: 'com.atproto.admin.defs#repoRef', did: subject,
      }, createdBy: did, createdAt: new Date().toISOString(), subjectBlobCids: [],
    })
}

export async function emitNewLabels(agent: BskyAgent, subject: string, newLabels: string[], labelsToRemove: string[]) {
  if (!ozoneEnabled) {
    logger.error(`Ozone is disabled`)
    return
  }
  logger.info(`Emitting new labels for ${subject} with ${newLabels.toString()}`)
  logger.info(`Emitting remove labels for ${subject} with ${labelsToRemove.toString()}`)
  return await agent
    .withProxy('atproto_labeler', did)
    .api.tools.ozone.moderation.emitEvent({
      event: {
        $type: 'tools.ozone.moderation.defs#modEventLabel',
        createLabelVals: newLabels,
        negateLabelVals: labelsToRemove,
      }, subject: {
        $type: 'com.atproto.admin.defs#repoRef', did: subject,
      }, createdBy: did, createdAt: new Date().toISOString(), subjectBlobCids: [],
    })
}