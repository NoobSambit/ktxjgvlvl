import { Types } from "mongoose"
import {
  getCurrentUserRecord,
  requireAdminUserRecord,
  requireAuthenticatedUserRecord
} from "@/platform/auth/current-user"
import { getSessionUser } from "@/platform/auth/session"
import { CatalogAlbumModel, CatalogTrackModel } from "@/platform/db/models/catalog"
import {
  MissionInstanceModel,
  MissionOverrideModel,
  RewardLedgerModel,
  UserMissionProgressModel
} from "@/platform/db/models/missions"
import { TrackerConnectionModel } from "@/platform/db/models/tracker"
import { connectToDatabase } from "@/platform/db/mongoose"
import { getLastFmClient, type LastFmRecentTrackView } from "@/platform/integrations/trackers/lastfm-client"
import { createCanonicalKey } from "@/platform/integrations/trackers/base"
import { getCurrentIndiaPeriods, getIndiaPeriod, type MissionCadence } from "@/platform/time/india-periods"
import { getCatalogSummary, listAlbumOptions, listTrackOptions } from "@/modules/catalog/service"
import {
  getMissionSlotConfig,
  missionSlotConfig,
  missionSlotOrder,
  type MissionSlotKey
} from "@/modules/missions/config"
import type {
  MissionAdminState,
  MissionCard,
  MissionPageState,
  MissionTargetView
} from "@/modules/missions/types"
import {
  applyMissionRewardToLeaderboards,
  materializeLeaderboards
} from "@/modules/leaderboards/service"

const TRACK_FILTER_KEYWORDS = [
  "remix",
  "remixes",
  "acoustic",
  "instrumental",
  "sped up",
  "slowed",
  "nightcore",
  "8d",
  "karaoke",
  "demo"
]

const ALBUM_FILTER_KEYWORDS = [
  "instrumental",
  "demo",
  "karaoke",
  "remix",
  "deluxe single",
  "single version",
  "edit",
  "sped up",
  "slowed",
  "8d",
  "nightcore"
]

const MIN_ELIGIBLE_ALBUM_TRACKS = 6
const LASTFM_MAX_PAGES = {
  daily: 10,
  weekly: 50
}

type CatalogTrackDoc = {
  spotifyId: string
  name: string
  artist: string
  album: string
}

type CatalogAlbumDoc = {
  spotifyId: string
  name: string
  artist: string
  trackCount: number
  tracks: Array<{
    name: string
    artist: string
    spotifyId: string
  }>
}

type MissionInstanceDoc = {
  _id: Types.ObjectId
  slotKey: MissionSlotKey
  cadence: MissionCadence
  periodKey: string
  startsAt: Date
  endsAt: Date
  title: string
  description: string
  goalValue: number
  rewardPoints: number
  selectionSource: "admin" | "random"
  rules: Array<{
    type: string
    trackKey?: string
    trackTitle?: string
    albumKey?: string
    albumTitle?: string
    artistName?: string
    targetCount?: number
    requireAlbumCompletion?: boolean
  }>
}

type MissionProgressDoc = {
  _id: Types.ObjectId
  missionInstanceId: Types.ObjectId
  userId: Types.ObjectId
  progressValue: number
  completedAt?: Date
  claimedAt?: Date
  rewardAwardedAt?: Date
  ruleProgress?: Record<string, number> | Map<string, number>
}

type TrackTarget = {
  trackName: string
  artistName: string
}

type AggregatedTrackMatch = {
  trackName: string
  artistName: string
  count: number
}

function seededRandom(seed: string) {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index)
    hash |= 0
  }

  const x = Math.sin(hash) * 10000
  return x - Math.floor(x)
}

function shuffleWithSeed<T>(items: T[], seed: string) {
  const values = [...items]
  let offset = 0

  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(seededRandom(`${seed}:${offset}`) * (index + 1))
    const current = values[index]
    values[index] = values[randomIndex]
    values[randomIndex] = current
    offset += 1
  }

  return values
}

function normalizeTrackName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s*\[.*?\]\s*/g, " ")
    .replace(/\s*-\s*feat\..*$/i, "")
    .replace(/\s*ft\..*$/i, "")
    .replace(/[^\w\s]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function normalizeArtistName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s*\[.*?\]\s*/g, " ")
    .replace(/\s*(feat\.|ft\.|featuring|with)\s+/gi, " ")
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

