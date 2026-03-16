import { Types } from "mongoose"
import { requireAuthenticatedUserRecord } from "@/platform/auth/current-user"
import { UserModel } from "@/platform/db/models/user"
import { CatalogTrackModel } from "@/platform/db/models/catalog"
import { StreamEventModel } from "@/platform/db/models/streaming"
import { TrackerConnectionModel } from "@/platform/db/models/tracker"
import { connectToDatabase } from "@/platform/db/mongoose"
import { buildStateKey } from "@/platform/integrations/geo/state-scopes"
import { getTrackerAdapter } from "@/platform/integrations/trackers"
import { getIndiaPeriod, type MissionCadence } from "@/platform/time/india-periods"
import {
  buildLocationActivityEvents,
  materializeLocationActivity,
  recordLocationActivityEvents
} from "@/modules/activity-map/service"
import { materializeLeaderboards, recordLeaderboardPointEvents } from "@/modules/leaderboards/service"
import { getEffectivePlaceFromRegion, getStateScopeSource } from "@/modules/locations/service"
import { recomputeMissionProgressForUser, ensureCurrentMissionInstances } from "@/modules/missions/service"
import {
  normalizeAlbumName,
  namesRoughlyMatch,
  normalizeArtistName,
  normalizeTrackName
} from "@/modules/streaming/normalization"
import type { StreamingSyncSummary } from "@/modules/streaming/types"

type CatalogTrackMatcher = {
  _id: Types.ObjectId
  spotifyId: string
  artist: string
  album: string
  normalizedTrackName: string
  normalizedArtistName: string
  normalizedAlbumName: string
}

type TrackerConnectionDoc = {
  _id: Types.ObjectId
  userId: Types.ObjectId
  provider: "lastfm"
  username: string
  verificationStatus: "pending" | "verified" | "failed"
  lastCheckpoint?: string
}

