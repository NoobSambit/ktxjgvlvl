import "dotenv/config"
import { Types } from "mongoose"
import { connectToDatabase } from "@/platform/db/mongoose"
import { CatalogAlbumModel } from "@/platform/db/models/catalog"
import {
  MissionContributionModel,
  MissionInstanceModel,
  MissionOverrideModel,
  SharedMissionProgressModel,
  UserMissionProgressModel
} from "@/platform/db/models/missions"
import { StreamEventModel } from "@/platform/db/models/streaming"
import { TrackerConnectionModel } from "@/platform/db/models/tracker"
import { UserModel } from "@/platform/db/models/user"
import { materializeLocationActivity } from "@/modules/activity-map/service"
import {
  LeaderboardBoardModel,
  LeaderboardPointEventModel
} from "@/platform/db/models/leaderboards"
import { materializeLeaderboards } from "@/modules/leaderboards/service"
import { missionCellConfig, type MissionCadence, type MissionCellKey } from "@/modules/missions/config"
import { recomputeMissionProgressForUser } from "@/modules/missions/service"
import { getCurrentIndiaPeriods } from "@/platform/time/india-periods"
import { normalizeArtistName } from "@/modules/streaming/normalization"

const MISSION_SCHEMA_VERSION = 3
const ARIRANG_ALBUM_SPOTIFY_ID = "3ukkRHDHbN8tNRPKsGZR1h"

const TRACK_PER_TARGET_COUNT: Record<MissionCellKey, number> = {
  daily_india: 100,
  daily_individual: 1,
  daily_state: 20,
  weekly_india: 300,
  weekly_individual: 3,
  weekly_state: 60
}

const ALBUM_GOAL_UNITS: Record<MissionCellKey, number> = {
  daily_india: 100,
  daily_individual: 1,
  daily_state: 20,
  weekly_india: 100,
  weekly_individual: 1,
  weekly_state: 20
}

type UserLike = {
  _id: Types.ObjectId
  displayName: string
  username: string
  region?: {
    stateKey?: string
    state?: string
    cityKey?: string
    city?: string
    fallbackCityKey?: string
    fallbackCityLabel?: string
  }
}

type AlbumTrackEntry = {
  spotifyId: string
  name: string
  artist: string
}

type ArirangAlbumDoc = {
  spotifyId: string
  name: string
  tracks: AlbumTrackEntry[]
}

type MissionTargetEntry = {
  trackTitle?: string
  albumTitle?: string
  targetCount?: number
}

function getTrackGoalUnits(missionCellKey: MissionCellKey, trackCount: number) {
  return TRACK_PER_TARGET_COUNT[missionCellKey] * trackCount
}

function getPeriodKeyForCadence(cadence: MissionCadence) {
  return getCurrentIndiaPeriods()[cadence].periodKey
}

function buildSlotKey(missionCellKey: MissionCellKey, mechanicType: "track_streams" | "album_completions") {
  return `${missionCellKey}:${mechanicType}`
}

function buildTrackMissionTitle(missionCellKey: MissionCellKey) {
  return `${missionCellConfig[missionCellKey].label} · ARIRANG Songs`
}

function buildAlbumMissionTitle(missionCellKey: MissionCellKey) {
  return `${missionCellConfig[missionCellKey].label} · ARIRANG Album`
}

function buildTrackMissionDescription(
  missionCellKey: MissionCellKey,
  cadence: MissionCadence,
  perTrackTargetCount: number
) {
  const cadenceLabel = cadence === "daily" ? "today" : "this week"

  if (missionCellConfig[missionCellKey].missionKind === "individual_personal") {
    return cadence === "daily"
      ? "Stream every song from BTS's new album ARIRANG once today."
      : `Stream every song from BTS's new album ARIRANG ${perTrackTargetCount} times this week.`
  }

  if (missionCellConfig[missionCellKey].missionKind === "state_shared") {
    return `Your state is pushing every track from BTS's new album ARIRANG ${cadenceLabel}. Target ${perTrackTargetCount} counted streams per song.`
  }

  return `All India is pushing every track from BTS's new album ARIRANG ${cadenceLabel}. Target ${perTrackTargetCount} counted streams per song.`
}

