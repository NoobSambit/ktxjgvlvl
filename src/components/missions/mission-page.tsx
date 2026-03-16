"use client"

import { useState } from "react"
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock3,
  Disc3,
  Globe2,
  Layers3,
  Music4,
  Circle,
  Sparkles,
  Trophy,
  Waves
} from "lucide-react"
import { MissionActions } from "@/components/missions/mission-actions"
import { Badge } from "@/components/ui/badge"
import { cn, formatDateLabel } from "@/lib/utils"
import type { MissionCard, MissionPageState, MissionTargetView } from "@/modules/missions/types"

type MissionPageProps = {
  missionState: MissionPageState
}

type MechanicSectionProps = {
  mechanicType: MissionCard["mechanicType"]
  missions: MissionCard[]
  streamPointValue: number
  isConnected: boolean
}

type CadenceLaneProps = {
  cadence: MissionCard["cadence"]
  missions: MissionCard[]
  streamPointValue: number
  isConnected: boolean
}

type MissionCardProps = {
  mission: MissionCard
  streamPointValue: number
  isConnected: boolean
}

function MissionMeter({
  value,
  max,
  className,
  fillClassName,
  trackClassName = "bg-white/8",
  thicknessClassName = "h-2.5"
}: {
  value: number
  max: number
  className?: string
  fillClassName?: string
  trackClassName?: string
  thicknessClassName?: string
}) {
  const safeMax = max > 0 ? max : 1
  const width = Math.max(0, Math.min(100, (value / safeMax) * 100))

  return (
    <div className={cn("overflow-hidden rounded-full", trackClassName, thicknessClassName, className)}>
      <div className={cn("h-full rounded-full", fillClassName)} style={{ width: `${width}%` }} />
    </div>
  )
}

function getMechanicSectionMeta(mechanicType: MissionCard["mechanicType"]) {
  if (mechanicType === "track_streams") {
    return {
      title: "Song Streaming Quests",
      description:
        "Single-song missions track repeated verified plays on assigned tracks. Completion rewards are separate from normal verified stream scoring.",
      icon: Music4,
      shellClassName:
        "border-[hsl(205,72%,58%)]/18 bg-[radial-gradient(circle_at_top_left,rgba(35,65,140,0.28),rgba(27,18,49,0.96)_48%,rgba(16,12,28,0.98)_100%)]",
      accentClassName: "text-[hsl(196,86%,72%)]",
      badgeClassName:
        "border-[hsl(196,86%,72%)]/25 bg-[hsl(196,86%,72%)]/10 text-[hsl(196,86%,72%)]"
    }
  }

  return {
    title: "Album Streaming Quests",
    description:
      "Album quests require finishing assigned albums from verified track events. Their completion rewards are tuned separately from song quests.",
    icon: Disc3,
    shellClassName:
      "border-[hsl(24,78%,62%)]/18 bg-[radial-gradient(circle_at_top_left,rgba(161,73,33,0.28),rgba(36,18,42,0.96)_48%,rgba(18,12,24,0.98)_100%)]",
    accentClassName: "text-[hsl(24,94%,68%)]",
    badgeClassName:
      "border-[hsl(24,94%,68%)]/25 bg-[hsl(24,94%,68%)]/10 text-[hsl(24,94%,68%)]"
  }
}

function getQuestTitle(mission: MissionCard) {
  return `${mission.cadence === "daily" ? "Daily" : "Weekly"} ${
    mission.mechanicType === "track_streams" ? "Song Streaming Quest" : "Album Streaming Quest"
  }`
}

function getResetLabel(cadence: MissionCard["cadence"]) {
  return cadence === "daily" ? "Resets daily" : "Resets weekly"
}

function getScopeLabel(mission: MissionCard) {
  switch (mission.missionKind) {
    case "india_shared":
      return "India shared"
    case "state_shared":
      return "State shared"
    case "individual_personal":
    default:
      return "Personal"
  }
}

function getConnectionLabel(isConnected: boolean) {
  return isConnected ? "Connected" : "Verification needed"
}

function getCompletionRewardUnitLabel(mission: MissionCard) {
  return mission.missionKind === "state_shared" ? "state points" : "points"
}

