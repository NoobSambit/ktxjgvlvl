import { MissionAdminConsole } from "@/components/admin/mission-admin-console"
import { PageHero } from "@/components/shared/page-hero"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Clock, TrendingUp, Layers, Database, RefreshCw, Zap, Shield } from "lucide-react"
import { getAdminOverview } from "@/modules/admin/service"
import { listChartCards } from "@/modules/charts/service"
import { getMissionAdminState } from "@/modules/missions/service"

export const dynamic = "force-dynamic"

function formatDateTime(value?: string) {
  if (!value) {
    return "Pending"
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata"
  }).format(new Date(value))
}

export default async function AdminPage() {
  const [overview, charts, missionAdminState] = await Promise.all([
    getAdminOverview(),
    listChartCards(),
    getMissionAdminState()
  ])

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin"
        title="Control Room"
        description="Plan the next mission reset, sync the BTS catalog, and keep platform jobs healthy from one admin surface."
      />

      <MissionAdminConsole initialState={missionAdminState} />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-[hsl(265,60%,55%)]/5 to-[hsl(30,100%,50%)]/5 border-[hsl(265,60%,55%)]/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[hsl(265,60%,55%)]/10 flex items-center justify-center">
                <Settings className="w-4 h-4 text-[hsl(265,60%,55%)]" />
              </div>
              Working Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overview.panels.map((panel) => (
              <div className="flex items-center gap-3 rounded-xl bg-white/60 px-4 py-3" key={panel}>
                <Layers className="w-4 h-4 text-[hsl(265,60%,55%)]" />
                <span className="text-sm font-medium">{panel}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[hsl(30,100%,50%)]/5 to-[hsl(170,60%,40%)]/5 border-[hsl(30,100%,50%)]/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[hsl(30,100%,50%)]/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[hsl(30,100%,50%)]" />
              </div>
              Scheduled Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overview.scheduledJobs.map((job) => (
              <div className="flex items-center gap-3 rounded-xl border border-border/50 px-4 py-3" key={job}>
                <Zap className="w-4 h-4 text-[hsl(30,100%,50%)]" />
                <span className="text-sm">{job}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[hsl(170,60%,40%)]/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[hsl(170,60%,40%)]" />
              </div>
              Latest Chart Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {charts[0]?.entries.map((entry) => (
              <div className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3" key={entry.title}>
                <div className="min-w-0">
                  <span className="text-sm font-medium">{entry.artist}</span>
                  <span className="text-sm text-muted-foreground"> · {entry.title}</span>
                </div>
                <span className="font-semibold text-[hsl(265,60%,55%)]">#{entry.rank}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[hsl(320,70%,65%)]/5 to-[hsl(265,60%,55%)]/5 border-[hsl(320,70%,65%)]/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[hsl(320,70%,65%)]/10 flex items-center justify-center">
                <Database className="w-4 h-4 text-[hsl(320,70%,65%)]" />
              </div>
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Platform Health</span>
              </div>
              <span className="text-sm text-green-600 font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-[hsl(265,60%,55%)]" />
                <span className="text-sm font-medium">Location Registry</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {overview.locationRegistry.stateCount} states · {overview.locationRegistry.placeCount} places
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-[hsl(30,100%,50%)]" />
                <span className="text-sm font-medium">Last Location Import</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(overview.locationRegistry.lastImportedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-[hsl(170,60%,40%)]" />
                <span className="text-sm font-medium">Last Map Materialization</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDateTime(overview.locationActivity.lastMaterializedAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