function buildAlbumMissionDescription(missionCellKey: MissionCellKey, cadence: MissionCadence) {
  const cadenceLabel = cadence === "daily" ? "today" : "this week"

  if (missionCellConfig[missionCellKey].missionKind === "individual_personal") {
    return `Complete BTS's new album ARIRANG once ${cadenceLabel}.`
  }

  if (missionCellConfig[missionCellKey].missionKind === "state_shared") {
    return `Your state is completing BTS's new album ARIRANG together ${cadenceLabel}.`
  }

  return `All India is completing BTS's new album ARIRANG together ${cadenceLabel}.`
}

async function clearCurrentPeriodOverrides() {
  const periods = getCurrentIndiaPeriods()

  await MissionOverrideModel.deleteMany({
    schemaVersion: MISSION_SCHEMA_VERSION,
    periodKey: { $in: [periods.daily.periodKey, periods.weekly.periodKey] }
  })
}

async function requireArirangAlbum() {
  const album = await CatalogAlbumModel.findOne({
    spotifyId: ARIRANG_ALBUM_SPOTIFY_ID,
    isBTSFamily: true
  }).lean() as unknown as ArirangAlbumDoc | null

  if (!album) {
    throw new Error("ARIRANG is not present in the IndiaForBTS catalog.")
  }

  if (!Array.isArray(album.tracks) || album.tracks.length === 0) {
    throw new Error("ARIRANG exists in the catalog but has no track listing.")
  }

  if (album.tracks.length !== 14) {
    throw new Error(`Expected 14 ARIRANG tracks, found ${album.tracks.length}.`)
  }

  return album
}

async function resetMissionInstanceState(missionInstanceId: Types.ObjectId) {
  const missionSourceId = String(missionInstanceId)
  const rewardPointEvents = await LeaderboardPointEventModel.find({
    sourceType: "mission_completion",
    sourceId: missionSourceId
  })
    .select({ boardId: 1 })
    .lean()

  const affectedBoardIds = Array.from(
    new Set(
      rewardPointEvents
        .map((event) => String(event.boardId))
        .filter(Boolean)
    )
  ).map((boardId) => new Types.ObjectId(boardId))

  await Promise.all([
    UserMissionProgressModel.deleteMany({ missionInstanceId }),
    SharedMissionProgressModel.deleteMany({ missionInstanceId }),
    MissionContributionModel.deleteMany({ missionInstanceId }),
    LeaderboardPointEventModel.deleteMany({
      sourceType: "mission_completion",
      sourceId: missionSourceId
    })
  ])

  if (affectedBoardIds.length > 0) {
    await LeaderboardBoardModel.updateMany(
      { _id: { $in: affectedBoardIds } },
      { $set: { isDirty: true } }
    )
  }
}

async function rewriteCurrentMissionInstances(album: ArirangAlbumDoc) {
  const periodKeys = [getPeriodKeyForCadence("daily"), getPeriodKeyForCadence("weekly")]
  const instances = await MissionInstanceModel.find({
    schemaVersion: MISSION_SCHEMA_VERSION,
    isActive: true,
    periodKey: { $in: periodKeys }
  })

  const trackKeys = album.tracks.map((track) => track.spotifyId)

  for (const instance of instances) {
    await resetMissionInstanceState(instance._id)

    const missionCellKey = instance.missionCellKey as MissionCellKey
    const cadence = instance.cadence as MissionCadence

    if (instance.mechanicType === "track_streams") {
      const perTrackTargetCount = TRACK_PER_TARGET_COUNT[missionCellKey]
      instance.title = buildTrackMissionTitle(missionCellKey)
      instance.description = buildTrackMissionDescription(
        missionCellKey,
        cadence,
        perTrackTargetCount
      )
      instance.goalUnits = getTrackGoalUnits(missionCellKey, trackKeys.length)
      instance.selectionMode = "admin"
      instance.targetConfig.targets = album.tracks.map((track) => ({
        kind: "track",
        trackKey: track.spotifyId,
        trackTitle: track.name,
        artistKey: normalizeArtistName(track.artist),
        artistName: track.artist,
        targetCount: perTrackTargetCount,
        trackKeys: [track.spotifyId]
      }))
    } else {
      instance.title = buildAlbumMissionTitle(missionCellKey)
      instance.description = buildAlbumMissionDescription(missionCellKey, cadence)
      instance.goalUnits = ALBUM_GOAL_UNITS[missionCellKey]
      instance.selectionMode = "admin"
      instance.targetConfig.targets = [
        {
          kind: "album",
          albumKey: album.spotifyId,
          albumTitle: album.name,
          artistKey: normalizeArtistName("BTS"),
          artistName: "BTS",
          targetCount: 1,
          trackKeys
        }
      ]
    }

    await instance.save()
  }
}

