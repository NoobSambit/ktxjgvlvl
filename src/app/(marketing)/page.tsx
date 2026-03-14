import Link from "next/link"
import { Activity, ArrowRight, CalendarDays, MapPin, Sparkles, Trophy, Heart, Music4, Users, TrendingUp } from "lucide-react"
import { AnimatedHeroActions } from "@/components/shared/animated-hero"
import { PageHero } from "@/components/shared/page-hero"
import { ProgressBar } from "@/components/shared/progress-bar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { listChartCards } from "@/modules/charts/service"
import { listEvents } from "@/modules/events/service"
import { listFanProjects } from "@/modules/fan-projects/service"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { listMissionCards } from "@/modules/missions/service"
import { listVotingGuides } from "@/modules/voting-guides/service"
import { listWikiPages } from "@/modules/wiki/service"
import { formatCompactNumber, formatDateLabel } from "@/lib/utils"

export const dynamic = "force-dynamic"

const features = [
  { icon: Activity, title: "Smart Stream Tracking", desc: "Connect Last.fm and let the platform track your streams automatically", color: "purple" },
  { icon: Trophy, title: "City & State Leaderboards", desc: "Compete with ARMY from your city and state on verified missions", color: "saffron" },
  { icon: TrendingUp, title: "Real-time Chart Monitor", desc: "Watch BTS chart positions and know when to push together", color: "teal" },
  { icon: CalendarDays, title: "Event Calendar", desc: "Never miss watch parties, streaming sessions, or meetups", color: "pink" },
  { icon: Users, title: "Fan Projects", desc: "Discover and join charity drives, meetups, and creative projects", color: "marigold" },
  { icon: Sparkles, title: "Voting Guides", desc: "Step-by-step guides for every award show voting campaign", color: "purple" }
]

const colorMap: Record<string, string> = {
  purple: "from-[hsl(265,70%,65%)] to-[hsl(265,70%,55%)]",
  saffron: "from-[hsl(25,90%,55%)] to-[hsl(25,90%,45%)]",
  teal: "from-[hsl(170,60%,45%)] to-[hsl(170,60%,35%)]",
  pink: "from-[hsl(320,65%,70%)] to-[hsl(320,65%,60%)]",
  marigold: "from-[hsl(40,90%,55%)] to-[hsl(40,90%,45%)]"
}

