"use client"

import { useEffect, useRef, useState } from "react"
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Compass,
  Disc3,
  Globe2,
  Layers3,
  Link2,
  LockKeyhole,
  MapPinned,
  Music4,
  Radio,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Waves,
  Zap
} from "lucide-react"
import { DashboardPanel, DashboardPill } from "@/components/dashboard/dashboard-shell"
import { MissionActions } from "@/components/missions/mission-actions"
import { ProgressBar } from "@/components/shared/progress-bar"
import { ScoringGuideModal } from "@/components/shared/scoring-guide-modal"
import { Badge } from "@/components/ui/badge"
import { cn, formatCompactNumber, formatDateLabel } from "@/lib/utils"
import type { MissionCard, MissionPageState, MissionTargetView } from "@/modules/missions/types"

type MissionPageProps = {
  missionState: MissionPageState
}

type ToneName = "purple" | "teal" | "saffron"

type MechanicFilter = MissionCard["mechanicType"]
type CadenceFilter = MissionCard["cadence"]
type TrackerStatus = NonNullable<MissionPageState["trackerConnection"]>["verificationStatus"] | "missing"

const scopeMeta: Record<
  MissionCard["missionKind"],
  {
    label: string
    description: string
    rewardCopy: string
    tone: ToneName
    badgeClassName: string
  }
> = {
  individual_personal: {
    label: "Personal",
    description: "This one is just for you.",
    rewardCopy: "Finish it and the bonus is added to your score and your state's score.",
    tone: "purple",
    badgeClassName: "border-[hsl(265,70%,65%)]/20 bg-[hsl(265,70%,65%)]/10 text-[hsl(277,100%,88%)]"
  },
  state_shared: {
    label: "State",
    description: "You help the shared total for your state.",
    rewardCopy: "If your state finishes it, the bonus goes to the state ranking.",
    tone: "teal",
    badgeClassName: "border-[hsl(170,60%,45%)]/20 bg-[hsl(170,60%,45%)]/10 text-[hsl(171,100%,88%)]"
  },
  india_shared: {
    label: "India",
    description: "Everyone in India works on the same goal together.",
    rewardCopy: "If you helped before it finished, the bonus is added to your score and your state's score.",
    tone: "saffron",
    badgeClassName: "border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 text-[hsl(35,100%,88%)]"
  }
}

const mechanicMeta: Record<
  MissionCard["mechanicType"],
  {
    label: string
    title: string
    description: string
    guidance: string
    icon: typeof Music4
    pillTone: ToneName
    badgeClassName: string
    fillClassName: string
  }
> = {
  track_streams: {
    label: "Songs",
    title: "Song missions",
    description: "Play the listed songs until each target is filled.",
    guidance: "Your counted plays still give normal points. Finishing the full mission adds an extra bonus.",
    icon: Music4,
    pillTone: "purple",
    badgeClassName: "border-[hsl(205,72%,58%)]/20 bg-[hsl(205,72%,58%)]/10 text-[hsl(196,86%,72%)]",
    fillClassName:
      "bg-gradient-to-r from-[hsl(196,86%,72%)] via-[hsl(228,86%,72%)] to-[hsl(260,88%,74%)]"
  },
  album_completions: {
    label: "Albums",
    title: "Album missions",
    description: "Album missions move when you finish the listed albums during the mission time.",
    guidance: "You do not get extra points for every song here. The bonus comes once the album mission is done.",
    icon: Disc3,
    pillTone: "saffron",
    badgeClassName: "border-[hsl(24,94%,68%)]/20 bg-[hsl(24,94%,68%)]/10 text-[hsl(24,94%,68%)]",
    fillClassName:
      "bg-gradient-to-r from-[hsl(24,94%,68%)] via-[hsl(340,80%,70%)] to-[hsl(284,82%,72%)]"
  }
}

const cadenceMeta: Record<
  MissionCard["cadence"],
  {
    label: string
    resetLabel: string
  }
> = {
  daily: {
    label: "Daily",
    resetLabel: "Resets every day"
  },
  weekly: {
    label: "Weekly",
    resetLabel: "Resets every Monday"
  }
}

const scopeOrder: Record<MissionCard["missionKind"], number> = {
  individual_personal: 0,
  state_shared: 1,
  india_shared: 2
}

const cadenceOrder: Record<MissionCard["cadence"], number> = {
  daily: 0,
  weekly: 1
}

const mechanicOrder: Record<MissionCard["mechanicType"], number> = {
  track_streams: 0,
  album_completions: 1
}

function MissionMeter({
  value,
  max,
  fillClassName,
  className,
  trackClassName = "bg-white/8"
}: {
  value: number
  max: number
  fillClassName: string
  className?: string
  trackClassName?: string
}) {
  const safeMax = max > 0 ? max : 1
  const width = Math.max(0, Math.min(100, (value / safeMax) * 100))

  return (
    <div className={cn("h-2.5 overflow-hidden rounded-full", trackClassName, className)}>
      <div className={cn("h-full rounded-full", fillClassName)} style={{ width: `${width}%` }} />
    </div>
  )
}

function getInitialMechanic(missions: MissionCard[]): MechanicFilter {
  if (missions.some((mission) => mission.mechanicType === "track_streams")) {
    return "track_streams"
  }

  return "album_completions"
}

function getInitialCadence(missions: MissionCard[], mechanicType: MechanicFilter): CadenceFilter {
  if (missions.some((mission) => mission.mechanicType === mechanicType && mission.cadence === "daily")) {
    return "daily"
  }

  return "weekly"
}

