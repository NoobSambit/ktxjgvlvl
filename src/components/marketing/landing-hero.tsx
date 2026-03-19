"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  LayoutDashboard,
  MapPinned,
  Radio,
  Sparkles,
  Target,
  Trophy
} from "lucide-react"
import { cn, formatCompactNumber, formatDateLabel } from "@/lib/utils"
import type { GuideQuickReadView } from "@/modules/guides/service"
import type { ActivityMapView } from "@/modules/activity-map/types"
import type { ChartCard } from "@/modules/charts/types"
import type { LeaderboardBoardView } from "@/modules/leaderboards/types"
import type { MissionCard } from "@/modules/missions/types"

type LandingHeroProps = {
  isAuthenticated: boolean
  missions: MissionCard[]
  leadMission?: MissionCard
  featuredBoard?: LeaderboardBoardView
  stateBoard?: LeaderboardBoardView
  chartSnapshot?: ChartCard
  guideQuickReads: GuideQuickReadView[]
  dailyActivityMap: ActivityMapView
}

type HeroFeatureId = "dashboard" | "missions" | "guides" | "leaderboards"

type HeroFeatureButton = {
  id: HeroFeatureId
  label: string
  detail: string
  icon: typeof LayoutDashboard
}

const heroFeatureButtons: HeroFeatureButton[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    detail: "Everything important in one view",
    icon: LayoutDashboard
  },
  {
    id: "missions",
    label: "Missions",
    detail: "Jump into the live push instantly",
    icon: Target
  },
  {
    id: "guides",
    label: "Guides",
    detail: "Open the exact streaming rules fast",
    icon: BookOpen
  },
  {
    id: "leaderboards",
    label: "Leaderboards",
    detail: "Track who is moving the climb",
    icon: Trophy
  }
]

function getMaxMetric(entries: ChartCard["entries"]) {
  return entries.reduce((maxValue, entry) => Math.max(maxValue, entry.metricValue), 0)
}

function getMissionProgress(leadMission?: MissionCard) {
  if (!leadMission?.goalUnits) {
    return 0
  }

  return Math.min((leadMission.aggregateProgress / Math.max(leadMission.goalUnits, 1)) * 100, 100)
}

function PreviewPanelShell({
  accentClassName,
  children
}: {
  accentClassName: string
  children: ReactNode
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,12,24,0.98),rgba(8,7,18,0.98))] p-3 shadow-[0_35px_100px_-60px_rgba(0,0,0,0.95)] sm:rounded-[2rem] sm:p-5 lg:p-6">
      <div className={cn("absolute inset-0 opacity-90", accentClassName)} />
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  )
}

