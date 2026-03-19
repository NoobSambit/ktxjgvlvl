#!/usr/bin/env node

import { readFile } from "node:fs/promises"
import path from "node:path"
import mongoose from "mongoose"

function parseEnvFile(source) {
  return source.split(/\r?\n/).reduce((env, rawLine) => {
    const line = rawLine.trim()

    if (!line || line.startsWith("#")) {
      return env
    }

    const separatorIndex = line.indexOf("=")

    if (separatorIndex === -1) {
      return env
    }

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
    return env
  }, {})
}

function createResultTracker() {
  const passes = []
  const warnings = []
  const failures = []

  return {
    pass(message) {
      passes.push(message)
      console.log(`PASS ${message}`)
    },
    warn(message) {
      warnings.push(message)
      console.log(`WARN ${message}`)
    },
    fail(message) {
      failures.push(message)
      console.log(`FAIL ${message}`)
    },
    summary() {
      console.log("")
      console.log("Summary")
      console.log(`  Passed: ${passes.length}`)
      console.log(`  Warnings: ${warnings.length}`)
      console.log(`  Failed: ${failures.length}`)
      return { passes, warnings, failures }
    }
  }
}

function normalizeTargetProgress(raw) {
  if (!raw) {
    return {}
  }

  if (raw instanceof Map) {
    return Object.fromEntries(
      Array.from(raw.entries())
        .map(([key, value]) => [String(key), Number(value)])
        .sort(([left], [right]) => left.localeCompare(right))
    )
  }

  return Object.fromEntries(
    Object.entries(raw)
      .map(([key, value]) => [key, Number(value)])
      .sort(([left], [right]) => left.localeCompare(right))
  )
}

function buildTrackVariantBaseKey(track, normalizeTrackName, normalizeArtistName) {
  return `${normalizeTrackName(track.name)}::${normalizeArtistName(track.artist)}`
}