function getCompletionFooterCopy(mission: MissionCard, isConnected: boolean) {
  if (mission.completionState === "completed") {
    return "Completion reward already applied."
  }

  if (mission.completionState === "locked") {
    return "Confirm your state and verify your tracker to unlock this quest."
  }

  if (!isConnected) {
    return "Verify your tracker first. Completion rewards only count from verified stream activity."
  }

  return `Completion reward auto-applies when this quest reaches ${mission.goalUnits}/${mission.goalUnits}.`
}

function getMissionTone(mission: MissionCard) {
  if (mission.completionState === "completed") {
    return {
      cardClassName:
        "border-[hsl(154,75%,55%)]/25 bg-[linear-gradient(180deg,rgba(14,42,34,0.98),rgba(13,26,24,0.98))]",
      iconWrapClassName: "border-[hsl(154,75%,55%)]/28 bg-[hsl(154,75%,55%)]/12",
      iconClassName: "text-[hsl(154,80%,72%)]",
      fillClassName: "bg-gradient-to-r from-[hsl(154,80%,65%)] to-[hsl(130,72%,62%)]",
      accentClassName: "text-[hsl(154,80%,72%)]",
      rewardClassName: "text-[hsl(154,80%,72%)]",
      footerClassName:
        "border-[hsl(154,75%,55%)]/22 bg-[hsl(154,75%,55%)]/10 text-[hsl(154,80%,72%)]"
    }
  }

  if (mission.mechanicType === "track_streams") {
    return {
      cardClassName:
        "border-[hsl(205,72%,58%)]/18 bg-[linear-gradient(180deg,rgba(37,27,65,0.98),rgba(28,20,48,0.98))]",
      iconWrapClassName: "border-[hsl(205,72%,58%)]/22 bg-[hsl(205,72%,58%)]/10",
      iconClassName: "text-[hsl(196,86%,72%)]",
      fillClassName: "bg-gradient-to-r from-[hsl(196,86%,72%)] via-[hsl(228,86%,72%)] to-[hsl(260,88%,74%)]",
      accentClassName: "text-[hsl(196,86%,72%)]",
      rewardClassName: "text-[hsl(196,86%,72%)]",
      footerClassName:
        "border-white/10 bg-white/6 text-[hsl(265,15%,72%)]"
    }
  }

  return {
    cardClassName:
      "border-[hsl(24,78%,62%)]/18 bg-[linear-gradient(180deg,rgba(55,30,45,0.98),rgba(34,20,34,0.98))]",
    iconWrapClassName: "border-[hsl(24,78%,62%)]/22 bg-[hsl(24,78%,62%)]/10",
    iconClassName: "text-[hsl(24,94%,68%)]",
    fillClassName: "bg-gradient-to-r from-[hsl(24,94%,68%)] via-[hsl(340,80%,70%)] to-[hsl(284,82%,72%)]",
    accentClassName: "text-[hsl(24,94%,68%)]",
    rewardClassName: "text-[hsl(24,94%,68%)]",
    footerClassName:
      "border-white/10 bg-white/6 text-[hsl(265,15%,72%)]"
  }
}