async function recomputeRelevantUsers() {
  const periods = getCurrentIndiaPeriods()
  const streamUserIds = (await StreamEventModel.distinct("userId", {
    isBTSFamily: true,
    playedAt: {
      $gte: periods.weekly.startsAt,
      $lt: periods.weekly.endsAt
    }
  })) as Types.ObjectId[]

  const verifiedConnectionUserIds = (await TrackerConnectionModel.distinct("userId", {
    verificationStatus: "verified"
  })) as Types.ObjectId[]

  const uniqueUserIds = Array.from(
    new Set([...streamUserIds, ...verifiedConnectionUserIds].map((userId) => String(userId)))
  ).map((userId) => new Types.ObjectId(userId))

  const users = (await UserModel.find({
    _id: { $in: uniqueUserIds }
  })
    .select({ displayName: 1, username: 1, region: 1 })
    .lean()) as unknown as UserLike[]

  let recomputedUsers = 0

  for (const user of users) {
    try {
      await recomputeMissionProgressForUser(user as never)
      recomputedUsers += 1
    } catch (error) {
      console.error("Failed to recompute mission progress for user", {
        userId: String(user._id),
        error
      })
    }
  }

  return recomputedUsers
}

async function summarizeCurrentMissions() {
  const periods = getCurrentIndiaPeriods()
  const missions = await MissionInstanceModel.find({
    schemaVersion: MISSION_SCHEMA_VERSION,
    isActive: true,
    periodKey: { $in: [periods.daily.periodKey, periods.weekly.periodKey] }
  })
    .select({
      missionCellKey: 1,
      mechanicType: 1,
      goalUnits: 1,
      title: 1,
      targetConfig: 1,
      periodKey: 1
    })
    .sort({ periodKey: 1, missionCellKey: 1, mechanicType: 1 })
    .lean()

  return missions.map((mission) => ({
    missionCellKey: mission.missionCellKey,
    mechanicType: mission.mechanicType,
    periodKey: mission.periodKey,
    goalUnits: mission.goalUnits,
    title: mission.title,
    targets:
      mission.mechanicType === "track_streams"
        ? mission.targetConfig.targets.map((target: MissionTargetEntry) => ({
            title: target.trackTitle,
            targetCount: target.targetCount
          }))
        : mission.targetConfig.targets.map((target: MissionTargetEntry) => ({
            title: target.albumTitle,
            targetCount: target.targetCount
          }))
  }))
}

async function main() {
  await connectToDatabase()

  const album = await requireArirangAlbum()
  await clearCurrentPeriodOverrides()
  await rewriteCurrentMissionInstances(album)

  const recomputedUsers = await recomputeRelevantUsers()
  const leaderboardResult = await materializeLeaderboards()
  const locationResult = await materializeLocationActivity()
  const missions = await summarizeCurrentMissions()

  console.log(
    JSON.stringify(
      {
        album: {
          spotifyId: album.spotifyId,
          name: album.name,
          trackCount: album.tracks.length
        },
        recomputedUsers,
        leaderboardsMaterialized: leaderboardResult.boardsMaterialized,
        locationSnapshotsMaterialized: locationResult.snapshotsMaterialized,
        missions
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
