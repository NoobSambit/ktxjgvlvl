import { Flame, RadioTower, Trophy } from "lucide-react"
import { LandingActivityMap } from "@/components/marketing/landing-activity-map"
import { formatCompactNumber } from "@/lib/utils"
import type { ActivityMapView } from "@/modules/activity-map/types"

type LandingIndiaPowerProps = {
  weeklyActivityMap: ActivityMapView
}

export function LandingIndiaPower({ weeklyActivityMap }: LandingIndiaPowerProps) {
  const topState = weeklyActivityMap.topStates[0]
  const topHotspot = weeklyActivityMap.hotspots[0]
  const totalStreams = weeklyActivityMap.states.reduce((sum, state) => sum + state.verifiedStreamCount, 0)

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
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(265,70%,65%)]/18 text-[hsl(265,80%,78%)]">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Top contributing state</p>
                <p className="mt-2 text-xl font-semibold text-white">{topState?.stateLabel ?? "Waiting for state activity"}</p>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  {topState
                    ? `${formatCompactNumber(topState.activityScore)} activity points and ${formatCompactNumber(topState.verifiedStreamCount)} streams this week.`
                    : "State activity will show up here as fans start streaming."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(25,90%,55%)]/18 text-[hsl(25,90%,60%)]">
                <RadioTower className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Most active hotspot</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {topHotspot ? `${topHotspot.placeLabel}, ${topHotspot.stateLabel}` : "Waiting for hotspot activity"}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  {topHotspot
                    ? `${formatCompactNumber(topHotspot.activityScore)} activity points from ${formatCompactNumber(topHotspot.activeUserCount)} active fans.`
                    : "Hotspots appear here when a city starts building real momentum."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(170,60%,45%)]/18 text-[hsl(170,60%,45%)]">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Weekly verified volume</p>
                <p className="mt-2 text-xl font-semibold text-white">{formatCompactNumber(totalStreams)} verified streams</p>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  This gives you a quick view of how much activity is building across the platform this week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LandingActivityMap mapData={weeklyActivityMap} />
    </section>
  )
}
