import { Types } from "mongoose"
import { getCurrentUserRecord } from "@/platform/auth/current-user"
import {
  LeaderboardBoardModel,
  LeaderboardRankSnapshotModel,
  LeaderboardScoreModel
} from "@/platform/db/models/leaderboards"
import { connectToDatabase } from "@/platform/db/mongoose"
import { getCurrentIndiaPeriods, getIndiaPeriod, type MissionCadence } from "@/platform/time/india-periods"
import type {
  LeaderboardBoardView,
  LeaderboardEntryView
} from "@/modules/leaderboards/types"

type LeaderboardEligibleUser = {
  _id: Types.ObjectId
  displayName: string
  username: string
  region?: {
    state?: string
    city?: string
  }
}

type ListLeaderboardOptions = {
  period?: "daily" | "weekly"
  scopeType?: "state" | "city"
  scopeKey?: string
}

function slugifyScope(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
}

export function buildStateScopeKey(state: string) {
  return `state:${slugifyScope(state)}`
}

export function buildCityScopeKey(state: string, city: string) {
  return `city:${slugifyScope(state)}:${slugifyScope(city)}`
}

function buildBoardHeadline(scopeType: "state" | "city", period: "daily" | "weekly", scopeLabel: string) {
  if (scopeType === "city") {
    return period === "daily"
      ? `${scopeLabel} fans climbing the daily mission race.`
      : `${scopeLabel} crews stacking points across the full week.`
  }

  return period === "daily"
    ? `${scopeLabel} is moving on today’s state board.`
    : `${scopeLabel} is being shaped by steady weekly completions.`
}

