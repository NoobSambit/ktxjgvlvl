"use client"

import type { LucideIcon } from "lucide-react"
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Clock3,
  Crown,
  Expand,
  Loader2,
  MapPinned,
  Sparkles,
  Trophy,
  Users,
  Waves,
  X
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { DashboardPanel, DashboardPill } from "@/components/dashboard/dashboard-shell"
import { ScoringGuideModal } from "@/components/shared/scoring-guide-modal"
import { cn, formatCompactNumber } from "@/lib/utils"
import type { LeaderboardBoardView, LeaderboardEntryView } from "@/modules/leaderboards/types"

type LeaderboardsExperienceProps = {
  boards: LeaderboardBoardView[]
  streamPointValue: number
}

type BoardMetaKey = "daily-individual" | "weekly-individual" | "daily-state" | "weekly-state"

type BoardMeta = {
  title: string
  kicker: string
  description: string
  icon: LucideIcon
  tone: "purple" | "saffron" | "teal" | "rose"
  panelClassName: string
  accentTextClassName: string
  rankBadgeClassName: string
  scorePillClassName: string
  rowHighlightClassName: string
  footerClassName: string
}

const boardMetaByKey: Record<BoardMetaKey, BoardMeta> = {
  "daily-individual": {
    title: "Daily Individual",
    kicker: "Today's fan race",
    description: "Today's verified BTS streams plus today's personal mission rewards.",
    icon: Trophy,
    tone: "purple",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,rgba(101,58,215,0.18),rgba(16,13,28,0.96)_58%,rgba(11,10,20,0.98)_100%)]",
    accentTextClassName: "text-[hsl(277,100%,88%)]",
    rankBadgeClassName:
      "border-[hsl(265,70%,65%)]/24 bg-[hsl(265,70%,65%)]/12 text-[hsl(277,100%,88%)]",
    scorePillClassName:
      "border-[hsl(265,70%,65%)]/25 bg-[hsl(265,70%,65%)]/14 text-[hsl(277,100%,88%)]",
    rowHighlightClassName:
      "border-[hsl(265,70%,65%)]/24 bg-[hsl(265,70%,65%)]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
    footerClassName:
      "border-[hsl(265,70%,65%)]/24 bg-[hsl(265,70%,65%)]/12 text-[hsl(277,100%,88%)]"
  },
  "weekly-individual": {
    title: "Weekly Individual",
    kicker: "This week's fan race",
    description: "This week's verified BTS streams plus weekly mission rewards only.",
    icon: Crown,
    tone: "saffron",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,rgba(186,101,29,0.18),rgba(20,14,18,0.96)_58%,rgba(12,10,13,0.98)_100%)]",
    accentTextClassName: "text-[hsl(35,100%,82%)]",
    rankBadgeClassName:
      "border-[hsl(25,90%,55%)]/24 bg-[hsl(25,90%,55%)]/12 text-[hsl(35,100%,82%)]",
    scorePillClassName:
      "border-[hsl(25,90%,55%)]/24 bg-[hsl(25,90%,55%)]/12 text-[hsl(35,100%,82%)]",
    rowHighlightClassName:
      "border-[hsl(25,90%,55%)]/24 bg-[hsl(25,90%,55%)]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
    footerClassName:
      "border-[hsl(25,90%,55%)]/22 bg-[hsl(25,90%,55%)]/12 text-[hsl(35,100%,82%)]"
  },
  "daily-state": {
    title: "Daily State",
    kicker: "Today's state race",
    description: "Today's state total from verified BTS streams and daily state rewards.",
    icon: MapPinned,
    tone: "teal",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,rgba(30,148,111,0.18),rgba(13,23,22,0.96)_58%,rgba(9,15,14,0.98)_100%)]",
    accentTextClassName: "text-[hsl(171,100%,86%)]",
    rankBadgeClassName:
      "border-[hsl(170,60%,45%)]/24 bg-[hsl(170,60%,45%)]/12 text-[hsl(171,100%,86%)]",
    scorePillClassName:
      "border-[hsl(170,60%,45%)]/24 bg-[hsl(170,60%,45%)]/12 text-[hsl(171,100%,86%)]",
    rowHighlightClassName:
      "border-[hsl(170,60%,45%)]/24 bg-[hsl(170,60%,45%)]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
    footerClassName:
      "border-[hsl(170,60%,45%)]/24 bg-[hsl(170,60%,45%)]/12 text-[hsl(171,100%,86%)]"
  },
  "weekly-state": {
    title: "Weekly State",
    kicker: "This week's state race",
    description: "This week's state total from verified BTS streams and weekly state rewards.",
    icon: Waves,
    tone: "rose",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,rgba(133,88,208,0.16),rgba(19,15,29,0.96)_58%,rgba(11,10,20,0.98)_100%)]",
    accentTextClassName: "text-[hsl(320,100%,90%)]",
    rankBadgeClassName:
      "border-[hsl(320,65%,70%)]/24 bg-[hsl(320,65%,70%)]/12 text-[hsl(320,100%,90%)]",
    scorePillClassName:
      "border-[hsl(320,65%,70%)]/24 bg-[hsl(320,65%,70%)]/12 text-[hsl(320,100%,90%)]",
    rowHighlightClassName:
      "border-[hsl(320,65%,70%)]/24 bg-[hsl(320,65%,70%)]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
    footerClassName:
      "border-[hsl(320,65%,70%)]/22 bg-[hsl(320,65%,70%)]/12 text-[hsl(320,100%,90%)]"
  }
}

