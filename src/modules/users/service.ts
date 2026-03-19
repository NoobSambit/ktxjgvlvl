import { getCurrentUserRecord } from "@/platform/auth/current-user"
import { listLeaderboards } from "@/modules/leaderboards/service"
import type { LeaderboardBoardView } from "@/modules/leaderboards/types"
import { summarizeUserLocation } from "@/modules/locations/service"
import { listMissionCards } from "@/modules/missions/service"
import type { MissionCard } from "@/modules/missions/types"
import type { UserProfileView } from "@/modules/users/types"

type CurrentUserProfileOptions = {
  missions?: MissionCard[]
  boards?: LeaderboardBoardView[]
}

function buildCurrentUserProfileView(
  user: Awaited<ReturnType<typeof getCurrentUserRecord>>,
  missions: MissionCard[],
  boards: LeaderboardBoardView[]
): UserProfileView {
  const weeklyMissions = missions.filter((mission) => mission.missionCellKey === "weekly_individual")
  const featuredWeeklyMission =
    weeklyMissions.find((mission) => mission.mechanicType === "track_streams") ?? weeklyMissions[0]
  const focusTrack =
    featuredWeeklyMission?.targets.find((target) => target.kind === "track")?.title ??
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
    weeklyMissionProgress: weeklyMissions.reduce((sum, mission) => sum + mission.aggregateProgress, 0),
    weeklyMissionGoal: weeklyMissions.reduce((sum, mission) => sum + mission.goalUnits, 0),
    individualDailyRank: individualDailyBoard?.currentUserEntry?.rank ?? null,
    individualWeeklyRank: individualWeeklyBoard?.currentUserEntry?.rank ?? null,
    stateDailyRank: stateDailyBoard?.currentStateEntry?.rank ?? null,
    stateWeeklyRank: stateWeeklyBoard?.currentStateEntry?.rank ?? null,
    focusTrack
  }
}

export async function getCurrentUserProfile(
  options: CurrentUserProfileOptions = {}
): Promise<UserProfileView> {
  const user = await getCurrentUserRecord()
  const [missions, boards] = await Promise.all([
    options.missions ? Promise.resolve(options.missions) : listMissionCards(),
    options.boards ? Promise.resolve(options.boards) : listLeaderboards()
  ])

  return buildCurrentUserProfileView(user, missions, boards)
}
