import { Types } from "mongoose"
import {
  cacheTags,
  revalidateCacheTags,
  sharedCacheRevalidateSeconds,
  unstable_cache
} from "@/platform/cache/shared"
import { getCurrentUserRecord } from "@/platform/auth/current-user"
import {
  LeaderboardBoardModel,
  LeaderboardEntryModel,
  LeaderboardPointEventModel,
  LeaderboardRankSnapshotModel
} from "@/platform/db/models/leaderboards"
import { connectToDatabase } from "@/platform/db/mongoose"
import { TrackerConnectionModel } from "@/platform/db/models/tracker"
import { buildStateScopeKeyFromRegion } from "@/platform/integrations/geo/state-scopes"
import { getCurrentIndiaPeriods, getIndiaPeriod, type MissionCadence } from "@/platform/time/india-periods"
import type { LeaderboardBoardView, LeaderboardEntryView } from "@/modules/leaderboards/types"

type ListLeaderboardOptions = {
  period?: "daily" | "weekly"
  boardType?: "individual" | "state"
}

type GetLeaderboardByIdOptions = {
  fullEntries?: boolean
}

type PointEventInput = {
  boardType: "individual" | "state"
  cadence: MissionCadence
  periodAt: Date
  occurredAt: Date
  competitorType: "user" | "state"
  competitorKey: string
  displayName: string
  points: number
  sourceType: "verified_stream" | "mission_completion" | "admin_adjustment"
  sourceId: string
  dedupeKey: string
  userId?: Types.ObjectId
  stateKey?: string
}

type LeaderboardScoreDelta = {
  boardId: Types.ObjectId
  competitorType: "user" | "state"
  competitorKey: string
  userId?: Types.ObjectId
  stateKey?: string
  displayName: string
  scoreDelta: number
  lastQualifiedAt?: Date
}

type LeaderboardEntryDoc = {
  _id: Types.ObjectId
  boardId: Types.ObjectId
  competitorType: "user" | "state"
  competitorKey: string
  userId?: Types.ObjectId
  stateKey?: string
  displayName: string
  score: number
  rank: number
  previousRank?: number | null
  lastQualifiedAt?: Date
}

type MaterializableLeaderboardBoardDoc = {
  _id: Types.ObjectId
  boardType: "individual" | "state"
  period: "daily" | "weekly"
  periodKey: string
  startsAt: Date
  endsAt: Date
  isDirty: boolean
  materializationStartedAt?: Date
  lastMaterializedAt?: Date
  updatedAt: Date
}

const leaderboardMaterializationLeaseMs = 5 * 60 * 1000

function buildBoardHeadline(boardType: "individual" | "state", period: "daily" | "weekly") {
  if (boardType === "individual") {
    return period === "daily"
      ? "Daily individual rankings from verified BTS streams and mission rewards."
      : "Weekly individual rankings built from verified streams and mission completions."
  }

  return period === "daily"
    ? "Daily state standings powered by each state’s verified BTS activity."
    : "Weekly state standings powered by verified streams and shared state wins."
}

async function ensureLeaderboardBoard(boardType: "individual" | "state", cadence: MissionCadence) {
  const period = getIndiaPeriod(cadence)
  return ensureLeaderboardBoardForPeriod(boardType, period)
}