function sortByScope(missions: MissionCard[]) {
  return [...missions].sort((left, right) => {
    const scopeDiff = scopeOrder[left.missionKind] - scopeOrder[right.missionKind]
    if (scopeDiff !== 0) {
      return scopeDiff
    }

    return (
      cadenceOrder[left.cadence] - cadenceOrder[right.cadence] ||
      mechanicOrder[left.mechanicType] - mechanicOrder[right.mechanicType] ||
      left.title.localeCompare(right.title)
    )
  })
}

function getResetTimezoneLabel(resetTimezone: string) {
  return resetTimezone === "Asia/Kolkata" ? "IST" : resetTimezone
}

function getResetCopy(cadence: MissionCard["cadence"], resetTimezone: string) {
  const timezoneLabel = getResetTimezoneLabel(resetTimezone)

  return cadence === "daily" ? `12:00 AM ${timezoneLabel}` : `Monday 12:00 AM ${timezoneLabel}`
}

function getTrackerStatusTone(status: TrackerStatus) {
  if (status === "verified") {
    return "teal" as const
  }

  if (status === "failed") {
    return "saffron" as const
  }

  return "neutral" as const
}

function getTrackerStatusLabel(status: TrackerStatus) {
  switch (status) {
    case "verified":
      return "Connected"
    case "failed":
      return "Fix needed"
    case "pending":
      return "Checking"
    default:
      return "Not connected"
  }
}

function getMissionStatusMeta(mission: MissionCard) {
  if (mission.completionState === "completed") {
    return {
      label: "Completed",
      className: "border-[hsl(154,75%,55%)]/22 bg-[hsl(154,75%,55%)]/10 text-[hsl(154,80%,72%)]"
    }
  }

  if (mission.completionState === "locked") {
    return {
      label: "Locked",
      className: "border-[hsl(25,90%,55%)]/22 bg-[hsl(25,90%,55%)]/10 text-[hsl(35,100%,88%)]"
    }
  }

  return {
    label: "In progress",
    className: "border-white/10 bg-white/6 text-white/74"
  }
}

function getMissionProgressLabel(mission: MissionCard) {
  return `${formatCompactNumber(mission.aggregateProgress)} / ${formatCompactNumber(mission.goalUnits)}`
}

function getMissionContributionLabel(mission: MissionCard) {
  if (mission.missionKind === "individual_personal") {
    return `${mission.userContribution} from you`
  }

  if (typeof mission.contributorCount === "number") {
    return `${mission.userContribution} from you · ${mission.contributorCount} contributors`
  }

  return `${mission.userContribution} from you`
}

function getMissionCompletionCopy(mission: MissionCard, isConnected: boolean) {
  if (mission.completionState === "completed") {
    return "Bonus already added."
  }

  if (mission.completionState === "locked") {
    return "Add your state and connect your music app before this mission can count."
  }

  if (!isConnected) {
    return "Connect your music app first. Only counted streams move mission progress."
  }

  return `Reach ${mission.goalUnits} to collect the bonus automatically.`
}

function getMissionFocusCopy(mission: MissionCard) {
  if (mission.mechanicType === "track_streams") {
    return `Keep playing the listed songs until each one hits its goal.`
  }

  return "Finish the listed albums during this mission."
}

function getMissionPlainSummary(mission: MissionCard) {
  if (mission.missionKind === "individual_personal") {
    if (mission.mechanicType === "track_streams") {
      return "This is your own song mission. Finish the song goals before reset to collect the bonus."
    }

    return "This is your own album mission. Finish the listed albums before reset to collect the bonus."
  }

  if (mission.missionKind === "state_shared") {
    if (mission.mechanicType === "track_streams") {
      return "Everyone from your state helps the same song mission. If your state finishes it, the state ranking gets the bonus."
    }

    return "Everyone from your state helps the same album mission. If your state finishes it, the state ranking gets the bonus."
  }

  if (mission.mechanicType === "track_streams") {
    return "Fans across India help the same song mission. If you joined before it finished, you get the bonus too."
  }

  return "Fans across India help the same album mission. If you joined before it finished, you get the bonus too."
}

function getTargetGoalLabel(target: MissionTargetView) {
  const progress = target.progress ?? target.completedTrackCount ?? 0
  const goal = target.targetCount ?? target.trackCount ?? 1

  if (target.kind === "album") {
    return `${progress}/${goal} tracks`
  }

  return `${progress}/${goal} plays`
}

function HeroStat({
  icon: Icon,
  label,
  value,
  caption
}: {
  icon: typeof Layers3
  label: string
  value: string
  caption: string
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4">
      <div className="flex items-center gap-2 text-white/58">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-3 font-heading text-xl font-semibold tracking-tight text-white sm:text-2xl">{value}</p>
      <p className="mt-2 text-xs leading-5 text-white/54">{caption}</p>
    </div>
  )
}

