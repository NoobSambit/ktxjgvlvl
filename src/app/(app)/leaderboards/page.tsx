import { LeaderboardsExperience } from "@/components/leaderboards/leaderboards-experience"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { getStreamPointValue } from "@/modules/platform-settings/service"

export const dynamic = "force-dynamic"

export default async function LeaderboardsPage() {
  const [boards, streamPointValue] = await Promise.all([listLeaderboards(), getStreamPointValue()])

  return <LeaderboardsExperience boards={boards} streamPointValue={streamPointValue} />
}
