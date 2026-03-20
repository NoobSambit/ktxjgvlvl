import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Suspense, cache } from "react"
import {
  ArrowRight,
  Award,
  CalendarDays,
  MapPin,
  Sparkles,
  Trophy,
  Users
} from "lucide-react"
import { ActivityMapPanel } from "@/components/activity-map/activity-map-panel"
import {
  ActivityMapPanelSkeleton,
  DashboardHeaderPanelSkeleton,
  EventPanelSkeleton,
  LeaderboardPanelSkeleton,
  MissionControlPanelSkeleton,
  QuickReadsPanelSkeleton
} from "@/components/dashboard/dashboard-loading"
import { QuickReadsPanel } from "@/components/dashboard/quick-reads-panel"
import { DashboardPanel, DashboardPanelHeader, DashboardPill } from "@/components/dashboard/dashboard-shell"
import { MissionControlPanel } from "@/components/dashboard/mission-control-panel"
import { TrackerConnectionManager } from "@/components/dashboard/tracker-connection-manager"
import { getActivityMapView } from "@/modules/activity-map/service"
import { type EventView, listEvents } from "@/modules/events/service"
import { listGuideQuickReads } from "@/modules/guides/service"
import { listLeaderboards } from "@/modules/leaderboards/service"
import type { LeaderboardBoardView, LeaderboardEntryView } from "@/modules/leaderboards/types"
import { getMissionPageState } from "@/modules/missions/service"
import { getCurrentUserProfile } from "@/modules/users/service"
import type { UserProfileView } from "@/modules/users/types"
import { formatCompactNumber, formatDateLabel } from "@/lib/utils"

export const dynamic = "force-dynamic"

const rankCards = [
  {
    key: "individualDailyRank",
    label: "Your daily rank",
    compactLabel: "Your daily",
    icon: Award,
    mobileMeta: "Today",
    footnote: "Verified streams and mission points counted today."
  },
  {
    key: "individualWeeklyRank",
    label: "Your weekly rank",
    compactLabel: "Your weekly",
    icon: Award,
    mobileMeta: "This week",
    footnote: "Your standing for the full current week."
  },
  {
    key: "stateDailyRank",
    label: "State daily rank",
    compactLabel: "State daily",
    icon: Users,
    mobileMeta: "State today",
    footnote: "How your state is performing today."
  },
  {
    key: "stateWeeklyRank",
    label: "State weekly rank",
    compactLabel: "State weekly",
    icon: Award,
    mobileMeta: "State week",
    footnote: "How your state is doing across the week."
  }
] as const

type SimpleStatCardProps = {
  label: string
  value: React.ReactNode
  description: React.ReactNode
  icon?: LucideIcon
}

function SimpleStatCard({ description, icon: Icon, label, value }: SimpleStatCardProps) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-2 text-sm font-medium text-white/72">
        {Icon ? <Icon className="h-4 w-4 text-[hsl(265,70%,72%)]" /> : null}
        <span>{label}</span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="text-lg font-semibold text-white">{value}</div>
        <p className="text-sm leading-relaxed text-white/58">{description}</p>
      </div>
    </div>
  )
}

function formatRankValue(value: number | null) {
  return value ? `#${value}` : "Unranked"
}

function formatEventDay(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit"
  }).format(new Date(value))
}

function formatEventMonth(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short"
  }).format(new Date(value))
}

function isLiveEvent(event: EventView) {
  return new Date(event.startsAt).getTime() <= Date.now()
}

function getMovement(entry: LeaderboardEntryView) {
  if (entry.previousRank == null) {
    return null
  }

  const delta = entry.previousRank - entry.rank

  if (delta > 0) {
    return {
      label: `Up ${delta}`,
      tone: "teal" as const
    }
  }

  if (delta < 0) {
    return {
      label: `Down ${Math.abs(delta)}`,
      tone: "rose" as const
    }
  }

  return {
    label: "No change",
    tone: "neutral" as const
  }
}