function QuickJumpRail() {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [railState, setRailState] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
    thumbWidthPercent: 100,
    thumbOffsetPercent: 0
  })

  useEffect(() => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    const updateRailState = () => {
      const maxScrollLeft = Math.max(rail.scrollWidth - rail.clientWidth, 0)
      const hasOverflow = maxScrollLeft > 4
      const thumbWidthPercent = hasOverflow
        ? Math.min(100, Math.max((rail.clientWidth / rail.scrollWidth) * 100, 24))
        : 100
      const thumbTravelPercent = 100 - thumbWidthPercent
      const thumbOffsetPercent =
        hasOverflow && maxScrollLeft > 0
          ? (rail.scrollLeft / maxScrollLeft) * thumbTravelPercent
          : 0

      setRailState({
        hasOverflow,
        canScrollLeft: rail.scrollLeft > 2,
        canScrollRight: rail.scrollLeft < maxScrollLeft - 2,
        thumbWidthPercent,
        thumbOffsetPercent
      })
    }

    updateRailState()

    rail.addEventListener("scroll", updateRailState, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      updateRailState()
    })

    resizeObserver.observe(rail)
    window.addEventListener("resize", updateRailState)

    return () => {
      rail.removeEventListener("scroll", updateRailState)
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateRailState)
    }
  }, [])

  const links = [
    { href: "#tracker", label: "Connect app" },
    { href: "#playbook", label: "How it works" },
    { href: "#mission-board", label: "Live missions", featured: true },
    { href: "#faq", label: "Questions" }
  ]

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="relative">
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[rgba(28,18,49,0.96)] to-transparent transition-opacity duration-200",
            railState.canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[rgba(28,18,49,0.98)] via-[rgba(28,18,49,0.86)] to-transparent transition-opacity duration-200",
            railState.canScrollRight ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          className="w-full max-w-full min-w-0 flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          ref={railRef}
        >
          {links.map((link) => (
            <a
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                link.featured
                  ? "border-white/25 bg-[linear-gradient(90deg,rgba(255,153,51,0.95)_0%,rgba(255,255,255,0.96)_52%,rgba(19,136,8,0.95)_100%)] font-semibold text-[hsl(220,35%,14%)] shadow-[0_16px_36px_-22px_rgba(255,153,51,0.75)] hover:scale-[1.02] hover:shadow-[0_18px_40px_-18px_rgba(19,136,8,0.45)]"
                  : "border-white/10 bg-white/[0.04] text-white/74 hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
              )}
              href={link.href}
              key={link.href}
            >
              <Compass className={cn("h-3.5 w-3.5", link.featured ? "text-[hsl(220,35%,14%)]" : "")} />
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {railState.hasOverflow ? (
        <div className="mt-2 flex items-center gap-3">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[hsl(25,90%,55%)] via-white/90 to-[hsl(170,60%,45%)] transition-[width,transform] duration-150"
              style={{
                width: `${railState.thumbWidthPercent}%`,
                transform: `translateX(${railState.thumbOffsetPercent}%)`
              }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/46">
            {railState.canScrollRight ? "Swipe" : railState.canScrollLeft ? "More" : "Links"}
          </span>
        </div>
      ) : null}
    </div>
  )
}

function MissionControlHero({
  missionState,
  allMissions,
  trackMissionCount,
  albumMissionCount,
  isConnected
}: {
  missionState: MissionPageState
  allMissions: MissionCard[]
  trackMissionCount: number
  albumMissionCount: number
  isConnected: boolean
}) {
  const trackerStatus = missionState.trackerConnection?.verificationStatus ?? "missing"

  return (
    <DashboardPanel className="overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(116,59,255,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,156,83,0.18),transparent_28%)]" />
      <div className="relative grid gap-4 p-4 sm:gap-5 sm:p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] xl:gap-8 xl:p-8">
        <div className="min-w-0 space-y-4 sm:space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <DashboardPill icon={Target} tone="purple">
              Mission control
            </DashboardPill>
            <DashboardPill icon={CalendarClock} tone="neutral">
              Daily reset {getResetCopy("daily", missionState.resetTimezone)}
            </DashboardPill>
            <DashboardPill icon={CalendarClock} tone="neutral">
              Weekly reset {getResetCopy("weekly", missionState.resetTimezone)}
            </DashboardPill>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-[14ch] font-heading text-[2.2rem] font-semibold leading-[0.96] tracking-[-0.05em] text-white sm:text-[3.2rem]">
              Missions made simple
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              Your streams still earn points as usual. Missions are extra goals on top of that, with a bonus when you
              finish them.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <DashboardPill icon={UserRound} tone={missionState.isAuthenticated ? "teal" : "neutral"}>
              {missionState.isAuthenticated ? "Signed in" : "Guest mode"}
            </DashboardPill>
            <DashboardPill icon={MapPinned} tone={missionState.regionConfirmed ? "teal" : "saffron"}>
              {missionState.regionConfirmed ? missionState.state ?? "State confirmed" : "State confirmation needed"}
            </DashboardPill>
            <DashboardPill icon={Link2} tone={getTrackerStatusTone(trackerStatus)}>
              {getTrackerStatusLabel(trackerStatus)}
            </DashboardPill>
            <DashboardPill icon={Sparkles} tone={isConnected ? "teal" : "neutral"}>
              {isConnected ? "Ready to count" : "Connect your app"}
            </DashboardPill>
            <ScoringGuideModal
              buttonClassName="border-[hsl(265,70%,65%)]/24 bg-[hsl(265,70%,65%)]/10 text-[hsl(277,100%,88%)] hover:bg-[hsl(265,70%,65%)]/16"
              streamPointValue={missionState.streamPointValue}
            />
          </div>

          <QuickJumpRail />

          <div
            className={cn(
              "rounded-[1.05rem] border px-3.5 py-2.5 text-sm leading-6 sm:rounded-[1.15rem] sm:px-4 sm:py-3",
              missionState.verificationBlockedReason
                ? "border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 text-[hsl(35,100%,88%)]"
                : "border-[hsl(154,75%,55%)]/18 bg-[hsl(154,75%,55%)]/10 text-[hsl(154,80%,72%)]"
            )}
          >
            {missionState.verificationBlockedReason ??
              "You're ready. Pick a section below and focus on one mission at a time."}
          </div>
        </div>

        <div className="min-w-0 grid gap-3 sm:grid-cols-2">
          <HeroStat
            caption="These are your regular points from counted streams."
            icon={Layers3}
            label="Each stream"
            value={`+${missionState.streamPointValue} ${missionState.streamPointValue === 1 ? "point" : "points"}`}
          />
          <HeroStat
            caption="Finish the mission to collect this extra bonus."
            icon={Zap}
            label="Completion bonus"
            value="Separate reward"
          />
          <HeroStat
            caption="Song missions are live across both daily and weekly cells."
            icon={Music4}
            label="Song missions"
            value={`${trackMissionCount} live`}
          />
          <HeroStat
            caption="Album missions are live across both daily and weekly cells."
            icon={Disc3}
            label="Album missions"
            value={`${albumMissionCount} live`}
          />
        </div>
      </div>
    </DashboardPanel>
  )
}

