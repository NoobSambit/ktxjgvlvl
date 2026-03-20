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
import { UserModel } from "@/platform/db/models/user"
import {
  buildLocationActivityEvents,
  materializeLocationActivity,
  recordLocationActivityEvents
} from "@/modules/activity-map/service"
import {
  LeaderboardBoardModel,
  LeaderboardPointEventModel
} from "@/platform/db/models/leaderboards"
import {
  materializeLeaderboards,
  recordLeaderboardPointEvents
} from "@/modules/leaderboards/service"
import { getEffectivePlaceFromRegion, getStateScopeSource } from "@/modules/locations/service"
import { missionCellConfig, type MissionCadence, type MissionCellKey } from "@/modules/missions/config"
import { buildStateKey } from "@/platform/integrations/geo/state-scopes"
import { getCurrentIndiaPeriods } from "@/platform/time/india-periods"
import { normalizeArtistName } from "@/modules/streaming/normalization"

const MISSION_SCHEMA_VERSION = 3
const ARIRANG_ALBUM_SPOTIFY_ID = "3ukkRHDHbN8tNRPKsGZR1h"
const INDIA_SCOPE_KEY = "india:all"

const TRACK_PER_TARGET_COUNT: Record<MissionCellKey, number> = {
  daily_india: 200,
  daily_individual: 2,
  daily_state: 40,
  weekly_india: 600,
  weekly_individual: 6,
  weekly_state: 120
}

