import mongoose, { type Model } from "mongoose"
import { connectToDatabase } from "@/platform/db/mongoose"
import {
  LeaderboardBoardModel,
  LeaderboardEntryModel,
  LeaderboardPointEventModel,
  LeaderboardRankSnapshotModel
} from "@/platform/db/models/leaderboards"
import {
  LocationActivityEventModel,
  LocationActivityParticipantModel,
  LocationActivitySnapshotModel
} from "@/platform/db/models/activity-map"
import {
  StreamEventModel,
  StreamSyncCheckpointModel,
  UserStreamDailyStatModel,
  UserTrackCounterModel
} from "@/platform/db/models/streaming"
import {
  MissionContributionModel,
  MissionInstanceModel,
  MissionOverrideModel,
  SharedMissionProgressModel,
  UserMissionProgressModel
} from "@/platform/db/models/missions"
import { UserModel } from "@/platform/db/models/user"
import { LocationStateModel } from "@/platform/db/models/locations"
import { RegionConfirmationModel } from "@/platform/db/models/tracker"
import { getCurrentIndiaPeriods } from "@/platform/time/india-periods"
import { cacheTags, revalidateCacheTags } from "@/platform/cache/shared"

const defaultStreamRetentionDays = 14
const legacyCollectionNames = [
  "leaderboardpointevents",
  "locationactivityevents",
  "streamsynccheckpoints",
  "userstreamdailystats",
  "usertrackcounters",
  "regionconfirmations"
] as const

export async function backfillLifetimeStreamStatsFromStreamEvents() {
  await connectToDatabase()

  const [userTotals, stateTotals] = await Promise.all([
    StreamEventModel.aggregate<{
      _id: string
      totalVerifiedBtsStreams: number
      lastVerifiedStreamAt?: Date
    }>([
      { $match: { isBTSFamily: true } },
      {
        $group: {
          _id: "$userId",
          totalVerifiedBtsStreams: { $sum: 1 },
          lastVerifiedStreamAt: { $max: "$playedAt" }
        }
      }
    ]),
    StreamEventModel.aggregate<{
      _id: string
      totalVerifiedBtsStreams: number
      lastVerifiedStreamAt?: Date
    }>([
      {
        $match: {
          isBTSFamily: true,
          stateKey: { $type: "string", $ne: "" }
        }
      },
      {
        $group: {
          _id: "$stateKey",
          totalVerifiedBtsStreams: { $sum: 1 },
          lastVerifiedStreamAt: { $max: "$playedAt" }
        }
      }
    ])
  ])

  if (userTotals.length > 0) {
    await UserModel.bulkWrite(
      userTotals.map((entry) => ({
        updateOne: {
          filter: { _id: entry._id },
          update: {
            $max: {
              "streamStats.totalVerifiedBtsStreams": entry.totalVerifiedBtsStreams,
              "streamStats.lastVerifiedStreamAt": entry.lastVerifiedStreamAt ?? null
            }
          }
        }
      })),
      { ordered: false }
    )
  }

  if (stateTotals.length > 0) {
    await LocationStateModel.bulkWrite(
      stateTotals.map((entry) => ({
        updateOne: {
          filter: { stateKey: entry._id },
          update: {
            $max: {
              "streamStats.totalVerifiedBtsStreams": entry.totalVerifiedBtsStreams,
              "streamStats.lastVerifiedStreamAt": entry.lastVerifiedStreamAt ?? null
            }
          }
        }
      })),
      { ordered: false }
    )
  }

  return {
    usersBackfilled: userTotals.length,
    statesBackfilled: stateTotals.length
  }
}

function isAtlasQuotaError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  const mongoCode = "code" in error ? (error as { code?: unknown }).code : undefined
  const mongoName = "codeName" in error ? (error as { codeName?: unknown }).codeName : undefined
  return mongoCode === 8000 || mongoName === "AtlasError"
}