type UserDoc = {
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

let cachedTrackMatchers: CatalogTrackMatcher[] | null = null

async function loadBtsTrackMatchers() {
  if (cachedTrackMatchers) {
    return cachedTrackMatchers
  }

  const tracks = await CatalogTrackModel.find({ isBTSFamily: true })
    .select({ spotifyId: 1, name: 1, artist: 1, album: 1 })
    .lean()

  cachedTrackMatchers = tracks.map((track) => ({
    _id: track._id as Types.ObjectId,
    spotifyId: track.spotifyId,
    artist: track.artist,
    album: track.album,
    normalizedTrackName: normalizeTrackName(track.name),
    normalizedArtistName: normalizeArtistName(track.artist),
    normalizedAlbumName: normalizeAlbumName(track.album)
  }))

  return cachedTrackMatchers
}

async function getUserById(userId: Types.ObjectId) {
  return (await UserModel.findById(userId)
    .select({ displayName: 1, username: 1, region: 1 })
    .lean()) as UserDoc | null
}

function matchCatalogTrack(
  trackName: string,
  artistName: string,
  albumName: string | undefined,
  matchers: CatalogTrackMatcher[]
) {
  const normalizedName = normalizeTrackName(trackName)
  const normalizedArtist = normalizeArtistName(artistName)
  const normalizedAlbum = albumName ? normalizeAlbumName(albumName) : ""
  const candidates = matchers.filter((matcher) => matcher.normalizedTrackName === normalizedName)
  const exactArtistMatches = candidates.filter(
    (candidate) => candidate.normalizedArtistName === normalizedArtist
  )
  const artistMatches =
    exactArtistMatches.length > 0
      ? exactArtistMatches
      : candidates.filter((candidate) =>
          namesRoughlyMatch(candidate.normalizedArtistName, normalizedArtist)
        )

  if (artistMatches.length === 0) {
    return null
  }

  if (normalizedAlbum) {
    const albumMatches = artistMatches.filter(
      (candidate) => candidate.normalizedAlbumName === normalizedAlbum
    )

    if (albumMatches.length > 0) {
      return albumMatches[0]
    }
  }

  return artistMatches[0] ?? null
}

function buildStreamPointEvents(input: {
  user: UserDoc
  connection: TrackerConnectionDoc
  playedAt: Date
  sourceId: string
}) {
  const stateSource = getStateScopeSource(input.user.region)

  if (!stateSource || !input.user.region?.state) {
    return []
  }

  const stateKey = buildStateKey(stateSource)
  const daily = getIndiaPeriod("daily", input.playedAt)
  const weekly = getIndiaPeriod("weekly", input.playedAt)

  return [
    {
      boardType: "individual" as const,
      cadence: "daily" as MissionCadence,
      periodAt: input.playedAt,
      occurredAt: input.playedAt,
      competitorType: "user" as const,
      competitorKey: String(input.user._id),
      displayName: input.user.displayName,
      points: 1,
      sourceType: "verified_stream" as const,
      sourceId: input.sourceId,
      dedupeKey: `stream:${input.sourceId}:individual:${daily.periodKey}`,
      userId: input.user._id,
      stateKey
    },
    {
      boardType: "individual" as const,
      cadence: "weekly" as MissionCadence,
      periodAt: input.playedAt,
      occurredAt: input.playedAt,
      competitorType: "user" as const,
      competitorKey: String(input.user._id),
      displayName: input.user.displayName,
      points: 1,
      sourceType: "verified_stream" as const,
      sourceId: input.sourceId,
      dedupeKey: `stream:${input.sourceId}:individual:${weekly.periodKey}`,
      userId: input.user._id,
      stateKey
    },
    {
      boardType: "state" as const,
      cadence: "daily" as MissionCadence,
      periodAt: input.playedAt,
      occurredAt: input.playedAt,
      competitorType: "state" as const,
      competitorKey: stateKey,
      displayName: input.user.region.state,
      points: 1,
      sourceType: "verified_stream" as const,
      sourceId: input.sourceId,
      dedupeKey: `stream:${input.sourceId}:state:${daily.periodKey}`,
      userId: input.user._id,
      stateKey
    },
    {
      boardType: "state" as const,
      cadence: "weekly" as MissionCadence,
      periodAt: input.playedAt,
      occurredAt: input.playedAt,
      competitorType: "state" as const,
      competitorKey: stateKey,
      displayName: input.user.region.state,
      points: 1,
      sourceType: "verified_stream" as const,
      sourceId: input.sourceId,
      dedupeKey: `stream:${input.sourceId}:state:${weekly.periodKey}`,
      userId: input.user._id,
      stateKey
    }
  ]
}

async function syncTrackerConnectionActivity(
  connection: TrackerConnectionDoc,
  options: { materializeAfter?: boolean } = {}
) {
  const adapter = getTrackerAdapter(connection.provider)

  if (!adapter) {
    throw new Error(`${connection.provider} syncing is not available.`)
  }

  const user = await getUserById(connection.userId)

  if (!user) {
    return { syncedEvents: 0, scoredEvents: 0, provider: connection.provider, checkpoint: null }
  }

  const trackerResult = await adapter.fetchSince({
    username: connection.username,
    checkpoint: connection.lastCheckpoint
  })
  const matchers = await loadBtsTrackMatchers()
  const pointEvents: Parameters<typeof recordLeaderboardPointEvents>[0] = []
  const locationActivityEvents: ReturnType<typeof buildLocationActivityEvents> = []
  let syncedEvents = 0
  let scoredEvents = 0

  for (const event of trackerResult.events) {
    const playedAt = new Date(event.playedAt)
    const matchedTrack = matchCatalogTrack(
      event.trackName,
      event.artistName,
      event.albumName,
      matchers
    )
    const stateSource = getStateScopeSource(user.region)
    const stateKey = stateSource ? buildStateKey(stateSource) : undefined
    const effectivePlace = getEffectivePlaceFromRegion(user.region)

    const result = await StreamEventModel.updateOne(
      {
        provider: connection.provider,
        providerUserKey: event.providerUserKey,
        providerEventKey: event.providerEventKey
      },
      {
        $setOnInsert: {
          userId: user._id,
          provider: connection.provider,
          providerUserKey: event.providerUserKey,
          providerEventKey: event.providerEventKey,
          playedAt,
          artistKey: event.artistKey,
          trackKey: event.trackKey,
          albumKey: event.albumKey,
          normalizedTrackKey: normalizeTrackName(event.trackName),
          normalizedArtistKey: normalizeArtistName(event.artistName),
          catalogTrackId: matchedTrack?._id,
          catalogTrackSpotifyId: matchedTrack?.spotifyId,
          isBTSFamily: Boolean(matchedTrack),
          stateKey,
          stateLabel: user.region?.state,
          placeKey: effectivePlace?.placeKey,
          placeLabel: effectivePlace?.placeLabel,
          rawRef: event.rawRef
        }
      },
      {
        upsert: true
      }
    )

    if (result.upsertedCount > 0) {
      syncedEvents += 1
    }

    if (!matchedTrack) {
      continue
    }

    pointEvents.push(
      ...buildStreamPointEvents({
        user,
        connection,
        playedAt,
        sourceId: `${connection.provider}:${event.providerUserKey}:${event.providerEventKey}`
      })
    )

    if (stateSource && user.region?.state) {
      locationActivityEvents.push(
        ...buildLocationActivityEvents({
          occurredAt: playedAt,
          points: 1,
          sourceType: "verified_stream",
          sourceId: `${connection.provider}:${event.providerUserKey}:${event.providerEventKey}`,
          userId: user._id,
          stateKey: stateSource,
          stateLabel: user.region.state,
          placeKey: effectivePlace?.placeKey,
          placeLabel: effectivePlace?.placeLabel
        })
      )
    }
  }

  if (pointEvents.length > 0) {
    const pointResult = await recordLeaderboardPointEvents(pointEvents)
    scoredEvents += Math.floor(pointResult.inserted / 4)
  }

  if (locationActivityEvents.length > 0) {
    await recordLocationActivityEvents(locationActivityEvents)
  }

  await TrackerConnectionModel.updateOne(
    { _id: connection._id },
    {
      $set: {
        lastCheckpoint: trackerResult.nextCheckpoint ?? connection.lastCheckpoint,
        lastSyncAt: new Date(),
        lastSuccessfulSyncAt: new Date()
      }
    }
  )

  await ensureCurrentMissionInstances()
  await recomputeMissionProgressForUser(user as Awaited<ReturnType<typeof requireAuthenticatedUserRecord>>)

  if (options.materializeAfter !== false) {
    await materializeLeaderboards()
    await materializeLocationActivity()
  }

  return {
    syncedEvents,
    scoredEvents,
    provider: connection.provider,
    checkpoint: trackerResult.nextCheckpoint ?? connection.lastCheckpoint ?? null
  } satisfies StreamingSyncSummary
}

export async function syncVerifiedTrackerConnections() {
  await connectToDatabase()

  const connections = (await TrackerConnectionModel.find({
    provider: "lastfm",
    verificationStatus: "verified"
  }).lean()) as unknown as TrackerConnectionDoc[]

  let syncedEvents = 0
  let scoredEvents = 0
  let failedUsers = 0

  for (const connection of connections) {
    try {
      const summary = await syncTrackerConnectionActivity(connection, { materializeAfter: false })
      syncedEvents += summary.syncedEvents
      scoredEvents += summary.scoredEvents
    } catch (error) {
      failedUsers += 1
      console.error("tracker sync failed", {
        connectionId: String(connection._id),
        provider: connection.provider,
        error
      })
    }
  }

  await materializeLeaderboards()
  await materializeLocationActivity()

  return {
    syncedUsers: connections.length,
    syncedEvents,
    scoredEvents,
    failedUsers
  }
}

export async function syncCurrentUserTrackerActivity() {
  await connectToDatabase()

  const user = await requireAuthenticatedUserRecord()
  const connection = (await TrackerConnectionModel.findOne({
    userId: user._id,
    provider: "lastfm",
    verificationStatus: "verified"
  }).lean()) as TrackerConnectionDoc | null

  if (!connection) {
    throw new Error("Connect a verified Last.fm username before syncing streaming activity.")
  }

  return syncTrackerConnectionActivity(connection)
}

export async function syncStreamingActivity(provider: "lastfm" | "musicat" | "statsfm", username: string) {
  const adapter = getTrackerAdapter(provider)

  if (!adapter) {
    throw new Error(`${provider} syncing is not available yet.`)
  }

  const result = await adapter.fetchSince({ username })

  return {
    syncedEvents: result.events.length,
    scoredEvents: 0,
    provider,
    checkpoint: result.nextCheckpoint ?? null
  } satisfies StreamingSyncSummary
}
