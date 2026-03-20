import type { LucideIcon } from "lucide-react"
import { CalendarClock, Clock3, Crown, Expand, Sparkles, Trophy, Users } from "lucide-react"
import { DashboardPanel, DashboardPill } from "@/components/dashboard/dashboard-shell"
import { LoadingBlock } from "@/components/shared/premium-loading"

function OverviewShellCard({
  icon: Icon,
  label,
  caption,
  value,
  loading = false
}: {
  icon: LucideIcon
  label: string
  caption: string
  value?: string
  loading?: boolean
}) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.2rem] sm:p-4">
      <div className="flex items-center gap-1.5 text-white/54 sm:gap-2">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px] sm:tracking-[0.18em]">
          {label}
        </span>
      </div>
      {loading ? (
        <LoadingBlock className="mt-3 h-8 w-28 rounded-full sm:h-9 sm:w-32" />
      ) : (
        <>
          <p className="mt-2 font-heading text-[1.02rem] font-semibold leading-tight tracking-tight text-white sm:hidden">
            {value}
          </p>
          <p className="mt-3 hidden font-heading text-xl font-semibold tracking-tight text-white sm:block sm:text-2xl">
            {value}
          </p>
        </>
      )}
      <p className="mt-2 text-[11px] leading-4 text-white/50 sm:text-xs sm:leading-5">{caption}</p>
    </div>
  )
}

export function LeaderboardsHeroSkeleton() {
  return (
    <DashboardPanel className="overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,63,215,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,153,87,0.14),transparent_28%)]" />
      <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] xl:gap-8 xl:p-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <DashboardPill icon={Trophy} tone="purple">
              Leaderboards
            </DashboardPill>
            <DashboardPill icon={Sparkles} tone="neutral">
              Live boards
            </DashboardPill>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-[12ch] font-heading text-[2.5rem] font-semibold leading-[0.96] tracking-[-0.05em] text-white sm:text-[3.8rem]">
              See who is leading right now
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-white/68 sm:text-base sm:leading-7">
              Daily and weekly rankings stay live for both fans and states across India. Stream points count in both
              periods, but mission rewards only land on the matching daily or weekly board.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(265,70%,65%)]/24 bg-[hsl(265,70%,65%)]/10 px-4 py-2 text-sm font-medium text-[hsl(277,100%,88%)]">
              <Sparkles className="h-4 w-4" />
              Open scoring guide
            </div>
            <DashboardPill tone="purple">Daily Individual</DashboardPill>
            <DashboardPill tone="saffron">Weekly Individual</DashboardPill>
            <DashboardPill tone="teal">Daily State</DashboardPill>
            <DashboardPill tone="rose">Weekly State</DashboardPill>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <OverviewShellCard
            caption="Every day resets at midnight India time."
            icon={CalendarClock}
            label="Daily reset"
            value="12:00 AM IST"
          />
          <OverviewShellCard
            caption="Weekly rankings reset every Monday."
            icon={Clock3}
            label="Weekly reset"
            value="Monday 12:00 AM IST"
          />
          <OverviewShellCard
            caption="Your live personal rank is loading."
            icon={Crown}
            label="Best personal rank"
            loading
          />
          <OverviewShellCard caption="Your live state rank is loading." icon={Users} label="Best state rank" loading />
        </div>
      </div>
    </DashboardPanel>
  )
}

export function LeaderboardsScoreSystemShell() {
  return (
    <DashboardPanel className="overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,172,102,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(93,210,167,0.12),transparent_30%)]" />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <DashboardPill icon={Sparkles} tone="saffron">
            How scoring works
          </DashboardPill>
          <DashboardPill icon={Clock3} tone="neutral">
            Daily and weekly are separate reward windows
          </DashboardPill>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Verified stream</p>
            <p className="mt-2 text-sm leading-6 text-white/74">
              Every verified BTS-family stream adds the normal stream value to daily individual, weekly individual,
              daily state, and weekly state.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Mission reward</p>
            <p className="mt-2 text-sm leading-6 text-white/74">
              Mission rewards only go to the board for that mission&apos;s period. Daily mission rewards do not
              increase weekly totals, and weekly mission rewards do not backfill daily totals.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">What this means</p>
            <p className="mt-2 text-sm leading-6 text-white/74">
              A daily board can be ahead of the weekly board when you finish a daily mission but have not finished a
              weekly mission yet.
            </p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  )
}

