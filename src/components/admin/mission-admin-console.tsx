"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { CatalogOption } from "@/modules/catalog/service"
import { missionMechanicOrder, type MissionMechanicType } from "@/modules/missions/config"
import type { AdminMissionCellView, MissionAdminState } from "@/modules/missions/types"

type DraftState = Record<
  string,
  {
    targetKeys: string[]
    goalUnits: string
    rewardPoints: string
  }
>

type AdminCadenceFilter = "daily" | "weekly"
type AdminMissionKindFilter = "all" | AdminMissionCellView["missionKind"]

function getDraftKey(missionCellKey: string, mechanicType: MissionMechanicType) {
  return `${missionCellKey}:${mechanicType}`
}

function getCellAnchorId(missionCellKey: string, mechanicType: MissionMechanicType) {
  return `planner-${missionCellKey}-${mechanicType}`
}

function buildDrafts(state: MissionAdminState): DraftState {
  return Object.fromEntries(
    state.cells.flatMap((cell) =>
      missionMechanicOrder.map((mechanicType) => {
        const nextOverride = cell.nextOverrides[mechanicType]

        return [
          getDraftKey(cell.missionCellKey, mechanicType),
          {
            targetKeys: nextOverride?.targetKeys ?? [],
            goalUnits: String(nextOverride?.goalUnits ?? cell.defaultGoalUnitsByMechanic[mechanicType]),
            rewardPoints: String(
              nextOverride?.rewardPoints ?? cell.defaultRewardPointsByMechanic[mechanicType]
            )
          }
        ] as const
      })
    )
  )
}

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

function getMissionKindLabel(cell: AdminMissionCellView) {
  if (cell.missionKind === "india_shared") {
    return "India shared"
  }

  if (cell.missionKind === "state_shared") {
    return "State shared"
  }

  return "Personal"
}

function getMissionKindFilterLabel(value: AdminMissionKindFilter) {
  if (value === "all") {
    return "All cells"
  }

  if (value === "india_shared") {
    return "India shared"
  }

  if (value === "state_shared") {
    return "State shared"
  }

  return "Personal"
}

function getMechanicLabel(value: MissionMechanicType) {
  return value === "track_streams" ? "Streaming" : "Album Completion"
}

function getMechanicDescription(value: MissionMechanicType) {
  return value === "track_streams"
    ? "Use specific BTS songs with per-target stream progress."
    : "Require listeners to complete full BTS albums from verified track plays."
}

function getMissionTargetOptions(
  cell: AdminMissionCellView,
  mechanicType: MissionMechanicType
) {
  return mechanicType === "track_streams" ? cell.trackOptions : cell.albumOptions
}

function TargetArtwork({ option, size = "md" }: { option?: CatalogOption; size?: "sm" | "md" }) {
  const classes =
    size === "sm"
      ? "h-11 w-11 rounded-xl"
      : "h-16 w-16 rounded-2xl"

  if (option?.imageUrl) {
    return (
      <img
        alt={option.label}
        className={`${classes} shrink-0 border border-white/10 object-cover`}
        loading="lazy"
        src={option.imageUrl}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`${classes} shrink-0 border border-dashed border-white/15 bg-white/5`}
    />
  )
}