const boardSortOrder: Record<BoardMetaKey, number> = {
  "daily-individual": 0,
  "weekly-individual": 1,
  "daily-state": 2,
  "weekly-state": 3
}

function getBoardKey(board: LeaderboardBoardView): BoardMetaKey {
  return `${board.period}-${board.boardType}` as BoardMetaKey
}

function getBoardMeta(board: LeaderboardBoardView) {
  return boardMetaByKey[getBoardKey(board)]
}

function sortBoards(boards: LeaderboardBoardView[]) {
  return [...boards].sort((left, right) => boardSortOrder[getBoardKey(left)] - boardSortOrder[getBoardKey(right)])
}

function formatScore(score: number) {
  return `${formatCompactNumber(score)} pts`
}

function formatResetLabel(endsAt: string) {
  const end = new Date(endsAt).getTime()
  const diff = end - Date.now()

  if (diff <= 0) {
    return "Resetting now"
  }

  const totalMinutes = Math.floor(diff / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  if (days >= 2) {
    return `Ends in ${days}d`
  }

  if (days === 1) {
    return hours > 0 ? `Ends in 1d ${hours}h` : "Ends in 1d"
  }

  if (hours >= 1) {
    return `Ends in ${hours}h`
  }

  return `Ends in ${Math.max(1, minutes)}m`
}

function formatIndiaDeadline(value: string) {
  return `${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  }).format(new Date(value))} IST`
}

function getTrendMeta(entry: LeaderboardEntryView) {
  if (typeof entry.previousRank !== "number") {
    return null
  }

  const change = entry.previousRank - entry.rank

  if (change > 0) {
    return {
      icon: ArrowUpRight,
      label: `Up ${change}`,
      className: "text-[hsl(154,80%,72%)]"
    }
  }

  if (change < 0) {
    return {
      icon: ArrowDownRight,
      label: `Down ${Math.abs(change)}`,
      className: "text-[hsl(0,80%,78%)]"
    }
  }

  return null
}

function getBoardFooterCopy(board: LeaderboardBoardView) {
  if (board.boardType === "individual" && board.currentUserEntry) {
    return {
      icon: Trophy,
      label: `You are #${board.currentUserEntry.rank} on this board`,
      value: formatScore(board.currentUserEntry.score)
    }
  }

  if (board.boardType === "state" && board.currentStateEntry) {
    return {
      icon: MapPinned,
      label: `${board.currentStateEntry.displayName} is #${board.currentStateEntry.rank}`,
      value: formatScore(board.currentStateEntry.score)
    }
  }

  if (board.boardType === "individual") {
    return {
      icon: Sparkles,
      label: "Your place shows up here once your score starts moving.",
      value: "Keep streaming"
    }
  }

  return {
    icon: Users,
    label: "Set your state to compare it with the rest of India.",
    value: "State view"
  }
}

function getBestCurrentEntry(
  boards: LeaderboardBoardView[],
  boardType: LeaderboardBoardView["boardType"]
) {
  const entries =
    boardType === "individual"
      ? boards
          .map((board) => board.currentUserEntry)
          .filter((entry): entry is LeaderboardEntryView => Boolean(entry))
      : boards
          .map((board) => board.currentStateEntry)
          .filter((entry): entry is LeaderboardEntryView => Boolean(entry))

  return entries.sort((left, right) => left.rank - right.rank)[0] ?? null
}

function getFeaturedPodiumBoard(boards: LeaderboardBoardView[]) {
  return (
    boards.find((board) => board.period === "daily" && board.boardType === "individual") ??
    boards.find((board) => board.period === "weekly" && board.boardType === "individual") ??
    boards.find((board) => board.boardType === "individual") ??
    boards[0] ??
    null
  )
}

function getDisplayInitials(value: string) {
  const parts = value
    .split(/[\s_]+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return "?"
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getPodiumSlots(board: LeaderboardBoardView | null) {
  const entriesByRank = new Map((board?.entries ?? []).filter((entry) => entry.rank <= 3).map((entry) => [entry.rank, entry]))

  return [
    {
      rank: 2 as const,
      entry: entriesByRank.get(2) ?? null,
      positionClassName: "translate-y-4 sm:translate-y-6 md:translate-y-8"
    },
    {
      rank: 1 as const,
      entry: entriesByRank.get(1) ?? null,
      positionClassName: ""
    },
    {
      rank: 3 as const,
      entry: entriesByRank.get(3) ?? null,
      positionClassName: "translate-y-4 sm:translate-y-6 md:translate-y-8"
    }
  ]
}

function OverviewMetric({
  icon: Icon,
  label,
  value,
  caption,
  mobileValue,
  mobileCaption
}: {
  icon: LucideIcon
  label: string
  value: string
  caption: string
  mobileValue?: string
  mobileCaption?: string
}) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.2rem] sm:p-4">
      <div className="flex items-center gap-1.5 text-white/54 sm:gap-2">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px] sm:tracking-[0.18em]">
          {label}
        </span>
      </div>
      <p className="mt-2 font-heading text-[1.02rem] font-semibold leading-tight tracking-tight text-white sm:hidden">
        {mobileValue ?? value}
      </p>
      <p className="mt-3 hidden font-heading text-xl font-semibold tracking-tight text-white sm:block sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-4 text-white/50 sm:hidden">{mobileCaption ?? caption}</p>
      <p className="mt-2 hidden text-xs leading-5 text-white/50 sm:block">{caption}</p>
    </div>
  )
}

