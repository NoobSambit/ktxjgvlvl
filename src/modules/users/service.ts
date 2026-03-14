import { getCurrentUserRecord } from "@/platform/auth/current-user"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { listMissionCards } from "@/modules/missions/service"
import type { UserProfileView } from "@/modules/users/types"

export async function getCurrentUserProfile(): Promise<UserProfileView> {
  const user = await getCurrentUserRecord()
  const [missions, boards] = await Promise.all([listMissionCards(), listLeaderboards()])

  const weeklyMissions = missions.filter((mission) => mission.cadence === "weekly")
  const weeklyStreams = weeklyMissions.reduce((sum, mission) => sum + mission.progress, 0)
  const weeklyGoal = weeklyMissions.reduce((sum, mission) => sum + mission.goal, 0)
  const cityBoard = boards.find((board) => board.scopeType === "city" && board.period === "weekly")
  const stateBoard = boards.find((board) => board.scopeType === "state" && board.period === "weekly")
  const focusTrack =
    weeklyMissions.find((mission) => mission.targets[0]?.kind === "track")?.targets[0]?.title ??
    missions.find((mission) => mission.targets[0]?.kind === "track")?.targets[0]?.title ??
    "No mission focus yet"

  return {
    displayName: user.displayName,
    state: user.region?.state ?? "Unknown state",
    city: user.region?.city ?? "Unknown city",
    regionConfirmed: Boolean(user.region?.state && user.region?.city),
    streakDays:
      cityBoard?.currentUserEntry?.streakDays ??
      stateBoard?.currentUserEntry?.streakDays ??
      0,
    weeklyStreams,
    weeklyGoal,
    stateRank: stateBoard?.currentUserEntry?.rank ?? null,
    cityRank: cityBoard?.currentUserEntry?.rank ?? null,
    focusTrack
  }
}
