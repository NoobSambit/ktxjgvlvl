import { Crown, Medal, Trophy, Users } from "lucide-react"
import { PageHero } from "@/components/shared/page-hero"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listLeaderboards } from "@/modules/leaderboards/service"
import { formatCompactNumber } from "@/lib/utils"

export const dynamic = "force-dynamic"

const podiumIcons = [Crown, Medal, Medal]

export default async function LeaderboardsPage() {
  const boards = await listLeaderboards()
  const featuredBoard =
    boards.find((board) => board.boardType === "individual" && board.period === "daily") ?? boards[0]
  const podium = featuredBoard?.entries.slice(0, 3) ?? []

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Leaderboards"
        title="Individual and state boards, reset daily and weekly."
        description="Verified BTS-family streams and mission completion rewards now flow into four boards only: daily and weekly individual, plus daily and weekly state."
      />

      {podium.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-3">
          {podium.map((entry, index) => {
            const Icon = podiumIcons[index]

            return (
              <Card key={entry.competitorKey} className={index === 0 ? "border-primary/30" : ""}>
                <CardContent className="space-y-3 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">#{entry.rank}</p>
                    <h3 className="text-xl font-semibold">{entry.displayName}</h3>
                  </div>
                  <p className="text-3xl font-bold">{formatCompactNumber(entry.score)}</p>
                </CardContent>
              </Card>
            )
          })}
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        {boards.map((board) => (
          <Card key={board.boardId}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>
                    {board.period === "daily" ? "Daily" : "Weekly"} {board.boardType === "individual" ? "Individual" : "State"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{board.headline}</p>
                </div>
                <Badge variant="muted">{board.boardType}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {board.entries.map((entry) => (
                <div
                  className="flex items-center gap-4 rounded-xl bg-muted/30 p-3"
                  key={`${board.boardId}-${entry.competitorKey}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {entry.rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{entry.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.competitorType === "user" ? "Individual board entry" : "State board entry"}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">{formatCompactNumber(entry.score)}</p>
                </div>
              ))}

              {board.currentUserEntry ? (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="flex items-center gap-2 font-medium">
                    <Trophy className="h-4 w-4 text-primary" />
                    You are #{board.currentUserEntry.rank} on this board
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCompactNumber(board.currentUserEntry.score)} points
                  </p>
                </div>
              ) : null}

              {board.currentStateEntry && board.boardType === "state" ? (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="flex items-center gap-2 font-medium">
                    <Users className="h-4 w-4 text-primary" />
                    Your state is #{board.currentStateEntry.rank}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {board.currentStateEntry.displayName} · {formatCompactNumber(board.currentStateEntry.score)} points
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