function TargetPreviewGrid({
  options,
  emptyLabel,
  compact = false
}: {
  options: CatalogOption[]
  emptyLabel: string
  compact?: boolean
}) {
  if (options.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
      {options.map((option) => (
        <div
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
          key={option.key}
        >
          <TargetArtwork option={option} size={compact ? "sm" : "md"} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{option.label}</p>
            <p className="truncate text-xs text-muted-foreground">{option.secondaryLabel}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function CatalogPicker({
  cell,
  mechanicType,
  selectedKeys,
  onChange
}: {
  cell: AdminMissionCellView
  mechanicType: MissionMechanicType
  selectedKeys: string[]
  onChange: (nextKeys: string[]) => void
}) {
  const [query, setQuery] = useState("")
  const options = getMissionTargetOptions(cell, mechanicType)
  const selectedSet = new Set(selectedKeys)
  const selectedOptions = selectedKeys
    .map((key) => options.find((option) => option.key === key))
    .filter((option): option is CatalogOption => Boolean(option))
  const filteredOptions = options
    .filter((option) =>
      `${option.label} ${option.secondaryLabel}`.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 12)

  function addItem(key: string) {
    if (selectedSet.has(key)) {
      return
    }

    onChange([...selectedKeys, key])
  }

  function removeItem(key: string) {
    onChange(selectedKeys.filter((itemKey) => itemKey !== key))
  }

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-[hsl(265,25%,10%)]/80 p-4">
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-foreground"
          htmlFor={getDraftKey(cell.missionCellKey, mechanicType)}
        >
          Pick specific {mechanicType === "track_streams" ? "songs" : "albums"} for the next cycle
        </label>
        <Input
          id={getDraftKey(cell.missionCellKey, mechanicType)}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${mechanicType === "track_streams" ? "songs" : "albums"}`}
          value={query}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Selected targets
          </p>
          <p className="text-xs text-muted-foreground">{selectedOptions.length} queued</p>
        </div>
        {selectedOptions.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {selectedOptions.map((option) => (
              <button
                aria-label={`Remove ${option.label}`}
                className="flex items-center gap-3 rounded-2xl border border-[hsl(14,78%,68%)]/30 bg-[hsl(14,78%,68%)]/10 p-3 text-left transition hover:border-[hsl(14,78%,68%)]/60 hover:bg-[hsl(14,78%,68%)]/15"
                key={option.key}
                onClick={() => removeItem(option.key)}
                type="button"
              >
                <TargetArtwork option={option} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{option.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{option.secondaryLabel}</p>
                </div>
                <span className="text-xs font-semibold text-[hsl(14,78%,68%)]">Remove</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-4 text-sm text-muted-foreground">
            Leave this empty if you want the reset job to randomize the mission for {cell.nextPeriodKey}.
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Catalog results</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {filteredOptions.map((option) => {
            const isSelected = selectedSet.has(option.key)

            return (
              <button
                aria-pressed={isSelected}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  isSelected
                    ? "border-[hsl(170,60%,40%)]/50 bg-[hsl(170,60%,40%)]/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
                disabled={isSelected}
                key={option.key}
                onClick={() => addItem(option.key)}
                type="button"
              >
                <TargetArtwork option={option} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{option.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{option.secondaryLabel}</p>
                </div>
                <span className="text-xs font-semibold text-[hsl(170,60%,40%)]">
                  {isSelected ? "Added" : "Select"}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MissionPlannerPanel({
  cell,
  mechanicType,
  draft,
  nextOverride,
  disabled,
  onDraftChange,
  onSave,
  onClear
}: {
  cell: AdminMissionCellView
  mechanicType: MissionMechanicType
  draft: DraftState[string]
  nextOverride: AdminMissionCellView["nextOverrides"]["track_streams"]
  disabled: boolean
  onDraftChange: (value: DraftState[string]) => void
  onSave: () => void
  onClear: () => void
}) {
  const selectedTargets = draft.targetKeys
    .map((key) => getMissionTargetOptions(cell, mechanicType).find((option) => option.key === key))
    .filter((option): option is CatalogOption => Boolean(option))

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-[hsl(14,78%,68%)]/15 bg-gradient-to-br from-[hsl(14,78%,68%)]/8 to-[hsl(170,60%,40%)]/6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Next up</p>
          <h4 className="mt-1 text-lg font-semibold text-foreground">{cell.nextPeriodKey}</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Save a custom {mechanicType === "track_streams" ? "song" : "album"} slate for the next reset or leave it empty and let the generator randomize this mechanic.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">{getMechanicLabel(mechanicType)}</Badge>
          <Badge variant={nextOverride ? "accent" : "muted"}>
            {nextOverride ? "Admin override queued" : "Random fallback queued"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Selection mode" value={selectedTargets.length > 0 ? "Admin" : "Random"} />
        <MiniStat label="Mechanic" value={getMechanicLabel(mechanicType)} />
        <MiniStat label="Goal units" value={draft.goalUnits || "Pending"} />
        <MiniStat label="Completion reward" value={draft.rewardPoints || "Pending"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-sm font-medium text-foreground">{getMechanicLabel(mechanicType)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{getMechanicDescription(mechanicType)}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Goal units</span>
              <Input
                inputMode="numeric"
                min={1}
                onChange={(event) => onDraftChange({ ...draft, goalUnits: event.target.value })}
                type="number"
                value={draft.goalUnits}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Completion reward</span>
              <Input
                inputMode="numeric"
                min={1}
                onChange={(event) => onDraftChange({ ...draft, rewardPoints: event.target.value })}
                type="number"
                value={draft.rewardPoints}
              />
            </label>
          </div>
        </div>

        <CatalogPicker
          cell={cell}
          mechanicType={mechanicType}
          onChange={(targetKeys) => onDraftChange({ ...draft, targetKeys })}
          selectedKeys={draft.targetKeys}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Selected mission preview
          </p>
          <Badge variant={selectedTargets.length > 0 ? "accent" : "muted"}>
            {selectedTargets.length > 0
              ? `${selectedTargets.length} target${selectedTargets.length === 1 ? "" : "s"} selected`
              : "Builds after selection"}
          </Badge>
        </div>

        {selectedTargets.length > 0 ? (
          <>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm font-medium text-foreground">
                {getMechanicLabel(mechanicType)} mission preview for {cell.nextPeriodKey}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This preview is built only from the songs or albums selected above and will be used when you save this override.
              </p>
            </div>
            <TargetPreviewGrid
              emptyLabel="Select songs or albums to build a preview."
              options={selectedTargets}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-muted-foreground">
            Select one or more {mechanicType === "track_streams" ? "songs" : "albums"} above to build a preview. If you leave this empty, the next reset will use the random fallback.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={disabled} onClick={onSave}>
          Save next {getMechanicLabel(mechanicType).toLowerCase()} mission
        </Button>
        <Button
          disabled={disabled || !nextOverride}
          onClick={onClear}
          variant="secondary"
        >
          Clear override
        </Button>
        <p className="text-sm text-muted-foreground">
          Clearing the override keeps the current live mission intact and returns this mechanic to its default random fallback for the next reset.
        </p>
      </div>
    </div>
  )
}

export function MissionAdminConsole({ initialState }: { initialState: MissionAdminState }) {
  const router = useRouter()
  const [state, setState] = useState(initialState)
  const [drafts, setDrafts] = useState<DraftState>(() => buildDrafts(initialState))
  const [message, setMessage] = useState("")
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [selectedCadence, setSelectedCadence] = useState<AdminCadenceFilter>("daily")
  const [selectedMissionKind, setSelectedMissionKind] = useState<AdminMissionKindFilter>("all")
  const [isPending, startTransition] = useTransition()

  function applyState(nextState: MissionAdminState) {
    setState(nextState)
    setDrafts(buildDrafts(nextState))
  }

  function updateDraft(draftKey: string, nextDraft: DraftState[string]) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [draftKey]: nextDraft
    }))
  }

  async function saveOverride(cell: AdminMissionCellView, mechanicType: MissionMechanicType) {
    const draftKey = getDraftKey(cell.missionCellKey, mechanicType)
    setPendingKey(draftKey)
    setMessage("")

    try {
      const draft = drafts[draftKey]
      const response = await fetch("/api/v1/admin/mission-overrides", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          missionCellKey: cell.missionCellKey,
          mechanicType,
          targetKeys: draft.targetKeys,
          goalUnits: Number.parseInt(draft.goalUnits, 10),
          rewardPoints: Number.parseInt(draft.rewardPoints, 10)
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save this mission override.")
      }

      applyState(data.state)
      setMessage(
        `${cell.label} ${getMechanicLabel(mechanicType).toLowerCase()} queued for ${cell.nextPeriodKey}. The live mission was not changed.`
      )
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this mission override.")
    } finally {
      setPendingKey(null)
    }
  }

  async function clearOverride(cell: AdminMissionCellView, mechanicType: MissionMechanicType) {
    const draftKey = getDraftKey(cell.missionCellKey, mechanicType)
    setPendingKey(`clear:${draftKey}`)
    setMessage("")

    try {
      const response = await fetch(
        `/api/v1/admin/mission-overrides?missionCellKey=${cell.missionCellKey}&mechanicType=${mechanicType}`,
        { method: "DELETE" }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Could not clear this mission override.")
      }

      applyState(data.state)
      setMessage(
        `${cell.label} ${getMechanicLabel(mechanicType).toLowerCase()} for ${cell.nextPeriodKey} is back on random fallback.`
      )
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not clear this mission override.")
    } finally {
      setPendingKey(null)
    }
  }

  const dailyCells = state.cells.filter((cell) => cell.cadence === "daily")
  const weeklyCells = state.cells.filter((cell) => cell.cadence === "weekly")
  const visibleSection = {
    cadence: selectedCadence,
    title: selectedCadence === "daily" ? "Daily planning" : "Weekly planning",
    description:
      selectedCadence === "daily"
        ? `These overrides are saved only for ${state.nextPeriodKeys.daily}.`
        : `These overrides are saved only for ${state.nextPeriodKeys.weekly}.`,
    cells: (selectedCadence === "daily" ? dailyCells : weeklyCells).filter((cell) =>
      selectedMissionKind === "all" ? true : cell.missionKind === selectedMissionKind
    )
  }

  return (
    <div className="space-y-8">
      <Card className="border-[hsl(14,78%,68%)]/15 bg-gradient-to-br from-[hsl(14,78%,68%)]/10 via-[hsl(265,25%,14%)] to-[hsl(170,60%,40%)]/8">
        <CardHeader className="gap-4">
          <div className="space-y-2">
            <Badge variant="accent">Mission control</Badge>
            <CardTitle className="text-2xl">Plan only the next reset</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-6">
              Queue the exact songs and albums that should go live at the next daily or weekly reset. Each mission cell supports separate streaming and album-completion planning lanes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <MiniStat label="Next daily" value={state.nextPeriodKeys.daily} />
            <MiniStat label="Next weekly" value={state.nextPeriodKeys.weekly} />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <MiniStat label="Last tracker sync" value={formatDateTime(state.lastTrackerSyncAt)} />
            <MiniStat label="Mission generation" value={formatDateTime(state.lastMissionGenerationAt)} />
            <MiniStat
              label="Leaderboard materialization"
              value={formatDateTime(state.lastLeaderboardMaterializedAt)}
            />
          </div>
        </CardContent>
      </Card>

      <p aria-live="polite" className="min-h-6 text-sm font-medium text-foreground">
        {message}
      </p>

      <section className="space-y-4">
        <Card className="sticky top-4 z-10 border-white/10 bg-[hsl(265,25%,12%)]/92 backdrop-blur-xl">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">Planner navigation</Badge>
              <p className="text-sm text-muted-foreground">
                Switch cadence, filter by mission scope, and jump directly into a mission lane.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[auto_auto_1fr]">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cadence</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: "daily" as const, label: "Daily" },
                    { value: "weekly" as const, label: "Weekly" }
                  ]).map((item) => (
                    <Button
                      className={cn(
                        "min-w-[7rem]",
                        selectedCadence === item.value && "ring-2 ring-[hsl(14,78%,68%)]/50"
                      )}
                      key={item.value}
                      onClick={() => setSelectedCadence(item.value)}
                      type="button"
                      variant={selectedCadence === item.value ? "default" : "ghost"}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cell scope</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    "all",
                    "individual_personal",
                    "state_shared",
                    "india_shared"
                  ] as const).map((value) => (
                    <Button
                      className={cn(
                        selectedMissionKind === value && "ring-2 ring-[hsl(170,60%,40%)]/45"
                      )}
                      key={value}
                      onClick={() => setSelectedMissionKind(value)}
                      type="button"
                      variant={selectedMissionKind === value ? "secondary" : "ghost"}
                    >
                      {getMissionKindFilterLabel(value)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Quick jump</p>
                  <p className="text-xs text-muted-foreground">
                    {visibleSection.cells.length} cell{visibleSection.cells.length === 1 ? "" : "s"} visible
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visibleSection.cells.flatMap((cell) =>
                    missionMechanicOrder.map((mechanicType) => (
                      <a
                        className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-foreground transition hover:border-white/20 hover:bg-white/10"
                        href={`#${getCellAnchorId(cell.missionCellKey, mechanicType)}`}
                        key={getCellAnchorId(cell.missionCellKey, mechanicType)}
                      >
                        {cell.label} · {getMechanicLabel(mechanicType)}
                      </a>
                    ))
                  )}
                  {visibleSection.cells.length === 0 ? (
                    <div className="rounded-full border border-dashed border-white/10 px-4 py-2 text-sm text-muted-foreground">
                      No cells match this filter.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-2xl font-semibold text-foreground">{visibleSection.title}</h3>
            <Badge variant="muted">{visibleSection.description}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Each mission cell is focused on the queued configuration for the next reset.
          </p>
        </div>

        <div className="grid gap-5">
          {visibleSection.cells.map((cell) => (
            <Card key={cell.missionCellKey}>
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>{cell.label}</CardTitle>
                      <Badge>{getMissionKindLabel(cell)}</Badge>
                    </div>
                    <CardDescription className="max-w-3xl leading-6">
                      {cell.description}
                    </CardDescription>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Next editable period
                    </p>
                    <p className="mt-1 font-semibold text-foreground">{cell.nextPeriodKey}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {missionMechanicOrder.map((mechanicType) => {
                  const draftKey = getDraftKey(cell.missionCellKey, mechanicType)
                  const disabled =
                    isPending ||
                    pendingKey === draftKey ||
                    pendingKey === `clear:${draftKey}`

                  return (
                    <section
                      className="space-y-4 rounded-[1.5rem] border border-white/10 bg-black/10 p-4 scroll-mt-28"
                      id={getCellAnchorId(cell.missionCellKey, mechanicType)}
                      key={mechanicType}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Mechanic lane
                          </p>
                          <h4 className="mt-1 text-lg font-semibold text-foreground">
                            {getMechanicLabel(mechanicType)}
                          </h4>
                        </div>
                        <Badge variant="muted">{getMechanicDescription(mechanicType)}</Badge>
                      </div>

                      <MissionPlannerPanel
                        cell={cell}
                        disabled={disabled}
                        draft={drafts[draftKey]}
                        mechanicType={mechanicType}
                        nextOverride={cell.nextOverrides[mechanicType]}
                        onClear={() => clearOverride(cell, mechanicType)}
                        onDraftChange={(nextDraft) => updateDraft(draftKey, nextDraft)}
                        onSave={() => saveOverride(cell, mechanicType)}
                      />
                    </section>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {visibleSection.cells.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-muted-foreground">
            No mission cells match the current cadence and scope filter.
          </div>
        ) : null}
      </section>
    </div>
  )
}