async function ensureLeaderboardBoardForPeriod(
  boardType: "individual" | "state",
  period: ReturnType<typeof getIndiaPeriod>
) {
  const scopeKey = `v2:${boardType}`
  const scopeLabel = boardType === "individual" ? "All Users" : "All States"

  return LeaderboardBoardModel.findOneAndUpdate(
    {
      schemaVersion: 2,
      boardType,
      periodKey: period.periodKey
    },
    {
      $set: {
        schemaVersion: 2,
        boardType,
        scopeType: boardType,
        scopeKey,
        scopeLabel,
        period: period.cadence,
        periodKey: period.periodKey,
        startsAt: period.startsAt,
        endsAt: period.endsAt
      },
      $setOnInsert: {
        isDirty: true
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )
}

async function ensureCurrentLeaderboardBoards() {
  const boards = await Promise.all([
    ensureLeaderboardBoard("individual", "daily"),
    ensureLeaderboardBoard("individual", "weekly"),
    ensureLeaderboardBoard("state", "daily"),
    ensureLeaderboardBoard("state", "weekly")
  ])

  return new Map(
    boards.map((board) => [`${board.period}:${board.boardType}:${board.periodKey}`, board] as const)
  )
}

async function ensureLeaderboardBoardsForEvents(events: PointEventInput[]) {
  const uniquePeriods = new Map<string, ReturnType<typeof getIndiaPeriod>>()

  for (const event of events) {
    const period = getIndiaPeriod(event.cadence, event.periodAt)
    uniquePeriods.set(`${event.boardType}:${period.periodKey}`, period)
  }

  const boards = await Promise.all(
    Array.from(uniquePeriods.entries()).map(([key, period]) => {
      const [boardType] = key.split(":")
      return ensureLeaderboardBoardForPeriod(boardType as "individual" | "state", period)
    })
  )

  return new Map(
    boards.map((board) => [`${board.period}:${board.boardType}:${board.periodKey}`, board] as const)
  )
}

function buildLeaderboardScoreDeltas(
  events: PointEventInput[],
  boardMap: Map<string, Awaited<ReturnType<typeof ensureLeaderboardBoardForPeriod>>>
) {
  const grouped = new Map<string, LeaderboardScoreDelta>()

  for (const event of events) {
    const period = getIndiaPeriod(event.cadence, event.periodAt)
    const board = boardMap.get(`${event.cadence}:${event.boardType}:${period.periodKey}`)

    if (!board) {
      continue
    }

    const key = `${String(board._id)}:${event.competitorKey}`
    const current = grouped.get(key)

    if (current) {
      current.scoreDelta += event.points
      current.displayName = event.displayName
      current.userId = event.userId ?? current.userId
      current.stateKey = event.stateKey ?? current.stateKey
      current.lastQualifiedAt =
        event.points > 0
          ? current.lastQualifiedAt && current.lastQualifiedAt > event.occurredAt
            ? current.lastQualifiedAt
            : event.occurredAt
          : current.lastQualifiedAt
      continue
    }

    grouped.set(key, {
      boardId: board._id,
      competitorType: event.competitorType,
      competitorKey: event.competitorKey,
      userId: event.userId,
      stateKey: event.stateKey,
      displayName: event.displayName,
      scoreDelta: event.points,
      lastQualifiedAt: event.points > 0 ? event.occurredAt : undefined
    })
  }

  return Array.from(grouped.values()).filter((delta) => delta.scoreDelta !== 0)
}

async function applyLeaderboardScoreDeltas(deltas: LeaderboardScoreDelta[]) {
  if (deltas.length === 0) {
    return { inserted: 0 }
  }

  await LeaderboardEntryModel.bulkWrite(
    deltas.map((delta) => {
      const update: Record<string, unknown> = {
        $set: {
          competitorType: delta.competitorType,
          userId: delta.userId,
          stateKey: delta.stateKey,
          displayName: delta.displayName
        },
        $inc: {
          score: delta.scoreDelta
        }
      }

      if (delta.lastQualifiedAt) {
        update.$max = {
          lastQualifiedAt: delta.lastQualifiedAt
        }
      }

      return {
        updateOne: {
          filter: {
            boardId: delta.boardId,
            competitorKey: delta.competitorKey
          },
          update,
          upsert: delta.scoreDelta > 0
        }
      }
    }),
    { ordered: false }
  )

  await LeaderboardBoardModel.updateMany(
    {
      _id: {
        $in: Array.from(new Set(deltas.map((delta) => String(delta.boardId))), (boardId) => new Types.ObjectId(boardId))
      }
    },
    { $set: { isDirty: true } }
  )

  revalidateCacheTags(cacheTags.leaderboards)

  return { inserted: deltas.filter((delta) => delta.scoreDelta > 0).length }
}

export async function recordLeaderboardPointEvents(events: PointEventInput[]) {
  await connectToDatabase()

  const filteredEvents = events.filter(
    (event) => event.points > 0 && event.competitorKey.trim().length > 0 && event.displayName.trim().length > 0
  )

  if (filteredEvents.length === 0) {
    return { inserted: 0 }
  }

  const boardMap = await ensureLeaderboardBoardsForEvents(filteredEvents)
  const deltas = buildLeaderboardScoreDeltas(filteredEvents, boardMap)
  return applyLeaderboardScoreDeltas(deltas)
}

export async function rollbackLeaderboardPointEvents(events: PointEventInput[]) {
  await connectToDatabase()

  const filteredEvents = events
    .map((event) => ({
      ...event,
      points: -Math.abs(event.points)
    }))
    .filter(
      (event) => event.competitorKey.trim().length > 0 && event.displayName.trim().length > 0
    )

  if (filteredEvents.length === 0) {
    return { inserted: 0 }
  }

  const boardMap = await ensureLeaderboardBoardsForEvents(filteredEvents)
  const deltas = buildLeaderboardScoreDeltas(filteredEvents, boardMap)
  return applyLeaderboardScoreDeltas(deltas)
}

function toSnapshotEntry(entry: {
  rank: number
  competitorType: "user" | "state"
  competitorKey: string
  userId?: Types.ObjectId
  stateKey?: string
  displayName: string
  score: number
  previousRank?: number | null
}): LeaderboardEntryView {
  return {
    rank: entry.rank,
    competitorType: entry.competitorType,
    competitorKey: entry.competitorKey,
    userId: entry.userId ? String(entry.userId) : undefined,
    stateKey: entry.stateKey,
    displayName: entry.displayName,
    score: entry.score,
    previousRank: entry.previousRank ?? null
  }
}

export async function materializeLeaderboards(options: {
  boardIds?: Types.ObjectId[]
  periodKey?: string
} = {}) {
  await connectToDatabase()

  const filter: Record<string, unknown> = { schemaVersion: 2 }

  if (options.boardIds?.length) {
    filter._id = { $in: options.boardIds }
  } else {
    filter.isDirty = true
  }

  if (options.periodKey) {
    filter.periodKey = options.periodKey
  }

  const candidateBoards = (await LeaderboardBoardModel.find(filter).lean()) as unknown as MaterializableLeaderboardBoardDoc[]
  const staleLeaseThreshold = new Date(Date.now() - leaderboardMaterializationLeaseMs)
  let boardsMaterialized = 0

  for (const candidateBoard of candidateBoards) {
    const board = (await LeaderboardBoardModel.findOneAndUpdate(
      {
        _id: candidateBoard._id,
        schemaVersion: 2,
        isDirty: true,
        $or: [
          { materializationStartedAt: { $exists: false } },
          { materializationStartedAt: null },
          { materializationStartedAt: { $lt: staleLeaseThreshold } }
        ]
      },
      {
        $set: {
          materializationStartedAt: new Date()
        }
      },
      {
        new: true
      }
    ).lean()) as unknown as MaterializableLeaderboardBoardDoc | null

    if (!board) {
      continue
    }

    const materializationStartedAt = board.materializationStartedAt ?? new Date()

    try {
      const previousEntries = (await LeaderboardEntryModel.find({ boardId: board._id }).lean()) as unknown as LeaderboardEntryDoc[]
      const previousRankMap = new Map(
        previousEntries.map((entry) => [entry.competitorKey, entry.rank ?? null] as const)
      )
      const rankedEntries = previousEntries
        .filter((entry) => entry.score > 0)
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
          rank: index + 1,
          previousRank: previousRankMap.get(entry.competitorKey) ?? null
        }))

      if (rankedEntries.length > 0) {
        await LeaderboardEntryModel.bulkWrite(
          rankedEntries.map((entry) => ({
            updateOne: {
              filter: {
                boardId: board._id,
                competitorKey: entry.competitorKey
              },
              update: {
                $set: {
                  competitorType: entry.competitorType,
                  userId: entry.userId,
                  stateKey: entry.stateKey,
                  displayName: entry.displayName,
                  score: entry.score,
                  rank: entry.rank,
                  previousRank: entry.previousRank,
                  lastQualifiedAt: entry.lastQualifiedAt
                }
              },
              upsert: true
            }
          })),
          { ordered: false }
        )

        await LeaderboardEntryModel.deleteMany({
          boardId: board._id,
          competitorKey: {
            $nin: rankedEntries.map((entry) => entry.competitorKey)
          }
        })
      } else {
        await LeaderboardEntryModel.deleteMany({ boardId: board._id })
      }

      await LeaderboardEntryModel.deleteMany({
        boardId: board._id,
        score: { $lte: 0 }
      })

      await LeaderboardRankSnapshotModel.create({
        boardId: board._id,
        topEntries: rankedEntries.slice(0, 10).map(toSnapshotEntry),
        generatedAt: new Date(),
        totalParticipants: rankedEntries.length
      })

      const materializedAt = new Date()
      const finalizeResult = await LeaderboardBoardModel.updateOne(
        {
          _id: board._id,
          materializationStartedAt,
          updatedAt: { $lte: materializationStartedAt }
        },
        {
          $set: { isDirty: false, lastMaterializedAt: materializedAt },
          $unset: { materializationStartedAt: 1 }
        }
      )

      if ((finalizeResult.matchedCount ?? 0) === 0) {
        await LeaderboardBoardModel.updateOne(
          { _id: board._id, materializationStartedAt },
          { $unset: { materializationStartedAt: 1 } }
        )
      }

      boardsMaterialized += 1
    } catch (error) {
      await LeaderboardBoardModel.updateOne(
        { _id: board._id, materializationStartedAt },
        {
          $set: { isDirty: true },
          $unset: { materializationStartedAt: 1 }
        }
      )

      throw error
    }
  }

  return {
    boardsMaterialized
  }
}