const ALBUM_GOAL_UNITS: Record<MissionCellKey, number> = {
  daily_india: 200,
  daily_individual: 1,
  daily_state: 40,
  weekly_india: 200,
  weekly_individual: 1,
  weekly_state: 40
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

type StreamEventLike = {
  userId: Types.ObjectId
  playedAt: Date
  catalogTrackSpotifyId?: string
  stateKey?: string
}

function formatTimes(count: number, cadence: MissionCadence) {
  if (count === 1) {
    return cadence === "daily" ? "once today" : "once this week"
  }

  return `${count} times ${cadence === "daily" ? "today" : "this week"}`
}

function getTrackGoalUnits(missionCellKey: MissionCellKey, trackCount: number) {
  return TRACK_PER_TARGET_COUNT[missionCellKey] * trackCount
}

function buildTrackTargetProgressKey(trackKey: string) {
  return `track:${trackKey}`
}

function buildAlbumTargetProgressKey(albumKey: string) {
  return `album:${albumKey}`
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
    return `Stream every song from BTS's new album ARIRANG ${formatTimes(perTrackTargetCount, cadence)}.`
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

function getUserStateContext(user?: UserLike) {
  const stateSource = getStateScopeSource(user?.region)
  const stateKey = stateSource ? buildStateKey(stateSource) : undefined

  return {
    stateKey,
    stateLabel: user?.region?.state,
    effectivePlace: getEffectivePlaceFromRegion(user?.region)
  }
}

async function awardPersonalMissionCompletion(
  user: UserLike,
  mission: InstanceType<typeof MissionInstanceModel>,
  progressId: Types.ObjectId,
  occurredAt: Date
) {
  const { stateKey, stateLabel, effectivePlace } = getUserStateContext(user)

  if (!stateKey || !stateLabel) {
    return
  }

  const result = await recordLeaderboardPointEvents([
    {
      boardType: "individual",
      cadence: mission.cadence as MissionCadence,
      periodAt: mission.startsAt,
      occurredAt,
      competitorType: "user",
      competitorKey: String(user._id),
      displayName: user.displayName,
      points: mission.rewardPoints,
      sourceType: "mission_completion",
      sourceId: String(mission._id),
      dedupeKey: `mission:${mission._id}:user:${user._id}:individual`,
      userId: user._id,
      stateKey
    },
    {
      boardType: "state",
      cadence: mission.cadence as MissionCadence,
      periodAt: mission.startsAt,
      occurredAt,
      competitorType: "state",
      competitorKey: stateKey,
      displayName: stateLabel,
      points: mission.rewardPoints,
      sourceType: "mission_completion",
      sourceId: String(mission._id),
      dedupeKey: `mission:${mission._id}:user:${user._id}:state:${stateKey}`,
      userId: user._id,
      stateKey
    }
  ])

  if (result.inserted > 0) {
    await recordLocationActivityEvents(
      buildLocationActivityEvents({
        occurredAt,
        points: mission.rewardPoints,
        sourceType: "mission_completion",
        sourceId: `${mission._id}:personal:${user._id}`,
        userId: user._id,
        stateKey: stateKey.replace(/^state:/, ""),
        stateLabel,
        placeKey: effectivePlace?.placeKey,
        placeLabel: effectivePlace?.placeLabel
      })
    )

    await UserMissionProgressModel.updateOne(
      { _id: progressId },
      { $set: { rewardAwardedAt: new Date() } }
    )
  }
}

function groupEventsByUser(events: StreamEventLike[]) {
  const grouped = new Map<string, StreamEventLike[]>()

  for (const event of events) {
    const key = String(event.userId)
    const existing = grouped.get(key)

    if (existing) {
      existing.push(event)
      continue
    }

    grouped.set(key, [event])
  }

  return grouped
}

function countTrackProgress(events: StreamEventLike[], trackKeys: string[]) {
  const trackKeySet = new Set(trackKeys)
  const counts = new Map<string, number>()

  for (const event of events) {
    const trackKey = event.catalogTrackSpotifyId

    if (!trackKey || !trackKeySet.has(trackKey)) {
      continue
    }

    counts.set(trackKey, (counts.get(trackKey) ?? 0) + 1)
  }

  return counts
}

function getAlbumCompletion(events: StreamEventLike[], trackKeys: string[]) {
  const remaining = new Set(trackKeys)

  for (const event of events) {
    const trackKey = event.catalogTrackSpotifyId

    if (!trackKey || !remaining.has(trackKey)) {
      continue
    }

    remaining.delete(trackKey)
  }

  return remaining.size === 0 ? 1 : 0
}

async function recomputeCurrentMissionProgress() {
  const periods = getCurrentIndiaPeriods()
  const [dailyEvents, weeklyEvents, missions] = await Promise.all([
    StreamEventModel.find({
      isBTSFamily: true,
      playedAt: {
        $gte: periods.daily.startsAt,
        $lt: periods.daily.endsAt
      }
    })
      .select({ userId: 1, playedAt: 1, catalogTrackSpotifyId: 1, stateKey: 1 })
      .lean(),
    StreamEventModel.find({
      isBTSFamily: true,
      playedAt: {
        $gte: periods.weekly.startsAt,
        $lt: periods.weekly.endsAt
      }
    })
      .select({ userId: 1, playedAt: 1, catalogTrackSpotifyId: 1, stateKey: 1 })
      .lean(),
    MissionInstanceModel.find({
      schemaVersion: MISSION_SCHEMA_VERSION,
      isActive: true,
      periodKey: { $in: [periods.daily.periodKey, periods.weekly.periodKey] }
    }).sort({ periodKey: 1, missionCellKey: 1, mechanicType: 1 })
  ])

  const eventsByCadence: Record<MissionCadence, StreamEventLike[]> = {
    daily: dailyEvents as unknown as StreamEventLike[],
    weekly: weeklyEvents as unknown as StreamEventLike[]
  }

  const uniqueUserIds = Array.from(
    new Set(
      [...eventsByCadence.daily, ...eventsByCadence.weekly].map((event) => String(event.userId))
    )
  ).map((userId) => new Types.ObjectId(userId))

  const users = (await UserModel.find({
    _id: { $in: uniqueUserIds }
  })
    .select({ displayName: 1, username: 1, region: 1 })
    .lean()) as unknown as UserLike[]

  const userMap = new Map(users.map((user) => [String(user._id), user] as const))
  const usersWithProgress = new Set<string>()

  for (const mission of missions) {
    const events = eventsByCadence[mission.cadence as MissionCadence]
    const eventsByUser = groupEventsByUser(events)

    if (mission.missionKind === "individual_personal") {
      if (mission.mechanicType === "track_streams") {
        const trackKeys = mission.targetConfig.targets
          .map((target: { trackKey?: string }) => target.trackKey)
          .filter((value: string | undefined): value is string => Boolean(value))

        for (const [userId, userEvents] of eventsByUser.entries()) {
          const counts = countTrackProgress(userEvents, trackKeys)

          if (counts.size === 0) {
            continue
          }

          const targetProgress: Record<string, number> = {}
          let progressValue = 0

          for (const target of mission.targetConfig.targets) {
            if (target.kind !== "track" || !target.trackKey) {
              continue
            }

            const count = counts.get(target.trackKey) ?? 0
            targetProgress[buildTrackTargetProgressKey(target.trackKey)] = count
            progressValue += Math.min(count, target.targetCount ?? count)
          }

          const completedAt = progressValue >= mission.goalUnits ? new Date() : undefined
          const progress = await UserMissionProgressModel.findOneAndUpdate(
            {
              schemaVersion: MISSION_SCHEMA_VERSION,
              missionInstanceId: mission._id,
              userId: new Types.ObjectId(userId)
            },
            {
              $set: {
                progressValue,
                targetProgress,
                completedAt
              }
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true
            }
          )

          usersWithProgress.add(userId)

          if (completedAt) {
            const user = userMap.get(userId)

            if (user) {
              await awardPersonalMissionCompletion(user, mission, progress._id, completedAt)
            }
          }
        }
      } else {
        const albumTarget = mission.targetConfig.targets.find(
          (target: { kind?: string; albumKey?: string }) => target.kind === "album" && target.albumKey
        )

        if (!albumTarget?.albumKey || !albumTarget.trackKeys?.length) {
          continue
        }

        for (const [userId, userEvents] of eventsByUser.entries()) {
          const completed = getAlbumCompletion(userEvents, albumTarget.trackKeys)

          if (!completed) {
            continue
          }

          const completedAt = new Date()
          const progress = await UserMissionProgressModel.findOneAndUpdate(
            {
              schemaVersion: MISSION_SCHEMA_VERSION,
              missionInstanceId: mission._id,
              userId: new Types.ObjectId(userId)
            },
            {
              $set: {
                progressValue: 1,
                targetProgress: {
                  [buildAlbumTargetProgressKey(albumTarget.albumKey)]: 1
                },
                completedAt
              }
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true
            }
          )

          usersWithProgress.add(userId)

          const user = userMap.get(userId)

          if (user) {
            await awardPersonalMissionCompletion(user, mission, progress._id, completedAt)
          }
        }
      }

      continue
    }

    if (mission.missionKind === "state_shared") {
      const stateProgressMap = new Map<
        string,
        {
          scopeLabel: string
          progressValue: number
          contributorUserIds: Set<string>
          targetProgress: Record<string, number>
        }
      >()

      if (mission.mechanicType === "track_streams") {
        const trackKeys = mission.targetConfig.targets
          .map((target: { trackKey?: string }) => target.trackKey)
          .filter((value: string | undefined): value is string => Boolean(value))
        const trackKeySet = new Set(trackKeys)

        for (const event of events) {
          const trackKey = event.catalogTrackSpotifyId
          const stateKey = event.stateKey

          if (!trackKey || !stateKey || !trackKeySet.has(trackKey)) {
            continue
          }

          const stateEntry =
            stateProgressMap.get(stateKey) ??
            {
              scopeLabel: userMap.get(String(event.userId))?.region?.state ?? stateKey,
              progressValue: 0,
              contributorUserIds: new Set<string>(),
              targetProgress: {}
            }

          stateEntry.progressValue += 1
          stateEntry.contributorUserIds.add(String(event.userId))
          stateEntry.targetProgress[buildTrackTargetProgressKey(trackKey)] =
            (stateEntry.targetProgress[buildTrackTargetProgressKey(trackKey)] ?? 0) + 1
          stateProgressMap.set(stateKey, stateEntry)

          await MissionContributionModel.findOneAndUpdate(
            {
              schemaVersion: MISSION_SCHEMA_VERSION,
              missionInstanceId: mission._id,
              userId: event.userId
            },
            {
              $inc: { contributionUnits: 1 },
              $set: {
                stateKey,
                qualifiedAt: new Date()
              }
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true
            }
          )

          usersWithProgress.add(String(event.userId))
        }
      } else {
        const albumTarget = mission.targetConfig.targets.find(
          (target: { kind?: string; albumKey?: string }) => target.kind === "album" && target.albumKey
        )

        if (!albumTarget?.albumKey || !albumTarget.trackKeys?.length) {
          continue
        }

        for (const [userId, userEvents] of eventsByUser.entries()) {
          const completed = getAlbumCompletion(userEvents, albumTarget.trackKeys)
          const user = userMap.get(userId)
          const { stateKey, stateLabel } = getUserStateContext(user)

          if (!completed || !stateKey) {
            continue
          }

          const stateEntry =
            stateProgressMap.get(stateKey) ??
            {
              scopeLabel: stateLabel ?? stateKey,
              progressValue: 0,
              contributorUserIds: new Set<string>(),
              targetProgress: {}
            }

          stateEntry.progressValue += 1
          stateEntry.contributorUserIds.add(userId)
          stateEntry.targetProgress[buildAlbumTargetProgressKey(albumTarget.albumKey)] =
            (stateEntry.targetProgress[buildAlbumTargetProgressKey(albumTarget.albumKey)] ?? 0) + 1
          stateProgressMap.set(stateKey, stateEntry)

          await MissionContributionModel.findOneAndUpdate(
            {
              schemaVersion: MISSION_SCHEMA_VERSION,
              missionInstanceId: mission._id,
              userId: new Types.ObjectId(userId)
            },
            {
              $set: {
                contributionUnits: 1,
                stateKey,
                qualifiedAt: new Date()
              }
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true
            }
          )

          usersWithProgress.add(userId)
        }
      }

      for (const [stateKey, stateEntry] of stateProgressMap.entries()) {
        await SharedMissionProgressModel.findOneAndUpdate(
          {
            schemaVersion: MISSION_SCHEMA_VERSION,
            missionInstanceId: mission._id,
            scopeType: "state",
            scopeKey: stateKey
          },
          {
            $set: {
              scopeLabel: stateEntry.scopeLabel,
              progressValue: stateEntry.progressValue,
              goalUnits: mission.goalUnits,
              contributorCount: stateEntry.contributorUserIds.size,
              targetProgress: stateEntry.targetProgress,
              completedAt: stateEntry.progressValue >= mission.goalUnits ? new Date() : undefined
            }
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        )
      }

      continue
    }

    const indiaTargetProgress: Record<string, number> = {}
    let indiaProgressValue = 0
    const indiaContributorUserIds = new Set<string>()

    if (mission.mechanicType === "track_streams") {
      const trackKeys = mission.targetConfig.targets
        .map((target: { trackKey?: string }) => target.trackKey)
        .filter((value: string | undefined): value is string => Boolean(value))
      const trackKeySet = new Set(trackKeys)

      for (const event of events) {
        const trackKey = event.catalogTrackSpotifyId

        if (!trackKey || !trackKeySet.has(trackKey)) {
          continue
        }

        indiaProgressValue += 1
        indiaContributorUserIds.add(String(event.userId))
        indiaTargetProgress[buildTrackTargetProgressKey(trackKey)] =
          (indiaTargetProgress[buildTrackTargetProgressKey(trackKey)] ?? 0) + 1

        const user = userMap.get(String(event.userId))
        const { stateKey } = getUserStateContext(user)

        await MissionContributionModel.findOneAndUpdate(
          {
            schemaVersion: MISSION_SCHEMA_VERSION,
            missionInstanceId: mission._id,
            userId: event.userId
          },
          {
            $inc: { contributionUnits: 1 },
            $set: {
              stateKey,
              qualifiedAt: new Date()
            }
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        )

        usersWithProgress.add(String(event.userId))
      }
    } else {
      const albumTarget = mission.targetConfig.targets.find(
        (target: { kind?: string; albumKey?: string }) => target.kind === "album" && target.albumKey
      )

      if (!albumTarget?.albumKey || !albumTarget.trackKeys?.length) {
        continue
      }

      for (const [userId, userEvents] of eventsByUser.entries()) {
        const completed = getAlbumCompletion(userEvents, albumTarget.trackKeys)
        const user = userMap.get(userId)
        const { stateKey } = getUserStateContext(user)

        if (!completed) {
          continue
        }

        indiaProgressValue += 1
        indiaContributorUserIds.add(userId)
        indiaTargetProgress[buildAlbumTargetProgressKey(albumTarget.albumKey)] =
          (indiaTargetProgress[buildAlbumTargetProgressKey(albumTarget.albumKey)] ?? 0) + 1

        await MissionContributionModel.findOneAndUpdate(
          {
            schemaVersion: MISSION_SCHEMA_VERSION,
            missionInstanceId: mission._id,
            userId: new Types.ObjectId(userId)
          },
          {
            $set: {
              contributionUnits: 1,
              stateKey,
              qualifiedAt: new Date()
            }
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        )

        usersWithProgress.add(userId)
      }
    }

    if (indiaProgressValue > 0) {
      await SharedMissionProgressModel.findOneAndUpdate(
        {
          schemaVersion: MISSION_SCHEMA_VERSION,
          missionInstanceId: mission._id,
          scopeType: "india",
          scopeKey: INDIA_SCOPE_KEY
        },
        {
          $set: {
            scopeLabel: "All India",
            progressValue: indiaProgressValue,
            goalUnits: mission.goalUnits,
            contributorCount: indiaContributorUserIds.size,
            targetProgress: indiaTargetProgress,
            completedAt: indiaProgressValue >= mission.goalUnits ? new Date() : undefined
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      )
    }
  }

  return usersWithProgress.size
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
  console.log("Connecting to Mongo and loading ARIRANG...")
  await connectToDatabase()

  const album = await requireArirangAlbum()
  console.log("Clearing current-period mission overrides...")
  await clearCurrentPeriodOverrides()
  console.log("Rewriting current daily and weekly mission instances...")
  await rewriteCurrentMissionInstances(album)

  console.log("Recomputing mission progress for relevant users...")
  const recomputedUsers = await recomputeCurrentMissionProgress()
  console.log("Materializing leaderboards...")
  const leaderboardResult = await materializeLeaderboards()
  console.log("Materializing location activity...")
  const locationResult = await materializeLocationActivity()
  console.log("Summarizing current missions...")
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