function TargetPanel({
  mission,
  targets,
  accentClassName,
  isConnected
}: {
  mission: MissionCard
  targets: MissionTargetView[]
  accentClassName: string
  isConnected: boolean
}) {
  const [expandedTargets, setExpandedTargets] = useState<Record<string, boolean>>({})

  function toggleTarget(key: string) {
    setExpandedTargets((current) => ({
      ...current,
      [key]: !current[key]
    }))
  }

  return (
    <div className="space-y-3 rounded-[1rem] border border-white/8 bg-white/[0.035] p-2.5 sm:rounded-[1.35rem] sm:p-4">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(265,15%,62%)]">
          {mission.mechanicType === "track_streams" ? "Required Tracks" : "Required Albums"}
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-[hsl(265,15%,70%)]">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-[hsl(154,80%,62%)]" : "bg-[hsl(0,75%,66%)]"
            )}
          />
          <span className={isConnected ? "text-[hsl(154,80%,72%)]" : "text-[hsl(0,80%,78%)]"}>
            {getConnectionLabel(isConnected)}
          </span>
        </div>
      </div>

      <div className={cn("space-y-2.5", targets.length > 4 && "max-h-72 overflow-y-auto pr-1")}>
        {targets.map((target) => {
          const progress = target.progress ?? 0
          const targetCount = target.targetCount ?? 1
          const isAlbumTarget = target.kind === "album"
          const isExpanded = expandedTargets[target.key]

          if (isAlbumTarget) {
            const completedTrackCount = target.completedTrackCount ?? 0
            const albumTrackCount = target.trackCount ?? target.tracks?.length ?? 0

            return (
              <div
                className="rounded-[0.95rem] border border-white/6 bg-[rgba(255,255,255,0.04)] px-2.5 py-2.5 sm:rounded-[1rem] sm:px-3.5 sm:py-3"
                key={target.key}
              >
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                  {target.spotifyUrl ? (
                    <a
                      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl transition hover:bg-white/5 sm:gap-3"
                      href={target.spotifyUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {target.imageUrl ? (
                        <img
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
                          decoding="async"
                          loading="lazy"
                          src={target.imageUrl}
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[hsl(265,15%,58%)]">
                          <Trophy className="h-4 w-4" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{target.title}</p>
                        <p className="mt-1 text-xs text-[hsl(265,15%,62%)] sm:truncate">
                          {target.artistName} · {albumTrackCount} tracks required
                        </p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                      {target.imageUrl ? (
                        <img
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
                          decoding="async"
                          loading="lazy"
                          src={target.imageUrl}
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[hsl(265,15%,58%)]">
                          <Trophy className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{target.title}</p>
                        <p className="mt-1 text-xs text-[hsl(265,15%,62%)] sm:truncate">
                          {target.artistName} · {albumTrackCount} tracks required
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10 sm:w-auto sm:shrink-0 sm:justify-start sm:text-right"
                    onClick={() => toggleTarget(target.key)}
                    type="button"
                  >
                    <div>
                      <p className={cn("text-sm font-semibold", accentClassName)}>
                        {completedTrackCount}/{albumTrackCount}
                      </p>
                      <p className="mt-1 text-[11px] text-[hsl(265,15%,58%)]">Verified tracks</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[hsl(265,15%,62%)]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[hsl(265,15%,62%)]" />
                    )}
                  </button>
                </div>

                {isExpanded ? (
                  <div className="mt-3 space-y-2 border-t border-white/8 pt-3">
                    {(target.tracks ?? []).map((track, index) =>
                      track.spotifyUrl ? (
                        <a
                          className="flex flex-col items-start gap-2 rounded-xl border border-white/6 bg-black/10 px-2.5 py-2.5 transition hover:border-white/12 hover:bg-white/5 sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-2.5"
                          href={track.spotifyUrl}
                          key={track.key}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <span className="w-5 shrink-0 text-left text-xs text-[hsl(265,15%,52%)] sm:text-right">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground sm:truncate">{track.title}</p>
                            <p className="mt-1 text-xs text-[hsl(265,15%,58%)] sm:truncate">{track.artistName}</p>
                          </div>
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold self-start sm:self-auto",
                              track.isCompleted
                                ? "bg-[hsl(154,80%,62%)]/12 text-[hsl(154,80%,72%)]"
                                : "bg-white/6 text-[hsl(265,15%,68%)]"
                            )}
                          >
                            {track.isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Circle className="h-3.5 w-3.5" />
                            )}
                            {track.isCompleted ? "Verified" : "Pending"}
                          </div>
                        </a>
                      ) : (
                        <div
                          className="flex flex-col items-start gap-2 rounded-xl border border-white/6 bg-black/10 px-2.5 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-2.5"
                          key={track.key}
                        >
                          <span className="w-5 shrink-0 text-left text-xs text-[hsl(265,15%,52%)] sm:text-right">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground sm:truncate">{track.title}</p>
                            <p className="mt-1 text-xs text-[hsl(265,15%,58%)] sm:truncate">{track.artistName}</p>
                          </div>
                          <div
                            className={cn(
                              "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold self-start sm:self-auto",
                              track.isCompleted
                                ? "bg-[hsl(154,80%,62%)]/12 text-[hsl(154,80%,72%)]"
                                : "bg-white/6 text-[hsl(265,15%,68%)]"
                            )}
                          >
                            {track.isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Circle className="h-3.5 w-3.5" />
                            )}
                            {track.isCompleted ? "Verified" : "Pending"}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : null}
              </div>
            )
          }

          return (
            <a
              className="flex items-center gap-2.5 rounded-[0.95rem] border border-white/6 bg-[rgba(255,255,255,0.04)] px-2.5 py-2.5 transition hover:border-white/12 hover:bg-white/6 sm:gap-3 sm:rounded-[1rem] sm:px-3.5 sm:py-3"
              href={target.spotifyUrl}
              key={target.key}
              rel="noreferrer"
              target="_blank"
            >
              {target.imageUrl ? (
                <img
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
                  decoding="async"
                  loading="lazy"
                  src={target.imageUrl}
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[hsl(265,15%,58%)]">
                  <Trophy className="h-4 w-4" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground sm:truncate">{target.title}</p>
                <p className="mt-1 text-xs text-[hsl(265,15%,62%)] sm:truncate">{target.artistName}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className={cn("text-sm font-semibold", accentClassName)}>
                  {progress}/{targetCount}
                </p>
                <p className="mt-1 text-[11px] text-[hsl(265,15%,58%)]">Target plays</p>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

function QuestCard({ mission, streamPointValue, isConnected }: MissionCardProps) {
  const tone = getMissionTone(mission)
  const Icon =
    mission.completionState === "completed"
      ? Sparkles
      : mission.mechanicType === "track_streams"
        ? Music4
        : Disc3

  return (
    <article
      className={cn(
        "space-y-3.5 rounded-[1.2rem] border p-3 shadow-[0_24px_60px_-34px_rgba(0,0,0,0.85)] sm:space-y-5 sm:rounded-[1.7rem] sm:p-5",
        tone.cardClassName
      )}
    >
      <div className="flex flex-col gap-3.5 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-2.5 sm:gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border sm:h-12 sm:w-12 sm:rounded-2xl",
              tone.iconWrapClassName
            )}
          >
            <Icon className={cn("h-4.5 w-4.5 sm:h-5 sm:w-5", tone.iconClassName)} />
          </div>

          <div className="min-w-0 space-y-2.5 sm:space-y-3">
            <div>
              <h3 className="font-heading text-[1.08rem] font-semibold tracking-tight text-foreground sm:text-[1.5rem]">
                {getQuestTitle(mission)}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-[hsl(265,15%,66%)] sm:text-xs">
                <Badge className="border border-white/12 bg-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(265,15%,74%)]">
                  {mission.mechanicType === "track_streams" ? "Single Song" : "Album"}
                </Badge>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Clock3 className="h-3.5 w-3.5" />
                  {getResetLabel(mission.cadence)}
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <Waves className="h-3.5 w-3.5" />
                  {getScopeLabel(mission)}
                </span>
                <span className="whitespace-nowrap">Ends {formatDateLabel(mission.endsAt)}</span>
              </div>
            </div>

            <p className="max-w-3xl text-[13px] leading-5 text-[hsl(265,15%,68%)] sm:text-sm sm:leading-6">
              {mission.description}
            </p>

            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
              <Badge className="border border-white/10 bg-white/6 px-2.5 py-1 text-[hsl(265,15%,72%)] sm:px-3">
                Contribution: {mission.userContribution}
              </Badge>
              <Badge className="border border-white/10 bg-white/6 px-2.5 py-1 text-[hsl(265,15%,72%)] sm:px-3">
                {mission.scopeLabel}
              </Badge>
              {typeof mission.contributorCount === "number" ? (
                <Badge className="border border-white/10 bg-white/6 px-2.5 py-1 text-[hsl(265,15%,72%)] sm:px-3">
                  {mission.contributorCount} contributors
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="w-full rounded-[1rem] border border-white/10 bg-black/10 px-3.5 py-2.5 text-left sm:w-auto sm:shrink-0 sm:rounded-[1.25rem] sm:px-4 sm:py-3 sm:text-right">
          <p className={cn("text-xl font-semibold sm:text-2xl", tone.rewardClassName)}>+{mission.rewardPoints}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(265,15%,62%)]">
            Completion Reward
          </p>
          <p className="mt-1 text-xs text-[hsl(265,15%,70%)]">{getCompletionRewardUnitLabel(mission)}</p>
          <p className="mt-3 text-xs text-[hsl(265,15%,58%)]">
            +{streamPointValue} / verified stream scored separately
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-[hsl(265,15%,72%)]">Progress</span>
          <span className="font-semibold text-foreground">
            {mission.aggregateProgress} / {mission.goalUnits}
          </span>
        </div>
        <MissionMeter
          fillClassName={tone.fillClassName}
          max={mission.goalUnits || 1}
          thicknessClassName="h-2.5"
          trackClassName="bg-white/8"
          value={mission.aggregateProgress}
        />
      </div>

      <TargetPanel
        accentClassName={tone.accentClassName}
        isConnected={isConnected}
        mission={mission}
        targets={mission.targets}
      />

      <div
        className={cn(
          "rounded-[0.95rem] border px-3 py-2.5 text-center text-sm font-semibold sm:rounded-[1.15rem] sm:px-4 sm:py-3",
          tone.footerClassName
        )}
      >
        {getCompletionFooterCopy(mission, isConnected)}
      </div>
    </article>
  )
}

function CadenceLane({ cadence, missions, streamPointValue, isConnected }: CadenceLaneProps) {
  return (
    <div className="space-y-3.5 rounded-[1.05rem] border border-white/8 bg-[rgba(255,255,255,0.03)] p-2.5 sm:space-y-4 sm:rounded-[1.5rem] sm:p-4">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[hsl(265,15%,62%)]">
            {cadence === "daily" ? "Daily" : "Weekly"}
          </p>
          <p className="mt-1 text-sm text-[hsl(265,15%,68%)]">
            {cadence === "daily" ? "Resets every day at 12:00 AM IST." : "Resets every Monday at 12:00 AM IST."}
          </p>
        </div>
        <Badge className="border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(265,15%,72%)]">
          {missions.length} live
        </Badge>
      </div>

      {missions.length > 0 ? (
        <div className="space-y-3.5 sm:space-y-4">
          {missions.map((mission) => (
            <QuestCard
              isConnected={isConnected}
              key={mission.id}
              mission={mission}
              streamPointValue={streamPointValue}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.15rem] border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-[hsl(265,15%,64%)]">
          No live {cadence} quests in this mechanic right now.
        </div>
      )}
    </div>
  )
}

function MechanicSection({
  mechanicType,
  missions,
  streamPointValue,
  isConnected
}: MechanicSectionProps) {
  const meta = getMechanicSectionMeta(mechanicType)
  const Icon = meta.icon
  const dailyMissions = missions.filter((mission) => mission.cadence === "daily")
  const weeklyMissions = missions.filter((mission) => mission.cadence === "weekly")

  return (
    <section className={cn("space-y-4 rounded-[1.25rem] border p-3 sm:space-y-6 sm:rounded-[2rem] sm:p-6", meta.shellClassName)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-2.5 py-1.5 sm:px-3">
            <Icon className={cn("h-3.5 w-3.5", meta.accentClassName)} />
            <span className={cn("text-[11px] font-bold uppercase tracking-[0.2em]", meta.accentClassName)}>
              {meta.title}
            </span>
          </div>
          <div>
            <h2 className="font-heading text-[1.75rem] font-semibold tracking-tight text-foreground sm:text-4xl">
              {meta.title}
            </h2>
            <p className="mt-2 max-w-3xl text-[13px] leading-5 text-[hsl(265,15%,70%)] sm:text-sm sm:leading-6">
              {meta.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={cn("px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]", meta.badgeClassName)}>
            {missions.length} live quests
          </Badge>
          <Badge className="border border-white/10 bg-white/6 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(265,15%,72%)]">
            +{streamPointValue} / verified stream
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <CadenceLane
          cadence="daily"
          isConnected={isConnected}
          missions={dailyMissions}
          streamPointValue={streamPointValue}
        />
        <CadenceLane
          cadence="weekly"
          isConnected={isConnected}
          missions={weeklyMissions}
          streamPointValue={streamPointValue}
        />
      </div>
    </section>
  )
}

function HeroMetric({
  label,
  value,
  icon: Icon
}: {
  label: string
  value: string
  icon: typeof CalendarClock
}) {
  return (
    <div className="w-full rounded-[1.05rem] border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm sm:rounded-[1.15rem] sm:px-4">
      <div className="flex items-center gap-2 text-[hsl(265,15%,62%)]">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}

function MissionCommandHero({
  liveMissionCount,
  streamPointValue,
  resetTimezone
}: {
  liveMissionCount: number
  streamPointValue: number
  resetTimezone: string
}) {
  const resetTimezoneLabel = resetTimezone === "Asia/Kolkata" ? "IST" : resetTimezone

  return (
    <section className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(82,26,180,0.68),rgba(10,19,41,0.95)_52%,rgba(6,14,32,0.98)_100%)] px-3.5 py-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] sm:rounded-[2rem] sm:px-8 sm:py-8 lg:px-10 lg:py-12">
      <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute right-6 top-6 hidden h-64 w-64 rounded-full border border-white/5 bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_68%)] lg:block" />
      <div className="absolute right-10 bottom-6 hidden lg:block">
        <Sparkles className="h-40 w-40 text-white/12" strokeWidth={1.5} />
      </div>

      <div className="relative z-10 max-w-4xl space-y-5 sm:space-y-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-2.5 py-1.5 sm:px-3">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(25,90%,60%)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[hsl(25,90%,60%)]">Missions</span>
        </div>

        <div className="space-y-3.5 sm:space-y-4">
          <h1 className="font-heading text-[2rem] font-semibold tracking-tight leading-[1.02] text-white sm:text-5xl lg:text-7xl lg:leading-[0.94]">
            Separate Boards <br className="hidden sm:block" />
            <span className="text-[hsl(265,90%,76%)]">For Songs And Albums</span>
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[hsl(265,18%,82%)] sm:text-lg sm:leading-7">
            Song streaming quests and album streaming quests now live in separate mission sections. Verified
            streams always score normally, while each quest shows its own separate completion reward.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:flex xl:flex-wrap">
          <HeroMetric icon={CalendarClock} label="Daily reset" value={`12:00 AM ${resetTimezoneLabel}`} />
          <HeroMetric icon={Clock3} label="Weekly reset" value={`Monday 12:00 AM ${resetTimezoneLabel}`} />
          <HeroMetric
            icon={Layers3}
            label="Per stream"
            value={`+${streamPointValue} ${streamPointValue === 1 ? "point" : "points"}`}
          />
          <HeroMetric icon={Globe2} label="Live quests" value={`${liveMissionCount} active cells`} />
        </div>
      </div>
    </section>
  )
}

export function MissionPage({ missionState }: MissionPageProps) {
  const allMissions = [...missionState.daily, ...missionState.weekly]
  const trackMissions = allMissions.filter((mission) => mission.mechanicType === "track_streams")
  const albumMissions = allMissions.filter((mission) => mission.mechanicType === "album_completions")
  const isConnected = missionState.lastfmConnection?.verificationStatus === "verified"

  if (allMissions.length === 0) {
    return (
      <div className="space-y-8 sm:space-y-10">
        <MissionCommandHero
          liveMissionCount={0}
          resetTimezone={missionState.resetTimezone}
          streamPointValue={missionState.streamPointValue}
        />

        <MissionActions
          isAuthenticated={missionState.isAuthenticated}
          lastfmConnection={missionState.lastfmConnection}
          streamPointValue={missionState.streamPointValue}
          verificationBlockedReason={missionState.verificationBlockedReason}
        />

        <section className="rounded-[1.5rem] border border-dashed border-white/12 bg-[rgba(12,19,41,0.72)] p-5 text-center shadow-[0_24px_60px_-35px_rgba(0,0,0,0.85)] sm:rounded-[1.75rem] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/6">
            <CircleDot className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">No live missions yet</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[hsl(265,15%,66%)]">
            Sync the BTS-family catalog from admin first. Once missions are generated, this page will render
            separate song-streaming and album-streaming boards automatically.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-12">
      <MissionCommandHero
        liveMissionCount={allMissions.length}
        resetTimezone={missionState.resetTimezone}
        streamPointValue={missionState.streamPointValue}
      />

      <MissionActions
        isAuthenticated={missionState.isAuthenticated}
        lastfmConnection={missionState.lastfmConnection}
        streamPointValue={missionState.streamPointValue}
        verificationBlockedReason={missionState.verificationBlockedReason}
      />

      <MechanicSection
        isConnected={isConnected}
        mechanicType="track_streams"
        missions={trackMissions}
        streamPointValue={missionState.streamPointValue}
      />

      <MechanicSection
        isConnected={isConnected}
        mechanicType="album_completions"
        missions={albumMissions}
        streamPointValue={missionState.streamPointValue}
      />
    </div>
  )
}