export async function backfillCurrentLeaderboardsFromLegacyPointEvents() {
  await connectToDatabase()

  const periods = getCurrentIndiaPeriods()
  const boards = await ensureCurrentLeaderboardBoards()
  let boardsBackfilled = 0

  for (const board of boards.values()) {
    if (![periods.daily.periodKey, periods.weekly.periodKey].includes(board.periodKey)) {
      continue
    }

    const pointEvents = await LeaderboardPointEventModel.find({ boardId: board._id })
      .sort({ occurredAt: 1, createdAt: 1, _id: 1 })
      .lean()

    if (pointEvents.length === 0) {
      continue
    }

    const aggregateMap = new Map<
      string,
      {
        competitorType: "user" | "state"
        competitorKey: string
        userId?: Types.ObjectId
        stateKey?: string
        displayName: string
        score: number
        lastQualifiedAt?: Date
      }
    >()

    for (const event of pointEvents) {
      const eventOccurredAt = event.occurredAt ?? event.createdAt
      const current = aggregateMap.get(event.competitorKey)

      if (current) {
        current.score += event.points
        current.displayName = event.displayName
        current.lastQualifiedAt =
          current.lastQualifiedAt && current.lastQualifiedAt > eventOccurredAt
            ? current.lastQualifiedAt
            : eventOccurredAt
        current.userId = event.userId ?? current.userId
        current.stateKey = event.stateKey ?? current.stateKey
        continue
      }

      aggregateMap.set(event.competitorKey, {
        competitorType: event.competitorType as "user" | "state",
        competitorKey: event.competitorKey,
        userId: event.userId as Types.ObjectId | undefined,
        stateKey: event.stateKey,
        displayName: event.displayName,
        score: event.points,
        lastQualifiedAt: eventOccurredAt
      })
    }

    const rankedEntries = Array.from(aggregateMap.values())
      .filter((entry) => entry.score > 0)
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
        rank: index + 1,
        previousRank: null
      }))

    if (rankedEntries.length > 0) {
      await LeaderboardEntryModel.bulkWrite(
        rankedEntries.map((entry) => ({
          updateOne: {
            filter: {
              boardId: board._id,
              competitorKey: entry.competitorKey
            },
            update: {
              $set: {
                competitorType: entry.competitorType,
                userId: entry.userId,
                stateKey: entry.stateKey,
                displayName: entry.displayName,
                score: entry.score,
                rank: entry.rank,
                previousRank: entry.previousRank,
                lastQualifiedAt: entry.lastQualifiedAt
              }
            },
            upsert: true
          }
        })),
        { ordered: false }
      )
    }

    await LeaderboardEntryModel.deleteMany({
      boardId: board._id,
      competitorKey: {
        $nin: rankedEntries.map((entry) => entry.competitorKey)
      }
    })
    await LeaderboardBoardModel.updateOne(
      { _id: board._id },
      {
        $set: {
          isDirty: true
        }
      }
    )

    boardsBackfilled += 1
  }

  await materializeLeaderboards({
    boardIds: Array.from(boards.values()).map((board) => board._id)
  })

  return { boardsBackfilled }
}

