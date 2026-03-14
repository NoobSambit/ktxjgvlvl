export type LeaderboardEntryView = {
  rank: number
  userId?: string
  displayName: string
  score: number
  state: string
  city: string
  streakDays: number
  previousRank?: number | null
  isCurrentUser?: boolean
}

export type LeaderboardBoardView = {
  boardId: string
  scopeType: "state" | "city"
  scopeKey: string
  scopeLabel: string
  period: "daily" | "weekly"
  periodKey: string
  startsAt: string
  endsAt: string
  headline: string
  entries: LeaderboardEntryView[]
  currentUserEntry?: LeaderboardEntryView | null
}
