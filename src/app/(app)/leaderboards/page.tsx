import { PageHero } from "@/components/shared/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Crown, MapPin, Flame, Shield } from "lucide-react"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { formatCompactNumber } from "@/lib/utils"

export const dynamic = "force-dynamic"

const podiumIcons = [Crown, Medal, Medal]

export default async function LeaderboardsPage() {
  const boards = await listLeaderboards()
  const featuredBoard = boards.find((b) => b.scopeType === "city" && b.period === "daily") ?? boards[0]
  const podium = featuredBoard?.entries.slice(0, 3) ?? []

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Leaderboards"
        title="Rank up with your city"
        description="Compete with ARMY across India. Leaderboards track verified mission completions — real streams, real points."
      />

      {podium.length > 0 && (
        <section className="grid gap-4 md:grid-cols-3">
          {podium.map((entry, index) => {
            const Icon = podiumIcons[index]
            return (
              <Card 
                key={entry.displayName} 
                className={`relative overflow-hidden ${index === 0 ? 'border-0 shadow-purple-glow' : ''}`}
              >
                {index === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[hsl(265,60%,55%)] via-[hsl(265,60%,45%)] to-[hsl(265,70%,35%)]" />
                )}
                {index === 0 && (
                  <div className="absolute top-4 right-4 w-12 h-12 border border-white/20 rounded-full" />
                )}
                <CardContent className={`relative p-6 ${index === 0 ? 'text-white' : ''}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    index === 0 ? 'bg-white/20' : 'bg-gradient-to-br from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]'
                  }`}>
                    <Icon className={`w-6 h-6 ${index === 0 ? 'text-white' : 'text-white'}`} />
                  </div>
                  <div className={`flex items-center gap-2 mb-2 ${index === 0 ? 'text-white/70' : ''}`}>
                    <span className="text-sm">#{entry.rank}</span>
                    <span>•</span>
                    <span className="text-sm">{entry.city}</span>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${index === 0 ? 'text-white' : ''}`}>
                    {entry.displayName}
                  </h3>
                  <p className={`text-3xl font-bold mb-2 ${index === 0 ? 'text-white' : 'bg-gradient-to-r from-[hsl(265,60%,55%)] to-[hsl(30,100%,50%)] bg-clip-text text-transparent'}`}>
                    {formatCompactNumber(entry.score)}
                  </p>
                  <div className={`flex items-center gap-3 text-sm ${index === 0 ? 'text-white/70' : 'text-muted-foreground'}`}>
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      {entry.streakDays} day streak
                    </span>
                    <span>•</span>
                    <span>{entry.state}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        {boards.map((board) => (
          <Card key={`${board.scopeType}-${board.scopeLabel}-${board.period}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    board.scopeType === 'city' 
                      ? 'bg-gradient-to-br from-[hsl(30,100%,50%)] to-[hsl(30,90%,40%)]' 
                      : 'bg-gradient-to-br from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]'
                  }`}>
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>{board.scopeLabel} · {board.period}</CardTitle>
                    <p className="text-sm text-muted-foreground">{board.headline}</p>
                  </div>
                </div>
                <Badge variant="muted">{board.scopeType}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {board.entries.map((entry) => (
                <div key={entry.displayName} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    entry.rank <= 3 
                      ? 'bg-gradient-to-br from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)] text-white' 
                      : 'bg-muted text-muted-foreground'
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
              ))}
              {board.currentUserEntry && (
                <div className="rounded-xl border-2 border-[hsl(265,60%,55%)]/30 bg-[hsl(265,60%,55%)]/5 p-4">
                  <p className="font-medium flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[hsl(265,60%,55%)]" />
                    You are #{board.currentUserEntry.rank} on this board
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {board.currentUserEntry.city}, {board.currentUserEntry.state} • {formatCompactNumber(board.currentUserEntry.score)} points
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="bg-gradient-to-br from-[hsl(265,60%,55%)]/5 to-[hsl(30,100%,50%)]/5 border-[hsl(265,60%,55%)]/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(265,60%,55%)]/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[hsl(265,60%,55%)]" />
            </div>
            Fair Play Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/60">
            <Shield className="w-4 h-4 text-[hsl(265,60%,55%)] mt-0.5 flex-shrink-0" />
            <p>Use varied playlists and natural listening sessions</p>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/60">
            <MapPin className="w-4 h-4 text-[hsl(265,60%,55%)] mt-0.5 flex-shrink-0" />
            <p>Keep city & state accurate for meaningful rankings</p>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/60">
            <Flame className="w-4 h-4 text-[hsl(265,60%,55%)] mt-0.5 flex-shrink-0" />
            <p>Refresh tracker after sessions before India reset</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