async function buildEntryViewsFromSnapshot(boardId: Types.ObjectId) {
  const snapshot = (await LeaderboardRankSnapshotModel.findOne({ boardId })
    .sort({ generatedAt: -1 })
    .lean()) as { topEntries?: LeaderboardEntryView[]; totalParticipants?: number } | null

  return {
    entries: snapshot?.topEntries ?? [],
    totalParticipants: snapshot?.totalParticipants ?? snapshot?.topEntries?.length ?? 0
  }
}

async function buildFullEntryViews(boardId: Types.ObjectId) {
  const entries = (await LeaderboardEntryModel.find({ boardId })
    .sort({ rank: 1 })
    .lean()) as unknown as LeaderboardEntryDoc[]

  return {
    entries: entries.map(toSnapshotEntry),
    totalParticipants: entries.length
  }
}

async function buildSharedLeaderboardBoardView(
  board: MaterializableLeaderboardBoardDoc,
  options: GetLeaderboardByIdOptions = {}
): Promise<LeaderboardBoardView> {
  const entryData = options.fullEntries
    ? await buildFullEntryViews(board._id)
    : await buildEntryViewsFromSnapshot(board._id)

  return {
    boardId: String(board._id),
    boardType: board.boardType as "individual" | "state",
    period: board.period as "daily" | "weekly",
    periodKey: board.periodKey,
    startsAt: board.startsAt.toISOString(),
    endsAt: board.endsAt.toISOString(),
    headline: buildBoardHeadline(board.boardType as "individual" | "state", board.period as "daily" | "weekly"),
    entries: entryData.entries.map((entry) => ({
      ...entry,
      isCurrentUser: false
    })),
    totalParticipants: entryData.totalParticipants,
    currentUserEntry: null,
    currentStateEntry: null
  } satisfies LeaderboardBoardView
}