function matchesTarget(track: TrackTarget, target: TrackTarget) {
  const trackName = normalizeTrackName(track.trackName)
  const targetName = normalizeTrackName(target.trackName)
  const trackArtist = normalizeArtistName(track.artistName)
  const targetArtist = normalizeArtistName(target.artistName)

  return (
    trackName === targetName &&
    !!trackArtist &&
    !!targetArtist &&
    (trackArtist.includes(targetArtist) || targetArtist.includes(trackArtist))
  )
}

function getTrackProgressKey(trackKey: string) {
  return `track:${trackKey}`
}

function getAlbumTrackProgressKey(albumKey: string, trackKey: string) {
  return `album:${albumKey}:${trackKey}`.replace(/\./g, "_")
}

function summarizeFocus(values: string[], limit = 4) {
  if (values.length <= limit) {
    return values.join(", ")
  }

  return `${values.slice(0, limit).join(", ")} +${values.length - limit} more`
}

function toRuleProgressMap(value: MissionProgressDoc["ruleProgress"]) {
  if (!value) {
    return {}
  }

  if (value instanceof Map) {
    return Object.fromEntries(value)
  }

  return value
}

function isEligibleTrack(track: CatalogTrackDoc) {
  const name = track.name.toLowerCase()

  return !TRACK_FILTER_KEYWORDS.some((keyword) => name.includes(keyword))
}

function isEligibleAlbum(album: CatalogAlbumDoc) {
  const name = album.name.toLowerCase()

  return (
    album.trackCount >= MIN_ELIGIBLE_ALBUM_TRACKS &&
    album.tracks.length >= MIN_ELIGIBLE_ALBUM_TRACKS &&
    !ALBUM_FILTER_KEYWORDS.some((keyword) => name.includes(keyword))
  )
}

function sortMissionInstances(instances: MissionInstanceDoc[]) {
  const order = new Map(missionSlotOrder.map((slotKey, index) => [slotKey, index]))

  return [...instances].sort(
    (left, right) => (order.get(left.slotKey) ?? 0) - (order.get(right.slotKey) ?? 0)
  )
}

async function getCurrentMissionInstances() {
  const periods = getCurrentIndiaPeriods()

  const instances = (await MissionInstanceModel.find({
    isActive: true,
    periodKey: { $in: [periods.daily.periodKey, periods.weekly.periodKey] }
  }).lean()) as unknown as MissionInstanceDoc[]

  return sortMissionInstances(instances)
}

async function loadAlbumsByRuleKeys(instances: MissionInstanceDoc[]) {
  const albumKeys = Array.from(
    new Set(
      instances.flatMap((instance) =>
        instance.rules.map((rule) => rule.albumKey).filter((value): value is string => Boolean(value))
      )
    )
  )

  if (albumKeys.length === 0) {
    return new Map<string, CatalogAlbumDoc>()
  }

  const albums = (await CatalogAlbumModel.find({ spotifyId: { $in: albumKeys } }).lean()) as unknown as CatalogAlbumDoc[]

  return new Map(albums.map((album) => [album.spotifyId, album]))
}

async function loadTracksByRuleKeys(instances: MissionInstanceDoc[]) {
  const trackKeys = Array.from(
    new Set(
      instances.flatMap((instance) =>
        instance.rules.map((rule) => rule.trackKey).filter((value): value is string => Boolean(value))
      )
    )
  )

  if (trackKeys.length === 0) {
    return new Map<string, CatalogTrackDoc>()
  }

  const tracks = (await CatalogTrackModel.find({ spotifyId: { $in: trackKeys } }).lean()) as unknown as CatalogTrackDoc[]

  return new Map(tracks.map((track) => [track.spotifyId, track]))
}