function PlaybookCard({
  icon: Icon,
  title,
  description,
  tone
}: {
  icon: typeof Radio
  title: string
  description: string
  tone: ToneName
}) {
  const toneClasses = {
    purple: "border-[hsl(265,70%,65%)]/16 bg-[hsl(265,70%,65%)]/8 text-[hsl(277,100%,88%)]",
    teal: "border-[hsl(170,60%,45%)]/16 bg-[hsl(170,60%,45%)]/8 text-[hsl(171,100%,88%)]",
    saffron: "border-[hsl(25,90%,55%)]/16 bg-[hsl(25,90%,55%)]/8 text-[hsl(35,100%,88%)]"
  } as const

  return (
    <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.2rem] sm:p-4">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-[0.95rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          toneClasses[tone]
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/62">{description}</p>
    </div>
  )
}

function MissionScopeCard({ missionKind }: { missionKind: MissionCard["missionKind"] }) {
  const meta = scopeMeta[missionKind]

  return (
    <div className="rounded-[1.1rem] border border-white/10 bg-black/10 p-3.5 sm:rounded-[1.2rem] sm:p-4">
      <Badge className={cn("w-fit border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", meta.badgeClassName)}>
        {meta.label}
      </Badge>
      <p className="mt-3 text-sm font-medium text-white">{meta.description}</p>
      <p className="mt-2 text-sm leading-6 text-white/56">{meta.rewardCopy}</p>
    </div>
  )
}

function MissionPlaybook({ missionState }: { missionState: MissionPageState }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="scroll-mt-24" id="playbook">
      <DashboardPanel className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-3">
            <DashboardPill icon={Compass} tone="purple">
              How it works
            </DashboardPill>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">How missions work</h2>
              <p className="max-w-3xl text-sm leading-6 text-white/64">
                This explains what counts right away, what gives bonus points, and who gets the reward when a mission
                is finished.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 md:hidden">
          <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.2rem] sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Quick summary</p>
                <p className="mt-1 text-sm leading-6 text-white/58">
                  Connect your app, let streams count normally, then collect the bonus when the mission is finished.
                </p>
              </div>
              <button
                aria-expanded={isExpanded}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/78 transition hover:border-white/18 hover:bg-white/[0.07] hover:text-white"
                onClick={() => setIsExpanded((current) => !current)}
                type="button"
              >
                {isExpanded ? "Hide details" : "Show details"}
                <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
              </button>
            </div>

            {!isExpanded ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <DashboardPill icon={Radio} tone="purple">Connect app</DashboardPill>
                <DashboardPill icon={Layers3} tone="teal">Streams count</DashboardPill>
                <DashboardPill icon={Sparkles} tone="saffron">Bonus on finish</DashboardPill>
              </div>
            ) : null}
          </div>
        </div>

        <div className={cn("space-y-4 sm:space-y-5", isExpanded ? "mt-4 block sm:mt-5" : "mt-4 hidden md:block sm:mt-5")}>
          <div className="grid gap-3 lg:grid-cols-3">
            <PlaybookCard
              description="Connect one music app, make sure your state is set, then update your mission progress after a listening session."
              icon={Radio}
              title="1. Connect your app"
              tone="purple"
            />
            <PlaybookCard
              description={`Every counted stream is still worth +${missionState.streamPointValue} ${
                missionState.streamPointValue === 1 ? "point" : "points"
              }. If your state is set, those points help your own score and your state score.`}
              icon={Layers3}
              title="2. Streams still count"
              tone="teal"
            />
            <PlaybookCard
              description="Mission rewards are extra. The mission type decides whether the bonus goes to you, your state, or both."
              icon={Sparkles}
              title="3. Finishing gives the bonus"
              tone="saffron"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <MissionScopeCard missionKind="individual_personal" />
            <MissionScopeCard missionKind="state_shared" />
            <MissionScopeCard missionKind="india_shared" />
          </div>
        </div>
      </DashboardPanel>
    </section>
  )
}

