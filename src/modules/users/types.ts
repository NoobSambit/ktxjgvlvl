export type UserProfileView = {
  displayName: string
  state: string
  city: string
  regionConfirmed: boolean
  streakDays: number
  weeklyStreams: number
  weeklyGoal: number
  stateRank: number | null
  cityRank: number | null
  focusTrack: string
}
