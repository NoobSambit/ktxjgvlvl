export type UserProfileView = {
  displayName: string
  stateKey?: string
  stateLabel: string
  cityKey?: string
  cityLabel?: string
  cityMode: "confirmed" | "ip_fallback" | "missing"
  locationNeedsReview: boolean
  suggestedCityKey?: string
  suggestedCityLabel?: string
  regionConfirmed: boolean
  weeklyMissionProgress: number
  weeklyMissionGoal: number
  individualDailyRank: number | null
  individualWeeklyRank: number | null
  stateDailyRank: number | null
  stateWeeklyRank: number | null
  focusTrack: string
}
