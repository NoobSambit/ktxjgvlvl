import { PageHero } from "@/components/shared/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, Music4 } from "lucide-react"
import { listChartCards } from "@/modules/charts/service"
import { formatCompactNumber } from "@/lib/utils"

export default async function ChartsPage() {
  const charts = await listChartCards()
  const chart = charts[0]

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Chart Watch"
        title="Track BTS chart positions"
        description="Monitor real-time chart movements in India. Know which songs need a push and when to stream together."
      />

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="relative overflow-hidden border-0 shadow-purple-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(265,60%,55%)] via-[hsl(265,60%,45%)] to-[hsl(265,70%,35%)]" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border border-white/10 rounded-full" />
          </div>
          <CardContent className="relative p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-white/15 text-white border-0">{chart.source}</Badge>
            </div>
            <p className="text-sm text-white/70 mb-2">{chart.spotlight}</p>
            <p className="text-4xl font-bold text-white">{chart.snapshotDate}</p>
            <p className="mt-4 text-sm text-white/60">
              Updated snapshot for Indian ARMY streaming decisions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[hsl(265,60%,55%)]/10 flex items-center justify-center">
                <Music4 className="w-4 h-4 text-[hsl(265,60%,55%)]" />
              </div>
              Songs in Focus
            </CardTitle>
            <CardDescription>Top BTS tracks in India right now</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {chart.entries.map((entry, index) => (
              <div 
                key={entry.title} 
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                  index === 0 
                    ? 'bg-gradient-to-br from-[hsl(30,100%,50%)] to-[hsl(30,90%,40%)] text-white' 
                    : index === 1 
                    ? 'bg-gradient-to-br from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)] text-white'
                    : index === 2
                    ? 'bg-gradient-to-br from-[hsl(170,60%,40%)] to-[hsl(170,60%,30%)] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{entry.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCompactNumber(entry.metricValue)}</p>
                  <p className="text-xs text-muted-foreground">streams</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
