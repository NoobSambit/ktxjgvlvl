import { cn } from "@/lib/utils"

type LoadingBlockProps = {
  className?: string
}

export function LoadingBlock({ className }: LoadingBlockProps) {
  return <div aria-hidden className={cn("loading-shimmer rounded-[0.95rem]", className)} />
}

type LoadingPanelProps = {
  children: React.ReactNode
  className?: string
}

export function LoadingPanel({ children, className }: LoadingPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] shadow-[0_26px_80px_-46px_rgba(0,0,0,0.9)] sm:rounded-[1.45rem]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,146,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,153,51,0.12),transparent_32%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function LoadingPill({ className }: LoadingBlockProps) {
  return (
    <div className={cn("inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5", className)}>
      <LoadingBlock className="h-2.5 w-20 rounded-full" />
    </div>
  )
}

export function PremiumLoadingMark({
  label = "Loading next view",
  className
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-4 py-2 text-sm text-white/74 shadow-[0_20px_40px_-30px_rgba(0,0,0,0.95)] backdrop-blur-md",
        className
      )}
    >
      <div className="loading-orb relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 shadow-[0_0_30px_-18px_rgba(255,153,51,0.7)]">
        <div className="absolute inset-[5px] rounded-full bg-[conic-gradient(from_180deg,#ff9933_0deg,#ffffff_120deg,#138808_240deg,#ff9933_360deg)] opacity-85 blur-[1px]" />
        <div className="absolute inset-[10px] rounded-full bg-[rgba(9,8,18,0.92)]" />
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Transition</p>
        <p className="font-medium text-white">{label}</p>
      </div>
    </div>
  )
}

export function LoadingTextGroup({
  eyebrowWidth = "w-24",
  titleWidths = ["w-56", "w-40"],
  bodyWidths = ["w-full", "w-5/6"]
}: {
  eyebrowWidth?: string
  titleWidths?: string[]
  bodyWidths?: string[]
}) {
  return (
    <div className="space-y-3">
      <LoadingBlock className={cn("h-3 rounded-full", eyebrowWidth)} />
      <div className="space-y-2.5">
        {titleWidths.map((width, index) => (
          <LoadingBlock className={cn("h-8 rounded-full", width)} key={`${width}-${index}`} />
        ))}
      </div>
      <div className="space-y-2">
        {bodyWidths.map((width, index) => (
          <LoadingBlock className={cn("h-3.5 rounded-full", width)} key={`${width}-${index}`} />
        ))}
      </div>
    </div>
  )
}

export function AppRouteLoadingView() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <PremiumLoadingMark />

      <LoadingPanel className="p-5 sm:p-6 lg:p-7">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/42">Loading next page</p>
          <h1 className="max-w-[14ch] font-heading text-[2rem] font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-[2.8rem]">
            Opening the next view.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-white/64 sm:text-base sm:leading-7">
            The page shell comes in first. Live panels and dynamic data will fill in right after.
          </p>
        </div>
      </LoadingPanel>

      <div className="grid gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.35fr)_300px]">
        <LoadingPanel className="p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap gap-2">
            <LoadingPill />
            <LoadingPill className="w-28" />
          </div>
          <LoadingBlock className="mt-4 h-16 rounded-[1.1rem]" />
          <LoadingBlock className="mt-4 h-[18rem] rounded-[1.2rem]" />
        </LoadingPanel>

        <LoadingPanel className="p-4 sm:p-5">
          <LoadingBlock className="h-4 w-24 rounded-full" />
          <LoadingBlock className="mt-3 h-8 w-32 rounded-full" />
          <LoadingBlock className="mt-5 h-44 rounded-[1.1rem]" />
        </LoadingPanel>
      </div>

      <LoadingBlock className="h-[18rem] rounded-[1.4rem]" />
    </div>
  )
}

export function MarketingRouteLoadingView() {
  return (
    <div className="space-y-16 py-8 sm:space-y-20 sm:py-10 md:py-14">
      <PremiumLoadingMark label="Preparing homepage" />

      <LoadingPanel className="p-5 sm:p-7 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
                <span className="truncate">Opening IndiaForBTS</span>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h1 className="max-w-[12ch] text-balance font-heading text-[2.6rem] font-semibold leading-[0.92] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4.9rem]">
                One home for India&apos;s BTS streaming push.
                <span className="mt-2 block bg-gradient-to-r from-[hsl(267,84%,79%)] via-[hsl(325,74%,76%)] to-[hsl(27,95%,64%)] bg-clip-text text-transparent">
                  Missions, guides, and momentum.
                </span>
              </h1>
              <p className="max-w-xl text-sm leading-7 text-white/68 sm:text-base lg:text-lg">
                Follow the live goal, open the right guide, check the leaderboard, and move with fans across the
                country from one premium dashboard built for coordinated streaming.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LoadingBlock className="h-12 w-44 rounded-2xl" />
              <LoadingBlock className="h-12 w-36 rounded-2xl" />
            </div>
          </div>
          <LoadingBlock className="min-h-[22rem] rounded-[1.6rem]" />
        </div>
      </LoadingPanel>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingBlock className="h-56 rounded-[1.6rem]" key={index} />
        ))}
      </div>

      <LoadingPanel className="p-6 sm:p-8">
        <LoadingTextGroup titleWidths={["w-56", "w-72"]} bodyWidths={["w-4/5"]} />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingBlock className="h-44 rounded-[1.4rem]" key={index} />
          ))}
        </div>
      </LoadingPanel>
    </div>
  )
}

export function AuthRouteLoadingView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)]">
      <PremiumLoadingMark label="Preparing secure flow" />
      <div className="grid gap-4 xl:col-span-2 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <LoadingPanel className="p-5 sm:p-8 lg:p-10">
          <LoadingTextGroup titleWidths={["w-56", "w-72"]} bodyWidths={["w-full", "w-5/6"]} />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingBlock className="h-28 rounded-[1.3rem]" key={index} />
            ))}
          </div>
        </LoadingPanel>
        <LoadingPanel className="p-5 sm:p-7 lg:p-8">
          <LoadingBlock className="h-4 w-28 rounded-full" />
          <LoadingBlock className="mt-4 h-11 rounded-[1rem]" />
          <LoadingBlock className="mt-3 h-11 rounded-[1rem]" />
          <LoadingBlock className="mt-3 h-11 rounded-[1rem]" />
          <LoadingBlock className="mt-5 h-12 rounded-[1rem]" />
        </LoadingPanel>
      </div>
    </div>
  )
}

export function AdminRouteLoadingView() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <PremiumLoadingMark label="Preparing admin console" />
      <LoadingPanel className="p-4 sm:p-6">
        <LoadingTextGroup titleWidths={["w-60", "w-80"]} bodyWidths={["w-full", "w-2/3"]} />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingBlock className="h-32 rounded-[1.2rem]" key={index} />
          ))}
        </div>
      </LoadingPanel>
      <div className="grid gap-4 xl:grid-cols-2">
        <LoadingBlock className="h-[30rem] rounded-[1.4rem]" />
        <LoadingBlock className="h-[30rem] rounded-[1.4rem]" />
      </div>
    </div>
  )
}
