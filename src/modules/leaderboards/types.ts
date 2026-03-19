export type LeaderboardEntryView = {
  rank: number
  competitorType: "user" | "state"
  competitorKey: string
  userId?: string
  stateKey?: string
  displayName: string
  score: number
  previousRank?: number | null
  isCurrentUser?: boolean
}

export type LeaderboardBoardView = {
  boardId: string
  boardType: "individual" | "state"
  period: "daily" | "weekly"
  periodKey: string
  startsAt: string
  endsAt: string
  headline: string
  entries: LeaderboardEntryView[]
  totalParticipants: number
  currentUserEntry?: LeaderboardEntryView | null
  currentStateEntry?: LeaderboardEntryView | null
}
