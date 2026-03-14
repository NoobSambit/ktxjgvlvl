import { PageHero } from "@/components/shared/page-hero"
import { ProgressBar } from "@/components/shared/progress-bar"
import { MissionActions } from "@/components/missions/mission-actions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Clock, CheckCircle2, AlertCircle, Music4, Shuffle, RefreshCw, Flame } from "lucide-react"
import { getMissionPageState } from "@/modules/missions/service"
import { formatDateLabel } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function MissionsPage() {
  const missionState = await getMissionPageState()
  const { missions } = missionState

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Missions"
        title="Stream with purpose"
        description="Join daily and weekly missions, track your progress, and make every stream count toward collective goals."
      />

      <MissionActions
        isAuthenticated={missionState.isAuthenticated}
        lastfmConnection={missionState.lastfmConnection}
        verificationBlockedReason={missionState.verificationBlockedReason}
      />

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {missions.length > 0 ? (
            missions.map((mission) => (
              <Card key={mission.id} className="overflow-hidden">
                <div className={`h-1.5 ${
                  mission.cadence === 'daily' 
                    ? 'bg-gradient-to-r from-[hsl(30,100%,50%)] to-[hsl(30,90%,40%)]' 
                    : 'bg-gradient-to-r from-[hsl(265,60%,55%)] to-[hsl(265,60%,45%)]'
                }`} />
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={mission.cadence === 'daily' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}>
                          {mission.cadence}
                        </Badge>
                        <Badge variant="muted">{mission.scope}</Badge>
                      </div>
                      <CardTitle>{mission.title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{mission.rewardLabel}</Badge>
                      {mission.isCompleted && (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{mission.description}</p>
                  
                  <div className="grid gap-3 rounded-xl bg-muted/40 p-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(265,60%,55%)]/10 flex items-center justify-center flex-shrink-0">
                        <Target className="w-4 h-4 text-[hsl(265,60%,55%)]" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Focus</p>
                        <p className="text-sm font-medium mt-0.5">{mission.focus}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(30,100%,50%)]/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-[hsl(30,100%,50%)]" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ends</p>
                        <p className="text-sm font-medium mt-0.5">{formatDateLabel(mission.endsAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span className="font-semibold text-[hsl(265,60%,55%)]">
                        {mission.progress} / {mission.goal}
                      </span>
                    </div>
                    <ProgressBar max={mission.goal} value={mission.progress} />
                  </div>
                  
                  {mission.targets.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Target Tracks</p>
                      <div className="grid gap-2">
                        {mission.targets.map((target) => (
                          <div
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
                            key={`${mission.id}-${target.key}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(265,60%,55%)]/10 to-[hsl(265,60%,55%)]/5 flex items-center justify-center">
                                <Music4 className="w-4 h-4 text-[hsl(265,60%,55%)]" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{target.title}</p>
                                <p className="text-xs text-muted-foreground">{target.artistName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold">{target.progress}/{target.targetCount}</p>
                              <p className="text-xs text-muted-foreground">streams</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No live missions yet</p>
                <p className="text-sm text-muted-foreground/70 mt-2">Sync the BTS catalog from admin to generate missions</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-[hsl(265,60%,55%)]/5 to-[hsl(30,100%,50%)]/5 border-[hsl(265,60%,55%)]/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[hsl(265,60%,55%)]/10 flex items-center justify-center">
                  <Shuffle className="w-4 h-4 text-[hsl(265,60%,55%)]" />
                </div>
                Stream Smart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-xl bg-white/60 p-4">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Shuffle className="w-4 h-4" /> Use varied playlists
                </p>
                <p className="mt-2 text-xs">Mix BTS tracks to keep sessions natural and mission-safe.</p>
              </div>
              <div className="rounded-xl bg-white/60 p-4">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Sync before claiming
                </p>
                <p className="mt-2 text-xs">Refresh tracker after listening blocks for accurate progress.</p>
              </div>
              <div className="rounded-xl bg-white/60 p-4">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4" /> Protect your streak
                </p>
                <p className="mt-2 text-xs">Complete at least one daily mission before reset.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[hsl(30,100%,50%)]/10 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-[hsl(30,100%,50%)]" />
                </div>
                Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className="text-[hsl(265,60%,55%)] font-semibold">1.</span>
                <p>Complete daily missions before India reset</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className="text-[hsl(265,60%,55%)] font-semibold">2.</span>
                <p>Weekly points count for both city & state boards</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <span className="text-[hsl(265,60%,55%)] font-semibold">3.</span>
                <p>Admin overrides replace random picks when available</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
