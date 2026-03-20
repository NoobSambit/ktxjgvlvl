import { DashboardPanel, DashboardPill } from "@/components/dashboard/dashboard-shell"
import { LoadingBlock } from "@/components/shared/premium-loading"

export default function MissionsLoading() {
  return (
    <div className="space-y-3 sm:space-y-6 lg:space-y-8">
      <section>
        <DashboardPanel className="overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(116,59,255,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,156,83,0.18),transparent_28%)]" />
          <div className="relative grid gap-4 p-4 sm:gap-5 sm:p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] xl:gap-8 xl:p-8">
            <div className="min-w-0 space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <DashboardPill tone="purple">Mission control</DashboardPill>
                <DashboardPill tone="neutral">Daily reset 12:00 AM IST</DashboardPill>
                <DashboardPill tone="neutral">Weekly reset Monday 12:00 AM IST</DashboardPill>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-[14ch] font-heading text-[clamp(2rem,4vw,2.9rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white">
                  Missions made simple
                </h1>
                <p className="max-w-3xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                  Your streams still earn points as usual. Missions are extra goals on top of that, with a bonus when
                  you finish them.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <DashboardPill tone="teal">Signed in</DashboardPill>
                <DashboardPill tone="purple">Connect your app</DashboardPill>
                <DashboardPill tone="neutral">Scoring guide</DashboardPill>
              </div>

              <LoadingBlock className="h-12 rounded-[1.1rem]" />

              <div className="rounded-[1.05rem] border border-[hsl(154,75%,55%)]/18 bg-[hsl(154,75%,55%)]/10 px-3.5 py-2.5 text-sm leading-6 text-[hsl(154,80%,72%)] sm:px-4 sm:py-3">
                Pick a section below and focus on one mission at a time.
              </div>
            </div>

            <div className="min-w-0 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingBlock className="h-32 rounded-[1.2rem]" key={index} />
              ))}
            </div>
          </div>
        </DashboardPanel>
      </section>

      <LoadingBlock className="h-72 rounded-[1.5rem]" />
      <LoadingBlock className="h-[46rem] rounded-[1.5rem]" />
      <LoadingBlock className="h-80 rounded-[1.5rem]" />
    </div>
  )
}
