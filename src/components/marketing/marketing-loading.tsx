import {
  LoadingBlock,
  LoadingPanel,
  LoadingPill
} from "@/components/shared/premium-loading"

export function MarketingHeroSkeleton() {
  return (
    <LoadingPanel className="px-3 py-4 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div className="grid gap-3 sm:gap-6 xl:grid-cols-[minmax(0,0.96fr)_minmax(340px,0.92fr)] xl:items-stretch">
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
            <span className="truncate">Opening IndiaForBTS</span>
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
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="inline-flex min-h-12 min-w-[12rem] items-center justify-center rounded-2xl bg-[linear-gradient(90deg,rgba(168,85,247,0.92),rgba(147,51,234,0.92))] px-6 py-3 text-sm text-white sm:text-base">
              Create your account
            </div>
            <div className="inline-flex min-h-12 min-w-[12rem] items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm text-white sm:text-base">
              Explore missions
            </div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              ["Dashboard", "Everything important in one view"],
              ["Missions", "Jump into the live push instantly"],
              ["Guides", "Open the exact streaming rules fast"],
              ["Leaderboards", "Track who is moving the climb"]
            ].map(([title, detail]) => (
              <div
                className="rounded-[1.2rem] border border-white/8 bg-black/[0.18] px-3.5 py-3.5 text-left sm:rounded-[1.35rem] sm:px-4 sm:py-4"
                key={title}
              >
                <div className="flex items-start gap-3">
                  <LoadingBlock className="h-10 w-10 rounded-[1rem] sm:h-11 sm:w-11 sm:rounded-2xl" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-white sm:text-base">{title}</p>
                    <p className="mt-0.5 text-sm leading-5 text-white/58 sm:mt-1 sm:leading-6">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:rounded-[1.7rem] sm:p-5">
            <div className="flex items-start justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Getting started</p>
                <h2 className="mt-1.5 font-heading text-xl font-semibold tracking-[-0.04em] text-white sm:mt-2 sm:text-[1.9rem]">
                  Start in four steps.
                </h2>
              </div>
              <div className="text-xs font-semibold text-white/84 sm:text-sm">Set up your profile</div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 xl:grid-cols-4">
              {[
                { mobile: "Profile", full: "Create your profile" },
                { mobile: "Tracker", full: "Connect a tracker" },
                { mobile: "Mission", full: "Join the live mission" },
                { mobile: "Board", full: "Climb the daily board" }
              ].map((step, index) => (
                <div
                  key={step.full}
                  className="rounded-[1rem] border border-white/10 bg-black/20 px-3 py-2.5 sm:rounded-[1.2rem] sm:px-4 sm:py-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/38 sm:text-[11px]">Step {index + 1}</p>
                  <p className="mt-1.5 text-sm font-medium leading-5 text-white/82 sm:hidden">{step.mobile}</p>
                  <p className="mt-2 hidden text-sm font-medium leading-6 text-white/82 sm:block">{step.full}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,12,24,0.98),rgba(8,7,18,0.98))] p-3 shadow-[0_35px_100px_-60px_rgba(0,0,0,0.95)] sm:rounded-[2rem] sm:p-5 lg:p-6">
            <div className="relative space-y-4">
              <div className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">All in one dashboard</p>
                  <p className="mt-1 text-sm font-medium text-white/88">Live mission, chart watch, map pulse, and leaderboard</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Loading
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(13rem,0.78fr)]">
                <div className="rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(38,24,67,0.74),rgba(12,11,24,0.9))] p-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                    Command center
                  </div>
                  <h2 className="mt-4 max-w-[12ch] text-2xl font-semibold leading-tight text-white sm:text-[2rem]">
                    One surface for the whole push.
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/66">
                    Open the exact action you need without bouncing across pages.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Live goal</p>
                      <LoadingBlock className="mt-3 h-6 w-3/4 rounded-full" />
                      <LoadingBlock className="mt-3 h-3.5 w-5/6 rounded-full" />
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Chart watch</p>
                      <LoadingBlock className="mt-3 h-6 w-3/4 rounded-full" />
                      <LoadingBlock className="mt-3 h-3.5 w-5/6 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {["India pulse", "Quick facts"].map((label) => (
                    <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.04] p-4" key={label}>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">{label}</p>
                      <LoadingBlock className="mt-4 h-16 rounded-[1.1rem]" />
                      <LoadingBlock className="mt-3 h-16 rounded-[1.1rem]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3 sm:grid-cols-3">
            {["Live missions", "Chart focus", "Top state"].map((label) => (
              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3.5 sm:rounded-[1.3rem] sm:p-4" key={label}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">{label}</p>
                <LoadingBlock className="mt-3 h-6 w-24 rounded-full" />
                <LoadingBlock className="mt-3 h-3.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </LoadingPanel>
  )
}

export function MarketingFeatureGridSkeleton() {
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
        {[
          "Streaming Missions",
          "BTS Music Chart Performance",
          "State Leaderboards",
          "Streaming and Buying Guides",
          "Fan Projects"
        ].map((title, index) => (
          <div
            className={`rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm ${index === 0 ? "md:col-span-2 xl:col-span-2 lg:p-8" : ""}`}
            key={title}
          >
            <LoadingBlock className="mb-6 h-12 w-12 rounded-full" />
            <h3 className={`${index === 0 ? "text-2xl" : "text-xl"} font-semibold text-white`}>{title}</h3>
            <LoadingBlock className="mt-4 h-3.5 w-full rounded-full" />
            <LoadingBlock className="mt-2 h-3.5 w-5/6 rounded-full" />
            <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(265,80%,78%)]">
              <span>{index === 1 || index === 4 ? "Coming soon" : "Open section"}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function MarketingIndiaPowerSkeleton() {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)] lg:items-center">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(170,60%,45%)]">India&apos;s Streaming Power</p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            See where the momentum is coming from.
          </h2>
          <p className="max-w-2xl text-base leading-7 text-white/68">
            Watch the weekly push light up across the country. You can quickly spot which states and cities are leading
            the way without digging through numbers.
          </p>
        </div>
        <div className="grid gap-4">
          {[
            "Top contributing state",
            "Most active hotspot",
            "Weekly verified volume"
          ].map((label) => (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5" key={label}>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</p>
              <LoadingBlock className="mt-4 h-7 w-3/4 rounded-full" />
              <LoadingBlock className="mt-3 h-3.5 w-full rounded-full" />
              <LoadingBlock className="mt-2 h-3.5 w-5/6 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <LoadingBlock className="min-h-[30rem] rounded-[1.8rem]" />
    </section>
  )
}

export function MarketingBenefitsSkeleton() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[hsl(320,72%,76%)]">Why Stream with Us?</p>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Built to make supporting BTS feel easier.
        </h2>
        <p className="max-w-3xl text-base leading-7 text-white/68">
          IndiaForBTS helps you focus on what matters: what to stream, where the push is strongest, and how your effort
          fits into the bigger picture.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          "Clear progress tracking",
          "Fresh goals every day",
          "State rankings that feel alive",
          "Helpful guides built in"
        ].map((title) => (
          <div key={title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-start gap-4">
              <LoadingBlock className="h-12 w-12 rounded-full" />
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <LoadingBlock className="mt-4 h-3.5 w-full rounded-full" />
                <LoadingBlock className="mt-2 h-3.5 w-5/6 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)]">
        <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(98,59,152,0.18),rgba(10,10,16,0.88))] p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-white/45">In the app right now</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/52">Live goals</p>
              <LoadingBlock className="mt-3 h-8 w-20 rounded-full" />
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/52">Quick guides</p>
              <LoadingBlock className="mt-3 h-8 w-20 rounded-full" />
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[linear-gradient(90deg,rgba(168,85,247,0.92),rgba(147,51,234,0.92))] px-6 py-3 text-sm text-white">
              View guides
            </div>
            <div className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm text-white">
              See rankings
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.26em] text-white/45">Coming up</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">Community events incoming</h3>
          <LoadingBlock className="mt-4 h-3.5 w-full rounded-full" />
          <LoadingBlock className="mt-2 h-3.5 w-5/6 rounded-full" />
          <div className="mt-6 space-y-2">
            <LoadingBlock className="h-3.5 w-48 rounded-full" />
            <LoadingBlock className="h-3.5 w-40 rounded-full" />
          </div>
          <div className="mt-6 text-sm font-semibold text-[hsl(25,90%,60%)]">View upcoming events</div>
        </div>
      </div>
    </section>
  )
}

export function MarketingCtaSkeleton() {
  return (
    <section className="px-1 pb-4">
      <LoadingPanel className="px-6 py-12 text-center sm:px-8 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-3">
            <h2 className="font-heading text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Join the next India-wide push.
              <span className="block">Stream smarter, together.</span>
            </h2>
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            Follow live goals, check the charts, and stream alongside fans across the country from one clean home base.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[hsl(265,40%,18%)]">
              Create your account
            </div>
            <div className="inline-flex min-h-12 items-center justify-center rounded-full text-sm font-semibold text-white/88">
              See live goals
            </div>
          </div>
        </div>
      </LoadingPanel>
    </section>
  )
}