function attachCurrentEntriesToBoard(
  board: LeaderboardBoardView,
  currentUserEntryDoc: LeaderboardEntryDoc | null,
  currentStateEntryDoc: LeaderboardEntryDoc | null
) {
  return {
    ...board,
    entries: board.entries.map((entry) => ({
      ...entry,
      isCurrentUser:
        entry.competitorType === "user" && currentUserEntryDoc
          ? entry.competitorKey === currentUserEntryDoc.competitorKey
          : false
    })),
    currentUserEntry: currentUserEntryDoc ? toSnapshotEntry(currentUserEntryDoc) : null,
    currentStateEntry: currentStateEntryDoc ? toSnapshotEntry(currentStateEntryDoc) : null
  } satisfies LeaderboardBoardView
}

const getCachedSharedLeaderboards = unstable_cache(
  async (period: ListLeaderboardOptions["period"] | null, boardType: ListLeaderboardOptions["boardType"] | null) => {
    await connectToDatabase()
    await ensureCurrentLeaderboardBoards()

    const periods = getCurrentIndiaPeriods()
    const allowedPeriodKeys = period
      ? [periods[period].periodKey]
      : [periods.daily.periodKey, periods.weekly.periodKey]

    const filter: Record<string, unknown> = {
      schemaVersion: 2,
      periodKey: { $in: allowedPeriodKeys }
    }

    if (boardType) {
      filter.boardType = boardType
    }

    const boards = await LeaderboardBoardModel.find(filter)
      .sort({ period: 1, boardType: 1 })
      .lean()

    const dirtyBoardIds = boards.filter((board) => board.isDirty).map((board) => board._id as Types.ObjectId)

    if (dirtyBoardIds.length > 0) {
      await materializeLeaderboards({ boardIds: dirtyBoardIds })
    }

    const refreshedBoards = await LeaderboardBoardModel.find(filter)
      .sort({ period: 1, boardType: 1 })
      .lean()

    return Promise.all(
      refreshedBoards.map((board) =>
        buildSharedLeaderboardBoardView(board as unknown as MaterializableLeaderboardBoardDoc)
      )
    )
  },
  ["leaderboards:list:v2"],
  {
    revalidate: sharedCacheRevalidateSeconds,
    tags: [cacheTags.leaderboards]
  }
)

const getCachedSharedLeaderboardById = unstable_cache(
  async (boardId: string, fullEntries: boolean) => {
    await connectToDatabase()

    if (!Types.ObjectId.isValid(boardId)) {
      return null
    }

    const boardObjectId = new Types.ObjectId(boardId)
    let board = (await LeaderboardBoardModel.findOne({
      _id: boardObjectId,
      schemaVersion: 2
    }).lean()) as unknown as MaterializableLeaderboardBoardDoc | null

    if (!board) {
      return null
    }

    if (board.isDirty) {
      await materializeLeaderboards({ boardIds: [boardObjectId] })
      board = (await LeaderboardBoardModel.findOne({
        _id: boardObjectId,
        schemaVersion: 2
      }).lean()) as unknown as MaterializableLeaderboardBoardDoc | null

      if (!board) {
        return null
      }
    }

    return buildSharedLeaderboardBoardView(board, { fullEntries })
  },
  ["leaderboards:by-id:v2"],
  {
    revalidate: sharedCacheRevalidateSeconds,
    tags: [cacheTags.leaderboards]
  }
)