async function runFreeTierOperationalDataCleanup(options: {
  includeCurrentPeriodReceipts?: boolean
  preserveHistoricalBtsStreams?: boolean
  streamRetentionDays?: number
} = {}) {
  await connectToDatabase()

  const periods = getCurrentIndiaPeriods()
  const activePeriodKeys = [periods.daily.periodKey, periods.weekly.periodKey]
  const retentionDays = options.streamRetentionDays ?? defaultStreamRetentionDays
  const streamRetentionCutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
  const currentBoards = await LeaderboardBoardModel.find({
    schemaVersion: 2,
    periodKey: { $in: activePeriodKeys }
  })
    .select({ _id: 1 })
    .lean()
  const currentBoardIds = currentBoards.map((board) => board._id)
  const oldMissionInstances = await MissionInstanceModel.find({
    periodKey: { $nin: activePeriodKeys }
  })
    .select({ _id: 1 })
    .lean()
  const oldMissionIds = oldMissionInstances.map((instance) => instance._id)
  const pointEventFilter = options.includeCurrentPeriodReceipts
    ? {}
    : { periodKey: { $nin: activePeriodKeys } }
  const activityEventFilter = options.includeCurrentPeriodReceipts
    ? {}
    : { periodKey: { $nin: activePeriodKeys } }
  const streamEventFilter = options.preserveHistoricalBtsStreams
    ? { isBTSFamily: { $ne: true } }
    : {
        $or: [{ isBTSFamily: { $ne: true } }, { playedAt: { $lt: streamRetentionCutoff } }]
      }
  const emptyDeleteResult = { deletedCount: 0 }

  const [
    pointEventsDeleted,
    activityEventsDeleted,
    oldStreamEventsDeleted,
    oldBoardsDeleted,
    oldEntriesDeleted,
    oldSnapshotsDeleted,
    oldBoardSnapshotsDeleted,
    oldParticipantsDeleted,
    oldMissionInstancesDeleted,
    oldUserMissionProgressDeleted,
    oldSharedMissionProgressDeleted,
    oldMissionContributionsDeleted,
    oldMissionOverridesDeleted,
    unusedStreamCheckpointsDeleted,
    unusedUserDailyStatsDeleted,
    unusedUserTrackCountersDeleted,
    unusedRegionConfirmationsDeleted
  ] = await Promise.all([
    deleteManyIfCollectionExists(LeaderboardPointEventModel, pointEventFilter),
    deleteManyIfCollectionExists(LocationActivityEventModel, activityEventFilter),
    StreamEventModel.deleteMany(streamEventFilter),
    LeaderboardBoardModel.deleteMany({
      schemaVersion: 2,
      periodKey: { $nin: activePeriodKeys }
    }),
    currentBoardIds.length > 0
      ? LeaderboardEntryModel.deleteMany({
          boardId: { $nin: currentBoardIds }
        })
      : Promise.resolve(emptyDeleteResult),
    LocationActivitySnapshotModel.deleteMany({
      periodKey: { $nin: activePeriodKeys }
    }),
    currentBoardIds.length > 0
      ? LeaderboardRankSnapshotModel.deleteMany({
          boardId: { $nin: currentBoardIds }
        })
      : Promise.resolve(emptyDeleteResult),
    LocationActivityParticipantModel.deleteMany({
      periodKey: { $nin: activePeriodKeys }
    }),
    MissionInstanceModel.deleteMany({
      _id: { $in: oldMissionIds }
    }),
    UserMissionProgressModel.deleteMany({
      missionInstanceId: { $in: oldMissionIds }
    }),
    SharedMissionProgressModel.deleteMany({
      missionInstanceId: { $in: oldMissionIds }
    }),
    MissionContributionModel.deleteMany({
      missionInstanceId: { $in: oldMissionIds }
    }),
    MissionOverrideModel.deleteMany({
      periodKey: { $nin: activePeriodKeys }
    }),
    deleteManyIfCollectionExists(StreamSyncCheckpointModel),
    deleteManyIfCollectionExists(UserStreamDailyStatModel),
    deleteManyIfCollectionExists(UserTrackCounterModel),
    deleteManyIfCollectionExists(RegionConfirmationModel)
  ])

  revalidateCacheTags(
    cacheTags.leaderboards,
    cacheTags.leaderboardsStatus,
    cacheTags.activityMap,
    cacheTags.activityMapDaily,
    cacheTags.activityMapWeekly,
    cacheTags.activityMapAdmin,
    cacheTags.adminOverview,
    cacheTags.missions,
    cacheTags.missionSharedProgress,
    cacheTags.missionInstances
  )

  return {
    pointEventsDeleted: pointEventsDeleted.deletedCount ?? 0,
    activityEventsDeleted: activityEventsDeleted.deletedCount ?? 0,
    oldStreamEventsDeleted: oldStreamEventsDeleted.deletedCount ?? 0,
    oldBoardsDeleted: oldBoardsDeleted.deletedCount ?? 0,
    oldEntriesDeleted: oldEntriesDeleted.deletedCount ?? 0,
    oldSnapshotsDeleted: oldSnapshotsDeleted.deletedCount ?? 0,
    oldBoardSnapshotsDeleted: oldBoardSnapshotsDeleted.deletedCount ?? 0,
    oldParticipantsDeleted: oldParticipantsDeleted.deletedCount ?? 0,
    oldMissionInstancesDeleted: oldMissionInstancesDeleted.deletedCount ?? 0,
    oldUserMissionProgressDeleted: oldUserMissionProgressDeleted.deletedCount ?? 0,
    oldSharedMissionProgressDeleted: oldSharedMissionProgressDeleted.deletedCount ?? 0,
    oldMissionContributionsDeleted: oldMissionContributionsDeleted.deletedCount ?? 0,
    oldMissionOverridesDeleted: oldMissionOverridesDeleted.deletedCount ?? 0,
    unusedStreamCheckpointsDeleted: unusedStreamCheckpointsDeleted.deletedCount ?? 0,
    unusedUserDailyStatsDeleted: unusedUserDailyStatsDeleted.deletedCount ?? 0,
    unusedUserTrackCountersDeleted: unusedUserTrackCountersDeleted.deletedCount ?? 0,
    unusedRegionConfirmationsDeleted: unusedRegionConfirmationsDeleted.deletedCount ?? 0,
    streamRetentionDays: retentionDays
  }
}

