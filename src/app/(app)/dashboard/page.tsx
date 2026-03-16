import Link from "next/link"
import {
  ArrowRight,
  Award,
  CalendarDays,
  FileText,
  Link2,
  MapPin,
  Target,
  Trophy,
  Users
} from "lucide-react"
import { ActivityMapPanel } from "@/components/activity-map/activity-map-panel"
import { PageHero } from "@/components/shared/page-hero"
import { ProgressBar } from "@/components/shared/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getActivityMapView } from "@/modules/activity-map/service"
import { listEvents } from "@/modules/events/service"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { listMissionCards } from "@/modules/missions/service"
import { listTrackerConnections } from "@/modules/trackers/service"
import { getCurrentUserProfile } from "@/modules/users/service"
import { listVotingGuides } from "@/modules/voting-guides/service"
import { formatCompactNumber, formatDateLabel } from "@/lib/utils"

export const dynamic = "force-dynamic"

const rankCards = [
  { key: "individualDailyRank", label: "Your Daily Rank", icon: Trophy },
  { key: "individualWeeklyRank", label: "Your Weekly Rank", icon: Trophy },
  { key: "stateDailyRank", label: "State Daily Rank", icon: Users },
  { key: "stateWeeklyRank", label: "State Weekly Rank", icon: Award }
] as const

export default async function DashboardPage() {
  const [profile, trackers, missions, boards, events, guides, dailyActivityMap] = await Promise.all([
    getCurrentUserProfile(),
    listTrackerConnections(),
    listMissionCards(),
    listLeaderboards(),
    listEvents(),
    listVotingGuides(),
    getActivityMapView("daily")
  ])

  const leadMission = missions.find((mission) => mission.missionCellKey === "weekly_individual") ?? missions[0]
  const individualBoard =
    boards.find((board) => board.boardType === "individual" && board.period === "weekly") ?? boards[0]

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="My ARMY Room"
        title={`Namaste, ${profile.displayName}!`}
        description="Your weekly mission, tracker status, and the rankings that now matter most: you and your state."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rankCards.map((item) => {
          const Icon = item.icon
          const value = profile[item.key]

          return (
            <Card key={item.key}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-semibold">{value ? `#${value}` : "—"}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{profile.stateLabel}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <MapPin className="h-5 w-5 text-[hsl(265,70%,55%)]" />
              Location Summary
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your confirmed state drives scoring. City remains optional and only feeds hotspot attribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-700">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">State</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{profile.stateLabel}</p>
                <p className="mt-1 text-sm text-slate-600">Required for verified stream points and all state boards.</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">City status</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {profile.cityLabel ?? profile.suggestedCityLabel ?? "Missing"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {profile.cityMode === "confirmed"
                    ? "Confirmed and used for hotspot placement."
                    : profile.cityMode === "ip_fallback"
                      ? "Stored as an unconfirmed hotspot fallback."
                      : "Optional. Add one to sharpen the map."}
                </p>
              </div>
            </div>

            {profile.cityMode === "ip_fallback" && profile.suggestedCityLabel ? (
              <div className="rounded-[1.5rem] border border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 p-4 text-sm">
                Confirm <span className="font-semibold text-slate-900">{profile.suggestedCityLabel}</span> if it
                looks right. It won&apos;t change scoring, but it will move your activity from the state layer to a
                specific hotspot.
              </div>
            ) : null}

            {profile.locationNeedsReview ? (
              <div className="rounded-[1.5rem] border border-[hsl(265,70%,55%)]/20 bg-[hsl(265,70%,55%)]/10 p-4 text-sm">
                Your location was carried over from legacy free text and still needs a canonical match.
              </div>
            ) : null}

            <Link className="inline-flex text-sm font-semibold text-[hsl(265,70%,55%)] hover:underline" href="/profile">
              Open profile location settings <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <ActivityMapPanel
          description="Daily and weekly toggles use the live location activity snapshots. State intensity follows the leaderboard point model; city hotspots surface only when a resolved place exists."
          initialMap={dailyActivityMap}
          title="Track India activity by state and hotspot"
          variant="dashboard"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {leadMission ? (
          <Card className="relative overflow-hidden border-0 shadow-purple-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(265,60%,55%)] via-[hsl(265,60%,45%)] to-[hsl(265,70%,35%)]" />
            <CardHeader className="relative pt-6">
              <Badge className="w-fit bg-white/20 text-white border-0 backdrop-blur-sm">
                <Target className="mr-1 h-3 w-3" />
                Weekly Personal Mission
              </Badge>
              <CardTitle className="mt-4 text-2xl text-white md:text-3xl">{leadMission.title}</CardTitle>
              <CardDescription className="max-w-xl text-white/70">{leadMission.description}</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4 pb-6">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                  <span>{leadMission.focus}</span>
                  <span className="font-semibold text-white">
                    {leadMission.aggregateProgress} / {leadMission.goalUnits}
                  </span>
                </div>
                <ProgressBar
                  className="bg-white/20"
                  max={leadMission.goalUnits || 1}
                  value={leadMission.aggregateProgress}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Reward</p>
                  <p className="mt-1 text-sm font-medium text-white">{leadMission.rewardLabel}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Focus Track</p>
                  <p className="mt-1 text-sm font-medium text-white">{profile.focusTrack}</p>
                </div>
              </div>
              <Link
                className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
                href="/missions"
              >
                View all missions <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No active missions. Sync the BTS catalog from admin.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Link2 className="h-4 w-4" />
              </div>
              Connected Trackers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trackers.length > 0 ? (
              trackers.map((tracker) => (
                <div key={tracker.provider} className="rounded-xl border border-border/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium capitalize">{tracker.provider}</p>
                    <Badge className={tracker.verificationStatus === "verified" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>
                      {tracker.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tracker.helperText}</p>
                  <p className="mt-2 text-xs text-muted-foreground">@{tracker.username}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/50 p-6 text-center">
                <p className="text-sm text-muted-foreground">No trackers connected yet.</p>
                <Link className="mt-2 inline-block text-xs text-primary hover:underline" href="/missions">
                  Connect Last.fm on the missions page
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Individual Board</CardTitle>
                <CardDescription>{individualBoard?.headline ?? "Verified weekly rankings"}</CardDescription>
              </div>
              <Link className="flex items-center gap-1 text-sm text-primary hover:underline" href="/leaderboards">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {individualBoard && individualBoard.entries.length > 0 ? (
              individualBoard.entries.slice(0, 5).map((entry) => (
                <div key={entry.competitorKey} className="flex items-center gap-4 rounded-xl bg-muted/30 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {entry.rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{entry.displayName}</p>
                    <p className="text-sm text-muted-foreground">Verified BTS streams + mission rewards</p>
                  </div>
                  <span className="font-semibold text-primary">{formatCompactNumber(entry.score)}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">Verify streams and complete missions to appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </div>
                Next Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events[0] ? (
                <div>
                  <p className="font-medium">{events[0].title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{events[0].note}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateLabel(events[0].startsAt)} · {events[0].location}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                Quick Reads
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {guides.slice(0, 3).map((guide) => (
                <div key={guide.slug} className="rounded-xl border border-border/50 p-4">
                  <p className="font-medium">{guide.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{guide.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
