import Link from "next/link"
import { ArrowRight, CalendarDays, Heart, Sparkles, Trophy, Users } from "lucide-react"
import { ActivityMapPanel } from "@/components/activity-map/activity-map-panel"
import { AnimatedHeroActions } from "@/components/shared/animated-hero"
import { ProgressBar } from "@/components/shared/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getActivityMapView } from "@/modules/activity-map/service"
import { listChartCards } from "@/modules/charts/service"
import { listEvents } from "@/modules/events/service"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { listMissionCards } from "@/modules/missions/service"
import { formatCompactNumber, formatDateLabel } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function LandingPage() {
  const [charts, leaderboards, missions, events, weeklyActivityMap] = await Promise.all([
    listChartCards(),
    listLeaderboards(),
    listMissionCards(),
    listEvents(),
    getActivityMapView("weekly")
  ])

  const leadMission = missions.find((mission) => mission.missionCellKey === "daily_india") ?? missions[0]
  const featuredBoard =
    leaderboards.find((board) => board.boardType === "individual" && board.period === "daily") ??
    leaderboards[0]
  const chartSnapshot = charts[0]

  return (
    <main className="relative space-y-16 py-10 md:py-14">
      <div className="container space-y-16">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Heart className="h-4 w-4 fill-current text-primary" />
              <span className="text-sm font-medium text-primary">India&apos;s BTS ARMY Hub</span>
            </div>

            <h1 className="text-4xl font-heading font-semibold tracking-tight md:text-5xl lg:text-6xl">
              Stream together. Score together.
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground">
              IndiaForBTS now runs on verified BTS-family streams, six live mission cells, and a real India activity
              map layered by state and city hotspots.
            </p>

            <AnimatedHeroActions />

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary">{missions.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Live Missions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary">{leaderboards.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">Boards</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-primary">{chartSnapshot?.entries.length ?? 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">Tracked Songs</p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border-0 shadow-purple-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(265,70%,65%)] via-[hsl(265,70%,55%)] to-[hsl(265,80%,30%)]" />
            <CardHeader className="relative pt-8">
              <Badge className="w-fit bg-white/15 text-white border-0">
                <Sparkles className="mr-1 h-3 w-3" />
                Live India Mission
              </Badge>
              <CardTitle className="mt-4 text-2xl text-white md:text-3xl">
                {leadMission?.title ?? "No Active Mission"}
              </CardTitle>
              <CardDescription className="max-w-sm text-white/70">
                {leadMission?.description ?? "Import the BTS catalog to generate missions."}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4 pb-8">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between text-sm text-white/80">
                  <span>Progress</span>
                  <span className="font-semibold text-white">
                    {leadMission?.aggregateProgress ?? 0} / {leadMission?.goalUnits ?? 0}
                  </span>
                </div>
                <ProgressBar
                  className="bg-white/20"
                  max={leadMission?.goalUnits ?? 1}
                  value={leadMission?.aggregateProgress ?? 0}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Focus</p>
                  <p className="mt-1 text-sm font-medium text-white">{leadMission?.focus ?? "—"}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Reward</p>
                  <p className="mt-1 text-sm font-medium text-white">{leadMission?.rewardLabel ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <ActivityMapPanel
          description="Weekly state intensity stays tied to the same verified stream and mission point logic that powers the live state leaderboard. City hotspots add local visibility without changing scoring."
          initialMap={weeklyActivityMap}
          title="See where India is moving this week"
          variant="landing"
        />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mission Cells</CardTitle>
                  <CardDescription>Daily and weekly India, personal, and state missions</CardDescription>
                </div>
                <Link className="flex items-center gap-1 text-sm text-primary hover:underline" href="/missions">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {missions.slice(0, 3).map((mission) => (
                <div key={mission.id} className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{mission.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{mission.description}</p>
                    </div>
                    <Badge>{mission.scopeLabel}</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{mission.focus}</span>
                      <span className="font-semibold text-foreground">
                        {mission.aggregateProgress}/{mission.goalUnits}
                      </span>
                    </div>
                    <ProgressBar max={mission.goalUnits || 1} value={mission.aggregateProgress} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard Snapshot</CardTitle>
              <CardDescription>{featuredBoard?.headline ?? "Verified leaderboard scores"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredBoard?.entries.slice(0, 5).map((entry) => (
                <div key={entry.competitorKey} className="flex items-center gap-4 rounded-xl bg-muted/30 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {entry.rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{entry.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {featuredBoard.boardType === "individual" ? "Individual board" : "State board"}
                    </p>
                  </div>
                  <span className="font-semibold text-primary">{formatCompactNumber(entry.score)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Individual Boards
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Daily and weekly India-wide user rankings built from verified BTS-family streams and mission rewards.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                State Boards
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              State standings that move with verified streams from state members and shared mission completions.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {events.slice(0, 2).map((event) => (
                <div key={event.slug}>
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p>{formatDateLabel(event.startsAt)} · {event.location}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
