import { Suspense, cache } from "react"
import {
  LeaderboardsBoardsSection,
  LeaderboardsHero,
  ScoreSystemPanel
} from "@/components/leaderboards/leaderboards-experience"
import {
  LeaderboardsBoardsSkeleton,
  LeaderboardsHeroSkeleton
} from "@/components/leaderboards/leaderboards-loading"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { getStreamPointValue } from "@/modules/platform-settings/service"

export const dynamic = "force-dynamic"

const getCachedLeaderboards = cache(async () => listLeaderboards())
const getCachedStreamPointValue = cache(async () => getStreamPointValue())

async function LeaderboardsHeroSection() {
  const [boards, streamPointValue] = await Promise.all([getCachedLeaderboards(), getCachedStreamPointValue()])

  return <LeaderboardsHero boards={boards} streamPointValue={streamPointValue} />
}

async function LeaderboardsBoardsSectionContent() {
  const boards = await getCachedLeaderboards()

  return <LeaderboardsBoardsSection boards={boards} />
}

export default function LeaderboardsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <Suspense fallback={<LeaderboardsHeroSkeleton />}>
        <LeaderboardsHeroSection />
      </Suspense>

      <ScoreSystemPanel />

      <Suspense fallback={<LeaderboardsBoardsSkeleton />}>
        <LeaderboardsBoardsSectionContent />
      </Suspense>
    </div>
  )
}
