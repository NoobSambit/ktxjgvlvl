import { LandingPage as MarketingLandingPage } from "@/components/marketing/landing-page"
import { getSessionUser } from "@/platform/auth/session"
import { getActivityMapView } from "@/modules/activity-map/service"
import { listChartCards } from "@/modules/charts/service"
import { listEvents } from "@/modules/events/service"
import { listFanProjects } from "@/modules/fan-projects/service"
import { listGuideQuickReads } from "@/modules/guides/service"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { listMissionCards } from "@/modules/missions/service"
import { listVotingGuides } from "@/modules/voting-guides/service"

export const dynamic = "force-dynamic"

export default async function MarketingPage() {
  const [session, charts, leaderboards, missions, events, projects, guideQuickReads, votingGuides, dailyActivityMap, weeklyActivityMap] = await Promise.all([
    getSessionUser(),
    listChartCards(),
    listLeaderboards(),
    listMissionCards(),
    listEvents(),
    listFanProjects(),
    listGuideQuickReads(),
    listVotingGuides(),
    getActivityMapView("daily"),
    getActivityMapView("weekly")
  ])

  const leadMission =
    missions.find(
      (mission) =>
        mission.missionCellKey === "daily_india" && mission.mechanicType === "track_streams"
    ) ??
    missions.find((mission) => mission.missionCellKey === "daily_india") ??
    missions[0]
  const featuredBoard =
    leaderboards.find((board) => board.boardType === "individual" && board.period === "daily") ??
    leaderboards[0]
  const stateBoard =
    leaderboards.find((board) => board.boardType === "state" && board.period === "weekly") ??
    leaderboards.find((board) => board.boardType === "state") ??
    leaderboards[0]

  return (
    <MarketingLandingPage
      data={{
        chartSnapshot: charts[0],
        dailyActivityMap,
        events,
        featuredBoard,
        guideQuickReads,
        isAuthenticated: Boolean(session?.isAuthenticated),
        leadMission,
        missions,
        projects,
        stateBoard,
        votingGuides,
        weeklyActivityMap
      }}
    />
  )
}