export async function listLeaderboards(
  options: ListLeaderboardOptions = {}
): Promise<LeaderboardBoardView[]> {
  await connectToDatabase()
  const sharedBoards = await getCachedSharedLeaderboards(options.period ?? null, options.boardType ?? null)
  const user = await getCurrentUserRecord()
  const currentStateKey = buildStateScopeKeyFromRegion(user.region)
  const boardIds = sharedBoards.map((board) => new Types.ObjectId(board.boardId))
  const [currentUserEntryDocs, currentStateEntryDocs] = await Promise.all([
    user._id
      ? (LeaderboardEntryModel.find({
          boardId: { $in: boardIds },
          userId: user._id
        }).lean() as unknown as Promise<LeaderboardEntryDoc[]>)
      : Promise.resolve([]),
    currentStateKey
      ? (LeaderboardEntryModel.find({
          boardId: { $in: boardIds },
          competitorKey: currentStateKey
        }).lean() as unknown as Promise<LeaderboardEntryDoc[]>)
      : Promise.resolve([])
  ])

  const currentUserEntryMap = new Map(
    currentUserEntryDocs.map((entry) => [String(entry.boardId), entry] as const)
  )
  const currentStateEntryMap = new Map(
    currentStateEntryDocs.map((entry) => [String(entry.boardId), entry] as const)
  )

  return sharedBoards.map((board) =>
    attachCurrentEntriesToBoard(
      board,
      currentUserEntryMap.get(board.boardId) ?? null,
      currentStateEntryMap.get(board.boardId) ?? null
    )
  )
}

export async function getLeaderboardById(
  boardId: string,
  options: GetLeaderboardByIdOptions = {}
): Promise<LeaderboardBoardView | null> {
  await connectToDatabase()
  const sharedBoard = await getCachedSharedLeaderboardById(boardId, Boolean(options.fullEntries))

  if (!sharedBoard) {
    return null
  }

  const user = await getCurrentUserRecord()
  const currentStateKey = buildStateScopeKeyFromRegion(user.region)
  const [currentUserEntryDoc, currentStateEntryDoc] = await Promise.all([
    user._id
      ? (LeaderboardEntryModel.findOne({
          boardId: new Types.ObjectId(sharedBoard.boardId),
          userId: user._id
        }).lean() as unknown as Promise<LeaderboardEntryDoc | null>)
      : Promise.resolve(null),
    currentStateKey
      ? (LeaderboardEntryModel.findOne({
          boardId: new Types.ObjectId(sharedBoard.boardId),
          competitorKey: currentStateKey
        }).lean() as unknown as Promise<LeaderboardEntryDoc | null>)
      : Promise.resolve(null)
  ])

  return attachCurrentEntriesToBoard(sharedBoard, currentUserEntryDoc, currentStateEntryDoc)
}

const getLeaderboardStatusSummaryCached = unstable_cache(async () => {
  await connectToDatabase()

  const [lastTrackerSyncDoc, lastMaterializedBoard] = await Promise.all([
    (TrackerConnectionModel.findOne({ lastSyncAt: { $ne: null } })
      .sort({ lastSyncAt: -1 })
      .select({ lastSyncAt: 1 })
      .lean() as unknown as Promise<{ lastSyncAt?: Date } | null>),
    (LeaderboardBoardModel.findOne({ schemaVersion: 2, lastMaterializedAt: { $ne: null } })
      .sort({ lastMaterializedAt: -1 })
      .select({ lastMaterializedAt: 1 })
      .lean() as unknown as Promise<{ lastMaterializedAt?: Date } | null>)
  ])

  return {
    lastTrackerSyncAt: lastTrackerSyncDoc?.lastSyncAt?.toISOString(),
    lastLeaderboardMaterializedAt: lastMaterializedBoard?.lastMaterializedAt?.toISOString()
  }
}, ["leaderboards:status:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.leaderboardsStatus]
})

export async function getLeaderboardStatusSummary() {
  return getLeaderboardStatusSummaryCached()
}
