import { Types } from "mongoose"
import { unstable_cache } from "next/cache"
import { cacheTags, revalidateCacheTags, sharedCacheRevalidateSeconds } from "@/platform/cache/shared"
import {
  getCurrentUserRecord,
  requireAdminUserRecord,
  requireAuthenticatedUserRecord
} from "@/platform/auth/current-user"
import { getSessionUser } from "@/platform/auth/session"
import { CatalogAlbumModel, CatalogTrackModel } from "@/platform/db/models/catalog"
import {
  LeaderboardBoardModel,
  LeaderboardPointEventModel
} from "@/platform/db/models/leaderboards"
import {
  MissionContributionModel,
  MissionInstanceModel,
  MissionOverrideModel,
  SharedMissionProgressModel,
  UserMissionProgressModel
} from "@/platform/db/models/missions"
import { TrackerConnectionModel } from "@/platform/db/models/tracker"
import { StreamEventModel } from "@/platform/db/models/streaming"
import { UserModel } from "@/platform/db/models/user"
import { connectToDatabase } from "@/platform/db/mongoose"
import { buildStateKey } from "@/platform/integrations/geo/state-scopes"
import { getCurrentIndiaPeriods, getIndiaPeriod, getNextIndiaPeriods } from "@/platform/time/india-periods"
import {
  buildLocationActivityEvents,
  recordLocationActivityEvents
} from "@/modules/activity-map/service"
import {
  getCatalogSummary,
  listAlbumOptions,
  listTrackOptions,
  type CatalogOption
} from "@/modules/catalog/service"
import { getLeaderboardStatusSummary, recordLeaderboardPointEvents } from "@/modules/leaderboards/service"
import { getEffectivePlaceFromRegion, getStateScopeSource } from "@/modules/locations/service"
import {
  getMissionCellConfig,
  missionCellConfig,
  missionCellOrder,
  missionMechanicOrder,
  type MissionCadence,
  type MissionCellKey,
  type MissionKind,
  type MissionMechanicType
} from "@/modules/missions/config"
import { getStreamPointValue } from "@/modules/platform-settings/service"
import {
  areTrackDurationsEquivalent,
  normalizeArtistName,
  normalizeTrackName
} from "@/modules/streaming/normalization"
import { getTrackerProviderConfig } from "@/modules/trackers/provider-config"
import type {
  AdminMissionCellView,
  AdminMissionOverrideView,
  AdminMissionPlanView,
  MissionAdminState,
  MissionCard,
  MissionPageState,
  MissionTargetView
} from "@/modules/missions/types"

const TRACK_FILTER_KEYWORDS = [
  "remix",
  "remixes",
  "acoustic",
  "acapella",
  "cover",
  "instrumental",
  "sped up",
  "slowed",
  "nightcore",
  "8d",
  "karaoke",
  "demo"
]