export async function emergencyFreeTierCleanup(options: {
  streamRetentionDays?: number
} = {}) {
  return runFreeTierOperationalDataCleanup({
    includeCurrentPeriodReceipts: false,
    preserveHistoricalBtsStreams: true,
    streamRetentionDays: options.streamRetentionDays
  })
}

async function dropCollectionIfPresent(collectionName: string) {
  const db = mongoose.connection.db

  if (!db) {
    return false
  }

  const existingCollections = await db.listCollections({ name: collectionName }, { nameOnly: true }).toArray()

  if (existingCollections.length === 0) {
    return false
  }

  await db.dropCollection(collectionName)
  return true
}

async function collectionExists(collectionName: string) {
  const db = mongoose.connection.db

  if (!db) {
    return false
  }

  const existingCollections = await db.listCollections({ name: collectionName }, { nameOnly: true }).toArray()
  return existingCollections.length > 0
}

async function deleteManyIfCollectionExists<T>(
  model: Model<T>,
  filter: Record<string, unknown> = {}
) {
  if (!(await collectionExists(model.collection.collectionName))) {
    return { deletedCount: 0 }
  }

  return model.deleteMany(filter)
}

export async function dropLegacyStorageCollections() {
  await connectToDatabase()

  const droppedCollections: string[] = []

  for (const collectionName of legacyCollectionNames) {
    if (await dropCollectionIfPresent(collectionName)) {
      droppedCollections.push(collectionName)
    }
  }

  revalidateCacheTags(
    cacheTags.leaderboardsStatus,
    cacheTags.activityMapAdmin,
    cacheTags.adminOverview
  )

  return {
    droppedCollections
  }
}

export async function pruneFreeTierOperationalData(options: {
  includeCurrentPeriodReceipts?: boolean
  streamRetentionDays?: number
} = {}) {
  return runFreeTierOperationalDataCleanup({
    includeCurrentPeriodReceipts: options.includeCurrentPeriodReceipts,
    preserveHistoricalBtsStreams: false,
    streamRetentionDays: options.streamRetentionDays
  })
}

export async function migrateToFreeTierStorage(options: {
  streamRetentionDays?: number
} = {}) {
  await connectToDatabase()

  const emergencyCleanup = await emergencyFreeTierCleanup({
    streamRetentionDays: options.streamRetentionDays
  })

  try {
    const lifetimeStats = await backfillLifetimeStreamStatsFromStreamEvents()
    const finalCleanup = await pruneFreeTierOperationalData({
      includeCurrentPeriodReceipts: false,
      streamRetentionDays: options.streamRetentionDays
    })

    return {
      status: "completed",
      emergencyCleanup,
      lifetimeStats,
      finalCleanup
    }
  } catch (error) {
    if (!isAtlasQuotaError(error)) {
      throw error
    }

    return {
      status: "cleanup_only",
      emergencyCleanup,
      needsRerun: true,
      message:
        "Emergency cleanup succeeded, but Atlas still rejected follow-up writes. Rerun this command after the freed space is reflected."
    }
  }
}
