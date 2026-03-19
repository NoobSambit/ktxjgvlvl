import Link from "next/link"
import { ArrowRight, AudioWaveform, BarChart3, BookOpen, HeartHandshake, Trophy } from "lucide-react"
import { formatCompactNumber } from "@/lib/utils"
import type { ChartCard } from "@/modules/charts/types"
import type { VotingGuideView } from "@/modules/voting-guides/service"
import type { LeaderboardBoardView } from "@/modules/leaderboards/types"
import type { MissionCard } from "@/modules/missions/types"

type LandingFeatureGridProps = {
  leadMission?: MissionCard
  chartSnapshot?: ChartCard
  stateBoard?: LeaderboardBoardView
  featuredGuide?: VotingGuideView
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  accentClass,
  footer,
  featured = false
}: {
  title: string
  description: string
  icon: typeof AudioWaveform
  href: string
  accentClass: string
  footer: string
  featured?: boolean
}) {
  return (
    <Link
      className={[
        "group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]",
        featured ? "lg:col-span-2 lg:p-8" : ""
      ].join(" ")}
      href={href}
    >
      <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 ${accentClass}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className={featured ? "text-2xl font-semibold text-white" : "text-xl font-semibold text-white"}>{title}</h3>
      <p className={featured ? "mt-3 max-w-2xl text-base leading-7 text-white/65" : "mt-3 text-sm leading-6 text-white/62"}>
        {description}
      </p>
      <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(265,80%,78%)] transition-transform group-hover:translate-x-1">
        <span>{footer}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  )
}

export function LandingFeatureGrid({
  leadMission,
  chartSnapshot,
  stateBoard,
  featuredGuide
}: LandingFeatureGridProps) {
  const topChartEntry = chartSnapshot?.entries[0]
  const topStateEntry = stateBoard?.entries[0]

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(25,90%,60%)]">Ecosystem of Impact</p>
        <div className="max-w-3xl space-y-3">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need in one place.
          </h2>
          <p className="text-base leading-7 text-white/68">
            Keep up with live goals, chart movement, state rankings, guides, and community projects without jumping
            between a bunch of separate pages first.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FeatureCard
          accentClass="bg-[linear-gradient(135deg,rgba(185,142,255,0.34),rgba(110,68,170,0.18))]"
          description={leadMission?.description ?? "The mission hub is ready to surface the current India-wide target once a live cell is generated."}
          featured
          footer={leadMission ? `${leadMission.aggregateProgress}/${leadMission.goalUnits} progress so far` : "Open missions"}
          href="/missions"
          icon={AudioWaveform}
          title={leadMission?.title ?? "Streaming Missions"}
        />
        <FeatureCard
          accentClass="bg-[linear-gradient(135deg,rgba(45,197,186,0.3),rgba(20,70,75,0.22))]"
          description={
            topChartEntry
              ? `BTS music chart performance tracking is being refined so this space can show cleaner trend signals, milestone snapshots, and platform-wise momentum soon.`
              : "BTS music chart performance tracking is coming soon with clearer trend snapshots, milestone watchlists, and momentum signals across active songs."
          }
          footer="Coming soon"
          href="/charts"
          icon={BarChart3}
          title="BTS Music Chart Performance"
        />
        <FeatureCard
          accentClass="bg-[linear-gradient(135deg,rgba(255,153,51,0.3),rgba(98,58,20,0.22))]"
          description={
            topStateEntry
              ? `${topStateEntry.displayName} is leading the ${stateBoard?.period ?? "current"} state ranking right now.`
              : "See which parts of India are pushing the hardest and how close the rankings are."
          }
          footer={topStateEntry ? `${formatCompactNumber(topStateEntry.score)} points at the top` : "Explore rankings"}
          href="/leaderboards"
          icon={Trophy}
          title="State Leaderboards"
        />
        <FeatureCard
          accentClass="bg-[linear-gradient(135deg,rgba(241,185,77,0.28),rgba(96,70,22,0.2))]"
          description={
            featuredGuide
              ? `${featuredGuide.title} sits inside a broader guide hub for streaming rules, buying basics, and platform-specific walkthroughs.`
              : "Clear guides for streaming and buying support, built to keep fans aligned before comeback pushes and chart goals."
          }
          footer={featuredGuide?.updatedLabel ?? "Open guide hub"}
          href="/guide"
          icon={BookOpen}
          title="Streaming and Buying Guides"
        />
        <FeatureCard
          accentClass="bg-[linear-gradient(135deg,rgba(255,120,164,0.28),rgba(93,30,58,0.18))]"
          description="Fan projects will return here in a more curated format once the community board is ready. For now, this area stays intentionally parked as coming soon."
          footer="Coming soon"
          href="/projects"
          icon={HeartHandshake}
          title="Fan Projects"
        />
      </div>
    </section>
  )
}