async function ensureLeaderboardBoard(
  scopeType: "state" | "city",
  scopeKey: string,
  scopeLabel: string,
  cadence: MissionCadence
) {
  const period = getIndiaPeriod(cadence)

  return LeaderboardBoardModel.findOneAndUpdate(
    {
      scopeType,
      scopeKey,
      periodKey: period.periodKey
    },
    {
      $set: {
        scopeType,
        scopeKey,
        scopeLabel,
        period: cadence,
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

async function ensureLeaderboardsForUser(user: LeaderboardEligibleUser) {
  const state = user.region?.state?.trim()
  const city = user.region?.city?.trim()

  if (!state || !city) {
    return []
  }

  return Promise.all([
    ensureLeaderboardBoard("city", buildCityScopeKey(state, city), city, "daily"),
    ensureLeaderboardBoard("city", buildCityScopeKey(state, city), city, "weekly"),
    ensureLeaderboardBoard("state", buildStateScopeKey(state), state, "daily"),
    ensureLeaderboardBoard("state", buildStateScopeKey(state), state, "weekly")
  ])
}

async function buildEntryViewsFromSnapshot(boardId: Types.ObjectId) {
  const snapshot = (await LeaderboardRankSnapshotModel.findOne({ boardId })
    .sort({ generatedAt: -1 })
    .lean()) as { topEntries?: LeaderboardEntryView[] } | null

  return (snapshot?.topEntries ?? []) as LeaderboardEntryView[]
}

export async function materializeLeaderboards(options: {
  boardIds?: Types.ObjectId[]
  periodKey?: string
} = {}) {
  await connectToDatabase()

  const filter: Record<string, unknown> = options.boardIds?.length
    ? { _id: { $in: options.boardIds } }
    : { isDirty: true }

  if (options.periodKey) {
    filter.periodKey = options.periodKey
  }

  const boards = await LeaderboardBoardModel.find(filter).lean()

  for (const board of boards) {
    const scores = await LeaderboardScoreModel.find({ boardId: board._id })
      .sort({ score: -1, lastQualifiedAt: 1, displayName: 1, _id: 1 })
      .lean()

    if (scores.length > 0) {
      await Promise.all(
        scores.map((score, index) =>
          LeaderboardScoreModel.updateOne(
            { _id: score._id },
            {
              $set: {
                previousRank: score.rank ?? null,
                rank: index + 1
              }
            }
          )
        )
      )
    }

    const refreshedScores = await LeaderboardScoreModel.find({ boardId: board._id })
      .sort({ rank: 1, score: -1, lastQualifiedAt: 1, _id: 1 })
      .lean()

    const topEntries: LeaderboardEntryView[] = refreshedScores.slice(0, 10).map((score) => ({
      rank: score.rank ?? 0,
      userId: String(score.userId),
      displayName: score.displayName,
      score: score.score,
      state: score.state,
      city: score.city,
      streakDays: score.streakDays ?? 0,
      previousRank: score.previousRank ?? null
    }))

    await LeaderboardRankSnapshotModel.create({
      boardId: board._id,
      topEntries,
      generatedAt: new Date(),
      totalParticipants: refreshedScores.length
    })

    await LeaderboardBoardModel.updateOne({ _id: board._id }, { $set: { isDirty: false } })
  }

  return {
    boardsMaterialized: boards.length
  }
}

export async function applyMissionRewardToLeaderboards(input: {
  user: LeaderboardEligibleUser
  cadence: MissionCadence
  points: number
  streakDays: number
  qualifiedAt?: Date
}) {
  await connectToDatabase()

  if (!input.user.region?.state || !input.user.region?.city || input.points <= 0) {
    return []
  }

  const boards = await ensureLeaderboardsForUser(input.user)
  const currentPeriod = getIndiaPeriod(input.cadence)
  const matchingBoards = boards.filter((board) => board.periodKey === currentPeriod.periodKey)

  const qualifiedAt = input.qualifiedAt ?? new Date()

  await Promise.all(
    matchingBoards.map((board) =>
      Promise.all([
        LeaderboardScoreModel.findOneAndUpdate(
          {
            boardId: board._id,
            userId: input.user._id
          },
          {
            $inc: { score: input.points },
            $set: {
              displayName: input.user.displayName,
              username: input.user.username,
              state: input.user.region?.state ?? "",
              city: input.user.region?.city ?? "",
              streakDays: input.streakDays,
              lastQualifiedAt: qualifiedAt
            }
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        ),
        LeaderboardBoardModel.updateOne({ _id: board._id }, { $set: { isDirty: true } })
      ])
    )
  )

  return matchingBoards.map((board) => board._id as Types.ObjectId)
}

export async function listLeaderboards(
  options: ListLeaderboardOptions = {}
): Promise<LeaderboardBoardView[]> {
  await connectToDatabase()

  const user = await getCurrentUserRecord()
  await ensureLeaderboardsForUser(user as unknown as LeaderboardEligibleUser)

  const periods = getCurrentIndiaPeriods()
  const allowedPeriodKeys = options.period
    ? [periods[options.period].periodKey]
    : [periods.daily.periodKey, periods.weekly.periodKey]

  const filter: Record<string, unknown> = {
    scopeType: { $in: ["city", "state"] },
    periodKey: { $in: allowedPeriodKeys }
  }

  if (options.scopeType) {
    filter.scopeType = options.scopeType
  }

  if (options.scopeKey) {
    filter.scopeKey = options.scopeKey
  }

  const boards = await LeaderboardBoardModel.find(filter)
    .sort({ scopeType: 1, period: 1, scopeLabel: 1 })
    .lean()

  const dirtyBoardIds = boards.filter((board) => board.isDirty).map((board) => board._id as Types.ObjectId)

  if (dirtyBoardIds.length > 0) {
    await materializeLeaderboards({ boardIds: dirtyBoardIds })
  }

  const userScores = await LeaderboardScoreModel.find({
    boardId: { $in: boards.map((board) => board._id) },
    userId: user._id
  }).lean()

  const userScoreMap = new Map(userScores.map((score) => [String(score.boardId), score]))

  const sortedBoards = [...boards].sort((left, right) => {
    const scopeOrder = { city: 0, state: 1 }
    const periodOrder = { daily: 0, weekly: 1 }

    const scopeDelta =
      scopeOrder[left.scopeType as keyof typeof scopeOrder] -
      scopeOrder[right.scopeType as keyof typeof scopeOrder]

    if (scopeDelta !== 0) {
      return scopeDelta
    }

    const periodDelta =
      periodOrder[left.period as keyof typeof periodOrder] -
      periodOrder[right.period as keyof typeof periodOrder]

    if (periodDelta !== 0) {
      return periodDelta
    }

    return left.scopeLabel.localeCompare(right.scopeLabel)
  })

  return Promise.all(
    sortedBoards.map(async (board) => {
      const entries = await buildEntryViewsFromSnapshot(board._id as Types.ObjectId)
      const currentUserScore = userScoreMap.get(String(board._id))

      return {
        boardId: String(board._id),
        scopeType: board.scopeType as "state" | "city",
        scopeKey: board.scopeKey,
        scopeLabel: board.scopeLabel,
        period: board.period as "daily" | "weekly",
        periodKey: board.periodKey,
        startsAt: board.startsAt.toISOString(),
        endsAt: board.endsAt.toISOString(),
        headline: buildBoardHeadline(
          board.scopeType as "state" | "city",
          board.period as "daily" | "weekly",
          board.scopeLabel
        ),
        entries: entries.map((entry) => ({
          ...entry,
          isCurrentUser: entry.userId === String(user._id)
        })),
        currentUserEntry: currentUserScore
          ? {
              rank: currentUserScore.rank ?? 0,
              userId: String(currentUserScore.userId),
              displayName: currentUserScore.displayName,
              score: currentUserScore.score,
              state: currentUserScore.state,
              city: currentUserScore.city,
              streakDays: currentUserScore.streakDays ?? 0,
              previousRank: currentUserScore.previousRank ?? null,
              isCurrentUser: true
            }
          : null
      } satisfies LeaderboardBoardView
    })
  )
}