export function LandingHero({
  isAuthenticated,
  missions,
  leadMission,
  featuredBoard,
  stateBoard,
  chartSnapshot,
  guideQuickReads,
  dailyActivityMap
}: LandingHeroProps) {
  const [activeFeature, setActiveFeature] = useState<HeroFeatureId>("dashboard")

  function focusFeatureExplanation(featureId: HeroFeatureId) {
    setActiveFeature(featureId)

    if (typeof window === "undefined" || window.innerWidth >= 1280) {
      return
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(`hero-preview-${featureId}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        })
      })
    })
  }

  const activeUsers = dailyActivityMap.states.reduce((sum, state) => sum + state.activeUserCount, 0)
  const topState = dailyActivityMap.topStates[0]
  const topHotspot = dailyActivityMap.hotspots[0]
  const topSong = chartSnapshot?.entries[0]
  const maxChartMetric = chartSnapshot ? Math.max(getMaxMetric(chartSnapshot.entries), 1) : 1
  const missionProgress = getMissionProgress(leadMission)
  const guideSpotlight = guideQuickReads[0]
  const topFan = featuredBoard?.entries[0]
  const leaderboardLeaders = featuredBoard?.entries.slice(0, 3) ?? []

  const primaryHref = isAuthenticated ? "/dashboard" : "/signup"
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Create your account"

  return (
    <section className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,10,28,0.9),rgba(7,6,17,0.95))] px-3 py-4 shadow-[0_25px_90px_-55px_rgba(0,0,0,0.95)] sm:rounded-[2rem] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,146,255,0.16),transparent_34%),radial-gradient(circle_at_86%_18%,rgba(255,153,51,0.12),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(52,211,153,0.1),transparent_32%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]" />
      <div className="absolute -left-10 bottom-10 h-40 w-40 rounded-full bg-[hsl(25,90%,55%)]/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[hsl(265,70%,65%)]/12 blur-3xl" />

      <div className="relative grid gap-3 sm:gap-6 xl:grid-cols-[minmax(0,0.96fr)_minmax(340px,0.92fr)] xl:items-stretch">
        <div className="flex flex-col gap-4 p-0 sm:rounded-[1.8rem] sm:border sm:border-white/[0.07] sm:bg-white/[0.02] sm:p-6 sm:backdrop-blur-sm lg:p-7">
          <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
            <span className="truncate">
              {activeUsers > 0
                ? `${formatCompactNumber(activeUsers)} fans active across India`
                : `${missions.length} live streaming pushes open now`}
            </span>
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

          <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row">
            <Link className="btn-bts-primary min-h-12 min-w-[12rem] rounded-2xl px-6 py-3 text-sm sm:text-base" href={primaryHref}>
              {primaryLabel}
            </Link>
            <Link
              className="btn-bts-secondary min-h-12 min-w-[12rem] rounded-2xl border-white/15 px-6 py-3 text-sm text-white hover:bg-white/8 hover:text-white sm:text-base"
              href="/missions"
            >
              Explore missions
            </Link>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3" role="tablist" aria-label="Landing hero feature previews">
            {heroFeatureButtons.map((feature) => {
              const Icon = feature.icon
              const isActive = activeFeature === feature.id

              return (
                <button
                  key={feature.id}
                  id={`hero-tab-${feature.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`hero-preview-${feature.id}`}
                  onClick={() => focusFeatureExplanation(feature.id)}
                  className={cn(
                    "group rounded-[1.2rem] border px-3.5 py-3.5 text-left transition-all duration-300 sm:rounded-[1.35rem] sm:px-4 sm:py-4",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0",
                    isActive
                      ? "border-white/18 bg-[linear-gradient(135deg,rgba(185,142,255,0.16),rgba(255,255,255,0.07))] shadow-[0_20px_45px_-35px_rgba(185,142,255,0.65)]"
                      : "border-white/8 bg-black/[0.18] hover:border-white/16 hover:bg-white/[0.05]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border transition-colors sm:h-11 sm:w-11 sm:rounded-2xl",
                        isActive
                          ? "border-white/16 bg-white/10 text-white"
                          : "border-white/10 bg-white/[0.04] text-white/72 group-hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-white sm:text-base">{feature.label}</p>
                      <p className="mt-0.5 text-sm leading-5 text-white/58 sm:mt-1 sm:leading-6">{feature.detail}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:rounded-[1.7rem] sm:p-5">
            <div className="flex items-start justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/42">Getting started</p>
                <h2 className="mt-1.5 font-heading text-xl font-semibold tracking-[-0.04em] text-white sm:mt-2 sm:text-[1.9rem]">
                  Start in four steps.
                </h2>
              </div>
              <Link
                className="inline-flex shrink-0 items-center gap-2 pt-0.5 text-xs font-semibold text-white/84 transition-colors hover:text-white sm:text-sm"
                href={primaryHref}
              >
                {isAuthenticated ? "Jump back in" : "Set up your profile"}
                <ArrowRight className="h-4 w-4" />
              </Link>
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

        <div className="flex min-w-0 flex-col">
          {activeFeature === "dashboard" ? (
            <PreviewPanelShell accentClassName="bg-[radial-gradient(circle_at_top_right,rgba(186,146,255,0.22),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,153,51,0.16),transparent_28%)]">
              <div
                id="hero-preview-dashboard"
                role="tabpanel"
                aria-labelledby="hero-tab-dashboard"
                className="scroll-mt-24 space-y-4"
              >
                <div className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">All in one dashboard</p>
                    <p className="mt-1 text-sm font-medium text-white/88">Live mission, chart watch, map pulse, and leaderboard</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    Synced
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(13rem,0.78fr)]">
                  <div className="rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(38,24,67,0.74),rgba(12,11,24,0.9))] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                          <Sparkles className="h-3.5 w-3.5 text-[hsl(267,84%,79%)]" />
                          Command center
                        </div>
                        <h2 className="mt-4 max-w-[12ch] text-2xl font-semibold leading-tight text-white sm:text-[2rem]">
                          One surface for the whole push.
                        </h2>
                        <p className="mt-3 max-w-md text-sm leading-6 text-white/66">
                          Open the exact action you need without bouncing across pages. The dashboard keeps the active
                          mission, chart pressure, and country activity in one calm layout.
                        </p>
                      </div>
                      <LayoutDashboard className="mt-1 h-5 w-5 shrink-0 text-white/55" />
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Live goal</p>
                        <p className="mt-2 text-base font-semibold text-white">
                          {leadMission?.title ?? "Waiting for today&apos;s featured mission"}
                        </p>
                        <p className="mt-2 text-sm text-white/56">
                          {leadMission?.rewardLabel ?? "Rewards appear here as soon as a mission is active"}
                        </p>
                      </div>
                      <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Chart watch</p>
                        <p className="mt-2 text-base font-semibold text-white">
                          {topSong ? `#${topSong.rank} ${topSong.title}` : "No chart snapshot yet"}
                        </p>
                        <p className="mt-2 text-sm text-white/56">
                          {topSong ? `${topSong.artist} is the current focus track` : "Latest rank movement shows up here"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/45">
                        <MapPinned className="h-3.5 w-3.5 text-[hsl(170,60%,45%)]" />
                        India pulse
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                          <p className="text-xs text-white/45">Top state</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {topState?.stateLabel ?? stateBoard?.entries[0]?.displayName ?? "No live state data"}
                          </p>
                        </div>
                        <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                          <p className="text-xs text-white/45">Top hotspot</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {topHotspot?.placeLabel ?? "Waiting for hotspot data"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/45">
                        <Radio className="h-3.5 w-3.5 text-[hsl(25,90%,60%)]" />
                        Quick facts
                      </div>
                      <div className="mt-4 grid gap-3">
                        <div className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3">
                          <span className="text-sm text-white/60">Live missions</span>
                          <span className="text-sm font-semibold text-white">{missions.length}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3">
                          <span className="text-sm text-white/60">Fans active</span>
                          <span className="text-sm font-semibold text-white">{formatCompactNumber(activeUsers)}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3">
                          <span className="text-sm text-white/60">Top fan</span>
                          <span className="truncate pl-4 text-sm font-semibold text-white">
                            {topFan?.displayName ?? "Waiting for leaderboard"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PreviewPanelShell>
          ) : null}

          {activeFeature === "missions" ? (
            <PreviewPanelShell accentClassName="bg-[radial-gradient(circle_at_top_right,rgba(186,146,255,0.18),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.14),transparent_30%)]">
              <div
                id="hero-preview-missions"
                role="tabpanel"
                aria-labelledby="hero-tab-missions"
                className="scroll-mt-24 space-y-4"
              >
                <div className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">Mission journey</p>
                    <p className="mt-1 text-sm font-medium text-white/88">Open the live target and see exactly what to do next</p>
                  </div>
                  <Target className="h-4 w-4 text-[hsl(267,84%,79%)]" />
                </div>

                <div className="rounded-[1.6rem] border border-[hsl(267,84%,79%)]/20 bg-[linear-gradient(180deg,rgba(51,32,88,0.82),rgba(14,11,27,0.94))] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                        <AudioLines className="h-3.5 w-3.5 text-[hsl(267,84%,79%)]" />
                        Featured push
                      </div>
                      <h2 className="mt-4 max-w-[14ch] text-2xl font-semibold leading-tight text-white sm:text-[2rem]">
                        {leadMission?.title ?? "Today&apos;s streaming goal loads here"}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/66">
                        {leadMission?.description ??
                          "As soon as the admin team posts a live mission, this space turns into your clean action brief with progress, focus, and reward."}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/75">
                      {leadMission?.scopeLabel ?? "Live update"}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm text-white/66">
                      <span>Mission progress</span>
                      <span className="font-semibold text-white">
                        {leadMission ? `${leadMission.aggregateProgress}/${leadMission.goalUnits}` : "0/0"}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[hsl(267,84%,79%)] via-[hsl(325,74%,76%)] to-[hsl(27,95%,64%)]"
                        style={{ width: `${missionProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Focus</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white">
                        {leadMission?.focus ?? "Mission focus appears here once a goal is active"}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Reward</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white">
                        {leadMission?.rewardLabel ?? "Reward details appear here"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {(leadMission?.targets.slice(0, 3) ?? []).map((target) => (
                    <div key={target.key} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Target</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white">{target.title}</p>
                      <p className="mt-2 text-sm text-white/55">{target.artistName}</p>
                    </div>
                  ))}
                  {!leadMission?.targets.length ? (
                    <div className="rounded-[1.25rem] border border-dashed border-white/10 bg-white/[0.03] p-4 sm:col-span-3">
                      <p className="text-sm leading-6 text-white/58">
                        Target tracks and albums appear here when a mission is available.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </PreviewPanelShell>
          ) : null}

          {activeFeature === "guides" ? (
            <PreviewPanelShell accentClassName="bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(186,146,255,0.14),transparent_32%)]">
              <div
                id="hero-preview-guides"
                role="tabpanel"
                aria-labelledby="hero-tab-guides"
                className="scroll-mt-24 space-y-4"
              >
                <div className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">Guided walkthroughs</p>
                    <p className="mt-1 text-sm font-medium text-white/88">Rules first, then the exact platform flow</p>
                  </div>
                  <BookOpen className="h-4 w-4 text-[hsl(170,60%,45%)]" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.03fr)_minmax(14rem,0.77fr)]">
                  <div className="rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(20,51,48,0.48),rgba(11,12,23,0.92))] p-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                      <Sparkles className="h-3.5 w-3.5 text-[hsl(170,60%,45%)]" />
                      Featured guide
                    </div>
                    <h2 className="mt-4 max-w-[13ch] text-2xl font-semibold leading-tight text-white sm:text-[2rem]">
                      {guideSpotlight?.title ?? "Streaming guidance that stays easy to follow"}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/66">
                      {guideSpotlight?.summary ??
                        "The site keeps beginner-safe streaming rules and platform walkthroughs close to the action, so nobody has to guess what counts."}
                    </p>

                    <div className="mt-6 space-y-3">
                      {(guideSpotlight?.highlights.slice(0, 3) ?? [
                        "Clear beginner-safe rules",
                        "Platform-specific walkthroughs",
                        "Fast refreshers before a push"
                      ]).map((highlight) => (
                        <div key={highlight} className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-black/20 px-4 py-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(170,60%,45%)]/15 text-[hsl(170,75%,72%)]">
                            <Sparkles className="h-3.5 w-3.5" />
                          </span>
                          <p className="text-sm text-white/82">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Best for</p>
                      <p className="mt-3 text-lg font-semibold text-white">Fast, no-confusion streaming prep</p>
                      <p className="mt-2 text-sm leading-6 text-white/58">
                        Open a refresher before missions, watch parties, or comeback pushes.
                      </p>
                    </div>
                    <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Current spotlight</p>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {guideSpotlight?.detail ?? "Core rules + platform-specific steps"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/58">
                        {guideSpotlight?.navSummary ?? "Keep playback safe, clean, and chart-friendly."}
                      </p>
                    </div>
                    <Link
                      className="inline-flex w-full items-center justify-between rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-black/25"
                      href={guideSpotlight?.href ?? "/guide"}
                    >
                      Open guide library
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </PreviewPanelShell>
          ) : null}

          {activeFeature === "leaderboards" ? (
            <PreviewPanelShell accentClassName="bg-[radial-gradient(circle_at_top_right,rgba(255,153,51,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(186,146,255,0.14),transparent_30%)]">
              <div
                id="hero-preview-leaderboards"
                role="tabpanel"
                aria-labelledby="hero-tab-leaderboards"
                className="scroll-mt-24 space-y-4"
              >
                <div className="flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">Daily race</p>
                    <p className="mt-1 text-sm font-medium text-white/88">See who is carrying the climb today</p>
                  </div>
                  <Trophy className="h-4 w-4 text-[hsl(27,95%,64%)]" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.03fr)_minmax(14rem,0.77fr)]">
                  <div className="rounded-[1.55rem] border border-white/10 bg-[linear-gradient(180deg,rgba(66,37,10,0.42),rgba(13,10,21,0.93))] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/55">
                          <Trophy className="h-3.5 w-3.5 text-[hsl(27,95%,64%)]" />
                          Leaderboard snapshot
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-[2rem]">
                          {featuredBoard?.headline ?? "Top fan movement, live"}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-white/66">
                          {featuredBoard
                            ? `${featuredBoard.totalParticipants} participants are already on the ${featuredBoard.period} board.`
                            : "As users start earning points, the board becomes the cleanest way to see who is driving the push."}
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/75">
                        {featuredBoard?.period ?? "daily"} board
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {leaderboardLeaders.map((entry) => (
                        <div
                          key={entry.competitorKey}
                          className="flex items-center justify-between rounded-[1.15rem] border border-white/10 bg-black/20 px-4 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white">
                              {entry.rank}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{entry.displayName}</p>
                              <p className="text-xs text-white/48">Rank movement updates here live</p>
                            </div>
                          </div>
                          <span className="shrink-0 pl-4 text-sm font-semibold text-white/78">
                            {formatCompactNumber(entry.score)}
                          </span>
                        </div>
                      ))}

                      {!leaderboardLeaders.length ? (
                        <div className="rounded-[1.15rem] border border-dashed border-white/10 bg-black/20 px-4 py-6">
                          <p className="text-sm text-white/58">Leaderboard cards appear here when scoring data is available.</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Top fan</p>
                      <p className="mt-3 text-lg font-semibold text-white">{topFan?.displayName ?? "Waiting for scores"}</p>
                      <p className="mt-2 text-sm leading-6 text-white/58">
                        {topFan ? `${formatCompactNumber(topFan.score)} points on the board` : "Latest individual rankings show up here"}
                      </p>
                    </div>

                    <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Top state</p>
                      <p className="mt-3 text-lg font-semibold text-white">
                        {topState?.stateLabel ?? stateBoard?.entries[0]?.displayName ?? "Waiting for state board"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/58">
                        {topState
                          ? `${formatCompactNumber(topState.activityScore)} activity points recorded`
                          : "Regional leaderboard movement appears here"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </PreviewPanelShell>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3 px-1 sm:mt-4 sm:gap-4">
            <div className="flex items-center gap-2">
              {heroFeatureButtons.map((feature) => (
                <button
                  key={feature.id}
                  type="button"
                  aria-label={`Open ${feature.label} preview`}
                  onClick={() => setActiveFeature(feature.id)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    activeFeature === feature.id ? "w-10 bg-white" : "w-6 bg-white/22 hover:bg-white/40"
                  )}
                />
              ))}
            </div>

            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/76 transition-colors hover:text-white"
              href={
                activeFeature === "guides"
                  ? guideSpotlight?.href ?? "/guide"
                  : activeFeature === "leaderboards"
                    ? "/leaderboards"
                    : activeFeature === "missions"
                      ? "/missions"
                      : primaryHref
              }
            >
              {activeFeature === "guides"
                ? "Open guides"
                : activeFeature === "leaderboards"
                  ? "View leaderboards"
                  : activeFeature === "missions"
                    ? "See live missions"
                    : "Open dashboard"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3.5 sm:rounded-[1.3rem] sm:p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Live missions</p>
              <p className="mt-2 text-xl font-semibold text-white">{missions.length}</p>
              <p className="mt-1 text-sm text-white/56">Active goals ready to open now</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3.5 sm:rounded-[1.3rem] sm:p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Chart focus</p>
              <p className="mt-2 truncate text-base font-semibold text-white">
                {topSong ? `#${topSong.rank} ${topSong.title}` : "Snapshot pending"}
              </p>
              <p className="mt-1 text-sm text-white/56">
                {chartSnapshot ? formatDateLabel(chartSnapshot.snapshotDate) : "Latest charts will appear here"}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3.5 sm:rounded-[1.3rem] sm:p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Top state</p>
              <p className="mt-2 truncate text-base font-semibold text-white">
                {topState?.stateLabel ?? stateBoard?.entries[0]?.displayName ?? "No live state data"}
              </p>
              <p className="mt-1 text-sm text-white/56">
                {topState
                  ? `${formatCompactNumber(topState.activityScore)} activity points`
                  : `${Math.round(maxChartMetric)} chart value snapshot`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
