import { Types } from "mongoose"
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

export async function recordLeaderboardPointEvents(events: PointEventInput[]) {
  await connectToDatabase()

  const filteredEvents = events.filter(
    (event) => event.points > 0 && event.competitorKey.trim().length > 0 && event.displayName.trim().length > 0
  )

  if (filteredEvents.length === 0) {
    return { inserted: 0 }
  }

  const boardMap = await ensureLeaderboardBoardsForEvents(filteredEvents)
  let inserted = 0

  for (const event of filteredEvents) {
    const period = getIndiaPeriod(event.cadence, event.periodAt)
    const board = boardMap.get(`${event.cadence}:${event.boardType}:${period.periodKey}`)

    if (!board) {
      continue
    }

    const result = await LeaderboardPointEventModel.updateOne(
      { dedupeKey: event.dedupeKey },
      {
        $setOnInsert: {
          boardId: board._id,
          boardType: event.boardType,
          period: event.cadence,
          periodKey: board.periodKey,
          competitorType: event.competitorType,
          competitorKey: event.competitorKey,
          userId: event.userId,
          stateKey: event.stateKey,
          displayName: event.displayName,
          points: event.points,
          occurredAt: event.occurredAt,
          sourceType: event.sourceType,
          sourceId: event.sourceId,
          dedupeKey: event.dedupeKey
        }
      },
      {
        upsert: true
      }
    )

    if (result.upsertedCount > 0) {
      inserted += 1
      await LeaderboardBoardModel.updateOne({ _id: board._id }, { $set: { isDirty: true } })
    }
  }

  return { inserted }
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

  const boards = await LeaderboardBoardModel.find(filter).lean()

  for (const board of boards) {
    const previousEntries = (await LeaderboardEntryModel.find({ boardId: board._id }).lean()) as unknown as LeaderboardEntryDoc[]
    const previousRankMap = new Map(
      previousEntries.map((entry) => [entry.competitorKey, entry.rank ?? null] as const)
    )
    const pointEvents = await LeaderboardPointEventModel.find({ boardId: board._id })
      .sort({ occurredAt: 1, createdAt: 1, _id: 1 })
      .lean()

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
      } else {
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
    }

    const rankedEntries = Array.from(aggregateMap.values())
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

    await LeaderboardEntryModel.deleteMany({ boardId: board._id })

    if (rankedEntries.length > 0) {
      await LeaderboardEntryModel.insertMany(
        rankedEntries.map((entry) => ({
          boardId: board._id,
          competitorType: entry.competitorType,
          competitorKey: entry.competitorKey,
          userId: entry.userId,
          stateKey: entry.stateKey,
          displayName: entry.displayName,
          score: entry.score,
          rank: entry.rank,
          previousRank: entry.previousRank,
          lastQualifiedAt: entry.lastQualifiedAt
        }))
      )
    }

    await LeaderboardRankSnapshotModel.create({
      boardId: board._id,
      topEntries: rankedEntries.slice(0, 10).map(toSnapshotEntry),
      generatedAt: new Date(),
      totalParticipants: rankedEntries.length
    })

    await LeaderboardBoardModel.updateOne(
      { _id: board._id },
      { $set: { isDirty: false, lastMaterializedAt: new Date() } }
    )
  }

  return {
    boardsMaterialized: boards.length
  }
}

async function buildEntryViewsFromSnapshot(boardId: Types.ObjectId) {
  const snapshot = (await LeaderboardRankSnapshotModel.findOne({ boardId })
    .sort({ generatedAt: -1 })
    .lean()) as { topEntries?: LeaderboardEntryView[] } | null

  return snapshot?.topEntries ?? []
}

export async function listLeaderboards(
  options: ListLeaderboardOptions = {}
): Promise<LeaderboardBoardView[]> {
  await connectToDatabase()
  await ensureCurrentLeaderboardBoards()

  const user = await getCurrentUserRecord()
  const periods = getCurrentIndiaPeriods()
  const allowedPeriodKeys = options.period
    ? [periods[options.period].periodKey]
    : [periods.daily.periodKey, periods.weekly.periodKey]

  const filter: Record<string, unknown> = {
    schemaVersion: 2,
    periodKey: { $in: allowedPeriodKeys }
  }

  if (options.boardType) {
    filter.boardType = options.boardType
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

  const currentStateKey = buildStateScopeKeyFromRegion(user.region)

  return Promise.all(
    refreshedBoards.map(async (board) => {
      const [entries, currentUserEntryDoc, currentStateEntryDoc] = await Promise.all([
        buildEntryViewsFromSnapshot(board._id as Types.ObjectId),
        board.boardType === "individual" && user._id
          ? (LeaderboardEntryModel.findOne({ boardId: board._id, userId: user._id }).lean() as unknown as Promise<LeaderboardEntryDoc | null>)
          : null,
        board.boardType === "state" && currentStateKey
          ? (LeaderboardEntryModel.findOne({ boardId: board._id, competitorKey: currentStateKey }).lean() as unknown as Promise<LeaderboardEntryDoc | null>)
          : null
      ])

      return {
        boardId: String(board._id),
        boardType: board.boardType as "individual" | "state",
        period: board.period as "daily" | "weekly",
        periodKey: board.periodKey,
        startsAt: board.startsAt.toISOString(),
        endsAt: board.endsAt.toISOString(),
        headline: buildBoardHeadline(
          board.boardType as "individual" | "state",
          board.period as "daily" | "weekly"
        ),
        entries: entries.map((entry) => ({
          ...entry,
          isCurrentUser:
            entry.competitorType === "user" && currentUserEntryDoc
              ? entry.competitorKey === currentUserEntryDoc.competitorKey
              : false
        })),
        currentUserEntry: currentUserEntryDoc ? toSnapshotEntry(currentUserEntryDoc) : null,
        currentStateEntry: currentStateEntryDoc ? toSnapshotEntry(currentStateEntryDoc) : null
      } satisfies LeaderboardBoardView
    })
  )
}

export async function getLeaderboardStatusSummary() {
  await connectToDatabase()

  const [lastTrackerSyncDoc, lastMaterializedBoard] = await Promise.all([
    (TrackerConnectionModel.findOne({ provider: "lastfm", lastSyncAt: { $ne: null } })
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
}
