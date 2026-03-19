import type { ActivityMapView } from "@/modules/activity-map/types"
import type { ChartCard } from "@/modules/charts/types"
import type { EventView } from "@/modules/events/service"
import type { FanProjectView } from "@/modules/fan-projects/service"
import type { GuideQuickReadView } from "@/modules/guides/service"
import type { LeaderboardBoardView } from "@/modules/leaderboards/types"
import type { MissionCard } from "@/modules/missions/types"
import type { VotingGuideView } from "@/modules/voting-guides/service"

export type LandingPageData = {
  isAuthenticated: boolean
  missions: MissionCard[]
  leadMission?: MissionCard
  featuredBoard?: LeaderboardBoardView
  stateBoard?: LeaderboardBoardView
  chartSnapshot?: ChartCard
  guideQuickReads: GuideQuickReadView[]
  votingGuides: VotingGuideView[]
  projects: FanProjectView[]
  events: EventView[]
  dailyActivityMap: ActivityMapView
  weeklyActivityMap: ActivityMapView
}
