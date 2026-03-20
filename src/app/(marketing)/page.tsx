import Link from "next/link"
import { Suspense, cache } from "react"
import { ArrowRight } from "lucide-react"
import { LandingBenefits } from "@/components/marketing/landing-benefits"
import { LandingFeatureGrid } from "@/components/marketing/landing-feature-grid"
import { LandingHero } from "@/components/marketing/landing-hero"
import { LandingIndiaPower } from "@/components/marketing/landing-india-power"
import {
  MarketingBenefitsSkeleton,
  MarketingCtaSkeleton,
  MarketingFeatureGridSkeleton,
  MarketingHeroSkeleton,
  MarketingIndiaPowerSkeleton
} from "@/components/marketing/marketing-loading"
import { getSessionUser } from "@/platform/auth/session"
import { getActivityMapView } from "@/modules/activity-map/service"
import { listChartCards } from "@/modules/charts/service"
import { listEvents } from "@/modules/events/service"
import { listGuideQuickReads } from "@/modules/guides/service"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { listMissionPreviewCards } from "@/modules/missions/service"
import { listVotingGuides } from "@/modules/voting-guides/service"

export const dynamic = "force-dynamic"

const getCachedSession = cache(async () => getSessionUser())
const getCachedCharts = cache(async () => listChartCards())
const getCachedLeaderboards = cache(async () => listLeaderboards())
const getCachedMissions = cache(async () => listMissionPreviewCards())
const getCachedEvents = cache(async () => listEvents())
const getCachedGuides = cache(async () => listGuideQuickReads())
const getCachedVotingGuides = cache(async () => listVotingGuides())
const getCachedDailyActivityMap = cache(async () => getActivityMapView("daily"))
const getCachedWeeklyActivityMap = cache(async () => getActivityMapView("weekly"))

function getMarketingLeadMission(missions: Awaited<ReturnType<typeof listMissionPreviewCards>>) {
  const leadMission =
    missions.find(
      (mission) =>
        mission.missionCellKey === "daily_india" && mission.mechanicType === "track_streams"
    ) ??
    missions.find((mission) => mission.missionCellKey === "daily_india") ??
    missions[0]

  return leadMission
}

function getMarketingFeaturedBoard(boards: Awaited<ReturnType<typeof listLeaderboards>>) {
  const featuredBoard =
    boards.find((board) => board.boardType === "individual" && board.period === "daily") ??
    boards[0]

  return featuredBoard
}

function getMarketingStateBoard(boards: Awaited<ReturnType<typeof listLeaderboards>>) {
  const stateBoard =
    boards.find((board) => board.boardType === "state" && board.period === "weekly") ??
    boards.find((board) => board.boardType === "state") ??
    boards[0]

  return stateBoard
}

async function MarketingHeroSection() {
  const [session, charts, boards, missions, guideQuickReads, dailyActivityMap] = await Promise.all([
    getCachedSession(),
    getCachedCharts(),
    getCachedLeaderboards(),
    getCachedMissions(),
    getCachedGuides(),
    getCachedDailyActivityMap()
  ])

  return (
    <LandingHero
      chartSnapshot={charts[0]}
      dailyActivityMap={dailyActivityMap}
      featuredBoard={getMarketingFeaturedBoard(boards)}
      guideQuickReads={guideQuickReads}
      isAuthenticated={Boolean(session?.isAuthenticated)}
      leadMission={getMarketingLeadMission(missions)}
      missions={missions}
      stateBoard={getMarketingStateBoard(boards)}
    />
  )
}

async function MarketingFeatureGridSection() {
  const [charts, boards, missions, votingGuides] = await Promise.all([
    getCachedCharts(),
    getCachedLeaderboards(),
    getCachedMissions(),
    getCachedVotingGuides()
  ])

  return (
    <LandingFeatureGrid
      chartSnapshot={charts[0]}
      featuredGuide={votingGuides[0]}
      leadMission={getMarketingLeadMission(missions)}
      stateBoard={getMarketingStateBoard(boards)}
    />
  )
}

async function MarketingIndiaPowerSection() {
  const weeklyActivityMap = await getCachedWeeklyActivityMap()

  return <LandingIndiaPower weeklyActivityMap={weeklyActivityMap} />
}

async function MarketingBenefitsSection() {
  const [events, guideQuickReads, missions] = await Promise.all([
    getCachedEvents(),
    getCachedGuides(),
    getCachedMissions()
  ])

  return <LandingBenefits events={events} guideQuickReads={guideQuickReads} missions={missions} />
}

async function MarketingCtaSection() {
  const session = await getCachedSession()
  const isAuthenticated = Boolean(session?.isAuthenticated)

  return (
    <section className="px-1 pb-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(108,69,192,0.82),rgba(39,22,70,0.94))] px-6 py-12 text-center shadow-[0_40px_100px_-70px_rgba(105,66,194,0.8)] sm:px-8 sm:py-14">
        <div className="absolute -right-14 top-0 h-44 w-44 rounded-full bg-[hsl(25,90%,60%)]/18 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/8 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <h2 className="font-heading text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Join the next India-wide push.
            <span className="block">Stream smarter, together.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            Follow live goals, check the charts, and stream alongside fans across the country from one clean home base.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link className="btn-bts bg-white px-7 py-3 text-sm font-semibold text-[hsl(265,40%,18%)] hover:bg-white/92" href={isAuthenticated ? "/dashboard" : "/signup"}>
              {isAuthenticated ? "Go to Dashboard" : "Create your account"}
            </Link>
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-white/88 hover:text-white" href="/missions">
              See live goals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function MarketingPage() {
  return (
    <main className="relative space-y-16 py-8 sm:space-y-20 sm:py-10 md:py-14">
      <Suspense fallback={<MarketingHeroSkeleton />}>
        <MarketingHeroSection />
      </Suspense>

      <Suspense fallback={<MarketingFeatureGridSkeleton />}>
        <MarketingFeatureGridSection />
      </Suspense>

      <Suspense fallback={<MarketingIndiaPowerSkeleton />}>
        <MarketingIndiaPowerSection />
      </Suspense>

      <Suspense fallback={<MarketingBenefitsSkeleton />}>
        <MarketingBenefitsSection />
      </Suspense>

      <Suspense fallback={<MarketingCtaSkeleton />}>
        <MarketingCtaSection />
      </Suspense>
    </main>
  )
}