async function selectTracksForSlot(
  slotKey: MissionSlotKey,
  periodKey: string,
  overrideTrackKeys: string[]
) {
  const config = getMissionSlotConfig(slotKey)

  if (overrideTrackKeys.length > 0) {
    const selectedTracks = (await CatalogTrackModel.find({
      spotifyId: { $in: overrideTrackKeys },
      isBTSFamily: true
    }).lean()) as unknown as CatalogTrackDoc[]

    const byId = new Map(selectedTracks.map((track) => [track.spotifyId, track]))
    const ordered = overrideTrackKeys.map((trackKey) => byId.get(trackKey)).filter(Boolean) as CatalogTrackDoc[]

    if (ordered.length >= config.minSelections && ordered.length <= config.maxSelections) {
      return ordered
    }
  }

  const tracks = (await CatalogTrackModel.find({ isBTSFamily: true }).lean()) as unknown as CatalogTrackDoc[]
  const eligibleTracks = tracks.filter(isEligibleTrack)

  if (eligibleTracks.length < config.minSelections) {
    return []
  }

  const shuffled = shuffleWithSeed(eligibleTracks, `${periodKey}:${slotKey}`)
  return shuffled.slice(0, Math.min(config.randomSelectionCount, shuffled.length))
}

async function selectAlbumsForSlot(
  slotKey: MissionSlotKey,
  periodKey: string,
  overrideAlbumKeys: string[]
) {
  const config = getMissionSlotConfig(slotKey)

  if (overrideAlbumKeys.length > 0) {
    const selectedAlbums = (await CatalogAlbumModel.find({
      spotifyId: { $in: overrideAlbumKeys },
      isBTSFamily: true
    }).lean()) as unknown as CatalogAlbumDoc[]

    const byId = new Map(selectedAlbums.map((album) => [album.spotifyId, album]))
    const ordered = overrideAlbumKeys.map((albumKey) => byId.get(albumKey)).filter(Boolean) as CatalogAlbumDoc[]

    if (ordered.length >= config.minSelections && ordered.length <= config.maxSelections) {
      return ordered
    }
  }

  const albums = (await CatalogAlbumModel.find({ isBTSFamily: true }).lean()) as unknown as CatalogAlbumDoc[]
  const eligibleAlbums = albums.filter(isEligibleAlbum)

  if (eligibleAlbums.length < config.minSelections) {
    return []
  }

  const shuffled = shuffleWithSeed(eligibleAlbums, `${periodKey}:${slotKey}:albums`)
  return shuffled.slice(0, Math.min(config.randomSelectionCount, shuffled.length))
}