function FilterButton({
  active,
  children,
  disabled = false,
  onClick
}: {
  active: boolean
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        "shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition",
        active
          ? "border-[hsl(265,70%,65%)]/30 bg-[rgba(56,36,94,0.92)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-white/10 bg-white/[0.03] text-white/62 hover:border-white/18 hover:bg-white/[0.06] hover:text-white",
        disabled && "cursor-not-allowed opacity-45"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function MissionSummaryCard({
  mission,
  isActive,
  onSelect
}: {
  mission: MissionCard
  isActive: boolean
  onSelect: () => void
}) {
  const statusMeta = getMissionStatusMeta(mission)
  const scope = scopeMeta[mission.missionKind]
  const mechanic = mechanicMeta[mission.mechanicType]

  return (
    <button
      className={cn(
        "w-full rounded-[1.1rem] border p-3.5 text-left transition sm:rounded-[1.2rem] sm:p-4",
        isActive
          ? "border-[hsl(265,70%,65%)]/28 bg-[rgba(43,30,76,0.9)] shadow-[0_22px_60px_-38px_rgba(0,0,0,0.82)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.05]"
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", scope.badgeClassName)}>
              {scope.label}
            </Badge>
            <Badge className={cn("border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", statusMeta.className)}>
              {statusMeta.label}
            </Badge>
          </div>
          <h3 className="mt-3 font-heading text-lg font-semibold tracking-tight text-white">{mission.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/58">{mission.focus}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold text-white">+{mission.rewardPoints}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/46">Bonus</p>
        </div>
      </div>

      <div className="mt-3.5 sm:mt-4">
        <MissionMeter fillClassName={mechanic.fillClassName} max={mission.goalUnits || 1} value={mission.aggregateProgress} />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-white/54 sm:mt-3">
        <span>{getMissionProgressLabel(mission)}</span>
        <span>{getMissionContributionLabel(mission)}</span>
      </div>
    </button>
  )
}

function MissionTargetList({
  mission
}: {
  mission: MissionCard
}) {
  const [expandedTargets, setExpandedTargets] = useState<Record<string, boolean>>({})

  function toggleTarget(key: string) {
    setExpandedTargets((current) => ({
      ...current,
      [key]: !current[key]
    }))
  }

  if (mission.targets.length === 0) {
    return (
      <div className="rounded-[1.1rem] border border-dashed border-white/12 bg-white/[0.03] px-3.5 py-4 text-sm text-white/58 sm:rounded-[1.15rem] sm:px-4 sm:py-5">
        No targets are assigned to this mission yet.
      </div>
    )
  }

  return (
    <div className={cn("space-y-2.5", mission.targets.length > 4 && "max-h-[30rem] overflow-y-auto pr-1")}>
      {mission.targets.map((target) => {
        if (target.kind === "album") {
          const completedTrackCount = target.completedTrackCount ?? 0
          const trackCount = target.trackCount ?? target.tracks?.length ?? 0
          const isExpanded = expandedTargets[target.key]

          return (
            <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-2.5 sm:p-4" key={target.key}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {target.imageUrl ? (
                    <img
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-[1rem] border border-white/10 object-cover"
                      decoding="async"
                      loading="lazy"
                      src={target.imageUrl}
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 text-white/54">
                      <Trophy className="h-4 w-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    {target.spotifyUrl ? (
                      <a
                        className="block text-sm font-semibold text-white transition hover:text-[hsl(265,90%,82%)]"
                        href={target.spotifyUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {target.title}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-white">{target.title}</p>
                    )}
                    <p className="mt-1 text-xs text-white/56">
                      {target.artistName} · {trackCount} required tracks
                    </p>
                  </div>
                </div>

                <button
                  className="flex items-center justify-between gap-4 rounded-[0.95rem] border border-white/10 bg-black/10 px-3 py-2 text-left transition hover:bg-white/[0.06] sm:min-w-[12rem]"
                  onClick={() => toggleTarget(target.key)}
                  type="button"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {completedTrackCount}/{trackCount}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/42">Verified tracks</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-white/56" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/56" />
                  )}
                </button>
              </div>

              {isExpanded ? (
                <div className="mt-3 space-y-2 border-t border-white/8 pt-3">
                  {(target.tracks ?? []).map((track, index) =>
                    track.spotifyUrl ? (
                      <a
                        className="flex items-center gap-3 rounded-[0.95rem] border border-white/8 bg-black/10 px-3 py-2.5 transition hover:border-white/14 hover:bg-white/[0.05]"
                        href={track.spotifyUrl}
                        key={track.key}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span className="w-5 shrink-0 text-xs text-white/42">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white sm:truncate">{track.title}</p>
                          <p className="mt-1 text-xs text-white/52 sm:truncate">{track.artistName}</p>
                        </div>
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            track.isCompleted
                              ? "bg-[hsl(154,80%,62%)]/12 text-[hsl(154,80%,72%)]"
                              : "bg-white/6 text-white/60"
                          )}
                        >
                          {track.isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                          {track.isCompleted ? "Done" : "Pending"}
                        </div>
                      </a>
                    ) : (
                      <div
                        className="flex items-center gap-3 rounded-[0.95rem] border border-white/8 bg-black/10 px-3 py-2.5"
                        key={track.key}
                      >
                        <span className="w-5 shrink-0 text-xs text-white/42">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white sm:truncate">{track.title}</p>
                          <p className="mt-1 text-xs text-white/52 sm:truncate">{track.artistName}</p>
                        </div>
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            track.isCompleted
                              ? "bg-[hsl(154,80%,62%)]/12 text-[hsl(154,80%,72%)]"
                              : "bg-white/6 text-white/60"
                          )}
                        >
                          {track.isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                          {track.isCompleted ? "Done" : "Pending"}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : null}
            </div>
          )
        }

        return target.spotifyUrl ? (
          <a
            className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.03] p-2.5 transition hover:border-white/16 hover:bg-white/[0.05] sm:p-4"
            href={target.spotifyUrl}
            key={target.key}
            rel="noreferrer"
            target="_blank"
          >
            {target.imageUrl ? (
              <img
                alt=""
                className="h-14 w-14 shrink-0 rounded-[1rem] border border-white/10 object-cover"
                decoding="async"
                loading="lazy"
                src={target.imageUrl}
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 text-white/54">
                <Trophy className="h-4 w-4" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white sm:truncate">{target.title}</p>
              <p className="mt-1 text-xs text-white/56 sm:truncate">{target.artistName}</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-white">{getTargetGoalLabel(target)}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/42">Target</p>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-white/[0.03] p-2.5 sm:p-4" key={target.key}>
            {target.imageUrl ? (
              <img
                alt=""
                className="h-14 w-14 shrink-0 rounded-[1rem] border border-white/10 object-cover"
                decoding="async"
                loading="lazy"
                src={target.imageUrl}
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 text-white/54">
                <Trophy className="h-4 w-4" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white sm:truncate">{target.title}</p>
              <p className="mt-1 text-xs text-white/56 sm:truncate">{target.artistName}</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-white">{getTargetGoalLabel(target)}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/42">Target</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MissionDetailCard({
  mission,
  streamPointValue,
  isConnected,
  resetTimezone
}: {
  mission: MissionCard
  streamPointValue: number
  isConnected: boolean
  resetTimezone: string
}) {
  const scope = scopeMeta[mission.missionKind]
  const mechanic = mechanicMeta[mission.mechanicType]
  const statusMeta = getMissionStatusMeta(mission)
  const Icon = mechanic.icon
  const [expandedDetailSection, setExpandedDetailSection] = useState<"finish" | "bonus" | "state">("finish")

  useEffect(() => {
    setExpandedDetailSection("finish")
  }, [mission.id])

  const detailSections = [
    {
      key: "finish" as const,
      title: "How to finish",
      heading: getMissionFocusCopy(mission),
      body: mechanic.guidance
    },
    {
      key: "bonus" as const,
      title: "Who gets the bonus",
      heading: scope.description,
      body: scope.rewardCopy
    },
    {
      key: "state" as const,
      title: "Current mission state",
      heading: cadenceMeta[mission.cadence].resetLabel,
      body: `Ends ${formatDateLabel(mission.endsAt)} · resets ${getResetCopy(mission.cadence, resetTimezone)}.`,
      footnote: getMissionContributionLabel(mission)
    }
  ]

  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,13,29,0.82),rgba(10,11,20,0.92))] p-3.5 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.9)] sm:rounded-[1.35rem] sm:p-5">
      <div className="flex flex-col gap-3.5 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", scope.badgeClassName)}>
              {scope.label}
            </Badge>
            <Badge className={cn("border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", mechanic.badgeClassName)}>
              {mechanic.label}
            </Badge>
            <Badge className={cn("border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", statusMeta.className)}>
              {statusMeta.label}
            </Badge>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                mechanic.badgeClassName
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">{mission.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/62">{getMissionPlainSummary(mission)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.05rem] border border-white/10 bg-black/10 px-3.5 py-3 text-left lg:min-w-[12rem] lg:text-right sm:px-4">
          <p className="text-2xl font-semibold text-white">+{mission.rewardPoints}</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/46">Completion reward</p>
          <p className="mt-3 text-xs leading-5 text-white/58">
            Your streams still keep their normal +{streamPointValue} {streamPointValue === 1 ? "point" : "points"}.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 sm:mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-white/62">Mission progress</span>
          <span className="font-semibold text-white">{getMissionProgressLabel(mission)}</span>
        </div>
        <ProgressBar max={mission.goalUnits || 1} value={mission.aggregateProgress} />
      </div>

      <div className="mt-4 space-y-2.5 md:hidden sm:mt-5">
        {detailSections.map((section) => {
          const isExpanded = expandedDetailSection === section.key

          return (
            <div
              className="rounded-[1.1rem] border border-white/10 bg-white/[0.03]"
              key={section.key}
            >
              <button
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left sm:px-4"
                onClick={() =>
                  setExpandedDetailSection((current) => (current === section.key ? current : section.key))
                }
                type="button"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">{section.title}</p>
                  <p className="mt-2 text-sm font-medium text-white">{section.heading}</p>
                </div>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-white/56 transition-transform", isExpanded && "rotate-180")} />
              </button>

              {isExpanded ? (
                <div className="border-t border-white/8 px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4">
                  <p className="text-sm leading-6 text-white/56">{section.body}</p>
                  {section.footnote ? (
                    <p className="mt-2 text-sm leading-6 text-white/56">{section.footnote}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-5 hidden gap-3 md:grid md:grid-cols-3">
        <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3.5 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">How to finish</p>
          <p className="mt-2 text-sm font-medium text-white">{getMissionFocusCopy(mission)}</p>
          <p className="mt-2 text-sm leading-6 text-white/56">{mechanic.guidance}</p>
        </div>

        <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3.5 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">Who gets the bonus</p>
          <p className="mt-2 text-sm font-medium text-white">{scope.description}</p>
          <p className="mt-2 text-sm leading-6 text-white/56">{scope.rewardCopy}</p>
        </div>

        <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3.5 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">Current mission state</p>
          <p className="mt-2 text-sm font-medium text-white">{cadenceMeta[mission.cadence].resetLabel}</p>
          <p className="mt-2 text-sm leading-6 text-white/56">
            Ends {formatDateLabel(mission.endsAt)} · resets {getResetCopy(mission.cadence, resetTimezone)}.
          </p>
          <p className="mt-2 text-sm leading-6 text-white/56">{getMissionContributionLabel(mission)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.05rem] border border-white/10 bg-white/[0.03] p-3.5 sm:mt-5 sm:rounded-[1.1rem] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">Assigned targets</p>
            <p className="mt-2 text-sm text-white/62">
              Tap a target to open it in Spotify. Album missions can be expanded to show every required song.
            </p>
          </div>
          <DashboardPill icon={Target} tone={mechanic.pillTone}>
            {mission.targets.length} targets
          </DashboardPill>
        </div>

        <div className="mt-3.5 sm:mt-4">
          <MissionTargetList mission={mission} />
        </div>
      </div>

      <div
        className={cn(
          "mt-4 rounded-[1rem] border px-3.5 py-2.5 text-sm font-medium leading-6 sm:mt-5 sm:rounded-[1.05rem] sm:px-4 sm:py-3",
          mission.completionState === "completed"
            ? "border-[hsl(154,75%,55%)]/20 bg-[hsl(154,75%,55%)]/10 text-[hsl(154,80%,72%)]"
            : mission.completionState === "locked"
              ? "border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 text-[hsl(35,100%,88%)]"
              : "border-white/10 bg-white/[0.03] text-white/68"
        )}
      >
        {getMissionCompletionCopy(mission, isConnected)}
      </div>
    </div>
  )
}

function MissionBoard({
  allMissions,
  selectedCadence,
  selectedMechanic,
  selectedMission,
  setSelectedCadence,
  setSelectedMechanic,
  setSelectedMissionId,
  missionState,
  visibleMissions,
  isConnected
}: {
  allMissions: MissionCard[]
  selectedCadence: CadenceFilter
  selectedMechanic: MechanicFilter
  selectedMission: MissionCard | null
  setSelectedCadence: (cadence: CadenceFilter) => void
  setSelectedMechanic: (mechanic: MechanicFilter) => void
  setSelectedMissionId: (missionId: string) => void
  missionState: MissionPageState
  visibleMissions: MissionCard[]
  isConnected: boolean
}) {
  const activeMechanic = mechanicMeta[selectedMechanic]
  const ActiveMechanicIcon = activeMechanic.icon
  const detailRef = useRef<HTMLDivElement | null>(null)
  const dailyCount = allMissions.filter(
    (mission) => mission.mechanicType === selectedMechanic && mission.cadence === "daily"
  ).length
  const weeklyCount = allMissions.filter(
    (mission) => mission.mechanicType === selectedMechanic && mission.cadence === "weekly"
  ).length
  const trackCount = allMissions.filter((mission) => mission.mechanicType === "track_streams").length
  const albumCount = allMissions.filter((mission) => mission.mechanicType === "album_completions").length

  function focusMissionDetail(missionId: string) {
    setSelectedMissionId(missionId)

    if (typeof window === "undefined" || window.innerWidth >= 1280) {
      return
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        })
      })
    })
  }

  return (
    <section className="scroll-mt-24" id="mission-board">
      <DashboardPanel className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-3">
            <DashboardPill icon={Waves} tone="purple">Live missions</DashboardPill>
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">Pick a section, then focus on one mission</h2>
              <p className="max-w-3xl text-sm leading-6 text-white/64">
                Switch between songs and albums, daily and weekly, then open the mission you want to work on.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <DashboardPill icon={Music4} tone="purple">
              {trackCount} song
            </DashboardPill>
            <DashboardPill icon={Disc3} tone="saffron">
              {albumCount} album
            </DashboardPill>
            <DashboardPill icon={Globe2} tone="neutral">
              {allMissions.length} live total
            </DashboardPill>
          </div>
        </div>

        <div className="mt-4 grid gap-3.5 sm:mt-5 sm:gap-4 xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-3.5 sm:space-y-4">
            <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] p-3.5 sm:rounded-[1.2rem] sm:p-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">Mechanic</p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <FilterButton
                    active={selectedMechanic === "track_streams"}
                    onClick={() => setSelectedMechanic("track_streams")}
                  >
                    Songs ({trackCount})
                  </FilterButton>
                  <FilterButton
                    active={selectedMechanic === "album_completions"}
                    onClick={() => setSelectedMechanic("album_completions")}
                  >
                    Albums ({albumCount})
                  </FilterButton>
                </div>
              </div>

              <div className="mt-3.5 sm:mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">Cadence</p>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <FilterButton
                    active={selectedCadence === "daily"}
                    disabled={dailyCount === 0}
                    onClick={() => setSelectedCadence("daily")}
                  >
                    Daily ({dailyCount})
                  </FilterButton>
                  <FilterButton
                    active={selectedCadence === "weekly"}
                    disabled={weeklyCount === 0}
                    onClick={() => setSelectedCadence("weekly")}
                  >
                    Weekly ({weeklyCount})
                  </FilterButton>
                </div>
              </div>

              <div className="mt-3.5 rounded-[1rem] border border-white/10 bg-black/10 p-3 sm:mt-4 sm:p-3.5">
                <div className="flex items-center gap-2">
                  <ActiveMechanicIcon className="h-4 w-4 text-white/70" />
                  <p className="text-sm font-semibold text-white">{activeMechanic.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/58">{activeMechanic.description}</p>
              </div>
            </div>

            {visibleMissions.length > 0 ? (
              <div className="space-y-3">
                {visibleMissions.map((mission) => (
                  <MissionSummaryCard
                    isActive={selectedMission?.id === mission.id}
                    key={mission.id}
                    mission={mission}
                    onSelect={() => focusMissionDetail(mission.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.1rem] border border-dashed border-white/14 bg-white/[0.03] px-3.5 py-5 text-sm leading-6 text-white/58 sm:rounded-[1.2rem] sm:px-4 sm:py-6">
                Nothing is live in this section right now.
              </div>
            )}
          </div>

          {selectedMission ? (
            <div className="min-w-0 scroll-mt-24" ref={detailRef}>
              <MissionDetailCard
                isConnected={isConnected}
                mission={selectedMission}
                resetTimezone={missionState.resetTimezone}
                streamPointValue={missionState.streamPointValue}
              />
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-white/14 bg-white/[0.03] px-4 py-6 text-sm leading-6 text-white/58 sm:rounded-[1.35rem] sm:px-5 sm:py-8">
              {allMissions.length === 0
                ? "No missions are live yet. When they go up, details will show here."
                : "Pick a mission on the left to see the targets, bonus, and time left."}
            </div>
          )}
        </div>
      </DashboardPanel>
    </section>
  )
}

function FAQItem({
  question,
  answer
}: {
  question: string
  answer: string
}) {
  return (
    <details className="group rounded-[1.05rem] border border-white/10 bg-white/[0.03] px-3.5 py-3 sm:rounded-[1.1rem] sm:px-4 sm:py-3.5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white">
        <span>{question}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-white/54 transition group-open:rotate-180" />
      </summary>
      <p className="mt-3 text-sm leading-6 text-white/60">{answer}</p>
    </details>
  )
}

function MissionFAQ({ missionState }: { missionState: MissionPageState }) {
  const timezoneLabel = getResetTimezoneLabel(missionState.resetTimezone)

  return (
    <section className="scroll-mt-24" id="faq">
      <DashboardPanel className="p-4 sm:p-6">
        <div className="space-y-3">
          <DashboardPill icon={LockKeyhole} tone="purple">
            Questions
          </DashboardPill>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">Common questions</h2>
            <p className="max-w-3xl text-sm leading-6 text-white/64">
              These are the points that usually confuse people, now written more simply.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
          <FAQItem
            answer={`Yes. Your counted streams still give the normal +${missionState.streamPointValue} ${
              missionState.streamPointValue === 1 ? "point" : "points"
            } even if you do not finish the mission. The mission bonus is extra.`}
            question="Do my streams still count if I never complete the mission?"
          />
          <FAQItem
            answer="Locked usually means one step is missing: sign-in, state selection, or a connected music app."
            question="Why does a mission show as locked?"
          />
          <FAQItem
            answer="Personal missions help you and your state. State missions help the state score. India missions reward the people who joined before the India goal was completed."
            question="How are personal, state, and India rewards different?"
          />
          <FAQItem
            answer={`Daily windows reset at 12:00 AM ${timezoneLabel}. Weekly windows reset every Monday at 12:00 AM ${timezoneLabel}.`}
            question="When do daily and weekly missions reset?"
          />
        </div>
      </DashboardPanel>
    </section>
  )
}

export function MissionPage({ missionState }: MissionPageProps) {
  const allMissions = sortByScope([...missionState.daily, ...missionState.weekly])
  const trackMissionCount = allMissions.filter((mission) => mission.mechanicType === "track_streams").length
  const albumMissionCount = allMissions.filter((mission) => mission.mechanicType === "album_completions").length
  const isConnected = missionState.trackerConnection?.verificationStatus === "verified"

  const [selectedMechanic, setSelectedMechanic] = useState<MechanicFilter>(getInitialMechanic(allMissions))
  const [selectedCadence, setSelectedCadence] = useState<CadenceFilter>(
    getInitialCadence(allMissions, getInitialMechanic(allMissions))
  )
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)

  const mechanicOptions = (["track_streams", "album_completions"] as const).filter((mechanicType) =>
    allMissions.some((mission) => mission.mechanicType === mechanicType)
  )

  useEffect(() => {
    if (!mechanicOptions.includes(selectedMechanic)) {
      setSelectedMechanic(mechanicOptions[0] ?? "track_streams")
    }
  }, [mechanicOptions, selectedMechanic])

  const cadenceOptions = (["daily", "weekly"] as const).filter((cadence) =>
    allMissions.some((mission) => mission.mechanicType === selectedMechanic && mission.cadence === cadence)
  )

  useEffect(() => {
    if (!cadenceOptions.includes(selectedCadence)) {
      setSelectedCadence(cadenceOptions[0] ?? "daily")
    }
  }, [cadenceOptions, selectedCadence])

  const visibleMissions = sortByScope(
    allMissions.filter(
      (mission) => mission.mechanicType === selectedMechanic && mission.cadence === selectedCadence
    )
  )

  useEffect(() => {
    if (!visibleMissions.some((mission) => mission.id === selectedMissionId)) {
      setSelectedMissionId(visibleMissions[0]?.id ?? null)
    }
  }, [selectedMissionId, visibleMissions])

  const selectedMission =
    visibleMissions.find((mission) => mission.id === selectedMissionId) ?? visibleMissions[0] ?? null

  return (
    <div className="space-y-5 sm:space-y-8">
      <MissionControlHero
        albumMissionCount={albumMissionCount}
        allMissions={allMissions}
        isConnected={isConnected}
        missionState={missionState}
        trackMissionCount={trackMissionCount}
      />

      <div className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.25fr)_24rem]">
        <div className="order-2 min-w-0 space-y-5 sm:space-y-6 xl:order-1">
          <MissionPlaybook missionState={missionState} />
          <MissionBoard
            allMissions={allMissions}
            isConnected={isConnected}
            missionState={missionState}
            selectedCadence={selectedCadence}
            selectedMechanic={selectedMechanic}
            selectedMission={selectedMission}
            setSelectedCadence={setSelectedCadence}
            setSelectedMechanic={setSelectedMechanic}
            setSelectedMissionId={setSelectedMissionId}
            visibleMissions={visibleMissions}
          />
          <MissionFAQ missionState={missionState} />
        </div>

        <div className="order-1 min-w-0 space-y-5 sm:space-y-6 xl:order-2 xl:sticky xl:top-24 xl:self-start">
          <section className="scroll-mt-24" id="tracker">
            <MissionActions
              isAuthenticated={missionState.isAuthenticated}
              regionConfirmed={missionState.regionConfirmed}
              state={missionState.state}
              trackerConnection={missionState.trackerConnection}
              streamPointValue={missionState.streamPointValue}
              verificationBlockedReason={missionState.verificationBlockedReason}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