const ALBUM_FILTER_KEYWORDS = [
  "acapella",
  "cover",
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
const INDIA_SCOPE_KEY = "india:all"
const TRACK_VARIANT_DURATION_TOLERANCE_MS = 2_000
const MISSION_SCHEMA_VERSION = 3

type CatalogTrackDoc = {
  _id: Types.ObjectId
  spotifyId: string
  name: string
  artist: string
  album: string
  duration: number
  thumbnails?: {
    small?: string
    medium?: string
    large?: string
  }
}

type CatalogAlbumDoc = {
  _id: Types.ObjectId
  spotifyId: string
  name: string
  artist: string
  trackCount: number
  coverImage?: string
  tracks: Array<{
    name: string
    artist: string
    spotifyId: string
  }>
}

type MissionTargetDoc = {
  kind: "track" | "album"
  trackKey?: string
  trackTitle?: string
  albumKey?: string
  albumTitle?: string
  artistKey?: string
  artistName?: string
  targetCount?: number
  trackKeys?: string[]
}

type MissionInstanceDoc = {
  _id: Types.ObjectId
  cadence: MissionCadence
  missionCellKey: MissionCellKey
  slotKey?: string
  missionKind: MissionKind
  mechanicType: MissionMechanicType
  periodKey: string
  startsAt: Date
  endsAt: Date
  title: string
  description: string
  goalUnits: number
  rewardRouting: "individual_and_state" | "state_only" | "contributor_individual_and_state"
  rewardPoints: number
  selectionMode: "admin" | "random"
  targetConfig: {
    targets: MissionTargetDoc[]
  }
  updatedAt: Date
}

type MissionTargetImageMaps = {
  trackImages: Map<string, string>
  albumImages: Map<string, string>
  albumTracks: Map<
    string,
    Array<{
      key: string
      title: string
      artistName: string
    }>
  >
}

type CachedMissionInstance = Omit<MissionInstanceDoc, "_id" | "startsAt" | "endsAt" | "updatedAt"> & {
  id: string
  startsAt: string
  endsAt: string
  updatedAt: string
}

type CachedSharedMissionProgress = Omit<
  SharedMissionProgressDoc,
  "_id" | "missionInstanceId" | "completedAt" | "rewardAwardedAt"
> & {
  id: string
  missionInstanceId: string
  completedAt?: string
  rewardAwardedAt?: string
}

type MissionTargetImagePayload = {
  trackImages: Record<string, string>
  albumImages: Record<string, string>
  albumTracks: Record<
    string,
    Array<{
      key: string
      title: string
      artistName: string
    }>
  >
}

type UserMissionProgressDoc = {
  _id: Types.ObjectId
  missionInstanceId: Types.ObjectId
  userId: Types.ObjectId
  progressValue: number
  completedAt?: Date
  rewardAwardedAt?: Date
  targetProgress?: Record<string, number> | Map<string, number>
}

type SharedMissionProgressDoc = {
  _id: Types.ObjectId
  missionInstanceId: Types.ObjectId
  scopeType: "india" | "state"
  scopeKey: string
  scopeLabel: string
  progressValue: number
  goalUnits: number
  contributorCount: number
  completedAt?: Date
  rewardAwardedAt?: Date
  targetProgress?: Record<string, number> | Map<string, number>
}

type MissionContributionDoc = {
  _id: Types.ObjectId
  missionInstanceId: Types.ObjectId
  userId: Types.ObjectId
  contributionUnits: number
  stateKey?: string
  qualifiedAt?: Date
  rewardAwardedAt?: Date
}

type MissionOverrideDoc = {
  _id: Types.ObjectId
  schemaVersion: number
  missionCellKey: MissionCellKey
  mechanicType: MissionMechanicType
  targetKeys: string[]
  goalUnits: number
  rewardPoints: number
  periodKey: string
}

type StreamEventDoc = {
  _id: Types.ObjectId
  userId: Types.ObjectId
  playedAt: Date
  catalogTrackSpotifyId?: string
  catalogAlbumSpotifyId?: string
  isBTSFamily?: boolean
  stateKey?: string
}

type TrackEquivalenceData = {
  equivalentTrackKeysByTrackKey: Map<string, string[]>
  equivalenceGroupByTrackKey: Map<string, string>
}

let cachedTrackEquivalenceData: TrackEquivalenceData | null = null

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

function summarizeFocus(values: string[], limit = 4) {
  if (values.length <= limit) {
    return values.join(", ")
  }

  return `${values.slice(0, limit).join(", ")} +${values.length - limit} more`
}

function toTargetProgressMap(
  value: UserMissionProgressDoc["targetProgress"]
): Record<string, number> {
  if (!value) {
    return {}
  }

  if (value instanceof Map) {
    return Object.fromEntries(value)
  }

  return value
}

function serializeMissionInstance(instance: MissionInstanceDoc): CachedMissionInstance {
  return {
    ...instance,
    id: String(instance._id),
    startsAt: instance.startsAt.toISOString(),
    endsAt: instance.endsAt.toISOString(),
    updatedAt: instance.updatedAt.toISOString()
  }
}

function deserializeMissionInstance(instance: CachedMissionInstance): MissionInstanceDoc {
  return {
    ...instance,
    _id: new Types.ObjectId(instance.id),
    startsAt: new Date(instance.startsAt),
    endsAt: new Date(instance.endsAt),
    updatedAt: new Date(instance.updatedAt)
  }
}

function serializeSharedMissionProgress(doc: SharedMissionProgressDoc): CachedSharedMissionProgress {
  return {
    ...doc,
    id: String(doc._id),
    missionInstanceId: String(doc.missionInstanceId),
    completedAt: doc.completedAt?.toISOString(),
    rewardAwardedAt: doc.rewardAwardedAt?.toISOString()
  }
}

function deserializeSharedMissionProgress(doc: CachedSharedMissionProgress): SharedMissionProgressDoc {
  return {
    ...doc,
    _id: new Types.ObjectId(doc.id),
    missionInstanceId: new Types.ObjectId(doc.missionInstanceId),
    completedAt: doc.completedAt ? new Date(doc.completedAt) : undefined,
    rewardAwardedAt: doc.rewardAwardedAt ? new Date(doc.rewardAwardedAt) : undefined
  }
}

function toMissionTargetImageMaps(payload: MissionTargetImagePayload): MissionTargetImageMaps {
  return {
    trackImages: new Map(Object.entries(payload.trackImages)),
    albumImages: new Map(Object.entries(payload.albumImages)),
    albumTracks: new Map(Object.entries(payload.albumTracks))
  }
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
  const order = new Map(missionCellOrder.map((missionCellKey, index) => [missionCellKey, index]))
  const mechanicOrder = new Map(missionMechanicOrder.map((mechanicType, index) => [mechanicType, index]))

  return [...instances].sort(
    (left, right) =>
      (order.get(left.missionCellKey) ?? 0) - (order.get(right.missionCellKey) ?? 0) ||
      (mechanicOrder.get(left.mechanicType) ?? 0) - (mechanicOrder.get(right.mechanicType) ?? 0)
  )
}

function buildTrackVariantBaseKey(track: Pick<CatalogTrackDoc, "name" | "artist">) {
  return `${normalizeTrackName(track.name)}::${normalizeArtistName(track.artist)}`
}

function buildTrackEquivalenceData(tracks: CatalogTrackDoc[]): TrackEquivalenceData {
  const equivalentTrackKeysByTrackKey = new Map<string, string[]>()
  const equivalenceGroupByTrackKey = new Map<string, string>()
  const baseGroups = new Map<string, CatalogTrackDoc[]>()

  for (const track of tracks) {
    const baseKey = buildTrackVariantBaseKey(track)
    const existing = baseGroups.get(baseKey)

    if (existing) {
      existing.push(track)
      continue
    }

    baseGroups.set(baseKey, [track])
  }

  for (const [baseKey, groupTracks] of baseGroups.entries()) {
    const clusters: Array<{
      groupKey: string
      representativeDuration: number
      tracks: CatalogTrackDoc[]
    }> = []

    for (const track of [...groupTracks].sort((left, right) => left.duration - right.duration)) {
      const cluster = clusters.find((candidate) =>
        areTrackDurationsEquivalent(
          candidate.representativeDuration,
          track.duration,
          TRACK_VARIANT_DURATION_TOLERANCE_MS
        )
      )

      if (cluster) {
        cluster.tracks.push(track)
        continue
      }

      clusters.push({
        groupKey: `${baseKey}::${clusters.length}`,
        representativeDuration: track.duration,
        tracks: [track]
      })
    }

    for (const cluster of clusters) {
      const equivalentTrackKeys = cluster.tracks.map((track) => track.spotifyId)

      for (const track of cluster.tracks) {
        equivalentTrackKeysByTrackKey.set(track.spotifyId, equivalentTrackKeys)
        equivalenceGroupByTrackKey.set(track.spotifyId, cluster.groupKey)
      }
    }
  }

  return { equivalentTrackKeysByTrackKey, equivalenceGroupByTrackKey }
}

async function getTrackEquivalenceData() {
  if (cachedTrackEquivalenceData) {
    return cachedTrackEquivalenceData
  }

  const tracks = (await CatalogTrackModel.find({ isBTSFamily: true })
    .select({ spotifyId: 1, name: 1, artist: 1, album: 1, duration: 1 })
    .lean()) as unknown as CatalogTrackDoc[]

  cachedTrackEquivalenceData = buildTrackEquivalenceData(tracks)
  return cachedTrackEquivalenceData
}

function getTrackMissionMatchKeys(
  target: MissionTargetDoc,
  equivalenceData?: TrackEquivalenceData
) {
  if (target.kind !== "track" || !target.trackKey) {
    return []
  }

  if (target.trackKeys?.length) {
    return target.trackKeys
  }

  return equivalenceData?.equivalentTrackKeysByTrackKey.get(target.trackKey) ?? [target.trackKey]
}

function buildMissionTrackMatchKeySet(
  targets: MissionTargetDoc[],
  equivalenceData?: TrackEquivalenceData
) {
  return new Set(targets.flatMap((target) => getTrackMissionMatchKeys(target, equivalenceData)))
}

function takeUniqueTracksByEquivalence(
  tracks: CatalogTrackDoc[],
  equivalenceGroupByTrackKey: Map<string, string>,
  selectionCount: number
) {
  const selected: CatalogTrackDoc[] = []
  const seenGroups = new Set<string>()

  for (const track of tracks) {
    const groupKey = equivalenceGroupByTrackKey.get(track.spotifyId) ?? track.spotifyId

    if (seenGroups.has(groupKey)) {
      continue
    }

    seenGroups.add(groupKey)
    selected.push(track)

    if (selected.length >= selectionCount) {
      break
    }
  }

  return selected
}

function buildTrackTargetProgressKey(trackKey: string) {
  return `track:${trackKey}`
}

function buildAlbumTargetProgressKey(albumKey: string) {
  return `album:${albumKey}`
}

function buildSpotifyTrackUrl(trackKey?: string) {
  return trackKey ? `https://open.spotify.com/track/${trackKey}` : undefined
}

function buildSpotifyAlbumUrl(albumKey?: string) {
  return albumKey ? `https://open.spotify.com/album/${albumKey}` : undefined
}

function buildTrackTargets(
  tracks: CatalogTrackDoc[],
  missionKind: MissionKind,
  defaultTargetCount: number,
  equivalenceData: TrackEquivalenceData
) {
  return tracks.map((track) => ({
    kind: "track" as const,
    trackKey: track.spotifyId,
    trackTitle: track.name,
    artistKey: normalizeArtistName(track.artist),
    artistName: track.artist,
    trackKeys: equivalenceData.equivalentTrackKeysByTrackKey.get(track.spotifyId) ?? [track.spotifyId],
    targetCount: missionKind === "individual_personal" ? defaultTargetCount : undefined
  }))
}

function buildAlbumTargets(albums: CatalogAlbumDoc[]) {
  return albums.map((album) => ({
    kind: "album" as const,
    albumKey: album.spotifyId,
    albumTitle: album.name,
    artistKey: normalizeArtistName(album.artist),
    artistName: album.artist,
    targetCount: 1,
    trackKeys: album.tracks.map((track) => track.spotifyId)
  }))
}

function getPlanningPeriodForCadence(cadence: MissionCadence) {
  return getNextIndiaPeriods()[cadence]
}

function getTargetKey(target: MissionTargetDoc) {
  return target.kind === "track" ? target.trackKey : target.albumKey
}

function buildRewardLabel(missionKind: MissionKind, rewardPoints: number) {
  return missionKind === "state_shared" ? `${rewardPoints} state points` : `${rewardPoints} points`
}

function buildMissionSlotKey(missionCellKey: MissionCellKey, mechanicType: MissionMechanicType) {
  return `${missionCellKey}:${mechanicType}`
}

function buildMissionTitle(config: ReturnType<typeof getMissionCellConfig>, mechanicType: MissionMechanicType) {
  return `${config.label} · ${mechanicType === "track_streams" ? "Songs" : "Albums"}`
}

function buildMissionMechanicMap<T>(getValue: (mechanicType: MissionMechanicType) => T) {
  return {
    track_streams: getValue("track_streams"),
    album_completions: getValue("album_completions")
  }
}

async function findMissionOverride(
  missionCellKey: MissionCellKey,
  mechanicType: MissionMechanicType,
  periodKey: string
) {
  const override = (await MissionOverrideModel.findOne({
    schemaVersion: MISSION_SCHEMA_VERSION,
    missionCellKey,
    mechanicType,
    periodKey
  }).lean()) as MissionOverrideDoc | null

  if (override) {
    return override
  }

  const legacyOverride = (await MissionOverrideModel.findOne({
    schemaVersion: 2,
    missionCellKey,
    mechanicType,
    periodKey
  }).lean()) as MissionOverrideDoc | null

  return legacyOverride
}

async function clearLegacyOverrideIfPresent(
  missionCellKey: MissionCellKey,
  mechanicType: MissionMechanicType,
  periodKey: string
) {
  await MissionOverrideModel.deleteOne({
    schemaVersion: 2,
    missionCellKey,
    mechanicType,
    periodKey
  })
}

async function getCurrentMissionInstances(): Promise<MissionInstanceDoc[]> {
  const periods = getCurrentIndiaPeriods()

  const instances = (await MissionInstanceModel.find({
    schemaVersion: MISSION_SCHEMA_VERSION,
    isActive: true,
    periodKey: { $in: [periods.daily.periodKey, periods.weekly.periodKey] }
  }).lean()) as unknown as MissionInstanceDoc[]

  return sortMissionInstances(instances)
}

const getCachedCurrentMissionInstancesPayload = unstable_cache(async () => {
  await connectToDatabase()
  const instances = await getCurrentMissionInstances()

  return instances.map(serializeMissionInstance)
}, ["missions:current-instances:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.missions, cacheTags.missionInstances]
})

async function getCurrentMissionInstancesForRead() {
  const cachedInstances = (await getCachedCurrentMissionInstancesPayload()).map(deserializeMissionInstance)

  if (cachedInstances.length > 0) {
    return cachedInstances
  }

  const ensuredInstances = await ensureCurrentMissionInstances()

  if (ensuredInstances.length > 0) {
    revalidateCacheTags(
      cacheTags.missions,
      cacheTags.missionInstances,
      cacheTags.missionAssets,
      cacheTags.missionSharedProgress,
      cacheTags.missionAdmin
    )
  }

  return ensuredInstances
}

async function selectTracksForCell(missionCellKey: MissionCellKey, periodKey: string) {
  const config = getMissionCellConfig(missionCellKey)
  const tracks = (await CatalogTrackModel.find({ isBTSFamily: true }).lean()) as unknown as CatalogTrackDoc[]
  const equivalenceData = buildTrackEquivalenceData(tracks)
  const eligibleTracks = tracks.filter(isEligibleTrack)
  const selectionCount = config.targetSelectionCount.track_streams

  const uniqueEligibleTracks = takeUniqueTracksByEquivalence(
    shuffleWithSeed(eligibleTracks, `${periodKey}:${missionCellKey}:tracks`),
    equivalenceData.equivalenceGroupByTrackKey,
    selectionCount
  )

  if (uniqueEligibleTracks.length < selectionCount) {
    return []
  }

  return uniqueEligibleTracks
}

async function selectAlbumsForCell(missionCellKey: MissionCellKey, periodKey: string) {
  const config = getMissionCellConfig(missionCellKey)
  const albums = (await CatalogAlbumModel.find({ isBTSFamily: true }).lean()) as unknown as CatalogAlbumDoc[]
  const eligibleAlbums = albums.filter(isEligibleAlbum)
  const selectionCount = config.targetSelectionCount.album_completions

  if (eligibleAlbums.length < selectionCount) {
    return []
  }

  return shuffleWithSeed(eligibleAlbums, `${periodKey}:${missionCellKey}:albums`).slice(
    0,
    selectionCount
  )
}

async function resolveTrackTargets(trackKeys: string[]) {
  const tracks = (await CatalogTrackModel.find({
    spotifyId: { $in: trackKeys },
    isBTSFamily: true
  }).lean()) as unknown as CatalogTrackDoc[]

  const trackMap = new Map(tracks.map((track) => [track.spotifyId, track]))
  return trackKeys.map((trackKey) => trackMap.get(trackKey)).filter(Boolean) as CatalogTrackDoc[]
}

async function resolveAlbumTargets(albumKeys: string[]) {
  const albums = (await CatalogAlbumModel.find({
    spotifyId: { $in: albumKeys },
    isBTSFamily: true
  }).lean()) as unknown as CatalogAlbumDoc[]

  const albumMap = new Map(albums.map((album) => [album.spotifyId, album]))
  return albumKeys.map((albumKey) => albumMap.get(albumKey)).filter(Boolean) as CatalogAlbumDoc[]
}

async function buildMissionTargets(
  missionCellKey: MissionCellKey,
  mechanicType: MissionMechanicType,
  selectionMode: "admin" | "random",
  targetKeys: string[],
  periodKey: string
) {
  const config = getMissionCellConfig(missionCellKey)

  if (mechanicType === "album_completions") {
    const albums =
      selectionMode === "admin"
        ? await resolveAlbumTargets(targetKeys)
        : await selectAlbumsForCell(missionCellKey, periodKey)
    return buildAlbumTargets(albums)
  }

  const tracks =
    selectionMode === "admin"
      ? await resolveTrackTargets(targetKeys)
      : await selectTracksForCell(missionCellKey, periodKey)
  const equivalenceData = await getTrackEquivalenceData()

  return buildTrackTargets(tracks, config.missionKind, config.perItemTargetCount, equivalenceData)
}

function deriveGoalUnits(
  missionCellKey: MissionCellKey,
  missionKind: MissionKind,
  mechanicType: MissionMechanicType,
  targets: MissionTargetDoc[],
  configuredGoalUnits?: number
) {
  const config = getMissionCellConfig(missionCellKey)
  const resolvedGoalUnits =
    configuredGoalUnits && configuredGoalUnits > 0
      ? configuredGoalUnits
      : config.defaultGoalUnitsByMechanic[mechanicType]

  if (missionKind === "individual_personal" && mechanicType === "album_completions") {
    return Math.min(resolvedGoalUnits, targets.length)
  }

  return resolvedGoalUnits
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

async function resetLegacyCurrentMissionInstances() {
  const periods = getCurrentIndiaPeriods()
  const legacyInstances = (await MissionInstanceModel.find({
    schemaVersion: 2,
    isActive: true,
    periodKey: { $in: [periods.daily.periodKey, periods.weekly.periodKey] }
  }).lean()) as unknown as MissionInstanceDoc[]

  if (legacyInstances.length === 0) {
    return
  }

  for (const instance of legacyInstances) {
    await resetMissionInstanceState(instance._id)
  }

  await MissionInstanceModel.updateMany(
    {
      schemaVersion: 2,
      _id: { $in: legacyInstances.map((instance) => instance._id) }
    },
    { $set: { isActive: false } }
  )
}

async function generateMissionCellMechanic(
  missionCellKey: MissionCellKey,
  mechanicType: MissionMechanicType,
  force = false
) {
  const config = getMissionCellConfig(missionCellKey)
  const period = getIndiaPeriod(config.cadence)

  await MissionInstanceModel.updateMany(
    {
      schemaVersion: MISSION_SCHEMA_VERSION,
      missionCellKey,
      mechanicType,
      isActive: true,
      periodKey: { $ne: period.periodKey }
    },
    { $set: { isActive: false } }
  )

  const existing = (await MissionInstanceModel.findOne({
    schemaVersion: MISSION_SCHEMA_VERSION,
    missionCellKey,
    mechanicType,
    periodKey: period.periodKey,
    isActive: true
  }).lean()) as MissionInstanceDoc | null

  if (existing && !force) {
    return existing
  }

  if (existing && force) {
    await resetMissionInstanceState(existing._id)
    await MissionInstanceModel.deleteOne({ _id: existing._id })
  }

  const override = await findMissionOverride(missionCellKey, mechanicType, period.periodKey)
  const selectionMode = override ? "admin" : "random"
  const rawTargetKeys = override?.targetKeys ?? []
  const targets =
    selectionMode === "random"
      ? await buildMissionTargets(missionCellKey, mechanicType, selectionMode, [], period.periodKey)
      : await buildMissionTargets(
          missionCellKey,
          mechanicType,
          selectionMode,
          rawTargetKeys,
          period.periodKey
        )

  if (targets.length === 0) {
    return null
  }

  const goalUnits = deriveGoalUnits(
    missionCellKey,
    config.missionKind,
    mechanicType,
    targets,
    override?.goalUnits
  )
  const rewardPoints = override?.rewardPoints ?? config.defaultRewardPointsByMechanic[mechanicType]

  const instance = await MissionInstanceModel.create({
    schemaVersion: MISSION_SCHEMA_VERSION,
    cadence: config.cadence,
    missionCellKey,
    slotKey: buildMissionSlotKey(missionCellKey, mechanicType),
    missionKind: config.missionKind,
    mechanicType,
    periodKey: period.periodKey,
    startsAt: period.startsAt,
    endsAt: period.endsAt,
    timezone: period.timezone,
    title: buildMissionTitle(config, mechanicType),
    description: config.descriptionByMechanic[mechanicType],
    goalUnits,
    rewardRouting: config.rewardRouting,
    rewardPoints,
    selectionMode,
    isActive: true,
    targetConfig: {
      targets
    }
  })

  return instance.toObject() as unknown as MissionInstanceDoc
}

export async function ensureCurrentMissionInstances(options: {
  cadence?: MissionCadence
  missionCellKeys?: MissionCellKey[]
  force?: boolean
} = {}) {
  await connectToDatabase()
  await resetLegacyCurrentMissionInstances()

  const summary = await getCatalogSummary()

  if (summary.trackCount === 0 || summary.albumCount === 0) {
    return []
  }

  const missionCellKeys = (options.missionCellKeys ?? missionCellOrder).filter((missionCellKey) =>
    options.cadence ? missionCellConfig[missionCellKey].cadence === options.cadence : true
  )

  const instances = await Promise.all(
    missionCellKeys.flatMap((missionCellKey) =>
      missionMechanicOrder.map((mechanicType) =>
        generateMissionCellMechanic(missionCellKey, mechanicType, options.force ?? false)
      )
    )
  )

  return instances.filter((instance): instance is MissionInstanceDoc => Boolean(instance))
}

async function getMissionProgressMap(userId: Types.ObjectId, instances: MissionInstanceDoc[]) {
  const progressDocs = (await UserMissionProgressModel.find({
    schemaVersion: MISSION_SCHEMA_VERSION,
    userId,
    missionInstanceId: { $in: instances.map((instance) => instance._id) }
  }).lean()) as unknown as UserMissionProgressDoc[]

  return new Map(progressDocs.map((progress) => [String(progress.missionInstanceId), progress]))
}

async function getSharedProgressMap(stateKey: string | undefined, instances: MissionInstanceDoc[]) {
  const scopeKeys = [INDIA_SCOPE_KEY, ...(stateKey ? [stateKey] : [])]

  const progressDocs = (await SharedMissionProgressModel.find({
    schemaVersion: MISSION_SCHEMA_VERSION,
    missionInstanceId: { $in: instances.map((instance) => instance._id) },
    scopeKey: { $in: scopeKeys }
  }).lean()) as unknown as SharedMissionProgressDoc[]

  return new Map(progressDocs.map((progress) => [`${String(progress.missionInstanceId)}:${progress.scopeKey}`, progress]))
}

const getCachedSharedMissionProgressPayload = unstable_cache(
  async (stateKey: string | null) => {
    await connectToDatabase()

    const instances = (await getCachedCurrentMissionInstancesPayload()).map(deserializeMissionInstance)

    if (instances.length === 0) {
      return [] as CachedSharedMissionProgress[]
    }

    const scopeKeys = [INDIA_SCOPE_KEY, ...(stateKey ? [stateKey] : [])]
    const progressDocs = (await SharedMissionProgressModel.find({
      schemaVersion: MISSION_SCHEMA_VERSION,
      missionInstanceId: { $in: instances.map((instance) => instance._id) },
      scopeKey: { $in: scopeKeys }
    }).lean()) as unknown as SharedMissionProgressDoc[]

    return progressDocs.map(serializeSharedMissionProgress)
  },
  ["missions:shared-progress:v1"],
  {
    revalidate: sharedCacheRevalidateSeconds,
    tags: [cacheTags.missions, cacheTags.missionSharedProgress]
  }
)

async function getMissionContributionMap(userId: Types.ObjectId, instances: MissionInstanceDoc[]) {
  const docs = (await MissionContributionModel.find({
    schemaVersion: MISSION_SCHEMA_VERSION,
    userId,
    missionInstanceId: { $in: instances.map((instance) => instance._id) }
  }).lean()) as unknown as MissionContributionDoc[]

  return new Map(docs.map((doc) => [String(doc.missionInstanceId), doc]))
}

async function getUserPlayedTrackSetsForInstances(
  userId: Types.ObjectId,
  instances: MissionInstanceDoc[]
) {
  const dailyInstance = instances.find((instance) => instance.cadence === "daily")
  const weeklyInstance = instances.find((instance) => instance.cadence === "weekly")

  const [dailyEvents, weeklyEvents] = await Promise.all([
    dailyInstance ? getRelevantStreamEvents({ userId }, dailyInstance.startsAt, dailyInstance.endsAt) : [],
    weeklyInstance ? getRelevantStreamEvents({ userId }, weeklyInstance.startsAt, weeklyInstance.endsAt) : []
  ])

  return {
    daily: new Set(
      dailyEvents
        .map((event) => event.catalogTrackSpotifyId)
        .filter((trackKey): trackKey is string => Boolean(trackKey))
    ),
    weekly: new Set(
      weeklyEvents
        .map((event) => event.catalogTrackSpotifyId)
        .filter((trackKey): trackKey is string => Boolean(trackKey))
    )
  }
}

function buildTargetViews(
  targets: MissionTargetDoc[],
  progressMap: Record<string, number>,
  imageMaps?: MissionTargetImageMaps,
  playedTrackKeys: Set<string> = new Set()
) {
  return targets.map<MissionTargetView>((target) => {
    if (target.kind === "track") {
      const progressValue = target.trackKey
        ? progressMap[buildTrackTargetProgressKey(target.trackKey)] ?? 0
        : 0

      return {
        key: target.trackKey ?? target.trackTitle ?? "track",
        kind: "track",
        title: target.trackTitle ?? "Track",
        artistName: target.artistName ?? "BTS",
        imageUrl: target.trackKey ? imageMaps?.trackImages.get(target.trackKey) : undefined,
        spotifyUrl: buildSpotifyTrackUrl(target.trackKey),
        targetCount: target.targetCount,
        progress: target.targetCount ? Math.min(progressValue, target.targetCount) : progressValue
      }
    }

    const progressValue = target.albumKey
      ? progressMap[buildAlbumTargetProgressKey(target.albumKey)] ?? 0
      : 0
    const albumTracks = target.albumKey ? imageMaps?.albumTracks.get(target.albumKey) ?? [] : []
    const tracks = albumTracks.map((track) => ({
      ...track,
      spotifyUrl: buildSpotifyTrackUrl(track.key),
      isCompleted: playedTrackKeys.has(track.key)
    }))
    const completedTrackCount = tracks.filter((track) => track.isCompleted).length

    return {
      key: target.albumKey ?? target.albumTitle ?? "album",
      kind: "album",
      title: target.albumTitle ?? "Album",
      artistName: target.artistName ?? "BTS",
      imageUrl: target.albumKey ? imageMaps?.albumImages.get(target.albumKey) : undefined,
      spotifyUrl: buildSpotifyAlbumUrl(target.albumKey),
      targetCount: 1,
      progress: Math.min(progressValue, 1),
      trackCount: tracks.length > 0 ? tracks.length : (target.trackKeys?.length ?? 0),
      completedTrackCount,
      tracks
    }
  })
}

async function buildMissionTargetImagePayload(instances: MissionInstanceDoc[]): Promise<MissionTargetImagePayload> {
  const trackKeys = new Set<string>()
  const albumKeys = new Set<string>()

  for (const instance of instances) {
    for (const target of instance.targetConfig.targets) {
      if (target.kind === "track" && target.trackKey) {
        trackKeys.add(target.trackKey)
      }

      if (target.kind === "album" && target.albumKey) {
        albumKeys.add(target.albumKey)
      }
    }
  }

  const [tracks, albums] = await Promise.all([
    trackKeys.size > 0
      ? CatalogTrackModel.find({
          spotifyId: { $in: Array.from(trackKeys) },
          isBTSFamily: true
        })
          .select({ spotifyId: 1, thumbnails: 1 })
          .lean()
      : Promise.resolve([]),
    albumKeys.size > 0
      ? CatalogAlbumModel.find({
          spotifyId: { $in: Array.from(albumKeys) },
          isBTSFamily: true
        })
          .select({ spotifyId: 1, coverImage: 1, tracks: 1 })
          .lean()
      : Promise.resolve([])
  ])

  return {
    trackImages: Object.fromEntries(
      (tracks as Array<{ spotifyId: string; thumbnails?: { small?: string; medium?: string; large?: string } }>)
        .map((track) => [track.spotifyId, track.thumbnails?.medium ?? track.thumbnails?.large ?? track.thumbnails?.small])
        .filter((entry): entry is [string, string] => Boolean(entry[1]))
    ),
    albumImages: Object.fromEntries(
      (albums as Array<{ spotifyId: string; coverImage?: string }>)
        .map((album) => [album.spotifyId, album.coverImage])
        .filter((entry): entry is [string, string] => Boolean(entry[1]))
    ),
    albumTracks: Object.fromEntries(
      (
        albums as Array<{
          spotifyId: string
          tracks?: Array<{ spotifyId: string; name: string; artist: string }>
        }>
      ).map((album) => [
        album.spotifyId,
        (album.tracks ?? []).map((track) => ({
          key: track.spotifyId,
          title: track.name,
          artistName: track.artist
        }))
      ])
    )
  }
}

const getCachedMissionTargetImagePayload = unstable_cache(async () => {
  await connectToDatabase()
  const instances = (await getCachedCurrentMissionInstancesPayload()).map(deserializeMissionInstance)

  if (instances.length === 0) {
    return {
      trackImages: {},
      albumImages: {},
      albumTracks: {}
    } satisfies MissionTargetImagePayload
  }

  return buildMissionTargetImagePayload(instances)
}, ["missions:target-assets:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.missions, cacheTags.missionAssets, cacheTags.catalog]
})

async function buildMissionCardsForUser(
  user: Awaited<ReturnType<typeof getCurrentUserRecord>>
): Promise<MissionCard[]> {
  const instances = await getCurrentMissionInstancesForRead()
  const stateKey = user.region?.state ? buildStateKey(user.region.state) : undefined
  const cachedInstancesPayload = await getCachedCurrentMissionInstancesPayload()
  const canUseSharedMissionCaches =
    cachedInstancesPayload.length === instances.length &&
    cachedInstancesPayload.every((instance, index) => instance.id === String(instances[index]?._id))

  const [userProgressMap, contributionMap, playedTrackSets, sharedProgressSource, imageSource] = await Promise.all([
    getMissionProgressMap(user._id, instances),
    getMissionContributionMap(user._id, instances),
    getUserPlayedTrackSetsForInstances(user._id, instances),
    canUseSharedMissionCaches
      ? getCachedSharedMissionProgressPayload(stateKey ?? null)
      : getSharedProgressMap(stateKey, instances),
    canUseSharedMissionCaches
      ? getCachedMissionTargetImagePayload()
      : buildMissionTargetImagePayload(instances)
  ])
  const sharedProgressMap =
    sharedProgressSource instanceof Map
      ? sharedProgressSource
      : new Map(
          sharedProgressSource.map((progress) => {
            const hydratedProgress = deserializeSharedMissionProgress(progress)

            return [`${String(hydratedProgress.missionInstanceId)}:${hydratedProgress.scopeKey}`, hydratedProgress] as const
          })
        )
  const imageMaps = toMissionTargetImageMaps(imageSource)

  return instances.map((instance) => {
    const userProgress = userProgressMap.get(String(instance._id))
    const indiaProgress = sharedProgressMap.get(`${String(instance._id)}:${INDIA_SCOPE_KEY}`)
    const stateProgress = stateKey
      ? sharedProgressMap.get(`${String(instance._id)}:${stateKey}`)
      : undefined
    const contribution = contributionMap.get(String(instance._id))

    if (instance.missionKind === "individual_personal") {
      const targetProgress = buildTargetViews(
        instance.targetConfig.targets,
        toTargetProgressMap(userProgress?.targetProgress),
        imageMaps,
        instance.cadence === "daily" ? playedTrackSets.daily : playedTrackSets.weekly
      )
      const focus = summarizeFocus(targetProgress.map((target) => target.title))
      const progressValue = userProgress?.progressValue ?? 0
      const completionState =
        progressValue >= instance.goalUnits || Boolean(userProgress?.completedAt)
          ? "completed"
          : "in_progress"

      return {
        id: String(instance._id),
        missionCellKey: instance.missionCellKey,
        missionKind: instance.missionKind,
        mechanicType: instance.mechanicType,
        cadence: instance.cadence,
        title: instance.title,
        description: instance.description,
        startsAt: instance.startsAt.toISOString(),
        endsAt: instance.endsAt.toISOString(),
        periodKey: instance.periodKey,
        goalUnits: instance.goalUnits,
        rewardPoints: instance.rewardPoints,
        rewardLabel: `${instance.rewardPoints} points`,
        selectionMode: instance.selectionMode,
        progressScopeType: "user",
        aggregateProgress: progressValue,
        userContribution: progressValue,
        completionState,
        focus,
        scopeLabel: "You",
        targets: targetProgress
      } satisfies MissionCard
    }

    if (instance.missionKind === "state_shared") {
      const targetProgress = buildTargetViews(
        instance.targetConfig.targets,
        toTargetProgressMap(stateProgress?.targetProgress),
        imageMaps,
        instance.cadence === "daily" ? playedTrackSets.daily : playedTrackSets.weekly
      )
      const focus = summarizeFocus(targetProgress.map((target) => target.title))
      const progressValue = stateProgress?.progressValue ?? 0
      const completionState = !user.region?.state
        ? "locked"
        : progressValue >= instance.goalUnits || Boolean(stateProgress?.completedAt)
          ? "completed"
          : "in_progress"

      return {
        id: String(instance._id),
        missionCellKey: instance.missionCellKey,
        missionKind: instance.missionKind,
        mechanicType: instance.mechanicType,
        cadence: instance.cadence,
        title: instance.title,
        description: instance.description,
        startsAt: instance.startsAt.toISOString(),
        endsAt: instance.endsAt.toISOString(),
        periodKey: instance.periodKey,
        goalUnits: instance.goalUnits,
        rewardPoints: instance.rewardPoints,
        rewardLabel: `${instance.rewardPoints} state points`,
        selectionMode: instance.selectionMode,
        progressScopeType: "state",
        aggregateProgress: progressValue,
        userContribution: contribution?.contributionUnits ?? 0,
        contributorCount: stateProgress?.contributorCount ?? 0,
        completionState,
        focus,
        scopeLabel: user.region?.state ?? "Your State",
        targets: targetProgress
      } satisfies MissionCard
    }

    const targetProgress = buildTargetViews(
      instance.targetConfig.targets,
      toTargetProgressMap(indiaProgress?.targetProgress),
      imageMaps,
      instance.cadence === "daily" ? playedTrackSets.daily : playedTrackSets.weekly
    )
    const focus = summarizeFocus(targetProgress.map((target) => target.title))
    const progressValue = indiaProgress?.progressValue ?? 0

    return {
      id: String(instance._id),
      missionCellKey: instance.missionCellKey,
      missionKind: instance.missionKind,
      mechanicType: instance.mechanicType,
      cadence: instance.cadence,
      title: instance.title,
      description: instance.description,
      startsAt: instance.startsAt.toISOString(),
      endsAt: instance.endsAt.toISOString(),
      periodKey: instance.periodKey,
      goalUnits: instance.goalUnits,
      rewardPoints: instance.rewardPoints,
      rewardLabel: `${instance.rewardPoints} points`,
      selectionMode: instance.selectionMode,
      progressScopeType: "india",
      aggregateProgress: progressValue,
      userContribution: contribution?.contributionUnits ?? 0,
      contributorCount: indiaProgress?.contributorCount ?? 0,
      completionState:
        progressValue >= instance.goalUnits || Boolean(indiaProgress?.completedAt)
          ? "completed"
          : "in_progress",
      focus,
      scopeLabel: "All India",
      targets: targetProgress
    } satisfies MissionCard
  })
}

async function getRelevantStreamEvents(
  filter: Record<string, unknown>,
  startsAt: Date,
  endsAt: Date
) {
  return StreamEventModel.find({
    ...filter,
    isBTSFamily: true,
    playedAt: {
      $gte: startsAt,
      $lt: endsAt
    }
  })
    .sort({ playedAt: 1, _id: 1 })
    .select({
      _id: 1,
      userId: 1,
      playedAt: 1,
      catalogTrackSpotifyId: 1,
      catalogAlbumSpotifyId: 1,
      isBTSFamily: 1,
      stateKey: 1
    })
    .lean() as unknown as Promise<StreamEventDoc[]>
}

function countMatchingTrackStreams(
  events: StreamEventDoc[],
  targets: MissionTargetDoc[],
  equivalenceData?: TrackEquivalenceData
) {
  const counts = new Map<string, number>()

  for (const target of targets) {
    if (target.kind !== "track" || !target.trackKey) {
      continue
    }

    const matchTrackKeys = new Set(getTrackMissionMatchKeys(target, equivalenceData))
    counts.set(
      target.trackKey,
      events.filter(
        (event) => event.catalogTrackSpotifyId && matchTrackKeys.has(event.catalogTrackSpotifyId)
      ).length
    )
  }

  return counts
}

function getFirstMatchingTrackContributionAt(
  events: StreamEventDoc[],
  targets: MissionTargetDoc[],
  equivalenceData?: TrackEquivalenceData
) {
  const targetTrackKeys = new Set(targets.flatMap((target) => getTrackMissionMatchKeys(target, equivalenceData)))

  return (
    events.find((event) => event.catalogTrackSpotifyId && targetTrackKeys.has(event.catalogTrackSpotifyId))
      ?.playedAt ?? undefined
  )
}

function computeAlbumCompletionDetails(events: StreamEventDoc[], targets: MissionTargetDoc[]) {
  const firstTrackPlayMap = new Map<string, Date>()

  for (const event of events) {
    if (!event.catalogTrackSpotifyId || firstTrackPlayMap.has(event.catalogTrackSpotifyId)) {
      continue
    }

    firstTrackPlayMap.set(event.catalogTrackSpotifyId, event.playedAt)
  }

  const completionMap = new Map<string, { completed: number; completedAt?: Date }>()

  for (const target of targets) {
    if (target.kind !== "album" || !target.albumKey) {
      continue
    }

    const completionTimes = (target.trackKeys ?? [])
      .map((trackKey) => firstTrackPlayMap.get(trackKey))
      .filter((value): value is Date => Boolean(value))

    if (target.trackKeys?.length && completionTimes.length === target.trackKeys.length) {
      completionMap.set(target.albumKey, {
        completed: 1,
        completedAt: new Date(Math.max(...completionTimes.map((value) => value.getTime())))
      })
      continue
    }

    completionMap.set(target.albumKey, { completed: 0 })
  }

  return completionMap
}

async function awardPersonalMissionCompletion(
  user: Awaited<ReturnType<typeof getCurrentUserRecord>>,
  mission: MissionInstanceDoc,
  progress: UserMissionProgressDoc
) {
  const stateSource = getStateScopeSource(user.region)

  if (!stateSource || !user.region?.state) {
    return
  }

  const stateKey = buildStateKey(stateSource)
  const effectivePlace = getEffectivePlaceFromRegion(user.region)
  const occurredAt = progress.completedAt ?? new Date()

  const pointEvents = [
    {
      boardType: "individual" as const,
      cadence: mission.cadence,
      periodAt: mission.startsAt,
      occurredAt,
      competitorType: "user" as const,
      competitorKey: String(user._id),
      displayName: user.displayName,
      points: mission.rewardPoints,
      sourceType: "mission_completion" as const,
      sourceId: String(mission._id),
      dedupeKey: `mission:${mission._id}:user:${user._id}:individual`,
      userId: user._id,
      stateKey
    },
    {
      boardType: "state" as const,
      cadence: mission.cadence,
      periodAt: mission.startsAt,
      occurredAt,
      competitorType: "state" as const,
      competitorKey: stateKey,
      displayName: user.region.state,
      points: mission.rewardPoints,
      sourceType: "mission_completion" as const,
      sourceId: String(mission._id),
      dedupeKey: `mission:${mission._id}:user:${user._id}:state:${stateKey}`,
      userId: user._id,
      stateKey
    }
  ]

  const result = await recordLeaderboardPointEvents(pointEvents)

  if (result.inserted > 0) {
    await recordLocationActivityEvents(
      buildLocationActivityEvents({
        occurredAt,
        points: mission.rewardPoints,
        sourceType: "mission_completion",
        sourceId: `${mission._id}:personal:${user._id}`,
        userId: user._id,
        stateKey: stateSource,
        stateLabel: user.region.state,
        placeKey: effectivePlace?.placeKey,
        placeLabel: effectivePlace?.placeLabel
      })
    )

    await UserMissionProgressModel.updateOne(
      { _id: progress._id },
      { $set: { rewardAwardedAt: new Date() } }
    )
  }
}

async function awardIndiaMissionContributors(mission: MissionInstanceDoc, completedAt: Date) {
  const contributions = (await MissionContributionModel.find({
    schemaVersion: MISSION_SCHEMA_VERSION,
    missionInstanceId: mission._id,
    contributionUnits: { $gt: 0 },
    rewardAwardedAt: null,
    qualifiedAt: { $lte: completedAt }
  }).lean()) as unknown as MissionContributionDoc[]

  if (contributions.length === 0) {
    return
  }

  const userIds = contributions.map((contribution) => contribution.userId)
  const users = await requireUsersByIds(userIds)
  const userMap = new Map(users.map((user) => [String(user._id), user]))
  const pointEvents: Parameters<typeof recordLeaderboardPointEvents>[0] = []
  const locationEvents: ReturnType<typeof buildLocationActivityEvents> = []

  for (const contribution of contributions) {
    const user = userMap.get(String(contribution.userId))

    const stateSource = getStateScopeSource(user?.region)

    if (!stateSource || !user?.region?.state) {
      continue
    }

    const stateKey = buildStateKey(stateSource)
    const effectivePlace = getEffectivePlaceFromRegion(user.region)
    pointEvents.push(
      {
        boardType: "individual",
        cadence: mission.cadence,
        periodAt: mission.startsAt,
        occurredAt: completedAt,
        competitorType: "user",
        competitorKey: String(user._id),
        displayName: user.displayName,
        points: mission.rewardPoints,
        sourceType: "mission_completion",
        sourceId: String(mission._id),
        dedupeKey: `mission:${mission._id}:india:user:${user._id}:individual`,
        userId: user._id,
        stateKey
      },
      {
        boardType: "state",
        cadence: mission.cadence,
        periodAt: mission.startsAt,
        occurredAt: completedAt,
        competitorType: "state",
        competitorKey: stateKey,
        displayName: user.region.state,
        points: mission.rewardPoints,
        sourceType: "mission_completion",
        sourceId: String(mission._id),
        dedupeKey: `mission:${mission._id}:india:user:${user._id}:state:${stateKey}`,
        userId: user._id,
        stateKey
      }
    )

    locationEvents.push(
      ...buildLocationActivityEvents({
        occurredAt: completedAt,
        points: mission.rewardPoints,
        sourceType: "mission_completion",
        sourceId: `${mission._id}:india:${user._id}`,
        userId: user._id,
        stateKey: stateSource,
        stateLabel: user.region.state,
        placeKey: effectivePlace?.placeKey,
        placeLabel: effectivePlace?.placeLabel
      })
    )
  }

  const result = await recordLeaderboardPointEvents(pointEvents)

  if (result.inserted > 0) {
    if (locationEvents.length > 0) {
      await recordLocationActivityEvents(locationEvents)
    }

    await MissionContributionModel.updateMany(
      {
        schemaVersion: MISSION_SCHEMA_VERSION,
        missionInstanceId: mission._id,
        rewardAwardedAt: null,
        qualifiedAt: { $lte: completedAt }
      },
      { $set: { rewardAwardedAt: new Date() } }
    )
  }
}

async function requireUsersByIds(userIds: Types.ObjectId[]) {
  return (await UserModel.find({
    _id: { $in: userIds }
  }).lean()) as unknown as Array<{
    _id: Types.ObjectId
    displayName: string
    region?: {
      stateKey?: string
      state?: string
      cityKey?: string
      city?: string
      fallbackCityKey?: string
      fallbackCityLabel?: string
    }
  }>
}

async function recomputeIndividualMissionProgress(
  user: Awaited<ReturnType<typeof getCurrentUserRecord>>,
  mission: MissionInstanceDoc
) {
  const events = await getRelevantStreamEvents({ userId: user._id }, mission.startsAt, mission.endsAt)
  const existingProgress = (await UserMissionProgressModel.findOne({
    schemaVersion: MISSION_SCHEMA_VERSION,
    missionInstanceId: mission._id,
    userId: user._id
  })) as UserMissionProgressDoc | null

  const targetProgress: Record<string, number> = {}
  let progressValue = 0
  const trackEquivalenceData =
    mission.mechanicType === "track_streams" ? await getTrackEquivalenceData() : undefined

  if (mission.mechanicType === "track_streams") {
    const counts = countMatchingTrackStreams(events, mission.targetConfig.targets, trackEquivalenceData)

    for (const target of mission.targetConfig.targets) {
      if (target.kind !== "track" || !target.trackKey) {
        continue
      }

      const count = counts.get(target.trackKey) ?? 0
      targetProgress[buildTrackTargetProgressKey(target.trackKey)] = count
      progressValue += Math.min(count, target.targetCount ?? count)
    }
  } else {
    const completionMap = computeAlbumCompletionDetails(events, mission.targetConfig.targets)

    for (const target of mission.targetConfig.targets) {
      if (target.kind !== "album" || !target.albumKey) {
        continue
      }

      const completed = completionMap.get(target.albumKey)?.completed ?? 0
      targetProgress[buildAlbumTargetProgressKey(target.albumKey)] = completed
      progressValue += completed
    }
  }

  progressValue = Math.min(progressValue, mission.goalUnits)
  const completedAt =
    progressValue >= mission.goalUnits ? existingProgress?.completedAt ?? new Date() : undefined

  const progress = await UserMissionProgressModel.findOneAndUpdate(
    {
      schemaVersion: MISSION_SCHEMA_VERSION,
      missionInstanceId: mission._id,
      userId: user._id
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

  const typedProgress = progress.toObject() as unknown as UserMissionProgressDoc

  if (progressValue >= mission.goalUnits && !typedProgress.rewardAwardedAt) {
    await awardPersonalMissionCompletion(user, mission, typedProgress)
  }
}

async function recomputeStateMissionProgress(
  user: Awaited<ReturnType<typeof getCurrentUserRecord>>,
  mission: MissionInstanceDoc
) {
  const stateSource = getStateScopeSource(user.region)

  if (!stateSource || !user.region?.state) {
    return
  }

  const stateKey = buildStateKey(stateSource)
  const stateEvents = await getRelevantStreamEvents({ stateKey }, mission.startsAt, mission.endsAt)
  const existingSharedProgress = (await SharedMissionProgressModel.findOne({
    schemaVersion: MISSION_SCHEMA_VERSION,
    missionInstanceId: mission._id,
    scopeType: "state",
    scopeKey: stateKey
  }).lean()) as unknown as SharedMissionProgressDoc | null
  const stateUsers = new Set(stateEvents.map((event) => String(event.userId)))
  let progressValue = 0
  const targetProgress: Record<string, number> = {}
  let contributorCount = 0
  const trackEquivalenceData =
    mission.mechanicType === "track_streams" ? await getTrackEquivalenceData() : undefined
  const missionTrackMatchKeys =
    mission.mechanicType === "track_streams"
      ? buildMissionTrackMatchKeySet(mission.targetConfig.targets, trackEquivalenceData)
      : undefined

  if (mission.mechanicType === "track_streams") {
    const matchingEvents = stateEvents.filter((event) =>
      missionTrackMatchKeys?.has(event.catalogTrackSpotifyId ?? "")
    )
    const counts = countMatchingTrackStreams(
      matchingEvents,
      mission.targetConfig.targets,
      trackEquivalenceData
    )

    for (const target of mission.targetConfig.targets) {
      if (target.kind !== "track" || !target.trackKey) {
        continue
      }

      const count = counts.get(target.trackKey) ?? 0
      targetProgress[buildTrackTargetProgressKey(target.trackKey)] = count
      progressValue += count
    }

    contributorCount = new Set(matchingEvents.map((event) => String(event.userId))).size
  } else {
    const perUserAlbumCompletion = new Map<string, number>()
    const completedUserIds = new Set<string>()

    for (const userId of stateUsers) {
      const userEvents = stateEvents.filter((event) => String(event.userId) === userId)
      const completionMap = computeAlbumCompletionDetails(userEvents, mission.targetConfig.targets)
      let userCompletedCount = 0

      for (const target of mission.targetConfig.targets) {
        if (target.kind !== "album" || !target.albumKey) {
          continue
        }

        const completed = completionMap.get(target.albumKey)?.completed ?? 0
        targetProgress[buildAlbumTargetProgressKey(target.albumKey)] =
          (targetProgress[buildAlbumTargetProgressKey(target.albumKey)] ?? 0) + completed
        userCompletedCount += completed
      }

      perUserAlbumCompletion.set(userId, userCompletedCount)

      if (userCompletedCount > 0) {
        completedUserIds.add(userId)
      }
    }

    progressValue = Array.from(perUserAlbumCompletion.values()).reduce((sum, value) => sum + value, 0)
    contributorCount = completedUserIds.size
  }

  const completedAt =
    progressValue >= mission.goalUnits
      ? existingSharedProgress?.completedAt ?? new Date()
      : undefined
  const sharedProgress = await SharedMissionProgressModel.findOneAndUpdate(
    {
      schemaVersion: MISSION_SCHEMA_VERSION,
      missionInstanceId: mission._id,
      scopeType: "state",
      scopeKey: stateKey
    },
    {
      $set: {
        scopeLabel: user.region.state,
        progressValue,
        goalUnits: mission.goalUnits,
        contributorCount,
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

  const typedProgress = sharedProgress.toObject() as unknown as SharedMissionProgressDoc

  const userEvents = stateEvents.filter((event) => String(event.userId) === String(user._id))
  const userAlbumCompletionDetails =
    mission.mechanicType === "album_completions"
      ? computeAlbumCompletionDetails(userEvents, mission.targetConfig.targets)
      : null
  const contributionUnits =
    mission.mechanicType === "track_streams"
      ? userEvents.filter((event) => missionTrackMatchKeys?.has(event.catalogTrackSpotifyId ?? "")).length
      : Array.from(userAlbumCompletionDetails?.values() ?? []).reduce(
          (sum, value) => sum + value.completed,
          0
        )
  const qualifiedAt =
    mission.mechanicType === "track_streams"
      ? getFirstMatchingTrackContributionAt(
          userEvents,
          mission.targetConfig.targets,
          trackEquivalenceData
        )
      : Array.from(userAlbumCompletionDetails?.values() ?? [])
          .map((value) => value.completedAt)
          .filter((value): value is Date => Boolean(value))
          .sort((left, right) => left.getTime() - right.getTime())[0]

  await MissionContributionModel.findOneAndUpdate(
    {
      schemaVersion: MISSION_SCHEMA_VERSION,
      missionInstanceId: mission._id,
      userId: user._id
    },
    {
      $set: {
        contributionUnits,
        stateKey,
        qualifiedAt: contributionUnits > 0 ? qualifiedAt ?? new Date() : undefined
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )

  if (progressValue >= mission.goalUnits && !typedProgress.rewardAwardedAt) {
    const occurredAt = typedProgress.completedAt ?? new Date()

    await recordLeaderboardPointEvents([
      {
        boardType: "state",
        cadence: mission.cadence,
        periodAt: mission.startsAt,
        occurredAt,
        competitorType: "state",
        competitorKey: stateKey,
        displayName: user.region.state,
        points: mission.rewardPoints,
        sourceType: "mission_completion",
        sourceId: String(mission._id),
        dedupeKey: `mission:${mission._id}:state:${stateKey}`
      }
    ])

    await recordLocationActivityEvents(
      buildLocationActivityEvents({
        occurredAt,
        points: mission.rewardPoints,
        sourceType: "mission_completion",
        sourceId: `${mission._id}:state:${stateKey}`,
        stateKey: stateSource,
        stateLabel: user.region.state
      })
    )

    await SharedMissionProgressModel.updateOne(
      { _id: sharedProgress._id },
      { $set: { rewardAwardedAt: new Date(), completedAt: typedProgress.completedAt ?? new Date() } }
    )
  }
}

async function recomputeIndiaMissionProgress(
  user: Awaited<ReturnType<typeof getCurrentUserRecord>>,
  mission: MissionInstanceDoc
) {
  const indiaEvents = await getRelevantStreamEvents({}, mission.startsAt, mission.endsAt)
  const existingSharedProgress = (await SharedMissionProgressModel.findOne({
    schemaVersion: MISSION_SCHEMA_VERSION,
    missionInstanceId: mission._id,
    scopeType: "india",
    scopeKey: INDIA_SCOPE_KEY
  }).lean()) as unknown as SharedMissionProgressDoc | null
  const indiaUsers = new Set(indiaEvents.map((event) => String(event.userId)))
  let progressValue = 0
  const targetProgress: Record<string, number> = {}
  let contributorCount = 0
  const trackEquivalenceData =
    mission.mechanicType === "track_streams" ? await getTrackEquivalenceData() : undefined
  const missionTrackMatchKeys =
    mission.mechanicType === "track_streams"
      ? buildMissionTrackMatchKeySet(mission.targetConfig.targets, trackEquivalenceData)
      : undefined

  if (mission.mechanicType === "track_streams") {
    const matchingEvents = indiaEvents.filter((event) =>
      missionTrackMatchKeys?.has(event.catalogTrackSpotifyId ?? "")
    )
    const counts = countMatchingTrackStreams(
      matchingEvents,
      mission.targetConfig.targets,
      trackEquivalenceData
    )

    for (const target of mission.targetConfig.targets) {
      if (target.kind !== "track" || !target.trackKey) {
        continue
      }

      const count = counts.get(target.trackKey) ?? 0
      targetProgress[buildTrackTargetProgressKey(target.trackKey)] = count
      progressValue += count
    }

    contributorCount = new Set(matchingEvents.map((event) => String(event.userId))).size
  } else {
    const perUserAlbumCompletion = new Map<string, number>()
    const completedUserIds = new Set<string>()

    for (const userId of indiaUsers) {
      const userEvents = indiaEvents.filter((event) => String(event.userId) === userId)
      const completionMap = computeAlbumCompletionDetails(userEvents, mission.targetConfig.targets)
      let userCompletedCount = 0

      for (const target of mission.targetConfig.targets) {
        if (target.kind !== "album" || !target.albumKey) {
          continue
        }

        const completed = completionMap.get(target.albumKey)?.completed ?? 0
        targetProgress[buildAlbumTargetProgressKey(target.albumKey)] =
          (targetProgress[buildAlbumTargetProgressKey(target.albumKey)] ?? 0) + completed
        userCompletedCount += completed
      }

      perUserAlbumCompletion.set(userId, userCompletedCount)

      if (userCompletedCount > 0) {
        completedUserIds.add(userId)
      }
    }

    progressValue = Array.from(perUserAlbumCompletion.values()).reduce((sum, value) => sum + value, 0)
    contributorCount = completedUserIds.size
  }

  const completedAt =
    progressValue >= mission.goalUnits
      ? existingSharedProgress?.completedAt ?? new Date()
      : undefined

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
        progressValue,
        goalUnits: mission.goalUnits,
        contributorCount,
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

  const userEvents = indiaEvents.filter((event) => String(event.userId) === String(user._id))
  const userAlbumCompletionDetails =
    mission.mechanicType === "album_completions"
      ? computeAlbumCompletionDetails(userEvents, mission.targetConfig.targets)
      : null
  const contributionUnits =
    mission.mechanicType === "track_streams"
      ? userEvents.filter((event) => missionTrackMatchKeys?.has(event.catalogTrackSpotifyId ?? "")).length
      : Array.from(userAlbumCompletionDetails?.values() ?? []).reduce(
          (sum, value) => sum + value.completed,
          0
        )
  const qualifiedAt =
    mission.mechanicType === "track_streams"
      ? getFirstMatchingTrackContributionAt(
          userEvents,
          mission.targetConfig.targets,
          trackEquivalenceData
        )
      : Array.from(userAlbumCompletionDetails?.values() ?? [])
          .map((value) => value.completedAt)
          .filter((value): value is Date => Boolean(value))
          .sort((left, right) => left.getTime() - right.getTime())[0]

  await MissionContributionModel.findOneAndUpdate(
    {
      schemaVersion: MISSION_SCHEMA_VERSION,
      missionInstanceId: mission._id,
      userId: user._id
    },
    {
      $set: {
        contributionUnits,
        stateKey: getStateScopeSource(user.region)
          ? buildStateKey(getStateScopeSource(user.region) as string)
          : undefined,
        qualifiedAt: contributionUnits > 0 ? qualifiedAt ?? new Date() : undefined
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )

  if (completedAt) {
    await awardIndiaMissionContributors(mission, completedAt)
  }
}

export async function recomputeMissionProgressForUser(
  user: Awaited<ReturnType<typeof getCurrentUserRecord>>
) {
  if (!user.region?.state) {
    return
  }

  await ensureCurrentMissionInstances()
  const missions = await getCurrentMissionInstances()

  for (const mission of missions) {
    if (mission.missionKind === "individual_personal") {
      await recomputeIndividualMissionProgress(user, mission)
    } else if (mission.missionKind === "state_shared") {
      await recomputeStateMissionProgress(user, mission)
    } else {
      await recomputeIndiaMissionProgress(user, mission)
    }
  }
}

export async function listMissionCards(): Promise<MissionCard[]> {
  const user = await getCurrentUserRecord()
  return buildMissionCardsForUser(user)
}

export async function listMissionPreviewCards(): Promise<MissionCard[]> {
  const instances = await getCurrentMissionInstancesForRead()
  const [sharedProgressPayload, imagePayload] = await Promise.all([
    getCachedSharedMissionProgressPayload(null),
    getCachedMissionTargetImagePayload()
  ])
  const sharedProgressMap = new Map(
    sharedProgressPayload.map((progress) => {
      const hydratedProgress = deserializeSharedMissionProgress(progress)

      return [`${String(hydratedProgress.missionInstanceId)}:${hydratedProgress.scopeKey}`, hydratedProgress] as const
    })
  )
  const imageMaps = toMissionTargetImageMaps(imagePayload)

  return instances.map((instance) => {
    const indiaProgress = sharedProgressMap.get(`${String(instance._id)}:${INDIA_SCOPE_KEY}`)

    if (instance.missionKind === "individual_personal") {
      const targetProgress = buildTargetViews(instance.targetConfig.targets, {}, imageMaps)
      const focus = summarizeFocus(targetProgress.map((target) => target.title))

      return {
        id: String(instance._id),
        missionCellKey: instance.missionCellKey,
        missionKind: instance.missionKind,
        mechanicType: instance.mechanicType,
        cadence: instance.cadence,
        title: instance.title,
        description: instance.description,
        startsAt: instance.startsAt.toISOString(),
        endsAt: instance.endsAt.toISOString(),
        periodKey: instance.periodKey,
        goalUnits: instance.goalUnits,
        rewardPoints: instance.rewardPoints,
        rewardLabel: `${instance.rewardPoints} points`,
        selectionMode: instance.selectionMode,
        progressScopeType: "user",
        aggregateProgress: 0,
        userContribution: 0,
        completionState: "in_progress",
        focus,
        scopeLabel: "You",
        targets: targetProgress
      } satisfies MissionCard
    }

    if (instance.missionKind === "state_shared") {
      const targetProgress = buildTargetViews(instance.targetConfig.targets, {}, imageMaps)
      const focus = summarizeFocus(targetProgress.map((target) => target.title))

      return {
        id: String(instance._id),
        missionCellKey: instance.missionCellKey,
        missionKind: instance.missionKind,
        mechanicType: instance.mechanicType,
        cadence: instance.cadence,
        title: instance.title,
        description: instance.description,
        startsAt: instance.startsAt.toISOString(),
        endsAt: instance.endsAt.toISOString(),
        periodKey: instance.periodKey,
        goalUnits: instance.goalUnits,
        rewardPoints: instance.rewardPoints,
        rewardLabel: `${instance.rewardPoints} state points`,
        selectionMode: instance.selectionMode,
        progressScopeType: "state",
        aggregateProgress: 0,
        userContribution: 0,
        contributorCount: 0,
        completionState: "locked",
        focus,
        scopeLabel: "Your State",
        targets: targetProgress
      } satisfies MissionCard
    }

    const targetProgress = buildTargetViews(
      instance.targetConfig.targets,
      toTargetProgressMap(indiaProgress?.targetProgress),
      imageMaps
    )
    const focus = summarizeFocus(targetProgress.map((target) => target.title))
    const progressValue = indiaProgress?.progressValue ?? 0

    return {
      id: String(instance._id),
      missionCellKey: instance.missionCellKey,
      missionKind: instance.missionKind,
      mechanicType: instance.mechanicType,
      cadence: instance.cadence,
      title: instance.title,
      description: instance.description,
      startsAt: instance.startsAt.toISOString(),
      endsAt: instance.endsAt.toISOString(),
      periodKey: instance.periodKey,
      goalUnits: instance.goalUnits,
      rewardPoints: instance.rewardPoints,
      rewardLabel: `${instance.rewardPoints} points`,
      selectionMode: instance.selectionMode,
      progressScopeType: "india",
      aggregateProgress: progressValue,
      userContribution: 0,
      contributorCount: indiaProgress?.contributorCount ?? 0,
      completionState:
        progressValue >= instance.goalUnits || Boolean(indiaProgress?.completedAt)
          ? "completed"
          : "in_progress",
      focus,
      scopeLabel: "All India",
      targets: targetProgress
    } satisfies MissionCard
  })
}

function buildAdminMissionCard(
  instance: MissionInstanceDoc,
  sharedProgress?: SharedMissionProgressDoc | null
): MissionCard {
  const targetProgress =
    instance.missionKind === "individual_personal"
      ? {}
      : toTargetProgressMap(sharedProgress?.targetProgress)
  const targets = buildTargetViews(instance.targetConfig.targets, targetProgress)
  const focus = summarizeFocus(targets.map((target) => target.title))

  if (instance.missionKind === "individual_personal") {
    return {
      id: String(instance._id),
      missionCellKey: instance.missionCellKey,
      missionKind: instance.missionKind,
      mechanicType: instance.mechanicType,
      cadence: instance.cadence,
      title: instance.title,
      description: instance.description,
      startsAt: instance.startsAt.toISOString(),
      endsAt: instance.endsAt.toISOString(),
      periodKey: instance.periodKey,
      goalUnits: instance.goalUnits,
      rewardPoints: instance.rewardPoints,
      rewardLabel: `${instance.rewardPoints} points`,
      selectionMode: instance.selectionMode,
      progressScopeType: "user",
      aggregateProgress: 0,
      userContribution: 0,
      completionState: "in_progress",
      focus,
      scopeLabel: "Per user",
      targets
    }
  }

  if (instance.missionKind === "state_shared") {
    const progressValue = sharedProgress?.progressValue ?? 0

    return {
      id: String(instance._id),
      missionCellKey: instance.missionCellKey,
      missionKind: instance.missionKind,
      mechanicType: instance.mechanicType,
      cadence: instance.cadence,
      title: instance.title,
      description: instance.description,
      startsAt: instance.startsAt.toISOString(),
      endsAt: instance.endsAt.toISOString(),
      periodKey: instance.periodKey,
      goalUnits: instance.goalUnits,
      rewardPoints: instance.rewardPoints,
      rewardLabel: `${instance.rewardPoints} state points`,
      selectionMode: instance.selectionMode,
      progressScopeType: "state",
      aggregateProgress: progressValue,
      userContribution: 0,
      contributorCount: sharedProgress?.contributorCount ?? 0,
      completionState:
        progressValue >= instance.goalUnits || Boolean(sharedProgress?.completedAt)
          ? "completed"
          : "in_progress",
      focus,
      scopeLabel: sharedProgress?.scopeLabel ?? "Leading State",
      targets
    }
  }

  const progressValue = sharedProgress?.progressValue ?? 0

  return {
    id: String(instance._id),
    missionCellKey: instance.missionCellKey,
    missionKind: instance.missionKind,
    mechanicType: instance.mechanicType,
    cadence: instance.cadence,
    title: instance.title,
    description: instance.description,
    startsAt: instance.startsAt.toISOString(),
    endsAt: instance.endsAt.toISOString(),
    periodKey: instance.periodKey,
    goalUnits: instance.goalUnits,
    rewardPoints: instance.rewardPoints,
    rewardLabel: `${instance.rewardPoints} points`,
    selectionMode: instance.selectionMode,
    progressScopeType: "india",
    aggregateProgress: progressValue,
    userContribution: 0,
    contributorCount: sharedProgress?.contributorCount ?? 0,
    completionState:
      progressValue >= instance.goalUnits || Boolean(sharedProgress?.completedAt)
        ? "completed"
        : "in_progress",
    focus,
    scopeLabel: "All India",
    targets
  }
}

async function buildNextMissionPlan(
  missionCellKey: MissionCellKey,
  mechanicType: MissionMechanicType,
  trackOptionMap: Map<string, CatalogOption>,
  albumOptionMap: Map<string, CatalogOption>,
  override?: AdminMissionOverrideView | null
): Promise<AdminMissionPlanView | null> {
  const config = getMissionCellConfig(missionCellKey)
  const period = getPlanningPeriodForCadence(config.cadence)
  const selectionMode: "admin" | "random" = override ? "admin" : "random"
  const targets = await buildMissionTargets(
    missionCellKey,
    mechanicType,
    selectionMode,
    override?.targetKeys ?? [],
    period.periodKey
  )

  if (targets.length === 0) {
    return null
  }

  const targetMap = mechanicType === "album_completions" ? albumOptionMap : trackOptionMap
  const previewTargets = targets
    .map((target) => {
      const targetKey = getTargetKey(target)
      return targetKey ? targetMap.get(targetKey) : undefined
    })
    .filter((target): target is CatalogOption => Boolean(target))

  const goalUnits = deriveGoalUnits(
    missionCellKey,
    config.missionKind,
    mechanicType,
    targets,
    override?.goalUnits
  )
  const rewardPoints = override?.rewardPoints ?? config.defaultRewardPointsByMechanic[mechanicType]

  return {
    periodKey: period.periodKey,
    selectionMode,
    mechanicType,
    goalUnits,
    rewardPoints,
    rewardLabel: buildRewardLabel(config.missionKind, rewardPoints),
    focus: summarizeFocus(previewTargets.map((target) => target.label)),
    targets: previewTargets
  }
}

export async function getMissionPageState(): Promise<MissionPageState> {
  await connectToDatabase()

  const session = await getSessionUser()
  const user = await getCurrentUserRecord()
  const [missions, summary, trackerConnection, streamPointValue] = await Promise.all([
    buildMissionCardsForUser(user),
    getCatalogSummary(),
    TrackerConnectionModel.findOne({ userId: user._id })
      .sort({ updatedAt: -1 })
      .lean() as Promise<
      | {
          provider: "lastfm" | "musicat" | "statsfm"
          username: string
          verificationStatus: "pending" | "verified" | "failed"
          lastSuccessfulSyncAt?: Date
        }
      | null
    >,
    getStreamPointValue()
  ])

  let verificationBlockedReason: string | undefined

  if (!session.isAuthenticated) {
    verificationBlockedReason = "Sign in first to connect your music app and join missions."
  } else if (!user.region?.state) {
    verificationBlockedReason = "Add your state so your streams and state missions can count."
  } else if (summary.trackCount === 0 || summary.albumCount === 0) {
    verificationBlockedReason = "Missions are being prepared right now. Please check back soon."
  } else if (!trackerConnection) {
    verificationBlockedReason = "Connect Last.fm, stats.fm, or Musicat to start counting your streams."
  }

  return {
    daily: missions.filter((mission) => mission.cadence === "daily"),
    weekly: missions.filter((mission) => mission.cadence === "weekly"),
    isAuthenticated: session.isAuthenticated,
    trackerConnection: trackerConnection
      ? {
          provider: trackerConnection.provider,
          username: trackerConnection.username,
          verificationStatus: trackerConnection.verificationStatus,
          lastSuccessfulSyncAt: trackerConnection.lastSuccessfulSyncAt?.toISOString()
        }
      : null,
    regionConfirmed: Boolean(user.region?.state),
    state: user.region?.state,
    streamPointValue,
    verificationStatus: verificationBlockedReason ? "blocked" : "ready",
    verificationBlockedReason,
    resetTimezone: "Asia/Kolkata"
  }
}

export async function generateDailyMissionInstances(options: { force?: boolean } = {}) {
  const instances = await ensureCurrentMissionInstances({ cadence: "daily", force: options.force ?? false })

  revalidateCacheTags(
    cacheTags.missions,
    cacheTags.missionInstances,
    cacheTags.missionAssets,
    cacheTags.missionSharedProgress,
    cacheTags.missionAdmin
  )

  return instances
}

export async function generateWeeklyMissionInstances(options: { force?: boolean } = {}) {
  const instances = await ensureCurrentMissionInstances({ cadence: "weekly", force: options.force ?? false })

  revalidateCacheTags(
    cacheTags.missions,
    cacheTags.missionInstances,
    cacheTags.missionAssets,
    cacheTags.missionSharedProgress,
    cacheTags.missionAdmin
  )

  return instances
}

export async function verifyCurrentUserMissions() {
  await connectToDatabase()

  const user = await requireAuthenticatedUserRecord()

  if (!user.region?.state) {
    throw new Error("Confirm your state before verifying missions.")
  }

  const { syncCurrentUserTrackerActivity } = await import("@/modules/streaming/service")
  await syncCurrentUserTrackerActivity()

  return getMissionPageState()
}

export async function getMissionAdminState(): Promise<MissionAdminState> {
  await connectToDatabase()

  await requireAdminUserRecord()
  await ensureCurrentMissionInstances()

  const currentPeriods = getCurrentIndiaPeriods()
  const nextPeriods = getNextIndiaPeriods()
  const [trackOptions, albumOptions, summary, overrides, streamPointValue, leaderboardStatus, latestMission, currentInstances] =
    await Promise.all([
      listTrackOptions(),
      listAlbumOptions(),
      getCatalogSummary(),
      MissionOverrideModel.find({
        schemaVersion: { $in: [2, MISSION_SCHEMA_VERSION] },
        periodKey: { $in: [nextPeriods.daily.periodKey, nextPeriods.weekly.periodKey] }
      }).lean() as unknown as Promise<MissionOverrideDoc[]>,
      getStreamPointValue(),
      getLeaderboardStatusSummary(),
      MissionInstanceModel.findOne({ schemaVersion: MISSION_SCHEMA_VERSION })
        .sort({ updatedAt: -1 })
        .select({ updatedAt: 1 })
        .lean() as unknown as Promise<{ updatedAt?: Date } | null>,
      getCurrentMissionInstancesForRead()
    ])

  const trackOptionMap = new Map(trackOptions.map((option) => [option.key, option] as const))
  const albumOptionMap = new Map(albumOptions.map((option) => [option.key, option] as const))
  const overrideMap = new Map<string, MissionOverrideDoc>()

  for (const override of overrides
    .filter((candidate) => candidate.schemaVersion === 2)
    .sort((left, right) => left.periodKey.localeCompare(right.periodKey))) {
    overrideMap.set(buildMissionSlotKey(override.missionCellKey, override.mechanicType), override)
  }

  for (const override of overrides.filter((candidate) => candidate.schemaVersion === MISSION_SCHEMA_VERSION)) {
    overrideMap.set(buildMissionSlotKey(override.missionCellKey, override.mechanicType), override)
  }

  const stateBreakdownMap = new Map<
    string,
    MissionAdminState["cells"][number]["liveStateBreakdownByMechanic"]["track_streams"]
  >()
  const sharedProgressDocs = (await SharedMissionProgressModel.find({
    schemaVersion: MISSION_SCHEMA_VERSION,
    missionInstanceId: {
      $in: currentInstances
        .filter((instance) => instance.missionKind !== "individual_personal")
        .map((instance) => instance._id)
    }
  }).lean()) as unknown as SharedMissionProgressDoc[]
  const missionMap = new Map<string, MissionCard>()
  const indiaProgressMap = new Map(
    sharedProgressDocs
      .filter((doc) => doc.scopeKey === INDIA_SCOPE_KEY)
      .map((doc) => [String(doc.missionInstanceId), doc] as const)
  )

  for (const instance of currentInstances) {
    const slotKey = buildMissionSlotKey(instance.missionCellKey, instance.mechanicType)

    if (instance.missionKind === "individual_personal") {
      missionMap.set(slotKey, buildAdminMissionCard(instance, null))
      continue
    }

    if (instance.missionKind === "india_shared") {
      missionMap.set(slotKey, buildAdminMissionCard(instance, indiaProgressMap.get(String(instance._id)) ?? null))
      continue
    }

    const docs = sharedProgressDocs
      .filter(
        (doc) =>
          String(doc.missionInstanceId) === String(instance._id) &&
          doc.scopeType === "state"
      )
      .sort((left, right) => {
        if (right.progressValue !== left.progressValue) {
          return right.progressValue - left.progressValue
        }

        return left.scopeLabel.localeCompare(right.scopeLabel)
      })

    stateBreakdownMap.set(
      slotKey,
      docs.slice(0, 8).map((doc) => ({
        stateKey: doc.scopeKey,
        stateLabel: doc.scopeLabel,
        progressUnits: doc.progressValue,
        goalUnits: doc.goalUnits,
        completedAt: doc.completedAt?.toISOString()
      }))
    )

    missionMap.set(slotKey, buildAdminMissionCard(instance, docs[0] ?? null))
  }

  return {
    cells: await Promise.all(missionCellOrder.map(async (missionCellKey) => {
      const config = getMissionCellConfig(missionCellKey)
      const nextMissionsByMechanic = await Promise.all(
        missionMechanicOrder.map(async (mechanicType) => {
          const override = overrideMap.get(buildMissionSlotKey(missionCellKey, mechanicType))

          return [
            mechanicType,
            await buildNextMissionPlan(
              missionCellKey,
              mechanicType,
              trackOptionMap,
              albumOptionMap,
              override
                ? {
                    mechanicType: override.mechanicType,
                    targetKeys: override.targetKeys,
                    goalUnits: override.goalUnits,
                    rewardPoints: override.rewardPoints
                  }
                : null
            )
          ] as const
        })
      )
      const nextMissions = Object.fromEntries(nextMissionsByMechanic) as AdminMissionCellView["nextMissions"]
      const nextOverrides = buildMissionMechanicMap((mechanicType) => {
        const override = overrideMap.get(buildMissionSlotKey(missionCellKey, mechanicType))

        return override
          ? {
              mechanicType: override.mechanicType,
              targetKeys: override.targetKeys,
              goalUnits: override.goalUnits,
              rewardPoints: override.rewardPoints
            }
          : null
      })
      const liveMissions = buildMissionMechanicMap(
        (mechanicType) => missionMap.get(buildMissionSlotKey(missionCellKey, mechanicType)) ?? null
      )

      return {
        missionCellKey,
        cadence: config.cadence,
        missionKind: config.missionKind,
        label: config.label,
        description: config.description,
        defaultRewardPoints: config.defaultRewardPoints,
        defaultRewardPointsByMechanic: config.defaultRewardPointsByMechanic,
        defaultMechanicType: config.defaultMechanicType,
        defaultGoalUnitsByMechanic: config.defaultGoalUnitsByMechanic,
        trackOptions,
        albumOptions,
        liveMissions,
        nextPeriodKey: nextPeriods[config.cadence].periodKey,
        nextMissions,
        nextOverrides,
        liveStateBreakdownByMechanic: buildMissionMechanicMap(
          (mechanicType) => stateBreakdownMap.get(buildMissionSlotKey(missionCellKey, mechanicType)) ?? []
        )
      }
    })),
    catalogSummary: summary,
    currentPeriodKeys: {
      daily: currentPeriods.daily.periodKey,
      weekly: currentPeriods.weekly.periodKey
    },
    nextPeriodKeys: {
      daily: nextPeriods.daily.periodKey,
      weekly: nextPeriods.weekly.periodKey
    },
    streamPointValue,
    lastTrackerSyncAt: leaderboardStatus.lastTrackerSyncAt,
    lastMissionGenerationAt: latestMission?.updatedAt?.toISOString(),
    lastLeaderboardMaterializedAt: leaderboardStatus.lastLeaderboardMaterializedAt
  }
}

export async function upsertMissionOverrideForNextPeriod(input: {
  missionCellKey: MissionCellKey
  mechanicType: MissionMechanicType
  targetKeys: string[]
  goalUnits: number
  rewardPoints: number
}) {
  await connectToDatabase()

  const admin = await requireAdminUserRecord()
  const config = getMissionCellConfig(input.missionCellKey)
  const targetKeys = Array.from(new Set(input.targetKeys.map((targetKey) => targetKey.trim()).filter(Boolean)))

  if (targetKeys.length === 0) {
    throw new Error("Select at least one mission target.")
  }

  if (input.goalUnits <= 0 || input.rewardPoints <= 0) {
    throw new Error("Goal units and reward points must both be positive.")
  }

  if (input.mechanicType === "track_streams") {
    const tracks = (await CatalogTrackModel.find({
      spotifyId: { $in: targetKeys },
      isBTSFamily: true
    }).lean()) as unknown as CatalogTrackDoc[]

    if (tracks.length !== targetKeys.length) {
      throw new Error("One or more selected tracks could not be found in the imported catalog.")
    }

    const equivalenceData = buildTrackEquivalenceData(tracks)
    const seenGroups = new Set<string>()

    for (const targetKey of targetKeys) {
      const groupKey = equivalenceData.equivalenceGroupByTrackKey.get(targetKey) ?? targetKey

      if (seenGroups.has(groupKey)) {
        throw new Error(
          "Track-stream missions can include only one album-release variant of the same song."
        )
      }

      seenGroups.add(groupKey)
    }
  } else {
    const count = await CatalogAlbumModel.countDocuments({
      spotifyId: { $in: targetKeys },
      isBTSFamily: true
    })

    if (count !== targetKeys.length) {
      throw new Error("One or more selected albums could not be found in the imported catalog.")
    }
  }

  if (config.missionKind === "individual_personal") {
    const maxGoalUnits =
      input.mechanicType === "track_streams"
        ? targetKeys.length * config.perItemTargetCount
        : targetKeys.length

    if (input.goalUnits > maxGoalUnits) {
      throw new Error(
        `This personal mission can reach at most ${maxGoalUnits} goal units with the selected targets.`
      )
    }
  }

  const period = getPlanningPeriodForCadence(config.cadence)

  await MissionOverrideModel.findOneAndUpdate(
    {
      schemaVersion: MISSION_SCHEMA_VERSION,
      missionCellKey: input.missionCellKey,
      mechanicType: input.mechanicType,
      periodKey: period.periodKey
    },
    {
      $set: {
        schemaVersion: MISSION_SCHEMA_VERSION,
        slotKey: buildMissionSlotKey(input.missionCellKey, input.mechanicType),
        cadence: config.cadence,
        mechanicType: input.mechanicType,
        targetKeys,
        goalUnits: input.goalUnits,
        rewardPoints: input.rewardPoints,
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

  await clearLegacyOverrideIfPresent(input.missionCellKey, input.mechanicType, period.periodKey)

  revalidateCacheTags(
    cacheTags.missions,
    cacheTags.missionInstances,
    cacheTags.missionAssets,
    cacheTags.missionSharedProgress,
    cacheTags.missionAdmin
  )

  return getMissionAdminState()
}

export async function clearMissionOverrideForNextPeriod(
  missionCellKey: MissionCellKey,
  mechanicType: MissionMechanicType
) {
  await connectToDatabase()

  await requireAdminUserRecord()
  const config = getMissionCellConfig(missionCellKey)
  const period = getPlanningPeriodForCadence(config.cadence)

  await MissionOverrideModel.deleteOne({
    schemaVersion: MISSION_SCHEMA_VERSION,
    missionCellKey,
    mechanicType,
    periodKey: period.periodKey
  })
  await clearLegacyOverrideIfPresent(missionCellKey, mechanicType, period.periodKey)

  revalidateCacheTags(
    cacheTags.missions,
    cacheTags.missionInstances,
    cacheTags.missionAssets,
    cacheTags.missionSharedProgress,
    cacheTags.missionAdmin
  )

  return getMissionAdminState()
}