async function generateMissionSlot(slotKey: MissionSlotKey, force = false) {
  const config = getMissionSlotConfig(slotKey)
  const period = getIndiaPeriod(config.cadence)

  await MissionInstanceModel.updateMany(
    {
      slotKey,
      isActive: true,
      periodKey: { $ne: period.periodKey }
    },
    { $set: { isActive: false } }
  )

  if (!force) {
    const existing = (await MissionInstanceModel.findOne({
      slotKey,
      periodKey: period.periodKey,
      isActive: true
    }).lean()) as MissionInstanceDoc | null

    if (existing) {
      return existing
    }
  }

  const override = (await MissionOverrideModel.findOne({
    slotKey,
    periodKey: period.periodKey
  }).lean()) as
    | {
        rewardPoints?: number
        trackKeys?: string[]
        albumKeys?: string[]
      }
    | null

  const selectionSource = override ? "admin" : "random"
  const rewardPoints = override?.rewardPoints ?? config.defaultRewardPoints

  const rules =
    config.targetKind === "track"
      ? (await selectTracksForSlot(slotKey, period.periodKey, override?.trackKeys ?? [])).map((track) => ({
          type: "track_count",
          trackKey: track.spotifyId,
          trackTitle: track.name,
          artistKey: createCanonicalKey(track.artist),
          artistName: track.artist,
          targetCount: config.perItemTargetCount,
          requireAlbumCompletion: false
        }))
      : (await selectAlbumsForSlot(slotKey, period.periodKey, override?.albumKeys ?? [])).map((album) => ({
          type: "album_completion",
          albumKey: album.spotifyId,
          albumTitle: album.name,
          artistKey: createCanonicalKey(album.artist),
          artistName: album.artist,
          targetCount: album.trackCount,
          requireAlbumCompletion: true
        }))

  if (rules.length < config.minSelections) {
    return null
  }

  const goalValue = rules.reduce((sum, rule) => sum + (rule.targetCount ?? 0), 0)

  const instance = await MissionInstanceModel.findOneAndUpdate(
    {
      slotKey,
      periodKey: period.periodKey
    },
    {
      $set: {
        cadence: config.cadence,
        slotKey,
        periodKey: period.periodKey,
        startsAt: period.startsAt,
        endsAt: period.endsAt,
        timezone: period.timezone,
        title: config.label,
        description: config.description,
        goalValue,
        rewardPoints,
        selectionSource,
        isActive: true,
        rules
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )

  return instance.toObject() as unknown as MissionInstanceDoc
}

async function ensureCurrentMissionInstances(options: {
  cadence?: MissionCadence
  slotKeys?: MissionSlotKey[]
  force?: boolean
} = {}) {
  await connectToDatabase()

  const summary = await getCatalogSummary()

  if (summary.trackCount === 0 || summary.albumCount === 0) {
    return []
  }

  const slots = (options.slotKeys ?? missionSlotOrder).filter((slotKey) =>
    options.cadence ? missionSlotConfig[slotKey].cadence === options.cadence : true
  )

  const instances = await Promise.all(
    slots.map((slotKey) => generateMissionSlot(slotKey, options.force ?? false))
  )

  return instances.filter((instance): instance is MissionInstanceDoc => Boolean(instance))
}

async function getMissionProgressMap(userId: Types.ObjectId, instances: MissionInstanceDoc[]) {
  if (instances.length === 0) {
    return new Map<string, MissionProgressDoc>()
  }

  const progressDocs = (await UserMissionProgressModel.find({
    userId,
    missionInstanceId: { $in: instances.map((instance) => instance._id) }
  }).lean()) as unknown as MissionProgressDoc[]

  return new Map(progressDocs.map((progress) => [String(progress.missionInstanceId), progress]))
}

async function buildMissionCardsForUser(user: Awaited<ReturnType<typeof getCurrentUserRecord>>) {
  await ensureCurrentMissionInstances()

  const instances = await getCurrentMissionInstances()
  const progressMap = await getMissionProgressMap(user._id, instances)
  const [trackMap, albumMap] = await Promise.all([
    loadTracksByRuleKeys(instances),
    loadAlbumsByRuleKeys(instances)
  ])

  return instances.map((instance) => {
    const progress = progressMap.get(String(instance._id))
    const ruleProgress = toRuleProgressMap(progress?.ruleProgress)

    const targets = instance.rules.map<MissionTargetView>((rule) => {
      if (rule.trackKey) {
        const key = rule.trackKey
        const track = trackMap.get(rule.trackKey)
        const progressValue = Math.min(ruleProgress[getTrackProgressKey(key)] ?? 0, rule.targetCount ?? 0)

        return {
          key,
          kind: "track",
          title: rule.trackTitle ?? track?.name ?? "Track",
          artistName: rule.artistName ?? track?.artist ?? "BTS",
          targetCount: rule.targetCount ?? 0,
          progress: progressValue
        }
      }

      const album = rule.albumKey ? albumMap.get(rule.albumKey) : undefined
      const progressValue = album
        ? album.tracks.reduce((count, track) => {
            const trackKey = getAlbumTrackProgressKey(album.spotifyId, track.spotifyId)
            return count + ((ruleProgress[trackKey] ?? 0) > 0 ? 1 : 0)
          }, 0)
        : 0

      return {
        key: rule.albumKey ?? rule.albumTitle ?? "album",
        kind: "album",
        title: rule.albumTitle ?? album?.name ?? "Album",
        artistName: rule.artistName ?? album?.artist ?? "BTS",
        targetCount: rule.targetCount ?? album?.trackCount ?? 0,
        progress: progressValue,
        trackCount: album?.trackCount ?? rule.targetCount ?? 0
      }
    })

    const targetLabels = targets.map((target) => target.title)

    return {
      id: String(instance._id),
      slotKey: instance.slotKey,
      title: instance.title,
      description: instance.description,
      cadence: instance.cadence,
      startsAt: instance.startsAt.toISOString(),
      endsAt: instance.endsAt.toISOString(),
      periodKey: instance.periodKey,
      progress: progress?.progressValue ?? 0,
      goal: instance.goalValue,
      rewardPoints: instance.rewardPoints,
      scope:
        user.region?.state && user.region?.city
          ? `${user.region.city}, ${user.region.state}`
          : "Region confirmation required",
      rewardLabel: `${instance.rewardPoints} points`,
      focus: summarizeFocus(targetLabels),
      selectionSource: instance.selectionSource,
      isCompleted:
        Boolean(progress?.completedAt) || (progress?.progressValue ?? 0) >= instance.goalValue,
      rewardAwarded: Boolean(progress?.rewardAwardedAt),
      targets
    } satisfies MissionCard
  })
}

function collectTrackTargets(
  instances: MissionInstanceDoc[],
  albumMap: Map<string, CatalogAlbumDoc>
) {
  const targets = new Map<string, TrackTarget>()

  for (const instance of instances) {
    for (const rule of instance.rules) {
      if (rule.trackTitle && rule.artistName) {
        const key = `${normalizeTrackName(rule.trackTitle)}:${normalizeArtistName(rule.artistName)}`
        targets.set(key, {
          trackName: rule.trackTitle,
          artistName: rule.artistName
        })
      }

      if (rule.albumKey) {
        const album = albumMap.get(rule.albumKey)

        if (!album) {
          continue
        }

        for (const track of album.tracks) {
          const key = `${normalizeTrackName(track.name)}:${normalizeArtistName(track.artist)}`
          targets.set(key, {
            trackName: track.name,
            artistName: track.artist
          })
        }
      }
    }
  }

  return Array.from(targets.values())
}

async function fetchRecentMatchingTracks(
  username: string,
  since: Date,
  targets: TrackTarget[],
  cadence: MissionCadence
) {
  if (targets.length === 0) {
    return []
  }

  const client = getLastFmClient()
  const counts = new Map<string, AggregatedTrackMatch>()
  const from = Math.floor(since.getTime() / 1000)

  let page = 1
  let totalPages = 1

  while (page <= totalPages && page <= LASTFM_MAX_PAGES[cadence]) {
    const response = await client.getRecentTracks(username, {
      from,
      limit: 200,
      page
    })

    totalPages = response.totalPages

    for (const track of response.tracks) {
      if (track.nowPlaying || !track.timestamp) {
        continue
      }

      if (
        !targets.some((target) =>
          matchesTarget(
            {
              trackName: track.name,
              artistName: track.artistName
            },
            target
          )
        )
      ) {
        continue
      }

      const key = `${normalizeTrackName(track.name)}:${normalizeArtistName(track.artistName)}`
      const current = counts.get(key)

      if (current) {
        current.count += 1
      } else {
        counts.set(key, {
          trackName: track.name,
          artistName: track.artistName,
          count: 1
        })
      }
    }

    page += 1
  }

  return Array.from(counts.values())
}

function findMatchingTrackCount(tracks: AggregatedTrackMatch[], target: TrackTarget) {
  const match = tracks.find((track) => matchesTarget(track, target))
  return match?.count ?? 0
}

async function calculateDailyMissionStreakDays(userId: Types.ObjectId) {
  const progressDocs = (await UserMissionProgressModel.find({
    userId,
    completedAt: { $ne: null }
  })
    .select({ missionInstanceId: 1 })
    .lean()) as unknown as Array<{ missionInstanceId: Types.ObjectId }>

  if (progressDocs.length === 0) {
    return 0
  }

  const dailyInstances = (await MissionInstanceModel.find({
    _id: { $in: progressDocs.map((progress) => progress.missionInstanceId) },
    cadence: "daily"
  })
    .select({ periodKey: 1 })
    .lean()) as unknown as Array<{ periodKey: string }>

  const completedKeys = new Set(dailyInstances.map((instance) => instance.periodKey))
  let streak = 0
  let cursor = new Date()

  for (let count = 0; count < 365; count += 1) {
    const period = getIndiaPeriod("daily", cursor)

    if (!completedKeys.has(period.periodKey)) {
      break
    }

    streak += 1
    cursor = new Date(period.startsAt.getTime() - 1000)
  }

  return streak
}

async function awardMissionCompletion(
  user: Awaited<ReturnType<typeof getCurrentUserRecord>>,
  mission: MissionInstanceDoc,
  progress: MissionProgressDoc
) {
  const dedupeKey = `mission:${mission._id}:${user._id}`
  const rewardIssuedAt = new Date()

  const ledgerResult = await RewardLedgerModel.updateOne(
    { dedupeKey },
    {
      $setOnInsert: {
        userId: user._id,
        sourceType: "mission_completion",
        sourceId: String(mission._id),
        pointsAwarded: mission.rewardPoints,
        dedupeKey
      }
    },
    {
      upsert: true
    }
  )

  if (ledgerResult.upsertedCount === 0) {
    if (!progress.rewardAwardedAt) {
      await UserMissionProgressModel.updateOne(
        { _id: progress._id },
        { $set: { rewardAwardedAt: rewardIssuedAt, claimedAt: rewardIssuedAt } }
      )
    }

    return []
  }

  const streakDays = await calculateDailyMissionStreakDays(user._id)
  const touchedBoardIds = await applyMissionRewardToLeaderboards({
    user: user as unknown as {
      _id: Types.ObjectId
      displayName: string
      username: string
      region?: { state?: string; city?: string }
    },
    cadence: mission.cadence,
    points: mission.rewardPoints,
    streakDays,
    qualifiedAt: rewardIssuedAt
  })

  await UserMissionProgressModel.updateOne(
    { _id: progress._id },
    { $set: { rewardAwardedAt: rewardIssuedAt, claimedAt: rewardIssuedAt } }
  )

  return touchedBoardIds
}

async function verifyMissionInstanceForUser(
  user: Awaited<ReturnType<typeof getCurrentUserRecord>>,
  mission: MissionInstanceDoc,
  albumMap: Map<string, CatalogAlbumDoc>,
  tracks: AggregatedTrackMatch[]
) {
  const existingProgress = (await UserMissionProgressModel.findOne({
    missionInstanceId: mission._id,
    userId: user._id
  }).lean()) as MissionProgressDoc | null

  const previousRuleProgress = toRuleProgressMap(existingProgress?.ruleProgress)
  const nextRuleProgress: Record<string, number> = {}
  let progressValue = 0

  for (const rule of mission.rules) {
    if (rule.trackKey && rule.trackTitle && rule.artistName) {
      const progressKey = getTrackProgressKey(rule.trackKey)
      const matchCount = findMatchingTrackCount(tracks, {
        trackName: rule.trackTitle,
        artistName: rule.artistName
      })
      const mergedCount = Math.max(previousRuleProgress[progressKey] ?? 0, matchCount)

      nextRuleProgress[progressKey] = mergedCount
      progressValue += Math.min(mergedCount, rule.targetCount ?? 0)
      continue
    }

    if (rule.albumKey) {
      const album = albumMap.get(rule.albumKey)

      if (!album) {
        continue
      }

      let streamedTracks = 0

      for (const track of album.tracks) {
        const progressKey = getAlbumTrackProgressKey(album.spotifyId, track.spotifyId)
        const wasStreamed =
          findMatchingTrackCount(tracks, {
            trackName: track.name,
            artistName: track.artist
          }) > 0
        const mergedCount = Math.max(previousRuleProgress[progressKey] ?? 0, wasStreamed ? 1 : 0)

        nextRuleProgress[progressKey] = mergedCount

        if (mergedCount > 0) {
          streamedTracks += 1
        }
      }

      progressValue += streamedTracks
    }
  }

  const completedAt =
    progressValue >= mission.goalValue ? existingProgress?.completedAt ?? new Date() : undefined

  const updatedProgress = await UserMissionProgressModel.findOneAndUpdate(
    {
      missionInstanceId: mission._id,
      userId: user._id
    },
    {
      $set: {
        progressValue,
        completedAt,
        ruleProgress: nextRuleProgress
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )

  if (!updatedProgress) {
    return []
  }

  if (progressValue >= mission.goalValue && !updatedProgress.rewardAwardedAt) {
    return awardMissionCompletion(
      user,
      mission,
      updatedProgress.toObject() as unknown as MissionProgressDoc
    )
  }

  return []
}

export async function listMissionCards(): Promise<MissionCard[]> {
  const user = await getCurrentUserRecord()
  return buildMissionCardsForUser(user)
}

export async function getMissionPageState(): Promise<MissionPageState> {
  await connectToDatabase()

  const session = await getSessionUser()
  const user = await getCurrentUserRecord()
  const [missions, summary, lastfmConnection] = await Promise.all([
    buildMissionCardsForUser(user),
    getCatalogSummary(),
    TrackerConnectionModel.findOne({
      userId: user._id,
      provider: "lastfm"
    }).lean() as Promise<{ username: string; verificationStatus: "pending" | "verified" | "failed" } | null>
  ])

  let verificationBlockedReason: string | undefined

  if (!session.isAuthenticated) {
    verificationBlockedReason = "Sign in or join now before connecting Last.fm and verifying missions."
  } else if (!user.region?.state || !user.region?.city) {
    verificationBlockedReason = "Confirm your city and state before leaderboard points can be awarded."
  } else if (summary.trackCount === 0 || summary.albumCount === 0) {
    verificationBlockedReason =
      "Sync the BTS songs and albums catalog first so missions can be generated."
  } else if (!lastfmConnection) {
    verificationBlockedReason = "Connect your Last.fm username to verify streaming progress."
  }

  return {
    missions,
    isAuthenticated: session.isAuthenticated,
    lastfmConnection: lastfmConnection
      ? {
          username: lastfmConnection.username,
          verificationStatus: lastfmConnection.verificationStatus
        }
      : null,
    regionConfirmed: Boolean(user.region?.state && user.region?.city),
    city: user.region?.city,
    state: user.region?.state,
    verificationBlockedReason,
    resetTimezone: "Asia/Kolkata"
  }
}

export async function generateDailyMissionInstances() {
  return ensureCurrentMissionInstances({ cadence: "daily", force: false })
}

export async function generateWeeklyMissionInstances() {
  return ensureCurrentMissionInstances({ cadence: "weekly", force: false })
}

export async function verifyCurrentUserMissions() {
  await connectToDatabase()

  const user = await requireAuthenticatedUserRecord()

  if (!user.region?.state || !user.region?.city) {
    throw new Error("Confirm your city and state before verifying missions.")
  }

  await ensureCurrentMissionInstances()

  const lastfmConnection = (await TrackerConnectionModel.findOne({
    userId: user._id,
    provider: "lastfm",
    verificationStatus: "verified"
  }).lean()) as { _id: Types.ObjectId; username: string } | null

  if (!lastfmConnection) {
    throw new Error("Connect a verified Last.fm username before verifying missions.")
  }

  const missions = await getCurrentMissionInstances()
  const albumMap = await loadAlbumsByRuleKeys(missions)
  const dailyTargets = collectTrackTargets(
    missions.filter((mission) => mission.cadence === "daily"),
    albumMap
  )
  const weeklyTargets = collectTrackTargets(
    missions.filter((mission) => mission.cadence === "weekly"),
    albumMap
  )

  const periods = getCurrentIndiaPeriods()
  const [dailyTracks, weeklyTracks] = await Promise.all([
    fetchRecentMatchingTracks(lastfmConnection.username, periods.daily.startsAt, dailyTargets, "daily"),
    fetchRecentMatchingTracks(lastfmConnection.username, periods.weekly.startsAt, weeklyTargets, "weekly")
  ])

  const touchedBoards = new Map<string, Types.ObjectId>()

  for (const mission of missions) {
    const affectedBoards = await verifyMissionInstanceForUser(
      user,
      mission,
      albumMap,
      mission.cadence === "daily" ? dailyTracks : weeklyTracks
    )

    for (const boardId of affectedBoards) {
      touchedBoards.set(String(boardId), boardId)
    }
  }

  if (touchedBoards.size > 0) {
    await materializeLeaderboards({ boardIds: Array.from(touchedBoards.values()) })
  }

  await TrackerConnectionModel.updateOne(
    { _id: lastfmConnection._id },
    {
      $set: {
        lastSyncAt: new Date(),
        lastSuccessfulSyncAt: new Date()
      }
    }
  )

  return getMissionPageState()
}

export async function getMissionAdminState(): Promise<MissionAdminState> {
  await connectToDatabase()

  await requireAdminUserRecord()
  const periods = getCurrentIndiaPeriods()
  const [missions, trackOptions, albumOptions, summary, overrides] = await Promise.all([
    listMissionCards(),
    listTrackOptions(),
    listAlbumOptions(),
    getCatalogSummary(),
    MissionOverrideModel.find({
      periodKey: { $in: [periods.daily.periodKey, periods.weekly.periodKey] }
    }).lean() as unknown as Promise<
      Array<{
        slotKey: MissionSlotKey
        rewardPoints?: number
        trackKeys?: string[]
        albumKeys?: string[]
      }>
    >
  ])

  const missionMap = new Map(missions.map((mission) => [mission.slotKey, mission]))
  const overrideMap = new Map(
    overrides.map((override) => [
      override.slotKey,
      {
        itemKeys: override.trackKeys?.length ? override.trackKeys : override.albumKeys ?? [],
        rewardPoints: override.rewardPoints
      }
    ])
  )

  return {
    slots: missionSlotOrder.map((slotKey) => {
      const config = getMissionSlotConfig(slotKey)

      return {
        slotKey,
        cadence: config.cadence,
        label: config.label,
        description: config.description,
        targetKind: config.targetKind,
        minSelections: config.minSelections,
        maxSelections: config.maxSelections,
        defaultRewardPoints: config.defaultRewardPoints,
        options: config.targetKind === "track" ? trackOptions : albumOptions,
        currentMission: missionMap.get(slotKey) ?? null,
        currentOverride: overrideMap.get(slotKey) ?? null
      }
    }),
    catalogSummary: summary,
    currentPeriodKeys: {
      daily: periods.daily.periodKey,
      weekly: periods.weekly.periodKey
    }
  }
}

export async function upsertMissionOverrideForCurrentPeriod(input: {
  slotKey: MissionSlotKey
  itemKeys: string[]
  rewardPoints?: number
}) {
  await connectToDatabase()

  const admin = await requireAdminUserRecord()
  const config = getMissionSlotConfig(input.slotKey)
  const uniqueItemKeys = Array.from(new Set(input.itemKeys.map((itemKey) => itemKey.trim()).filter(Boolean)))

  if (
    uniqueItemKeys.length < config.minSelections ||
    uniqueItemKeys.length > config.maxSelections
  ) {
    throw new Error(
      `Select between ${config.minSelections} and ${config.maxSelections} ${config.targetKind}${
        config.maxSelections > 1 ? "s" : ""
      } for ${config.label}.`
    )
  }

  const period = getIndiaPeriod(config.cadence)

  if (config.targetKind === "track") {
    const count = await CatalogTrackModel.countDocuments({
      spotifyId: { $in: uniqueItemKeys },
      isBTSFamily: true
    })

    if (count !== uniqueItemKeys.length) {
      throw new Error("One or more selected tracks could not be found in the imported catalog.")
    }
  } else {
    const count = await CatalogAlbumModel.countDocuments({
      spotifyId: { $in: uniqueItemKeys },
      isBTSFamily: true
    })

    if (count !== uniqueItemKeys.length) {
      throw new Error("One or more selected albums could not be found in the imported catalog.")
    }
  }

  await MissionOverrideModel.findOneAndUpdate(
    {
      slotKey: input.slotKey,
      periodKey: period.periodKey
    },
    {
      $set: {
        cadence: config.cadence,
        rewardPoints: input.rewardPoints,
        trackKeys: config.targetKind === "track" ? uniqueItemKeys : [],
        albumKeys: config.targetKind === "album" ? uniqueItemKeys : [],
        updatedById: admin._id
      },
      $setOnInsert: {
        createdById: admin._id
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )

  await ensureCurrentMissionInstances({
    cadence: config.cadence,
    slotKeys: [input.slotKey],
    force: true
  })

  return getMissionAdminState()
}

export async function clearMissionOverrideForCurrentPeriod(slotKey: MissionSlotKey) {
  await connectToDatabase()

  await requireAdminUserRecord()
  const config = getMissionSlotConfig(slotKey)
  const period = getIndiaPeriod(config.cadence)

  await MissionOverrideModel.deleteOne({
    slotKey,
    periodKey: period.periodKey
  })

  await ensureCurrentMissionInstances({
    cadence: config.cadence,
    slotKeys: [slotKey],
    force: true
  })

  return getMissionAdminState()
}
