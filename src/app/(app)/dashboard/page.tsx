import Link from "next/link"
import { PageHero } from "@/components/shared/page-hero"
import { ProgressBar } from "@/components/shared/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Flame, Target, MapPin, Award, CalendarDays, FileText, Link2 } from "lucide-react"
import { listEvents } from "@/modules/events/service"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { listMissionCards } from "@/modules/missions/service"
import { listTrackerConnections } from "@/modules/trackers/service"
import { getCurrentUserProfile } from "@/modules/users/service"
import { listVotingGuides } from "@/modules/voting-guides/service"
import { formatCompactNumber, formatDateLabel } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [profile, trackers, missions, boards, events, guides] = await Promise.all([
    getCurrentUserProfile(),
    listTrackerConnections(),
    listMissionCards(),
    listLeaderboards(),
    listEvents(),
    listVotingGuides()
  ])

  const cityBoard = boards.find((board) => board.scopeType === "city" && board.period === "weekly") ?? boards[0]
  const leadMission = missions[0]

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="My ARMY Room"
        title={`Namaste, ${profile.displayName}!`}
        description="Your streaming stats, local rankings, and everything you need to stay in sync with Indian ARMY."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[hsl(30,100%,50%)]/10 to-transparent rounded-bl-full" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(30,100%,50%)] to-[hsl(30,90%,40%)] flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-semibold">{profile.streakDays} days</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Keep it going before reset!</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[hsl(265,60%,55%)]/10 to-transparent rounded-bl-full" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)] flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-2xl font-semibold">{profile.weeklyStreams}/{profile.weeklyGoal}</p>
              </div>
            </div>
            <ProgressBar max={profile.weeklyGoal} value={profile.weeklyStreams} />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[hsl(170,60%,40%)]/10 to-transparent rounded-bl-full" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(170,60%,40%)] to-[hsl(170,60%,30%)] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">City Rank</p>
                <p className="text-2xl font-semibold">{profile.cityRank ? `#${profile.cityRank}` : "—"}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{profile.city}, {profile.state}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[hsl(320,70%,65%)]/10 to-transparent rounded-bl-full" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(320,70%,65%)] to-[hsl(320,70%,55%)] flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">State Rank</p>
                <p className="text-2xl font-semibold">{profile.stateRank ? `#${profile.stateRank}` : "—"}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{profile.state}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {leadMission ? (
          <Card className="relative overflow-hidden border-0 shadow-purple-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(265,60%,55%)] via-[hsl(265,60%,45%)] to-[hsl(265,70%,35%)]" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-16 h-16 border border-white/20 rounded-full" />
              <div className="absolute bottom-12 left-12 w-12 h-12 border border-white/10 rounded-full" />
            </div>
            <CardHeader className="relative pt-6">
              <Badge className="w-fit bg-white/20 text-white border-0 backdrop-blur-sm">
                <Target className="w-3 h-3 mr-1" />
                Primary Mission
              </Badge>
              <CardTitle className="text-2xl md:text-3xl text-white mt-4">
                {leadMission.title}
              </CardTitle>
              <CardDescription className="text-white/70 max-w-xl">
                {leadMission.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative pb-6">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                  <span>{leadMission.focus}</span>
                  <span className="font-semibold text-white">
                    {leadMission.progress} / {leadMission.goal}
                  </span>
                </div>
                <ProgressBar className="bg-white/20" max={leadMission.goal} value={leadMission.progress} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Reward</p>
                  <p className="text-sm text-white mt-1 font-medium">{leadMission.rewardLabel}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Focus Track</p>
                  <p className="text-sm text-white mt-1 font-medium">{profile.focusTrack}</p>
                </div>
              </div>
              <Link href="/missions" className="inline-flex items-center gap-2 mt-4 text-sm text-white/80 hover:text-white transition-colors">
                View all missions <ArrowRight className="w-4 h-4" />
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[hsl(265,60%,55%)]/10 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-[hsl(265,60%,55%)]" />
                </div>
                <div>
                  <CardTitle className="text-base">Connected Trackers</CardTitle>
                  <CardDescription className="text-xs">Mission verification</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {trackers.length > 0 ? (
              trackers.map((tracker) => (
                <div key={tracker.provider} className="rounded-xl border border-border/50 p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium capitalize">{tracker.provider}</p>
                    <Badge className={tracker.verificationStatus === "verified" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>
                      {tracker.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tracker.helperText}</p>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">@{tracker.username}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/50 p-6 text-center">
                <Link2 className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No trackers connected</p>
                <Link href="/missions" className="text-xs text-[hsl(265,60%,55%)] hover:underline mt-2 inline-block">
                  Connect Last.fm on missions page
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
                <CardTitle>Local Leaderboard</CardTitle>
                <CardDescription>{cityBoard?.headline ?? "Weekly city rankings"}</CardDescription>
              </div>
              <Link href="/leaderboards" className="text-sm text-[hsl(265,60%,55%)] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {cityBoard && cityBoard.entries.length > 0 ? (
              cityBoard.entries.slice(0, 5).map((entry) => (
                <div key={entry.displayName} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    entry.rank <= 3 ? 'bg-gradient-to-br from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)] text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.displayName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {entry.city}, {entry.state} • {entry.streakDays} day streak
                    </p>
                  </div>
                  <span className="font-semibold text-[hsl(265,60%,55%)]">{formatCompactNumber(entry.score)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Complete missions to appear on the leaderboard</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[hsl(30,100%,50%)]/10 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-[hsl(30,100%,50%)]" />
                </div>
                <CardTitle className="text-base">Next Event</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {events[0] ? (
                <div>
                  <p className="font-medium">{events[0].title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{events[0].note}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" /> {formatDateLabel(events[0].startsAt)} • {events[0].location}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[hsl(170,60%,40%)]/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[hsl(170,60%,40%)]" />
                </div>
                <CardTitle className="text-base">Quick Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {guides[0] ? (
                <div>
                  <p className="font-medium">{guides[0].title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{guides[0].summary}</p>
                  <p className="text-xs text-muted-foreground mt-2">{guides[0].updatedLabel}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No guides available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
