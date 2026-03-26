import type { Metadata } from "next"
import { SocialPostFrame } from "@/components/social/social-post-frame"

export const metadata: Metadata = {
  title: "IndiaForBTS | Mission + Sync + Leaderboard Post",
  description: "Social story frame explaining how mission progress, tracker sync, and leaderboards work in IndiaForBTS."
}

export default function MissionSyncLeaderboardPostPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_24%),linear-gradient(180deg,#080511_0%,#05040b_100%)] px-3 py-3 sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.08),transparent_18%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.07),transparent_20%)]" />
      <div className="relative flex min-h-[calc(100vh-1.5rem)] items-center justify-center sm:min-h-[calc(100vh-2.5rem)]">
        <SocialPostFrame />
      </div>
    </main>
  )
}