function LeaderboardsHero({
  boards,
  streamPointValue
}: {
  boards: LeaderboardBoardView[]
  streamPointValue: number
}) {
  const bestPersonalEntry = getBestCurrentEntry(boards, "individual")
  const bestStateEntry = getBestCurrentEntry(boards, "state")

  return (
    <DashboardPanel className="overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(108,63,215,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,153,87,0.14),transparent_28%)]" />
      <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] xl:gap-8 xl:p-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <DashboardPill icon={Trophy} tone="purple">
              Leaderboards
            </DashboardPill>
            <DashboardPill icon={Sparkles} tone="neutral">
              {boards.length} live boards
            </DashboardPill>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-[12ch] font-heading text-[2.5rem] font-semibold leading-[0.96] tracking-[-0.05em] text-white sm:text-[3.8rem]">
              See who is leading right now
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-white/68 sm:text-base sm:leading-7">
              Daily and weekly rankings stay live for both fans and states across India. Stream points count in both
              periods, but mission rewards only land on the matching daily or weekly board, so a daily score can be
              higher than the weekly score until weekly rewards are earned.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ScoringGuideModal
              buttonClassName="border-[hsl(265,70%,65%)]/24 bg-[hsl(265,70%,65%)]/10 text-[hsl(277,100%,88%)] hover:bg-[hsl(265,70%,65%)]/16"
              buttonLabel="Open scoring guide"
              streamPointValue={streamPointValue}
            />
            {boards.map((board) => {
              const meta = getBoardMeta(board)
              const MetaIcon = meta.icon

              return (
                <a
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition hover:-translate-y-0.5",
                    meta.scorePillClassName
                  )}
                  href={`#${getBoardKey(board)}`}
                  key={board.boardId}
                >
                  <MetaIcon className="h-3.5 w-3.5" />
                  {meta.title}
                </a>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <OverviewMetric
            caption="Every day resets at midnight India time."
            icon={CalendarClock}
            label="Daily reset"
            mobileCaption="India time"
            value="12:00 AM IST"
          />
          <OverviewMetric
            caption="Weekly rankings reset every Monday."
            icon={Clock3}
            label="Weekly reset"
            mobileCaption="Every Monday"
            mobileValue="Mon 12 AM IST"
            value="Monday 12:00 AM IST"
          />
          <OverviewMetric
            caption={
              bestPersonalEntry
                ? "Your best live personal position right now."
                : "Your rank appears here once your personal score starts moving."
            }
            icon={Crown}
            label="Best personal rank"
            mobileCaption={bestPersonalEntry ? "Live personal rank" : "Not ranked yet"}
            value={bestPersonalEntry ? `#${bestPersonalEntry.rank}` : "Not ranked"}
          />
          <OverviewMetric
            caption={
              bestStateEntry
                ? `${bestStateEntry.displayName} is your best live state position right now.`
                : "Set your state and start scoring to track it here."
            }
            icon={Users}
            label="Best state rank"
            mobileCaption={bestStateEntry ? bestStateEntry.displayName : "Set your state"}
            value={bestStateEntry ? `#${bestStateEntry.rank}` : "Waiting"}
          />
        </div>
      </div>
    </DashboardPanel>
  )
}

function ScoreSystemPanel() {
  return (
    <DashboardPanel className="overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,172,102,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(93,210,167,0.12),transparent_30%)]" />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <DashboardPill icon={Sparkles} tone="saffron">
            How scoring works
          </DashboardPill>
          <DashboardPill icon={Clock3} tone="neutral">
            Daily and weekly are separate reward windows
          </DashboardPill>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Verified stream</p>
            <p className="mt-2 text-sm leading-6 text-white/74">
              Every verified BTS-family stream adds the normal stream value to daily individual, weekly individual,
              daily state, and weekly state.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">Mission reward</p>
            <p className="mt-2 text-sm leading-6 text-white/74">
              Mission rewards only go to the board for that mission's period. Daily mission rewards do not increase
              weekly totals, and weekly mission rewards do not backfill daily totals.
            </p>
          </div>

          <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/48">What this means</p>
            <p className="mt-2 text-sm leading-6 text-white/74">
              A daily board can be ahead of the weekly board when you finish a daily mission but have not finished a
              weekly mission yet.
            </p>
          </div>
        </div>
      </div>
    </DashboardPanel>
  )
}

function PodiumCard({
  board,
  rank,
  entry,
  positionClassName
}: {
  board: LeaderboardBoardView
  rank: 1 | 2 | 3
  entry: LeaderboardEntryView | null
  positionClassName?: string
}) {
  const meta = getBoardMeta(board)
  const isChampion = rank === 1
  const accentRingClassName =
    rank === 1
      ? "border-[hsl(277,100%,88%)]/55 bg-[radial-gradient(circle_at_30%_30%,rgba(211,190,255,0.92),rgba(159,132,255,0.78)_62%,rgba(88,52,190,0.95)_100%)] text-[hsl(244,25%,18%)]"
      : rank === 2
        ? "border-white/18 bg-[radial-gradient(circle_at_30%_30%,rgba(212,224,233,0.85),rgba(136,158,171,0.74)_62%,rgba(71,86,98,0.92)_100%)] text-[hsl(214,26%,18%)]"
        : "border-[hsl(132,65%,65%)]/28 bg-[radial-gradient(circle_at_30%_30%,rgba(194,255,214,0.9),rgba(100,212,144,0.72)_62%,rgba(30,108,58,0.92)_100%)] text-[hsl(146,34%,16%)]"
  const scorePillClassName =
    rank === 1
      ? "border-[hsl(265,70%,65%)]/28 bg-[hsl(265,70%,65%)]/16 text-[hsl(277,100%,88%)]"
      : rank === 2
        ? "border-white/12 bg-white/[0.05] text-white/86"
        : "border-[hsl(130,55%,56%)]/24 bg-[hsl(130,55%,56%)]/14 text-[hsl(132,100%,86%)]"

  return (
    <DashboardPanel
      className={cn(
        "min-w-0 flex h-full flex-col justify-between p-3 text-center sm:p-5",
        isChampion
          ? "min-h-[13.25rem] border-[hsl(265,70%,65%)]/24 bg-[radial-gradient(circle_at_top,rgba(101,58,215,0.26),rgba(22,16,38,0.98)_55%,rgba(12,10,22,1)_100%)] shadow-[0_30px_90px_-48px_rgba(114,74,255,0.78)] sm:min-h-[18rem] sm:p-6"
          : "min-h-[10.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] sm:min-h-[14rem] sm:p-5",
        !entry ? "border-dashed border-white/14" : "",
        positionClassName
      )}
    >
      {isChampion ? (
        <div className="pointer-events-none absolute inset-x-0 -top-4 flex justify-center sm:-top-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(277,100%,88%)]/60 bg-[hsl(262,62%,20%)] text-[hsl(277,100%,88%)] shadow-[0_18px_40px_-20px_rgba(133,88,208,0.9)] sm:h-10 sm:w-10">
            <Crown className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
          </div>
        </div>
      ) : null}

      <div className="space-y-2.5 sm:space-y-4">
        <div className="flex justify-center">
          <div
            className={cn(
              "flex items-center justify-center rounded-full border shadow-[0_12px_30px_-16px_rgba(0,0,0,0.85)]",
              isChampion ? "h-14 w-14 text-lg font-semibold sm:h-24 sm:w-24 sm:text-2xl" : "h-11 w-11 text-sm font-semibold sm:h-16 sm:w-16 sm:text-base",
              accentRingClassName
            )}
          >
            {entry ? getDisplayInitials(entry.displayName) : rank}
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex justify-center">
            <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] sm:px-2.5 sm:py-1 sm:text-[11px] sm:tracking-[0.18em]", meta.rankBadgeClassName)}>
              Rank #{rank}
            </span>
          </div>

          {entry ? (
            <>
              <h3
                className={cn(
                  "mx-auto max-w-full truncate font-heading font-semibold leading-tight tracking-tight text-white",
                  isChampion ? "text-[1.05rem] sm:max-w-[16ch] sm:text-[1.9rem]" : "text-[0.82rem] sm:max-w-[16ch] sm:text-[1.3rem]"
                )}
                title={entry.displayName}
              >
                {entry.displayName}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                <p className="hidden text-xs uppercase tracking-[0.16em] text-white/50 sm:block">
                  {board.boardType === "individual" ? "Live fan score" : "Live state score"}
                </p>
                {entry.isCurrentUser ? (
                  <span className="rounded-full border border-white/12 bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/78 sm:px-2 sm:text-[10px] sm:tracking-[0.14em]">
                    You
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <h3
                className={cn(
                  "font-heading font-semibold leading-tight tracking-tight text-white/70",
                  isChampion ? "text-[0.95rem] sm:text-[1.7rem]" : "text-[0.8rem] sm:text-[1.2rem]"
                )}
              >
                {isChampion ? "Open slot" : "Open"}
              </h3>
              <p className="text-[11px] leading-4 text-white/42 sm:text-sm sm:leading-6">
                <span className="sm:hidden">Waiting for rank #{rank}</span>
                <span className="hidden sm:inline">Rank #{rank} will appear here once someone reaches this spot.</span>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-center sm:mt-6">
        <div className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-4 sm:py-2 sm:text-sm", scorePillClassName)}>
          {entry ? formatScore(entry.score) : "Waiting"}
        </div>
      </div>
    </DashboardPanel>
  )
}

function LeaderboardPodium({
  board,
  onExpand
}: {
  board: LeaderboardBoardView | null
  onExpand: (board: LeaderboardBoardView) => void
}) {
  if (!board) {
    return null
  }

  const meta = getBoardMeta(board)
  const MetaIcon = meta.icon
  const slots = getPodiumSlots(board)

  return (
    <DashboardPanel className="overflow-visible p-5 sm:p-6 xl:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(126,85,220,0.16),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(255,154,86,0.1),transparent_28%)]" />
      <div className="relative space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <DashboardPill icon={MetaIcon} tone={meta.tone}>
                {meta.kicker}
              </DashboardPill>
              <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", meta.scorePillClassName)}>
                Top 3 podium
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-white sm:text-[2.4rem]">
                Podium stays fixed
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-white/62 sm:text-base sm:leading-7">
                {meta.title} keeps the same top-three layout even when only one or two entries are ranked. Empty slots
                stay visible until more scores join the board.
              </p>
            </div>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/82 transition hover:bg-white/[0.1] hover:text-white"
            onClick={() => onExpand(board)}
            type="button"
          >
            <Expand className="h-4 w-4" />
            View full leaderboard
          </button>
        </div>

        <div className="grid grid-cols-[minmax(0,0.84fr)_minmax(0,1.08fr)_minmax(0,0.84fr)] items-end gap-2.5 sm:gap-4">
          {slots.map((slot) => (
            <PodiumCard
              board={board}
              entry={slot.entry}
              key={`${board.boardId}-podium-${slot.rank}`}
              positionClassName={slot.positionClassName}
              rank={slot.rank}
            />
          ))}
        </div>
      </div>
    </DashboardPanel>
  )
}

function LeaderboardRow({
  board,
  entry
}: {
  board: LeaderboardBoardView
  entry: LeaderboardEntryView
}) {
  const meta = getBoardMeta(board)
  const trend = getTrendMeta(entry)
  const TrendIcon = trend?.icon
  const isCurrentState =
    board.boardType === "state" &&
    Boolean(board.currentStateEntry) &&
    board.currentStateEntry?.competitorKey === entry.competitorKey
  const isHighlighted = Boolean(entry.isCurrentUser || isCurrentState)

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-3",
        isHighlighted || entry.rank === 1 ? meta.rowHighlightClassName : ""
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
          entry.rank <= 3 ? meta.rankBadgeClassName : "border-white/10 bg-black/10 text-white/72"
        )}
      >
        {entry.rank}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-white">{entry.displayName}</p>
          {entry.isCurrentUser ? (
            <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/78">
              You
            </span>
          ) : null}
          {isCurrentState ? (
            <span className="rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/78">
              Your state
            </span>
          ) : null}
        </div>

        {trend && TrendIcon ? (
          <div className={cn("mt-1 inline-flex items-center gap-1.5 text-xs", trend.className)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trend.label}
          </div>
        ) : null}
      </div>

      <p className={cn("text-sm font-semibold sm:text-base", meta.accentTextClassName)}>
        {formatCompactNumber(entry.score)}
      </p>
    </div>
  )
}

function FullLeaderboardModal({
  board,
  loading,
  error,
  mounted,
  onClose
}: {
  board: LeaderboardBoardView | null
  loading: boolean
  error: string
  mounted: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!board) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [board, onClose])

  if (!board || !mounted) {
    return null
  }

  const meta = getBoardMeta(board)
  const MetaIcon = meta.icon
  const footer = getBoardFooterCopy(board)
  const FooterIcon = footer.icon

  return createPortal(
    <div className="fixed inset-0 z-[95] bg-[rgba(4,4,12,0.82)] backdrop-blur-md">
      <div className="flex h-full items-end justify-center p-3 sm:items-center sm:p-6">
        <div
          aria-label={`${meta.title} full leaderboard`}
          aria-modal="true"
          className="flex h-[88dvh] w-full max-w-[62rem] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,14,31,0.98),rgba(8,8,18,1))] shadow-[0_40px_120px_-45px_rgba(0,0,0,0.96)]"
          role="dialog"
        >
          <div className="border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DashboardPill icon={MetaIcon} tone={meta.tone}>
                    {meta.kicker}
                  </DashboardPill>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/62">
                    {formatResetLabel(board.endsAt)}
                  </span>
                  <span className={cn("rounded-full border px-3 py-1 text-xs", meta.scorePillClassName)}>
                    {board.totalParticipants} total
                  </span>
                </div>
                <h2 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-white">{meta.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  {meta.description} Full board through rank #{board.totalParticipants}. Ends {formatIndiaDeadline(board.endsAt)}.
                </p>
              </div>

              <button
                aria-label="Close full leaderboard"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
                onClick={onClose}
                type="button"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {loading ? (
              <div className="flex h-full min-h-[16rem] items-center justify-center text-white/62">
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Loading the full leaderboard...
              </div>
            ) : error ? (
              <div className="rounded-[1.25rem] border border-[hsl(0,80%,70%)]/20 bg-[hsl(0,80%,70%)]/10 px-4 py-5 text-sm text-[hsl(0,100%,88%)]">
                {error}
              </div>
            ) : board.entries.length > 0 ? (
              <div className="space-y-2.5">
                {board.entries.map((entry) => (
                  <LeaderboardRow board={board} entry={entry} key={`${board.boardId}-${entry.competitorKey}`} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-white/14 bg-white/[0.03] px-4 py-6 text-sm text-white/58">
                No scores are showing on this board yet.
              </div>
            )}
          </div>

          <div className="border-t border-white/10 px-4 py-4 sm:px-6">
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-[1.15rem] border px-4 py-3.5",
                meta.footerClassName
              )}
            >
              <div className="flex items-center gap-2.5">
                <FooterIcon className="h-4.5 w-4.5" />
                <p className="text-sm font-medium">{footer.label}</p>
              </div>
              <p className="text-sm font-semibold">{footer.value}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function LeaderboardBoardCard({
  board,
  onExpand
}: {
  board: LeaderboardBoardView
  onExpand: (board: LeaderboardBoardView) => void
}) {
  const meta = getBoardMeta(board)
  const MetaIcon = meta.icon
  const footer = getBoardFooterCopy(board)
  const FooterIcon = footer.icon
  const shouldScrollInside = board.entries.length > 3

  return (
    <DashboardPanel className={cn("flex min-h-[29rem] flex-col p-5 sm:p-6", meta.panelClassName)} id={getBoardKey(board)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <DashboardPill icon={MetaIcon} tone={meta.tone}>
            {meta.kicker}
          </DashboardPill>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">{meta.title}</h2>
            <p className="max-w-2xl text-sm leading-6 text-white/62">{meta.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/64">
            {formatResetLabel(board.endsAt)}
          </span>
          <span className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", meta.scorePillClassName)}>
            Top {board.entries.length}
          </span>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/78 transition hover:bg-white/[0.1] hover:text-white"
            onClick={() => onExpand(board)}
            type="button"
          >
            <Expand className="h-3.5 w-3.5" />
            Expand
          </button>
        </div>
      </div>

      <div className="mt-5 flex-1 rounded-[1.3rem] border border-white/10 bg-black/10 p-3 sm:p-4">
        {board.entries.length > 0 ? (
          <div className={cn("space-y-2.5 pr-1", shouldScrollInside && "max-h-[15.2rem] overflow-y-auto")}>
            {board.entries.map((entry) => (
              <LeaderboardRow board={board} entry={entry} key={`${board.boardId}-${entry.competitorKey}`} />
            ))}
          </div>
        ) : (
          <div className="flex h-full min-h-[12rem] items-center justify-center rounded-[1rem] border border-dashed border-white/12 bg-white/[0.03] px-4 text-sm text-white/58">
            No scores are showing on this board yet.
          </div>
        )}
      </div>

      <div
        className={cn(
          "mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.15rem] border px-4 py-3.5",
          meta.footerClassName
        )}
      >
        <div className="flex items-center gap-2.5">
          <FooterIcon className="h-4.5 w-4.5" />
          <p className="text-sm font-medium">{footer.label}</p>
        </div>
        <p className="text-sm font-semibold">{footer.value}</p>
      </div>
    </DashboardPanel>
  )
}

export function LeaderboardsExperience({ boards, streamPointValue }: LeaderboardsExperienceProps) {
  const sortedBoards = useMemo(() => sortBoards(boards), [boards])
  const featuredPodiumBoard = useMemo(() => getFeaturedPodiumBoard(sortedBoards), [sortedBoards])
  const [mounted, setMounted] = useState(false)
  const [expandedBoardId, setExpandedBoardId] = useState<string | null>(null)
  const [expandedBoard, setExpandedBoard] = useState<LeaderboardBoardView | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cache, setCache] = useState<Record<string, LeaderboardBoardView>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  async function openFullLeaderboard(board: LeaderboardBoardView) {
    setExpandedBoardId(board.boardId)
    setExpandedBoard(cache[board.boardId] ?? board)
    setError("")

    if (cache[board.boardId] && cache[board.boardId].entries.length >= cache[board.boardId].totalParticipants) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/v1/leaderboards?boardId=${board.boardId}&full=1`, {
        cache: "no-store"
      })
      const data = (await response.json()) as { leaderboard?: LeaderboardBoardView | null; error?: string }

      if (!response.ok || !data.leaderboard) {
        throw new Error(data.error ?? "Could not load the full leaderboard.")
      }

      setCache((current) => ({
        ...current,
        [board.boardId]: data.leaderboard as LeaderboardBoardView
      }))
      setExpandedBoard(data.leaderboard as LeaderboardBoardView)
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Could not load the full leaderboard.")
    } finally {
      setLoading(false)
    }
  }

  function closeModal() {
    setExpandedBoardId(null)
    setExpandedBoard(null)
    setLoading(false)
    setError("")
  }

  const activeModalBoard =
    (expandedBoardId ? cache[expandedBoardId] : null) ??
    expandedBoard

  return (
    <div className="space-y-6 sm:space-y-8">
      <LeaderboardsHero boards={sortedBoards} streamPointValue={streamPointValue} />
      <ScoreSystemPanel />
      <LeaderboardPodium board={featuredPodiumBoard} onExpand={openFullLeaderboard} />

      <section className="grid gap-5 xl:grid-cols-2">
        {sortedBoards.map((board) => (
          <LeaderboardBoardCard board={board} key={board.boardId} onExpand={openFullLeaderboard} />
        ))}
      </section>

      <FullLeaderboardModal
        board={activeModalBoard}
        error={error}
        loading={loading}
        mounted={mounted}
        onClose={closeModal}
      />
    </div>
  )
}