function LeaderboardSnapshotGrid({ profile }: { profile: UserProfileView }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {rankCards.map((item) => {
        const Icon = item.icon
        const value = profile[item.key]
        const isStateRank = item.key === "stateDailyRank" || item.key === "stateWeeklyRank"

        return (
          <div
            key={item.key}
            className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-white/8 text-white sm:h-10 sm:w-10 sm:rounded-[1rem]">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <span className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">
                {item.mobileMeta}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-medium leading-4 text-white/64 sm:hidden">{item.compactLabel}</p>
              <p className="hidden text-sm font-medium text-white/72 sm:block">{item.label}</p>
              <p className="mt-1 text-[1.75rem] font-semibold leading-none text-white sm:text-2xl">
                {formatRankValue(value)}
              </p>
            </div>

            <p className="mt-3 text-[11px] leading-4 text-white/52 sm:hidden">
              {isStateRank ? profile.stateLabel : item.mobileMeta}
            </p>
            <p className="mt-3 hidden text-sm leading-relaxed text-white/56 sm:block">
              {isStateRank
                ? `${profile.stateLabel}. ${item.footnote}`
                : item.footnote}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function DashboardHeaderPanel({
  missionState,
  profile
}: {
  missionState: Awaited<ReturnType<typeof getMissionPageState>>
  profile: UserProfileView
}) {
  const cityValue = profile.cityLabel ?? profile.suggestedCityLabel ?? "City or town not set"
  const cityTone = profile.cityMode === "confirmed" ? "Confirmed city" : profile.cityMode === "ip_fallback" ? "Fallback city" : "Add city"
  const stateDescription =
    profile.cityMode === "confirmed"
      ? "Leaderboard scoring location is confirmed and your hotspot map can stay precise."
      : profile.cityMode === "ip_fallback"
        ? "State scoring is live. Confirm your city if you want more accurate hotspot attribution."
        : "Confirm your state and add your city or town to improve leaderboard and hotspot accuracy."

  return (
    <DashboardPanel className="p-3.5 sm:p-4 lg:p-5">
      <div className="flex flex-wrap gap-2">
        <DashboardPill icon={Sparkles} tone="purple">
          My ARMY Room
        </DashboardPill>
        <DashboardPill icon={MapPin} tone={profile.regionConfirmed ? "teal" : "saffron"}>
          {profile.stateLabel}
        </DashboardPill>
      </div>

      <div className="mt-4 space-y-2">
        <h1 className="font-heading text-[2rem] font-semibold tracking-tight text-white sm:text-[2.4rem]">
          Namaste, {profile.displayName}!
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-white/62 sm:text-[15px]">
          Your weekly mission, scoring setup, and location at a glance.
        </p>
      </div>

      <div className="mt-3 rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">Leaderboard snapshot</p>
            <p className="mt-1 hidden text-sm text-white/58 sm:block">
              These four ranks are the fast answer to where you and your state stand right now.
            </p>
          </div>
          <DashboardPill tone="purple">Live standings</DashboardPill>
        </div>

        <div className="mt-4">
          <LeaderboardSnapshotGrid profile={profile} />
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <TrackerConnectionManager
          isAuthenticated={missionState.isAuthenticated}
          trackerConnection={missionState.trackerConnection}
          streamPointValue={missionState.streamPointValue}
          triggerVariant="status-card"
          verificationBlockedReason={missionState.verificationBlockedReason}
        />
        <SimpleStatCard
          description={stateDescription}
          icon={MapPin}
          label="State status"
          value={
            <div className="space-y-1">
              <p>{profile.stateLabel}</p>
              <p className="text-sm font-medium text-white/58">
                {cityTone}: <span className="text-white/78">{cityValue}</span>
              </p>
            </div>
          }
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <Link className="btn-bts-primary text-sm" href="/missions">
          Continue missions <ArrowRight className="h-4 w-4" />
        </Link>
        <Link className="btn-bts-secondary text-sm" href="/profile">
          Refine profile <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </DashboardPanel>
  )
}

function EventPanel({ events }: { events: EventView[] }) {
  const nextEvent = events[0]

  return (
    <DashboardPanel className="p-3.5 sm:p-4 lg:p-5">
      <DashboardPanelHeader
        action={
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-white/72 hover:text-white" href="/events">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
        badge="Events"
        badgeIcon={CalendarDays}
        badgeTone="saffron"
        description="The next community event stays visible here without overpowering the page."
        title="Next event"
      />

      <div className="mt-5">
        {nextEvent ? (
          <div className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex flex-wrap gap-4">
              <div className="flex min-w-[82px] shrink-0 flex-col items-center justify-center rounded-[1rem] border border-white/10 bg-black/15 px-4 py-3 text-center">
                <span className="text-3xl font-semibold text-white">{formatEventDay(nextEvent.startsAt)}</span>
                <span className="text-sm font-medium text-white/58">{formatEventMonth(nextEvent.startsAt)}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <DashboardPill tone="saffron">{nextEvent.eventType.replace("_", " ")}</DashboardPill>
                  <DashboardPill tone={isLiveEvent(nextEvent) ? "rose" : "neutral"}>
                    {isLiveEvent(nextEvent) ? "Live now" : formatDateLabel(nextEvent.startsAt)}
                  </DashboardPill>
                </div>
                <p className="mt-3 font-semibold text-white">{nextEvent.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/58">{nextEvent.note}</p>
                <p className="mt-3 text-sm text-white/52">{nextEvent.location}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.1rem] border border-dashed border-white/14 bg-white/[0.03] px-5 py-8 text-center text-sm text-white/62">
            No upcoming events
          </div>
        )}
      </div>
    </DashboardPanel>
  )
}

function LeaderboardPanel({ board }: { board?: LeaderboardBoardView }) {
  return (
    <DashboardPanel className="p-3.5 sm:p-5 lg:p-6">
      <DashboardPanelHeader
        action={
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-white/72 hover:text-white" href="/leaderboards">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
        badge="Leaderboard"
        badgeIcon={Trophy}
        badgeTone="purple"
        description={board?.headline ?? "Verified weekly rankings"}
        title="Weekly individual board"
      />

      <div className="mt-6 space-y-3">
        {board && board.entries.length > 0 ? (
          board.entries.slice(0, 5).map((entry) => {
            const movement = getMovement(entry)

            return (
              <div
                key={entry.competitorKey}
                className="rounded-[1.15rem] border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-white">
                    {entry.rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-white">{entry.displayName}</p>
                      {movement ? <DashboardPill tone={movement.tone}>{movement.label}</DashboardPill> : null}
                    </div>
                    <p className="mt-1 text-sm text-white/56">Verified BTS streams plus mission rewards</p>
                  </div>
                  <span className="shrink-0 text-lg font-semibold text-white">
                    {formatCompactNumber(entry.score)}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-[1.15rem] border border-dashed border-white/14 bg-white/[0.03] px-5 py-8 text-center text-sm text-white/62">
            Verify streams and complete missions to appear here.
          </div>
        )}
      </div>

      {board?.currentUserEntry ? (
        <div className="mt-4 rounded-[1.15rem] border border-[hsl(265,70%,65%)]/18 bg-[hsl(265,70%,65%)]/10 p-4">
          <p className="font-medium text-white">You are #{board.currentUserEntry.rank} on this board.</p>
          <p className="mt-1 text-sm text-white/62">
            {formatCompactNumber(board.currentUserEntry.score)} points in the current weekly window.
          </p>
        </div>
      ) : null}
    </DashboardPanel>
  )
}

const getCachedMissionState = cache(async () => getMissionPageState())
const getCachedLeaderboards = cache(async () => listLeaderboards())
const getCachedEvents = cache(async () => listEvents())
const getCachedGuides = cache(async () => listGuideQuickReads())
const getCachedDailyActivityMap = cache(async () => getActivityMapView("daily"))
const getCachedProfile = cache(async () => {
  const [missionState, boards] = await Promise.all([getCachedMissionState(), getCachedLeaderboards()])
  const missions = [...missionState.weekly, ...missionState.daily]
  return getCurrentUserProfile({ boards, missions })
})

async function DashboardHeaderSection() {
  const [missionState, profile] = await Promise.all([getCachedMissionState(), getCachedProfile()])

  return <DashboardHeaderPanel missionState={missionState} profile={profile} />
}

async function QuickReadsSection() {
  const guides = await getCachedGuides()

  return <QuickReadsPanel guides={guides} />
}

async function MissionControlSection() {
  const missionState = await getCachedMissionState()

  return <MissionControlPanel missionState={missionState} />
}

async function EventSection() {
  const events = await getCachedEvents()

  return <EventPanel events={events} />
}

async function ActivityMapSection() {
  const dailyActivityMap = await getCachedDailyActivityMap()

  return (
    <ActivityMapPanel
      description="See how India is moving right now. The map uses the same verified stream and mission data that powers your leaderboard view."
      initialMap={dailyActivityMap}
      title="Track India activity by state and hotspot"
      variant="dashboard"
    />
  )
}

async function LeaderboardSection() {
  const boards = await getCachedLeaderboards()
  const individualBoard =
    boards.find((board) => board.boardType === "individual" && board.period === "weekly") ?? boards[0]

  return <LeaderboardPanel board={individualBoard} />
}

export default function DashboardPage() {
  return (
    <div className="relative isolate">
      <div className="relative z-10 space-y-3 sm:space-y-6 lg:space-y-8">
        <section className="space-y-3 sm:space-y-4">
          <Suspense fallback={<DashboardHeaderPanelSkeleton />}>
            <DashboardHeaderSection />
          </Suspense>
          <Suspense fallback={<QuickReadsPanelSkeleton />}>
            <QuickReadsSection />
          </Suspense>
        </section>

        <section className="grid items-start gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.35fr)_300px]">
          <Suspense fallback={<MissionControlPanelSkeleton />}>
            <MissionControlSection />
          </Suspense>
          <Suspense fallback={<EventPanelSkeleton />}>
            <EventSection />
          </Suspense>
        </section>

        <Suspense fallback={<ActivityMapPanelSkeleton />}>
          <ActivityMapSection />
        </Suspense>

        <Suspense fallback={<LeaderboardPanelSkeleton />}>
          <LeaderboardSection />
        </Suspense>
      </div>
    </div>
  )
}
