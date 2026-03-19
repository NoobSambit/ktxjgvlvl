"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useTransition } from "react"
import { ArrowRight, CalendarClock, RefreshCcw, Target, Trophy } from "lucide-react"
import { DashboardPanel, DashboardPanelHeader, DashboardPill } from "@/components/dashboard/dashboard-shell"
import { ProgressBar } from "@/components/shared/progress-bar"
import { Button } from "@/components/ui/button"
import { formatDateLabel } from "@/lib/utils"
import type { MissionCard, MissionPageState } from "@/modules/missions/types"

type MissionControlPanelProps = {
  missionState: MissionPageState
}

const scopeMeta = {
  individual_personal: {
    label: "Personal",
    tone: "purple"
  },
  state_shared: {
    label: "State",
    tone: "teal"
  },
  india_shared: {
    label: "India",
    tone: "saffron"
  }
} as const

const cadenceOrder = {
  daily: 0,
  weekly: 1
} as const

const mechanicOrder = {
  track_streams: 0,
  album_completions: 1
} as const

function getMissionChipLabel(mission: MissionCard) {
  const cadenceLabel = mission.cadence === "weekly" ? "Weekly" : "Daily"
  const mechanicLabel = mission.mechanicType === "track_streams" ? "Track" : "Album"
  return `${cadenceLabel} ${mechanicLabel}`
}

function getMissionStatusTone(mission: MissionCard) {
  if (mission.completionState === "completed") {
    return "teal" as const
  }

  if (mission.completionState === "locked") {
    return "saffron" as const
  }

  return "purple" as const
}

function getTargetGoalLabel(target: MissionCard["targets"][number]) {
  const progress = target.progress ?? 0
  const goal = target.targetCount ?? target.trackCount ?? 1

  if (target.kind === "album") {
    return `${progress}/${goal} tracks`
  }

  return `${progress}/${goal} plays`
}