function buildTrackEquivalenceData(
  tracks,
  normalizeTrackName,
  normalizeArtistName,
  areTrackDurationsEquivalent
) {
  const equivalentTrackKeysByTrackKey = new Map()
  const equivalenceGroupByTrackKey = new Map()
  const baseGroups = new Map()

  for (const track of tracks) {
    const baseKey = buildTrackVariantBaseKey(track, normalizeTrackName, normalizeArtistName)
    const existing = baseGroups.get(baseKey)

    if (existing) {
      existing.push(track)
      continue
    }

    baseGroups.set(baseKey, [track])
  }

  for (const [baseKey, groupTracks] of baseGroups.entries()) {
    const clusters = []

    for (const track of [...groupTracks].sort((left, right) => left.duration - right.duration)) {
      const cluster = clusters.find((candidate) =>
        areTrackDurationsEquivalent(candidate.representativeDuration, track.duration, 2_000)
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

function getTrackMissionMatchKeys(target, equivalenceData) {
  if (target.kind !== "track" || !target.trackKey) {
    return []
  }

  return Array.isArray(target.trackKeys) && target.trackKeys.length > 0
    ? target.trackKeys
    : equivalenceData?.equivalentTrackKeysByTrackKey.get(target.trackKey) ?? [target.trackKey]
}

function buildTrackTargetProgressKey(trackKey) {
  return `track:${trackKey}`
}

function buildAlbumTargetProgressKey(albumKey) {
  return `album:${albumKey}`
}

function countMatchingTrackStreams(events, targets, equivalenceData) {
  const counts = new Map()

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

function getFirstMatchingTrackContributionAt(events, targets, equivalenceData) {
  const targetTrackKeys = new Set(
    targets.flatMap((target) => getTrackMissionMatchKeys(target, equivalenceData))
  )
  return (
    events.find((event) => event.catalogTrackSpotifyId && targetTrackKeys.has(event.catalogTrackSpotifyId))
      ?.playedAt ?? undefined
  )
}

function computeAlbumCompletionDetails(events, targets) {
  const firstTrackPlayMap = new Map()

  for (const event of events) {
    if (!event.catalogTrackSpotifyId || firstTrackPlayMap.has(event.catalogTrackSpotifyId)) {
      continue
    }

    firstTrackPlayMap.set(event.catalogTrackSpotifyId, event.playedAt)
  }

  const completionMap = new Map()

  for (const target of targets) {
    if (target.kind !== "album" || !target.albumKey) {
      continue
    }

    const completionTimes = (target.trackKeys ?? [])
      .map((trackKey) => firstTrackPlayMap.get(trackKey))
      .filter(Boolean)

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

function computePersonalProgress(events, mission, equivalenceData) {
  const targetProgress = {}
  let progressValue = 0

  if (mission.mechanicType === "track_streams") {
    const counts = countMatchingTrackStreams(events, mission.targetConfig.targets, equivalenceData)

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

  return {
    targetProgress,
    progressValue: Math.min(progressValue, mission.goalUnits),
    completed: progressValue >= mission.goalUnits
  }
}

function computeSharedProgress(events, mission, scopeType, equivalenceData) {
  const targetProgress = {}
  let progressValue = 0
  let contributorCount = 0

  if (mission.mechanicType === "track_streams") {
    const missionTrackMatchKeys = new Set(
      mission.targetConfig.targets.flatMap((target) =>
        getTrackMissionMatchKeys(target, equivalenceData)
      )
    )
    const matchingEvents = events.filter(
      (event) => event.catalogTrackSpotifyId && missionTrackMatchKeys.has(event.catalogTrackSpotifyId)
    )
    const counts = countMatchingTrackStreams(
      matchingEvents,
      mission.targetConfig.targets,
      equivalenceData
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
    const groupedEvents = new Map()

    for (const event of events) {
      const userId = String(event.userId)
      const list = groupedEvents.get(userId) ?? []
      list.push(event)
      groupedEvents.set(userId, list)
    }

    const completedUserIds = new Set()

    for (const [userId, userEvents] of groupedEvents.entries()) {
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

      progressValue += userCompletedCount

      if (userCompletedCount > 0) {
        completedUserIds.add(userId)
      }
    }

    contributorCount = completedUserIds.size
  }

  return {
    scopeType,
    targetProgress,
    progressValue,
    contributorCount,
    completed: progressValue >= mission.goalUnits
  }
}

function computeContribution(events, mission, equivalenceData) {
  if (mission.mechanicType === "track_streams") {
    const missionTrackMatchKeys = new Set(
      mission.targetConfig.targets.flatMap((target) =>
        getTrackMissionMatchKeys(target, equivalenceData)
      )
    )
    const contributionUnits = events.filter(
      (event) => event.catalogTrackSpotifyId && missionTrackMatchKeys.has(event.catalogTrackSpotifyId)
    ).length

    return {
      contributionUnits,
      qualifiedAt:
        contributionUnits > 0
          ? getFirstMatchingTrackContributionAt(
              events,
              mission.targetConfig.targets,
              equivalenceData
            )
          : undefined
    }
  }

  const completionMap = computeAlbumCompletionDetails(events, mission.targetConfig.targets)
  const completedEntries = Array.from(completionMap.values()).filter((value) => value.completed > 0)

  return {
    contributionUnits: completedEntries.reduce((sum, value) => sum + value.completed, 0),
    qualifiedAt: completedEntries
      .map((value) => value.completedAt)
      .filter(Boolean)
      .sort((left, right) => left.getTime() - right.getTime())[0]
  }
}

function rankEntriesFromEvents(events) {
  const aggregateMap = new Map()

  for (const event of events) {
    const occurredAt = event.occurredAt ?? event.createdAt
    const current = aggregateMap.get(event.competitorKey)

    if (current) {
      current.score += event.points
      current.displayName = event.displayName
      current.userId = event.userId ?? current.userId
      current.stateKey = event.stateKey ?? current.stateKey
      current.lastQualifiedAt =
        current.lastQualifiedAt && current.lastQualifiedAt > occurredAt
          ? current.lastQualifiedAt
          : occurredAt
      continue
    }

    aggregateMap.set(event.competitorKey, {
      competitorType: event.competitorType,
      competitorKey: event.competitorKey,
      userId: event.userId,
      stateKey: event.stateKey,
      displayName: event.displayName,
      score: event.points,
      lastQualifiedAt: occurredAt
    })
  }

  return Array.from(aggregateMap.values())
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      const leftTime = left.lastQualifiedAt?.getTime() ?? 0
      const rightTime = right.lastQualifiedAt?.getTime() ?? 0

      if (leftTime !== rightTime) {
        return leftTime - rightTime
      }

      return left.displayName.localeCompare(right.displayName)
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))
}

async function getArmyBattlesEnv() {
  const envPath =
    process.env.ARMYBATTLES_ENV_PATH ??
    path.resolve(process.cwd(), "..", "ARMYBATTLES", ".env.local")
  const contents = await readFile(envPath, "utf8")
  return parseEnvFile(contents)
}

async function main() {
  const tracker = createResultTracker()
  const [
    { connectToDatabase },
    { generateDailyMissionInstances, generateWeeklyMissionInstances },
    { syncVerifiedTrackerConnections },
    { getIndiaPeriod },
    { CatalogTrackModel, CatalogAlbumModel },
    {
      TrackerConnectionModel
    },
    { StreamEventModel },
    {
      MissionInstanceModel,
      SharedMissionProgressModel,
      UserMissionProgressModel,
      MissionContributionModel
    },
    {
      LeaderboardBoardModel,
      LeaderboardEntryModel,
      LeaderboardPointEventModel,
      LeaderboardRankSnapshotModel
    },
    { UserModel },
    { LastFmClient },
    {
      normalizeAlbumName,
      normalizeArtistName,
      normalizeTrackName,
      areTrackDurationsEquivalent,
      namesRoughlyMatch
    }
  ] = await Promise.all([
    import("../src/platform/db/mongoose.ts"),
    import("../src/modules/missions/service.ts"),
    import("../src/modules/streaming/service.ts"),
    import("../src/platform/time/india-periods.ts"),
    import("../src/platform/db/models/catalog.ts"),
    import("../src/platform/db/models/tracker.ts"),
    import("../src/platform/db/models/streaming.ts"),
    import("../src/platform/db/models/missions.ts"),
    import("../src/platform/db/models/leaderboards.ts"),
    import("../src/platform/db/models/user.ts"),
    import("../src/platform/integrations/trackers/lastfm-client.ts"),
    import("../src/modules/streaming/normalization.ts")
  ])

  const armyEnv = await getArmyBattlesEnv()

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be loaded before running the verification script.")
  }

  if (!process.env.LASTFM_API_KEY) {
    throw new Error("LASTFM_API_KEY must be loaded before running the verification script.")
  }

  if (!armyEnv.MONGO_URI) {
    throw new Error("ARMYBATTLES .env.local is missing MONGO_URI.")
  }

  await connectToDatabase()
  await generateDailyMissionInstances()
  await generateWeeklyMissionInstances()

  const currentPeriods = {
    daily: getIndiaPeriod("daily"),
    weekly: getIndiaPeriod("weekly")
  }
  const currentPeriodKeys = [currentPeriods.daily.periodKey, currentPeriods.weekly.periodKey]

  const countSnapshot = async () => ({
    streamEvents: await StreamEventModel.countDocuments(),
    pointEvents: await LeaderboardPointEventModel.countDocuments(),
    trackerConnections: await TrackerConnectionModel.countDocuments(),
    verifiedConnections: await TrackerConnectionModel.countDocuments({
      provider: "lastfm",
      verificationStatus: "verified"
    })
  })

  const findCurrentMissions = async () =>
    MissionInstanceModel.find({
      schemaVersion: 3,
      isActive: true,
      periodKey: { $in: currentPeriodKeys }
    })
      .sort({ startsAt: 1, missionCellKey: 1 })
      .lean()

  const beforeCounts = await countSnapshot()
  const currentMissionsBeforeSync = await findCurrentMissions()

  if (currentMissionsBeforeSync.length === 12) {
    tracker.pass(`current mission generation is healthy with 12 live missions (${currentPeriodKeys.join(", ")})`)
  } else {
    tracker.fail(`expected 12 live missions for the current periods, found ${currentMissionsBeforeSync.length}`)
  }

  const byCadence = {
    daily: currentMissionsBeforeSync.filter((mission) => mission.periodKey === currentPeriods.daily.periodKey),
    weekly: currentMissionsBeforeSync.filter((mission) => mission.periodKey === currentPeriods.weekly.periodKey)
  }

  if (byCadence.daily.length === 6 && byCadence.weekly.length === 6) {
    tracker.pass("daily and weekly mission generation both expose the expected 6 live missions")
  } else {
    tracker.fail(
      `expected 6 daily and 6 weekly live missions, found ${byCadence.daily.length} daily and ${byCadence.weekly.length} weekly`
    )
  }

  const [
    catalogTracks,
    catalogAlbumCount,
    verifiedConnections,
    verifiedConnectionUsers
  ] =
    await Promise.all([
      CatalogTrackModel.find({ isBTSFamily: true })
        .select({ spotifyId: 1, name: 1, artist: 1, album: 1, duration: 1 })
        .lean(),
      CatalogAlbumModel.countDocuments({ isBTSFamily: true }),
      TrackerConnectionModel.find({
        provider: "lastfm",
        verificationStatus: "verified"
      }).lean(),
      TrackerConnectionModel.aggregate([
        {
          $match: {
            provider: "lastfm",
            verificationStatus: "verified"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        { $unwind: "$user" },
        {
          $project: {
            username: 1,
            userId: 1,
            state: "$user.region.state"
          }
        }
      ])
    ])
  const catalogTrackCount = catalogTracks.length
  const trackEquivalenceData = buildTrackEquivalenceData(
    catalogTracks,
    normalizeTrackName,
    normalizeArtistName,
    areTrackDurationsEquivalent
  )

  if (catalogTrackCount > 0 && catalogAlbumCount > 0) {
    tracker.pass(`catalog is populated with ${catalogTrackCount} BTS-family tracks and ${catalogAlbumCount} albums`)
  } else {
    tracker.fail(`catalog is not ready for verification (tracks=${catalogTrackCount}, albums=${catalogAlbumCount})`)
  }

  if (beforeCounts.verifiedConnections > 0) {
    tracker.pass(`IndiaForBTS has ${beforeCounts.verifiedConnections} verified Last.fm connection(s) for live sync testing`)
  } else {
    tracker.fail("IndiaForBTS has no verified Last.fm connections to exercise the live sync path")
  }

  const missingStateConnections = verifiedConnectionUsers.filter((entry) => !entry.state)

  if (missingStateConnections.length === 0) {
    tracker.pass("all verified IndiaForBTS tracker connections belong to users with a confirmed state")
  } else {
    tracker.fail(
      `${missingStateConnections.length} verified tracker connection(s) have no confirmed state, so mission scoring will be blocked`
    )
  }

  console.log("STEP running first live sync")
  const firstSync = await syncVerifiedTrackerConnections()
  const afterFirstSyncCounts = await countSnapshot()

  if (afterFirstSyncCounts.streamEvents - beforeCounts.streamEvents === firstSync.syncedEvents) {
    tracker.pass(`first live sync imported ${firstSync.syncedEvents} unique scrobble event(s) with no stream-event count drift`)
  } else {
    tracker.fail(
      `stream-event delta mismatch after first sync: expected ${firstSync.syncedEvents}, observed ${afterFirstSyncCounts.streamEvents - beforeCounts.streamEvents}`
    )
  }

  const firstSyncPointDelta = afterFirstSyncCounts.pointEvents - beforeCounts.pointEvents

  if (firstSyncPointDelta >= firstSync.scoredEvents * 4) {
    tracker.pass(
      `first live sync emitted ${firstSyncPointDelta} leaderboard point event(s) for ${firstSync.scoredEvents} scored BTS stream batch(es)`
    )
  } else {
    tracker.fail(
      `leaderboard point-event delta after first sync is too small: expected at least ${firstSync.scoredEvents * 4}, observed ${firstSyncPointDelta}`
    )
  }

  if (firstSync.failedUsers === 0) {
    tracker.pass("first live sync completed without per-user failures")
  } else {
    tracker.fail(`first live sync reported ${firstSync.failedUsers} failing tracker connection(s)`)
  }

  console.log("STEP running second live sync")
  const secondSync = await syncVerifiedTrackerConnections()
  const afterSecondSyncCounts = await countSnapshot()
  const secondSyncPointDelta = afterSecondSyncCounts.pointEvents - afterFirstSyncCounts.pointEvents

  if (afterSecondSyncCounts.streamEvents - afterFirstSyncCounts.streamEvents === secondSync.syncedEvents) {
    tracker.pass(`second live sync respected stream-event accounting with ${secondSync.syncedEvents} additional unique scrobble event(s)`)
  } else {
    tracker.fail(
      `stream-event delta mismatch after second sync: expected ${secondSync.syncedEvents}, observed ${afterSecondSyncCounts.streamEvents - afterFirstSyncCounts.streamEvents}`
    )
  }

  if (secondSyncPointDelta >= secondSync.scoredEvents * 4) {
    tracker.pass(
      `second live sync respected point-event accounting with ${secondSyncPointDelta} new leaderboard point event(s)`
    )
  } else {
    tracker.fail(
      `leaderboard point-event delta after second sync is too small: expected at least ${secondSync.scoredEvents * 4}, observed ${secondSyncPointDelta}`
    )
  }

  if (secondSync.syncedEvents === 0 && secondSync.scoredEvents === 0) {
    tracker.pass("immediate second sync was fully idempotent with no new imported or scored events")
  } else {
    tracker.warn(
      `immediate second sync still saw new activity (${secondSync.syncedEvents} imports, ${secondSync.scoredEvents} scored); duplicates are audited separately because live users may have continued streaming`
    )
  }

  const duplicateStreamEvents = await StreamEventModel.aggregate([
    {
      $group: {
        _id: {
          provider: "$provider",
          providerUserKey: "$providerUserKey",
          providerEventKey: "$providerEventKey"
        },
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: 1 } } },
    { $count: "duplicateGroups" }
  ])

  if ((duplicateStreamEvents[0]?.duplicateGroups ?? 0) === 0) {
    tracker.pass("stream-event dedupe is intact with no duplicate provider event keys")
  } else {
    tracker.fail(`found ${duplicateStreamEvents[0].duplicateGroups} duplicated stream-event key group(s)`)
  }

  const duplicatePointEvents = await LeaderboardPointEventModel.aggregate([
    {
      $group: {
        _id: "$dedupeKey",
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: 1 } } },
    { $count: "duplicateGroups" }
  ])

  if ((duplicatePointEvents[0]?.duplicateGroups ?? 0) === 0) {
    tracker.pass("leaderboard point-event dedupe is intact with no duplicate dedupe keys")
  } else {
    tracker.fail(`found ${duplicatePointEvents[0].duplicateGroups} duplicated leaderboard dedupe key group(s)`)
  }

  const currentMissions = await findCurrentMissions()
  const currentMissionIds = currentMissions.map((mission) => mission._id)
  const missionsById = new Map(currentMissions.map((mission) => [String(mission._id), mission]))
  const [currentUserProgressDocs, currentSharedProgressDocs, currentContributionDocs, currentUsers] =
    await Promise.all([
      UserMissionProgressModel.find({
        schemaVersion: 3,
        missionInstanceId: { $in: currentMissionIds }
      }).lean(),
      SharedMissionProgressModel.find({
        schemaVersion: 3,
        missionInstanceId: { $in: currentMissionIds }
      }).lean(),
      MissionContributionModel.find({
        schemaVersion: 3,
        missionInstanceId: { $in: currentMissionIds }
      }).lean(),
      UserModel.find({
        _id: { $in: Array.from(new Set(verifiedConnections.map((connection) => String(connection.userId)))).map((id) => new mongoose.Types.ObjectId(id)) }
      }).lean()
    ])

  const verifiedUserMap = new Map(currentUsers.map((user) => [String(user._id), user]))

  for (const progress of currentUserProgressDocs) {
    const mission = missionsById.get(String(progress.missionInstanceId))

    if (!mission) {
      tracker.fail(`user mission progress ${progress._id} points to a non-current mission ${progress.missionInstanceId}`)
      continue
    }

    const events = await StreamEventModel.find({
      userId: progress.userId,
      isBTSFamily: true,
      playedAt: { $gte: mission.startsAt, $lt: mission.endsAt }
    })
      .sort({ playedAt: 1, _id: 1 })
      .select({ userId: 1, playedAt: 1, catalogTrackSpotifyId: 1 })
      .lean()
    const expected = computePersonalProgress(events, mission, trackEquivalenceData)

    if (progress.progressValue === expected.progressValue) {
      tracker.pass(`personal mission progress matches computed value for ${mission.missionCellKey} / user ${progress.userId}`)
    } else {
      tracker.fail(
        `personal mission progress mismatch for ${mission.missionCellKey} / user ${progress.userId}: stored=${progress.progressValue}, computed=${expected.progressValue}`
      )
    }

    const storedTargetProgress = normalizeTargetProgress(progress.targetProgress)
    const expectedTargetProgress = normalizeTargetProgress(expected.targetProgress)

    if (JSON.stringify(storedTargetProgress) === JSON.stringify(expectedTargetProgress)) {
      tracker.pass(`personal mission target breakdown matches for ${mission.missionCellKey} / user ${progress.userId}`)
    } else {
      tracker.fail(`personal mission target breakdown mismatch for ${mission.missionCellKey} / user ${progress.userId}`)
    }

    if (Boolean(progress.completedAt) === expected.completed) {
      tracker.pass(`personal mission completion flag matches for ${mission.missionCellKey} / user ${progress.userId}`)
    } else {
      tracker.fail(`personal mission completion flag mismatch for ${mission.missionCellKey} / user ${progress.userId}`)
    }

    if (progress.rewardAwardedAt) {
      const rewardEventCount = await LeaderboardPointEventModel.countDocuments({
        sourceType: "mission_completion",
        sourceId: String(mission._id),
        userId: progress.userId
      })

      if (rewardEventCount >= 2) {
        tracker.pass(`personal mission reward events exist for ${mission.missionCellKey} / user ${progress.userId}`)
      } else {
        tracker.fail(`personal mission reward marker exists without the expected leaderboard reward events for ${mission.missionCellKey} / user ${progress.userId}`)
      }
    }
  }

  for (const progress of currentSharedProgressDocs) {
    const mission = missionsById.get(String(progress.missionInstanceId))

    if (!mission) {
      tracker.fail(`shared mission progress ${progress._id} points to a non-current mission ${progress.missionInstanceId}`)
      continue
    }

    const filter =
      progress.scopeType === "state"
        ? { stateKey: progress.scopeKey }
        : {}
    const events = await StreamEventModel.find({
      ...filter,
      isBTSFamily: true,
      playedAt: { $gte: mission.startsAt, $lt: mission.endsAt }
    })
      .sort({ playedAt: 1, _id: 1 })
      .select({ userId: 1, playedAt: 1, catalogTrackSpotifyId: 1, stateKey: 1 })
      .lean()
    const expected = computeSharedProgress(
      events,
      mission,
      progress.scopeType,
      trackEquivalenceData
    )

    if (progress.progressValue === expected.progressValue) {
      tracker.pass(`shared mission progress matches computed value for ${mission.missionCellKey} / ${progress.scopeKey}`)
    } else {
      tracker.fail(
        `shared mission progress mismatch for ${mission.missionCellKey} / ${progress.scopeKey}: stored=${progress.progressValue}, computed=${expected.progressValue}`
      )
    }

    if (progress.contributorCount === expected.contributorCount) {
      tracker.pass(`shared mission contributor count matches for ${mission.missionCellKey} / ${progress.scopeKey}`)
    } else {
      tracker.fail(
        `shared mission contributor count mismatch for ${mission.missionCellKey} / ${progress.scopeKey}: stored=${progress.contributorCount}, computed=${expected.contributorCount}`
      )
    }

    const storedTargetProgress = normalizeTargetProgress(progress.targetProgress)
    const expectedTargetProgress = normalizeTargetProgress(expected.targetProgress)

    if (JSON.stringify(storedTargetProgress) === JSON.stringify(expectedTargetProgress)) {
      tracker.pass(`shared mission target breakdown matches for ${mission.missionCellKey} / ${progress.scopeKey}`)
    } else {
      tracker.fail(`shared mission target breakdown mismatch for ${mission.missionCellKey} / ${progress.scopeKey}`)
    }

    if (Boolean(progress.completedAt) === expected.completed) {
      tracker.pass(`shared mission completion flag matches for ${mission.missionCellKey} / ${progress.scopeKey}`)
    } else {
      tracker.fail(`shared mission completion flag mismatch for ${mission.missionCellKey} / ${progress.scopeKey}`)
    }

    if (progress.rewardAwardedAt) {
      const rewardEventCount = await LeaderboardPointEventModel.countDocuments({
        sourceType: "mission_completion",
        sourceId: String(mission._id),
        ...(progress.scopeType === "state"
          ? {
              competitorType: "state",
              competitorKey: progress.scopeKey
            }
          : {})
      })

      if (rewardEventCount > 0) {
        tracker.pass(`shared mission reward events exist for ${mission.missionCellKey} / ${progress.scopeKey}`)
      } else {
        tracker.fail(`shared mission reward marker exists without leaderboard reward events for ${mission.missionCellKey} / ${progress.scopeKey}`)
      }
    }
  }

  for (const contribution of currentContributionDocs) {
    const mission = missionsById.get(String(contribution.missionInstanceId))

    if (!mission) {
      tracker.fail(`mission contribution ${contribution._id} points to a non-current mission ${contribution.missionInstanceId}`)
      continue
    }

    const user = verifiedUserMap.get(String(contribution.userId))
    const stateFilter = mission.missionKind === "state_shared" && contribution.stateKey
      ? { stateKey: contribution.stateKey }
      : {}
    const userEvents = await StreamEventModel.find({
      ...stateFilter,
      userId: contribution.userId,
      isBTSFamily: true,
      playedAt: { $gte: mission.startsAt, $lt: mission.endsAt }
    })
      .sort({ playedAt: 1, _id: 1 })
      .select({ userId: 1, playedAt: 1, catalogTrackSpotifyId: 1, stateKey: 1 })
      .lean()
    const expected = computeContribution(userEvents, mission, trackEquivalenceData)

    if (contribution.contributionUnits === expected.contributionUnits) {
      tracker.pass(`mission contribution units match for ${mission.missionCellKey} / user ${contribution.userId}`)
    } else {
      tracker.fail(
        `mission contribution mismatch for ${mission.missionCellKey} / user ${contribution.userId}: stored=${contribution.contributionUnits}, computed=${expected.contributionUnits}`
      )
    }

    if (expected.qualifiedAt) {
      const storedTime = contribution.qualifiedAt?.getTime()
      const expectedTime = expected.qualifiedAt.getTime()

      if (storedTime === expectedTime) {
        tracker.pass(`mission contribution qualification timestamp matches for ${mission.missionCellKey} / user ${contribution.userId}`)
      } else {
        tracker.fail(
          `mission contribution qualification timestamp mismatch for ${mission.missionCellKey} / user ${contribution.userId}`
        )
      }
    } else if (!contribution.qualifiedAt) {
      tracker.pass(`mission contribution qualification timestamp is correctly empty for ${mission.missionCellKey} / user ${contribution.userId}`)
    } else {
      tracker.fail(`mission contribution has a qualification timestamp without any qualifying activity for ${mission.missionCellKey} / user ${contribution.userId}`)
    }

    if (contribution.rewardAwardedAt) {
      const rewardEventCount = await LeaderboardPointEventModel.countDocuments({
        sourceType: "mission_completion",
        sourceId: String(mission._id),
        userId: contribution.userId
      })

      if (rewardEventCount >= 2) {
        tracker.pass(`india mission contribution rewards exist for ${mission.missionCellKey} / user ${contribution.userId}`)
      } else {
        tracker.fail(`india mission contribution reward marker exists without expected reward events for ${mission.missionCellKey} / user ${contribution.userId}`)
      }
    } else if (mission.missionKind === "india_shared" && user?.region?.state && contribution.contributionUnits > 0) {
      const sharedProgress = currentSharedProgressDocs.find(
        (doc) =>
          String(doc.missionInstanceId) === String(mission._id) &&
          doc.scopeType === "india" &&
          doc.scopeKey === "india:all"
      )

      if (sharedProgress?.completedAt && contribution.qualifiedAt && contribution.qualifiedAt <= sharedProgress.completedAt) {
        tracker.fail(`india mission completed but qualified contribution for user ${contribution.userId} was not marked rewarded`)
      }
    }
  }

  const currentBoards = await LeaderboardBoardModel.find({
    schemaVersion: 2,
    periodKey: { $in: currentPeriodKeys }
  }).lean()

  if (currentBoards.length === 4) {
    tracker.pass("all 4 current leaderboard boards exist")
  } else {
    tracker.fail(`expected 4 current leaderboard boards, found ${currentBoards.length}`)
  }

  for (const board of currentBoards) {
    if (!board.isDirty) {
      tracker.pass(`leaderboard board ${board.boardType}/${board.periodKey} is materialized`)
    } else {
      tracker.fail(`leaderboard board ${board.boardType}/${board.periodKey} is still dirty after sync`)
    }

    const [events, entries, snapshot] = await Promise.all([
      LeaderboardPointEventModel.find({ boardId: board._id }).lean(),
      LeaderboardEntryModel.find({ boardId: board._id }).sort({ rank: 1 }).lean(),
      LeaderboardRankSnapshotModel.findOne({ boardId: board._id }).sort({ generatedAt: -1 }).lean()
    ])
    const rankedEntries = rankEntriesFromEvents(events)

    if (entries.length === rankedEntries.length) {
      tracker.pass(`leaderboard entry count matches aggregated point events for ${board.boardType}/${board.periodKey}`)
    } else {
      tracker.fail(
        `leaderboard entry count mismatch for ${board.boardType}/${board.periodKey}: stored=${entries.length}, computed=${rankedEntries.length}`
      )
    }

    const mismatch = entries.find((entry, index) => {
      const expected = rankedEntries[index]

      return !expected ||
        entry.competitorKey !== expected.competitorKey ||
        entry.rank !== expected.rank ||
        entry.score !== expected.score
    })

    if (!mismatch) {
      tracker.pass(`leaderboard ranking order matches aggregated point events for ${board.boardType}/${board.periodKey}`)
    } else {
      tracker.fail(`leaderboard ranking mismatch detected for ${board.boardType}/${board.periodKey}`)
    }

    if (snapshot) {
      tracker.pass(`leaderboard rank snapshot exists for ${board.boardType}/${board.periodKey}`)
    } else {
      tracker.fail(`leaderboard rank snapshot is missing for ${board.boardType}/${board.periodKey}`)
    }
  }

  const armyConnection = await mongoose.createConnection(armyEnv.MONGO_URI, {
    bufferCommands: false
  }).asPromise()

  try {
    console.log("STEP sampling ARMYBATTLES accounts")
    const armyTopUsers = await armyConnection.collection("streamcounts").aggregate([
      {
        $group: {
          _id: "$userId",
          totalCount: { $sum: "$count" }
        }
      },
      { $sort: { totalCount: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          totalCount: 1,
          username: "$user.username",
          lastfmUsername: "$user.lastfmUsername"
        }
      },
      {
        $match: {
          lastfmUsername: { $type: "string", $ne: "" }
        }
      }
    ]).toArray()

    if (armyTopUsers.length > 0) {
      tracker.pass(`ARMYBATTLES contributed ${armyTopUsers.length} high-activity Last.fm account(s) for external verification sampling`)
    } else {
      tracker.fail("ARMYBATTLES did not yield any Last.fm usernames for external verification sampling")
    }

    const catalogMatchers = catalogTracks.map((track) => ({
      spotifyId: track.spotifyId,
      normalizedTrackName: normalizeTrackName(track.name),
      normalizedArtistName: normalizeArtistName(track.artist),
      normalizedAlbumName: normalizeAlbumName(track.album)
    }))

    const matchCatalogTrack = (trackName, artistName, albumName) => {
      const normalizedName = normalizeTrackName(trackName)
      const normalizedArtist = normalizeArtistName(artistName)
      const normalizedAlbum = albumName ? normalizeAlbumName(albumName) : ""
      const candidates = catalogMatchers.filter((matcher) => matcher.normalizedTrackName === normalizedName)
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

    const lastFmClient = new LastFmClient(process.env.LASTFM_API_KEY)
    const liveTrackMissionKeys = new Set(
      currentMissions
        .filter((mission) => mission.mechanicType === "track_streams")
        .flatMap((mission) => mission.targetConfig.targets)
        .flatMap((target) => getTrackMissionMatchKeys(target))
    )
    const liveAlbumMissionTrackKeys = new Set(
      currentMissions
        .filter((mission) => mission.mechanicType === "album_completions")
        .flatMap((mission) => mission.targetConfig.targets)
        .flatMap((target) => target.trackKeys ?? [])
    )

    let sampledUsersWithBtsMatches = 0
    let sampledUsersWithMissionOverlap = 0

    for (const candidate of armyTopUsers.slice(0, 8)) {
      const recent = await lastFmClient.getRecentTracks(candidate.lastfmUsername, { limit: 200 })
      const matchedTracks = recent.tracks
        .filter((track) => !track.nowPlaying && track.timestamp)
        .map((track) => ({
          original: track,
          matched: matchCatalogTrack(track.name, track.artistName, track.albumName)
        }))
        .filter((entry) => entry.matched)

      if (matchedTracks.length > 0) {
        sampledUsersWithBtsMatches += 1
        tracker.pass(
          `external sample ${candidate.lastfmUsername} has ${matchedTracks.length} BTS-family match(es) in the latest 200 scrobbles`
        )
      } else {
        tracker.warn(
          `external sample ${candidate.lastfmUsername} had no BTS-family match in the latest 200 scrobbles`
        )
      }

      const missionOverlap = matchedTracks.some(
        (entry) =>
          liveTrackMissionKeys.has(entry.matched.spotifyId) || liveAlbumMissionTrackKeys.has(entry.matched.spotifyId)
      )

      if (missionOverlap) {
        sampledUsersWithMissionOverlap += 1
        tracker.pass(`external sample ${candidate.lastfmUsername} overlaps the current live mission target set`)
      }
    }

    if (sampledUsersWithBtsMatches >= 3) {
      tracker.pass(`external sample set is relevant: ${sampledUsersWithBtsMatches} sampled ARMYBATTLES users showed BTS-family scrobble matches`)
    } else {
      tracker.fail(`external sample set is too weak: only ${sampledUsersWithBtsMatches} sampled ARMYBATTLES users showed BTS-family scrobble matches`)
    }

    if (sampledUsersWithMissionOverlap > 0) {
      tracker.pass(`at least ${sampledUsersWithMissionOverlap} sampled ARMYBATTLES user(s) overlapped the current mission targets`)
    } else {
      tracker.warn("none of the sampled ARMYBATTLES users overlapped the current mission targets in their latest 200 scrobbles")
    }
  } finally {
    await armyConnection.close()
  }

  const { failures } = tracker.summary()

  if (failures.length > 0) {
    process.exitCode = 1
  }
}

await main().finally(async () => {
  await mongoose.disconnect().catch(() => {})
})
