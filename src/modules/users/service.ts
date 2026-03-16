import { getCurrentUserRecord } from "@/platform/auth/current-user"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { summarizeUserLocation } from "@/modules/locations/service"
import { listMissionCards } from "@/modules/missions/service"
import type { UserProfileView } from "@/modules/users/types"

export async function getCurrentUserProfile(): Promise<UserProfileView> {
  const user = await getCurrentUserRecord()
  const [missions, boards] = await Promise.all([listMissionCards(), listLeaderboards()])

  const weeklyMission = missions.find((mission) => mission.missionCellKey === "weekly_individual")
  const focusTrack =
    weeklyMission?.targets.find((target) => target.kind === "track")?.title ??
    missions.find((mission) => mission.targets[0]?.kind === "track")?.targets[0]?.title ??
    "No mission focus yet"

  const individualDailyBoard = boards.find(
    (board) => board.boardType === "individual" && board.period === "daily"
  )
  const individualWeeklyBoard = boards.find(
    (board) => board.boardType === "individual" && board.period === "weekly"
  )
  const stateDailyBoard = boards.find((board) => board.boardType === "state" && board.period === "daily")
  const stateWeeklyBoard = boards.find((board) => board.boardType === "state" && board.period === "weekly")
  const location = summarizeUserLocation(user.region)

  return {
    displayName: user.displayName,
    stateKey: location.stateKey,
    stateLabel: location.stateLabel ?? "Unknown state",
    cityKey: location.cityKey,
    cityLabel: location.cityLabel,
    cityMode: location.cityMode,
    locationNeedsReview: location.locationNeedsReview,
    suggestedCityKey: location.suggestedCityKey,
    suggestedCityLabel: location.suggestedCityLabel,
    regionConfirmed: Boolean(user.region?.state),
    weeklyMissionProgress: weeklyMission?.aggregateProgress ?? 0,
    weeklyMissionGoal: weeklyMission?.goalUnits ?? 0,
    individualDailyRank: individualDailyBoard?.currentUserEntry?.rank ?? null,
    individualWeeklyRank: individualWeeklyBoard?.currentUserEntry?.rank ?? null,
    stateDailyRank: stateDailyBoard?.currentStateEntry?.rank ?? null,
    stateWeeklyRank: stateWeeklyBoard?.currentStateEntry?.rank ?? null,
    focusTrack
  }
}
