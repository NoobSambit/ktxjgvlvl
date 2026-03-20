import {
  LoadingBlock,
  LoadingPanel,
  LoadingPill,
  PremiumLoadingMark
} from "@/components/shared/premium-loading"

export function DashboardHeaderPanelSkeleton() {
  return (
    <LoadingPanel className="p-3.5 sm:p-4 lg:p-5">
      <div className="flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 px-2.5 py-1 text-xs font-medium text-[hsl(277,100%,88%)]">
          My ARMY Room
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 px-2.5 py-1 text-xs font-medium text-[hsl(35,100%,88%)]">
          Loading state
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <h1 className="font-heading text-[2rem] font-semibold tracking-tight text-white sm:text-[2.4rem]">
          Namaste!
        </h1>
        <LoadingBlock className="h-4 w-full max-w-xl rounded-full" />
      </div>

      <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">Leaderboard snapshot</p>
            <p className="mt-1 hidden text-sm text-white/58 sm:block">
              These four ranks are the fast answer to where you and your state stand right now.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 px-2.5 py-1 text-xs font-medium text-[hsl(277,100%,88%)]">
            Live standings
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {[
            "Your daily rank",
            "Your weekly rank",
            "State daily rank",
            "State weekly rank"
          ].map((label) => (
            <div
              className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4"
              key={label}
            >
              <p className="text-[11px] font-medium leading-4 text-white/64 sm:text-sm">{label}</p>
              <LoadingBlock className="mt-3 h-8 w-28 rounded-full" />
              <LoadingBlock className="mt-3 h-3.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-sm font-medium text-white/72">Tracker status</p>
          <LoadingBlock className="mt-4 h-8 w-32 rounded-full" />
          <LoadingBlock className="mt-3 h-3.5 w-full rounded-full" />
          <LoadingBlock className="mt-2 h-3.5 w-4/5 rounded-full" />
        </div>
        <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <p className="text-sm font-medium text-white/72">State status</p>
          <LoadingBlock className="mt-4 h-8 w-36 rounded-full" />
          <LoadingBlock className="mt-3 h-3.5 w-full rounded-full" />
          <LoadingBlock className="mt-2 h-3.5 w-4/5 rounded-full" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,rgba(168,85,247,0.92),rgba(147,51,234,0.92))] px-6 py-3 text-sm font-semibold text-white">
          Continue missions
        </div>
        <div className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[hsl(265,70%,65%)]/40 px-6 py-3 text-sm font-semibold text-[hsl(277,100%,88%)]">
          Refine profile
        </div>
      </div>
    </LoadingPanel>
  )
}

export function QuickReadsPanelSkeleton() {
  return (
    <LoadingPanel className="p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 px-2.5 py-1 text-xs font-medium text-[hsl(277,100%,88%)]">
          Guides
        </div>
        <div className="text-sm font-medium text-white/72">All guides</div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {[
          "Core rules",
          "Spotify",
          "Apple Music",
          "YouTube",
          "Charts",
          "Buying",
          "MV rules",
          "Streaming"
        ].map((label) => (
          <div
            className="inline-flex min-h-11 w-full items-center gap-2 rounded-[1rem] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-white/78"
            key={label}
          >
            <LoadingBlock className="h-4 w-4 rounded-full" />
            <span className="truncate">{label}</span>
          </div>
        ))}
      </div>
    </LoadingPanel>
  )
}

export function MissionControlPanelSkeleton() {
  return (
    <LoadingPanel className="p-3.5 sm:p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 px-2.5 py-1 text-xs font-medium text-[hsl(277,100%,88%)]">
            Mission control
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">All live missions</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/64">
            Switch between personal, state, and India missions, then move across the live daily, weekly, song, and
            album goals inside each group.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-slate-900">
            Sync progress
          </div>
          <div className="self-center text-sm font-medium text-white/72">View all</div>
        </div>
      </div>

      <div className="mt-4 space-y-3 sm:space-y-4">
        <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.1rem] sm:p-3">
          <div className="flex flex-col gap-2.5 xl:flex-row xl:items-start">
            <div className="min-w-0 xl:flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42 sm:text-[11px]">
                Where you want to help
              </p>
              <div className="mt-2 flex gap-2">
                <div className="rounded-full border border-[hsl(265,70%,65%)]/34 bg-[rgba(56,36,94,0.9)] px-3 py-1.5 text-[13px] font-medium text-white">
                  Personal
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/64">
                  State
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/64">
                  India
                </div>
              </div>
            </div>

            <div className="min-w-0 xl:flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42 sm:text-[11px]">
                Pick a mission
              </p>
              <div className="mt-2 flex gap-2">
                <div className="rounded-full border border-[hsl(265,70%,65%)]/34 bg-[rgba(56,36,94,0.9)] px-3 py-1.5 text-[13px] text-white">
                  Daily Track
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/64">
                  Weekly Track
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(277,100%,88%)]">
                  Personal
                </div>
                <div className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/74">
                  In progress
                </div>
                <div className="rounded-full border border-[hsl(170,60%,45%)]/20 bg-[hsl(170,60%,45%)]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(171,100%,88%)]">
                  Reward
                </div>
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">Today&apos;s mission details</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/62">
                The selected mission, progress, and targets will appear here as soon as the live data is ready.
              </p>
            </div>

            <div className="rounded-[1rem] border border-white/10 bg-black/10 px-4 py-3 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Progress</p>
              <LoadingBlock className="mt-2 h-8 w-20 rounded-full" />
            </div>
          </div>

          <LoadingBlock className="mt-4 h-3 rounded-full" />

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["How to finish", "Who gets the bonus", "Current mission state"].map((label) => (
              <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3.5 sm:p-4" key={label}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">{label}</p>
                <LoadingBlock className="mt-3 h-4 w-3/4 rounded-full" />
                <LoadingBlock className="mt-3 h-3.5 w-full rounded-full" />
                <LoadingBlock className="mt-2 h-3.5 w-5/6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </LoadingPanel>
  )
}

export function EventPanelSkeleton() {
  return (
    <LoadingPanel className="p-3.5 sm:p-4 lg:p-5">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 px-2.5 py-1 text-xs font-medium text-[hsl(35,100%,88%)]">
          Events
        </div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">Next event</h2>
        <p className="text-sm leading-6 text-white/64">
          The next community event stays visible here without overpowering the page.
        </p>
      </div>
      <div className="mt-5 rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex flex-wrap gap-4">
          <div className="flex min-w-[82px] shrink-0 flex-col items-center justify-center rounded-[1rem] border border-white/10 bg-black/15 px-4 py-3 text-center">
            <LoadingBlock className="h-9 w-12 rounded-full" />
            <LoadingBlock className="mt-2 h-4 w-16 rounded-full" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 px-2.5 py-1 text-xs text-[hsl(35,100%,88%)]">
                Event type
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/72">Status</div>
            </div>
            <LoadingBlock className="mt-3 h-6 w-2/3 rounded-full" />
            <LoadingBlock className="mt-3 h-3.5 w-full rounded-full" />
            <LoadingBlock className="mt-2 h-3.5 w-5/6 rounded-full" />
            <LoadingBlock className="mt-4 h-3.5 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </LoadingPanel>
  )
}

export function ActivityMapPanelSkeleton() {
  return (
    <LoadingPanel className="p-3.5 sm:p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 px-2.5 py-1 text-xs font-medium text-[hsl(277,100%,88%)]">
            Activity map
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">Track India activity by state and hotspot</h2>
          <p className="max-w-3xl text-sm leading-6 text-white/64">
            See how India is moving right now. The map uses the same verified stream and mission data that powers your
            leaderboard view.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-white/10 bg-black/15 p-1">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">Daily</div>
          <div className="rounded-full px-4 py-2 text-sm font-semibold text-white/72">Weekly</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_320px]">
        <div className="rounded-[1.75rem] border border-white/10 bg-[hsl(258,30%,8%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <LoadingBlock className="min-h-[28rem] rounded-[1.25rem]" />
        </div>
        <div className="space-y-4">
          {["Selected area", "Top hotspots", "Top active states"].map((label) => (
            <div className="rounded-[1.2rem] border border-white/10 bg-black/15 p-3 sm:p-4" key={label}>
              <p className="text-sm font-semibold text-white">{label}</p>
              <LoadingBlock className="mt-3 h-4 w-3/4 rounded-full" />
              <LoadingBlock className="mt-3 h-3.5 w-full rounded-full" />
              <LoadingBlock className="mt-2 h-3.5 w-5/6 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </LoadingPanel>
  )
}

export function LeaderboardPanelSkeleton() {
  return (
    <LoadingPanel className="p-3.5 sm:p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 px-2.5 py-1 text-xs font-medium text-[hsl(277,100%,88%)]">
            Leaderboard
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">Weekly individual board</h2>
          <p className="text-sm leading-6 text-white/64">Verified weekly rankings</p>
        </div>
        <div className="self-center text-sm font-medium text-white/72">View all</div>
      </div>

      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            key={index}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-white">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">Loading participant</p>
                <p className="mt-1 text-sm text-white/56">Verified BTS streams plus mission rewards</p>
              </div>
              <LoadingBlock className="h-7 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[1.15rem] border border-[hsl(265,70%,65%)]/18 bg-[hsl(265,70%,65%)]/10 p-4">
        <p className="font-medium text-white">Your board position will appear here.</p>
        <LoadingBlock className="mt-2 h-3.5 w-48 rounded-full" />
      </div>
    </LoadingPanel>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div className="relative isolate">
      <div className="relative z-10 space-y-3 sm:space-y-6 lg:space-y-8">
        <PremiumLoadingMark label="Building your dashboard" />

        <section className="space-y-3 sm:space-y-4">
          <DashboardHeaderPanelSkeleton />
          <QuickReadsPanelSkeleton />
        </section>

        <section className="grid items-start gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.35fr)_300px]">
          <MissionControlPanelSkeleton />
          <EventPanelSkeleton />
        </section>

        <ActivityMapPanelSkeleton />
        <LeaderboardPanelSkeleton />
      </div>
    </div>
  )
}