export default async function LandingPage() {
  const [charts, leaderboards, missions, events, projects, guides, wikiPages] = await Promise.all([
    listChartCards(),
    listLeaderboards(),
    listMissionCards(),
    listEvents(),
    listFanProjects(),
    listVotingGuides(),
    listWikiPages()
  ])

  const spotlightBoard = leaderboards.find((b) => b.scopeType === "city" && b.period === "daily") ?? leaderboards[0]
  const leadMission = missions[0]
  const chartSnapshot = charts[0]

  return (
    <main className="relative space-y-16 py-10 md:py-14">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[hsl(265,70%,65%)]/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[hsl(25,90%,55%)]/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[hsl(265,70%,65%)]/15 to-[hsl(25,90%,55%)]/10 rounded-full border border-[hsl(265,70%,65%)]/20">
              <Heart className="w-4 h-4 text-[hsl(265,70%,65%)] fill-current" />
              <span className="text-sm font-medium text-[hsl(265,70%,65%)]">India&apos;s BTS ARMY Hub</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-r from-[hsl(265,70%,65%)] via-[hsl(320,65%,70%)] to-[hsl(25,90%,55%)] bg-clip-text text-transparent">
                Stream Together.
              </span>
              <br />
              <span className="text-white">Win Together.</span>
            </h1>
            
            <p className="text-lg text-[hsl(265,15%,65%)] max-w-xl leading-relaxed">
              The unified platform for Indian ARMY to coordinate streaming campaigns, track chart movements, 
              and organize fan initiatives — all in one place.
            </p>
            
            <AnimatedHeroActions />
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { num: missions.length, label: "Active Missions" },
                { num: leaderboards.length, label: "Leaderboards" },
                { num: chartSnapshot.entries.length, label: "Tracked Songs" }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-semibold bg-gradient-to-r from-[hsl(265,70%,65%)] to-[hsl(25,90%,55%)] bg-clip-text text-transparent">
                    {stat.num}
                  </p>
                  <p className="text-xs text-[hsl(265,15%,55%)] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-0 glow-purple">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(265,70%,65%)] via-[hsl(265,70%,55%)] to-[hsl(265,80%,30%)]" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full" />
              <div className="absolute bottom-8 left-8 w-16 h-16 border border-white/10 rounded-full" />
            </div>
            <CardHeader className="relative pt-8">
              <Badge className="w-fit bg-white/15 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Tonight&apos;s Focus
              </Badge>
              <CardTitle className="text-2xl md:text-3xl text-white mt-4">
                {leadMission?.title ?? "No Active Mission"}
              </CardTitle>
              <CardDescription className="text-white/70 max-w-sm">
                {leadMission?.description ?? "Import the BTS catalog to generate missions"}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative pb-8">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm text-white/80 mb-3">
                  <span>Progress</span>
                  <span className="font-semibold text-white">
                    {leadMission?.progress ?? 0} / {leadMission?.goal ?? 0}
                  </span>
                </div>
                <ProgressBar 
                  className="bg-white/20" 
                  max={leadMission?.goal ?? 1} 
                  value={leadMission?.progress ?? 0} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Focus</p>
                  <p className="text-sm text-white mt-1 font-medium">{leadMission?.focus ?? "—"}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wider text-white/60">Reward</p>
                  <p className="text-sm text-white mt-1 font-medium">{leadMission?.rewardLabel ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:border-[hsl(265,70%,65%)]/30 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-5">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[feature.color]} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{feature.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Missions</CardTitle>
                  <CardDescription className="mt-1">Join today&apos;s streaming pushes</CardDescription>
                </div>
                <Link href="/missions" className="text-sm text-[hsl(265,70%,65%)] hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {missions.slice(0, 3).map((mission) => (
                <div key={mission.id} className="rounded-xl border border-white/10 bg-[hsl(265,25%,12%)]/50 p-4 hover:bg-[hsl(265,25%,15%)]/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium">{mission.title}</p>
                      <p className="text-sm text-[hsl(265,15%,65%)] mt-1">{mission.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="text-[10px]">{mission.cadence}</Badge>
                        <span className="text-xs text-[hsl(265,15%,55%)]">• {mission.scope}</span>
                      </div>
                    </div>
                    <Badge className="shrink-0">{mission.rewardLabel}</Badge>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[hsl(265,15%,65%)]">{mission.focus}</span>
                      <span className="font-semibold">{mission.progress}/{mission.goal}</span>
                    </div>
                    <ProgressBar max={mission.goal} value={mission.progress} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart Watch</CardTitle>
              <CardDescription className="mt-1">Today&apos;s top BTS tracks in India</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {chartSnapshot.entries.slice(0, 5).map((entry, idx) => (
                <div key={entry.title} className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(265,25%,12%)]/50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-gradient-to-br from-[hsl(25,90%,55%)] to-[hsl(25,90%,45%)] text-white' :
                    idx === 1 ? 'bg-gradient-to-br from-[hsl(265,70%,65%)] to-[hsl(265,70%,55%)] text-white' :
                    idx === 2 ? 'bg-gradient-to-br from-[hsl(170,60%,45%)] to-[hsl(170,60%,35%)] text-white' :
                    'bg-[hsl(265,25%,18%)] text-[hsl(265,15%,65%)]'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.title}</p>
                    <p className="text-sm text-[hsl(265,15%,65%)] truncate">{entry.artist}</p>
                  </div>
                  <span className="text-sm font-semibold text-[hsl(265,15%,65%)]">
                    {formatCompactNumber(entry.metricValue)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription className="mt-1">Watch parties, meetups & campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <div key={event.slug} className="rounded-xl border border-white/10 p-4 hover:bg-[hsl(265,25%,12%)]/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[hsl(265,70%,65%)] mb-2">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {event.eventType.replaceAll("_", " ")}
                  </div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-[hsl(265,15%,65%)] mt-1">{event.note}</p>
                  <p className="text-xs text-[hsl(265,15%,55%)] mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {formatDateLabel(event.startsAt)} • {event.location}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Reads</CardTitle>
              <CardDescription className="mt-1">Guides & wiki for ARMY</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...guides.slice(0, 2), ...wikiPages.slice(0, 2)].map((item) => (
                <Link
                  key={item.slug}
                  href={item.slug.includes("guide") ? "/voting-guides" : "/wiki"}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 hover:bg-[hsl(265,25%,12%)]/50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-sm text-[hsl(265,15%,65%)] truncate">{item.summary}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[hsl(265,15%,55%)] group-hover:text-[hsl(265,70%,65%)] transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Fan Projects</CardTitle>
              <CardDescription className="mt-1">Local initiatives by Indian ARMY</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.slice(0, 3).map((project) => (
                <div key={project.slug} className="rounded-xl border border-white/10 p-4 hover:bg-[hsl(265,25%,12%)]/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{project.title}</p>
                    <Badge variant="muted" className="text-xs">{project.category}</Badge>
                  </div>
                  <p className="text-sm text-[hsl(265,15%,65%)]">{project.summary}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-[hsl(265,15%,55%)]">
                    <MapPin className="w-3 h-3" /> {project.city}, {project.state}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