function PodiumShellCard({ rank }: { rank: 1 | 2 | 3 }) {
  return (
    <DashboardPanel
      className={
        rank === 1
          ? "flex min-h-[13.25rem] flex-col justify-between p-3 text-center sm:min-h-[18rem] sm:p-6"
          : "flex min-h-[10.5rem] flex-col justify-between p-3 text-center sm:min-h-[14rem] sm:p-5"
      }
    >
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-white/72 sm:h-16 sm:w-16 sm:text-base">
            {rank}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-center">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/64">
              Rank #{rank}
            </span>
          </div>
          <LoadingBlock className="mx-auto h-5 w-24 rounded-full sm:h-7 sm:w-36" />
          <p className="text-[11px] leading-4 text-white/42 sm:text-sm sm:leading-6">Live entry is loading.</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center sm:mt-6">
        <LoadingBlock className="h-8 w-28 rounded-full sm:h-10 sm:w-32" />
      </div>
    </DashboardPanel>
  )
}

function BoardShellCard({
  title,
  kicker,
  description
}: {
  title: string
  kicker: string
  description: string
}) {
  return (
    <DashboardPanel className="flex min-h-[29rem] flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <DashboardPill tone="neutral">{kicker}</DashboardPill>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">{title}</h2>
            <p className="max-w-2xl text-sm leading-6 text-white/62">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <LoadingBlock className="h-8 w-24 rounded-full" />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/78">
            <Expand className="h-3.5 w-3.5" />
            Expand
          </div>
        </div>
      </div>

      <div className="mt-5 flex-1 rounded-[1.3rem] border border-white/10 bg-black/10 p-3 sm:p-4">
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-3"
              key={index}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/10 text-sm font-semibold text-white/72">
                {index + 1}
              </div>
              <div className="space-y-2">
                <LoadingBlock className="h-4 w-28 rounded-full" />
                <LoadingBlock className="h-3 w-16 rounded-full" />
              </div>
              <LoadingBlock className="h-4 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white/74">
        <p className="text-sm font-medium">Live placement refreshes here.</p>
        <LoadingBlock className="h-4 w-20 rounded-full" />
      </div>
    </DashboardPanel>
  )
}

export function LeaderboardsBoardsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <DashboardPanel className="overflow-visible p-5 sm:p-6 xl:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(126,85,220,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,154,86,0.1),transparent_28%)]" />
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <DashboardPill icon={Trophy} tone="purple">
                  Live podium
                </DashboardPill>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/64">
                  Top 3 podium
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-[2.4rem]">
                  Podium stays fixed
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
                  The live top-three layout stays visible even while leaderboard entries are still loading.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/82">
              <Expand className="h-4 w-4" />
              View full leaderboard
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,0.84fr)_minmax(0,1.08fr)_minmax(0,0.84fr)] items-end gap-2.5 sm:gap-4">
            <PodiumShellCard rank={2} />
            <PodiumShellCard rank={1} />
            <PodiumShellCard rank={3} />
          </div>
        </div>
      </DashboardPanel>

      <section className="grid gap-5 xl:grid-cols-2">
        <BoardShellCard
          description="Today&apos;s verified BTS streams plus today&apos;s personal mission rewards."
          kicker="Today&apos;s fan race"
          title="Daily Individual"
        />
        <BoardShellCard
          description="This week&apos;s verified BTS streams plus weekly mission rewards only."
          kicker="This week&apos;s fan race"
          title="Weekly Individual"
        />
        <BoardShellCard
          description="Today&apos;s state total from verified BTS streams and daily state rewards."
          kicker="Today&apos;s state race"
          title="Daily State"
        />
        <BoardShellCard
          description="This week&apos;s state total from verified BTS streams and weekly state rewards."
          kicker="This week&apos;s state race"
          title="Weekly State"
        />
      </section>
    </div>
  )
}

export function LeaderboardsLoadingPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <LeaderboardsHeroSkeleton />
      <LeaderboardsScoreSystemShell />
      <LeaderboardsBoardsSkeleton />
    </div>
  )
}