export function MissionControlPanel({ missionState }: MissionControlPanelProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState("")
  const [isPending, startTransition] = useTransition()
  const missions = useMemo(
    () =>
      [...missionState.daily, ...missionState.weekly].sort(
        (left, right) =>
          cadenceOrder[left.cadence] - cadenceOrder[right.cadence] ||
          mechanicOrder[left.mechanicType] - mechanicOrder[right.mechanicType] ||
          left.title.localeCompare(right.title)
      ),
    [missionState.daily, missionState.weekly]
  )

  const scopes = useMemo(
    () =>
      Object.entries(scopeMeta)
        .map(([key, meta]) => ({
          key: key as MissionCard["missionKind"],
          label: meta.label,
          tone: meta.tone,
          missions: missions.filter((mission) => mission.missionKind === key)
        }))
        .filter((scope) => scope.missions.length > 0),
    [missions]
  )

  const [selectedScope, setSelectedScope] = useState<MissionCard["missionKind"] | null>(scopes[0]?.key ?? null)
  const selectedScopeEntry = scopes.find((scope) => scope.key === selectedScope) ?? scopes[0]
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(selectedScopeEntry?.missions[0]?.id ?? null)

  useEffect(() => {
    if (!scopes.some((scope) => scope.key === selectedScope)) {
      setSelectedScope(scopes[0]?.key ?? null)
    }
  }, [scopes, selectedScope])

  useEffect(() => {
    if (!selectedScopeEntry) {
      setSelectedMissionId(null)
      return
    }

    const hasSelectedMission = selectedScopeEntry.missions.some((mission) => mission.id === selectedMissionId)

    if (!hasSelectedMission) {
      setSelectedMissionId(selectedScopeEntry.missions[0]?.id ?? null)
    }
  }, [selectedMissionId, selectedScopeEntry])

  const selectedMission =
    selectedScopeEntry?.missions.find((mission) => mission.id === selectedMissionId) ?? selectedScopeEntry?.missions[0]

  async function handleRefreshProgress() {
    setFeedback("")

    try {
      const response = await fetch("/api/v1/missions/verify", {
        method: "POST"
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Mission verification failed.")
      }

      setFeedback("Mission progress refreshed.")
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Mission verification failed.")
    }
  }

  return (
    <DashboardPanel className="p-3.5 sm:p-5 lg:p-6">
      <DashboardPanelHeader
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="h-10 rounded-full px-4 text-sm"
              disabled={isPending || Boolean(missionState.verificationBlockedReason)}
              onClick={handleRefreshProgress}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Sync progress
            </Button>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-white/72 hover:text-white" href="/missions">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        }
        badge="Mission control"
        badgeIcon={Target}
        badgeTone="purple"
        description="Switch between personal, state, and India missions, then move across the live daily, weekly, song, and album goals inside each group."
        title="All live missions"
      />

      <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
        <div className="rounded-[1rem] border border-white/10 bg-white/[0.03] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.1rem] sm:p-3">
          <div className="flex flex-col gap-2.5 xl:flex-row xl:items-start">
            <div className="min-w-0 xl:flex-1">
              <div className="flex items-center gap-2">
                <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42 sm:text-[11px] sm:tracking-[0.18em]">
                  <span className="sm:hidden">Help as</span>
                  <span className="hidden sm:inline">Where you want to help</span>
                </p>
                <div className="h-px flex-1 bg-white/8 xl:hidden" />
              </div>
              <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1 sm:mt-2">
                {scopes.map((scope) => (
                  <button
                    key={scope.key}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-medium transition sm:px-3.5 sm:text-sm ${
                      selectedScopeEntry?.key === scope.key
                        ? "border-[hsl(265,70%,65%)]/34 bg-[rgba(56,36,94,0.9)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                        : "border-white/10 bg-white/[0.03] text-white/64 hover:bg-white/[0.06] hover:text-white"
                    }`}
                    onClick={() => setSelectedScope(scope.key)}
                    type="button"
                  >
                    {scope.label} ({scope.missions.length})
                  </button>
                ))}
              </div>
            </div>

            {selectedScopeEntry ? (
              <div className="min-w-0 xl:flex-1">
                <div className="flex items-center gap-2">
                  <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42 sm:text-[11px] sm:tracking-[0.18em]">
                    <span className="sm:hidden">Mission</span>
                    <span className="hidden sm:inline">Pick a mission</span>
                  </p>
                  <div className="h-px flex-1 bg-white/8 xl:hidden" />
                </div>
                <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1 sm:mt-2">
                  {selectedScopeEntry.missions.map((mission) => (
                    <button
                      key={mission.id}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-[13px] transition sm:text-sm ${
                        selectedMission?.id === mission.id
                          ? "border-[hsl(265,70%,65%)]/34 bg-[rgba(56,36,94,0.9)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "border-white/10 bg-white/[0.03] text-white/64 hover:bg-white/[0.06] hover:text-white"
                      }`}
                      onClick={() => setSelectedMissionId(mission.id)}
                      type="button"
                    >
                      {getMissionChipLabel(mission)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {selectedMission ? (
          <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <DashboardPill tone={selectedScopeEntry?.tone ?? "purple"}>{selectedMission.scopeLabel}</DashboardPill>
                  <DashboardPill tone={getMissionStatusTone(selectedMission)}>
                    {selectedMission.completionState.replace("_", " ")}
                  </DashboardPill>
                  <DashboardPill tone="teal">{selectedMission.rewardLabel}</DashboardPill>
                  <DashboardPill tone="neutral">
                    <CalendarClock className="h-3 w-3" />
                    Ends {formatDateLabel(selectedMission.endsAt)}
                  </DashboardPill>
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">
                  {selectedMission.title}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/62">{selectedMission.description}</p>
              </div>

              <div className="rounded-[1rem] border border-white/10 bg-black/10 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/46">Progress</p>
                <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                  {selectedMission.aggregateProgress} / {selectedMission.goalUnits}
                </p>
                <p className="mt-1 text-xs text-white/52">Reward: {selectedMission.rewardLabel}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-5">
              <ProgressBar
                className="bg-white/10"
                max={selectedMission.goalUnits || 1}
                value={selectedMission.aggregateProgress}
              />
            </div>

            <div className="mt-4 sm:mt-5">
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Targets</p>
                  <p className="mt-1 text-xs text-white/52">
                    Scroll horizontally to see every target. Tap a card to open it in Spotify.
                  </p>
                </div>
                <span className="text-xs text-white/46">{selectedMission.targets.length} total</span>
              </div>

              <div className="mt-3 overflow-x-auto pb-3">
                <div className="flex min-w-max gap-3">
                  {selectedMission.targets.map((target) =>
                    target.spotifyUrl ? (
                      <a
                        className="flex w-[15rem] shrink-0 gap-3 rounded-[1rem] border border-white/10 bg-black/10 p-3 transition hover:border-white/18 hover:bg-white/[0.06]"
                        href={target.spotifyUrl}
                        key={target.key}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {target.imageUrl ? (
                          <img
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-[0.9rem] border border-white/10 object-cover"
                            decoding="async"
                            loading="lazy"
                            src={target.imageUrl}
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.9rem] border border-white/10 bg-white/5 text-white/52">
                            <Trophy className="h-4 w-4" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{target.title}</p>
                          <p className="mt-1 truncate text-xs text-white/56">{target.artistName}</p>
                          <p className="mt-3 text-xs font-medium text-white/74">{getTargetGoalLabel(target)}</p>
                        </div>
                      </a>
                    ) : (
                      <div
                        className="flex w-[15rem] shrink-0 gap-3 rounded-[1rem] border border-white/10 bg-black/10 p-3"
                        key={target.key}
                      >
                        {target.imageUrl ? (
                          <img
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-[0.9rem] border border-white/10 object-cover"
                            decoding="async"
                            loading="lazy"
                            src={target.imageUrl}
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[0.9rem] border border-white/10 bg-white/5 text-white/52">
                            <Trophy className="h-4 w-4" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{target.title}</p>
                          <p className="mt-1 truncate text-xs text-white/56">{target.artistName}</p>
                          <p className="mt-3 text-xs font-medium text-white/74">{getTargetGoalLabel(target)}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-white/14 bg-white/[0.03] px-5 py-8 text-center text-sm text-white/62">
            No live missions available.
          </div>
        )}

        {missionState.verificationBlockedReason ? (
          <p className="text-sm text-white/62">{missionState.verificationBlockedReason}</p>
        ) : null}
        {feedback ? <p className="text-sm font-medium text-white">{feedback}</p> : null}
      </div>
    </DashboardPanel>
  )
}
