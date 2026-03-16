"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { CatalogOption } from "@/modules/catalog/service"
import type { AdminMissionCellView, MissionAdminState, MissionCard } from "@/modules/missions/types"

type DraftState = Record<
  string,
  {
    mechanicType: "track_streams" | "album_completions"
    targetKeys: string[]
    goalUnits: string
    rewardPoints: string
  }
>

function buildDrafts(state: MissionAdminState): DraftState {
  return Object.fromEntries(
    state.cells.map((cell) => {
      const mechanicType = cell.nextOverride?.mechanicType ?? cell.defaultMechanicType

      return [
        cell.missionCellKey,
        {
          mechanicType,
          targetKeys: cell.nextOverride?.targetKeys ?? [],
          goalUnits: String(cell.nextOverride?.goalUnits ?? cell.defaultGoalUnitsByMechanic[mechanicType]),
          rewardPoints: String(
            cell.nextOverride?.rewardPoints ?? cell.defaultRewardPointsByMechanic[mechanicType]
          )
        }
      ] as const
    })
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

function getMechanicLabel(value: "track_streams" | "album_completions") {
  return value === "track_streams" ? "Streaming" : "Album Completion"
}

function getMissionTargetOptions(
  cell: AdminMissionCellView,
  mechanicType: "track_streams" | "album_completions"
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

function StateBreakdown({
  items
}: {
  items: NonNullable<AdminMissionCellView["liveStateBreakdown"]>
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Leading state progress
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            key={item.stateKey}
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">{item.stateLabel}</p>
              <p className="text-xs text-muted-foreground">
                {item.progressUnits}/{item.goalUnits}
                {item.completedAt ? ` · completed ${formatDateTime(item.completedAt)}` : ""}
              </p>
            </div>
            <Badge variant={item.completedAt ? "accent" : "muted"}>
              {item.completedAt ? "Done" : "Active"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

function resolveMissionTargetOptions(
  cell: AdminMissionCellView,
  mission: MissionCard | null
) {
  if (!mission) {
    return []
  }

  const optionMap = new Map(
    getMissionTargetOptions(cell, mission.mechanicType).map((option) => [option.key, option] as const)
  )

  return mission.targets
    .map((target) => optionMap.get(target.key))
    .filter((option): option is CatalogOption => Boolean(option))
}

function CatalogPicker({
  cell,
  mechanicType,
  selectedKeys,
  onChange
}: {
  cell: AdminMissionCellView
  mechanicType: "track_streams" | "album_completions"
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
        <label className="text-sm font-medium text-foreground" htmlFor={`${cell.missionCellKey}-search`}>
          Pick specific {mechanicType === "track_streams" ? "songs" : "albums"} for the next cycle
        </label>
        <Input
          id={`${cell.missionCellKey}-search`}
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

function MissionLivePanel({ cell }: { cell: AdminMissionCellView }) {
  const liveMissionTargets = resolveMissionTargetOptions(cell, cell.liveMission)

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[hsl(265,25%,10%)]/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live now</p>
          <h4 className="mt-1 text-lg font-semibold text-foreground">
            {cell.liveMission?.title ?? "Waiting for generation"}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Current missions are locked. Admin changes only apply to the next reset.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">{cell.liveMission?.periodKey ?? "Not generated"}</Badge>
          {cell.liveMission ? (
            <Badge variant={cell.liveMission.selectionMode === "admin" ? "accent" : "default"}>
              {cell.liveMission.selectionMode === "admin" ? "Admin set" : "Random"}
            </Badge>
          ) : null}
        </div>
      </div>

      {cell.liveMission ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat label="Mechanic" value={getMechanicLabel(cell.liveMission.mechanicType)} />
            <MiniStat label="Completion reward" value={cell.liveMission.rewardLabel} />
            <MiniStat
              label="Progress"
              value={`${cell.liveMission.aggregateProgress}/${cell.liveMission.goalUnits}`}
            />
            <MiniStat
              label="Contributors"
              value={typeof cell.liveMission.contributorCount === "number" ? cell.liveMission.contributorCount : "N/A"}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Mission focus</p>
            <p className="mt-2 text-sm font-medium text-foreground">{cell.liveMission.focus}</p>
            <p className="mt-1 text-sm text-muted-foreground">{cell.liveMission.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live targets</p>
            <TargetPreviewGrid
              compact
              emptyLabel="Target previews are not available for the live mission."
              options={liveMissionTargets}
            />
          </div>

          {cell.liveStateBreakdown?.length ? <StateBreakdown items={cell.liveStateBreakdown} /> : null}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-muted-foreground">
          This mission cell has no live instance yet. The reset job will create it when enough catalog data is available.
        </div>
      )}
    </div>
  )
}

function MissionPlannerPanel({
  cell,
  draft,
  disabled,
  onDraftChange,
  onSave,
  onClear
}: {
  cell: AdminMissionCellView
  draft: DraftState[string]
  disabled: boolean
  onDraftChange: (value: DraftState[string]) => void
  onSave: () => void
  onClear: () => void
}) {
  return (
    <div className="space-y-4 rounded-[1.75rem] border border-[hsl(14,78%,68%)]/15 bg-gradient-to-br from-[hsl(14,78%,68%)]/8 to-[hsl(170,60%,40%)]/6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Next up</p>
          <h4 className="mt-1 text-lg font-semibold text-foreground">{cell.nextPeriodKey}</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Save a custom slate for the next reset or leave it empty and let the generator randomize songs or albums based on the selected mechanic.
          </p>
        </div>
        <Badge variant={cell.nextOverride ? "accent" : "muted"}>
          {cell.nextOverride ? "Admin override queued" : "Random fallback queued"}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Selection mode" value={cell.nextMission?.selectionMode === "admin" ? "Admin" : "Random"} />
        <MiniStat
          label="Mechanic"
          value={getMechanicLabel(cell.nextMission?.mechanicType ?? draft.mechanicType)}
        />
        <MiniStat label="Goal units" value={cell.nextMission?.goalUnits ?? "Pending"} />
        <MiniStat label="Completion reward" value={cell.nextMission?.rewardLabel ?? "Pending"} />
      </div>

      {cell.nextMission ? (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Next mission preview</p>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-sm font-medium text-foreground">{cell.nextMission.focus}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Preview generated for {cell.nextMission.periodKey}. This is what the cron job will use unless you change the inputs below.
            </p>
          </div>
          <TargetPreviewGrid
            emptyLabel="No preview targets were generated for the next cycle."
            options={cell.nextMission.targets}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-muted-foreground">
          No preview could be generated yet. Sync the catalog before planning this mission.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Mission mechanic</p>
            <div className="grid gap-2">
              {(["track_streams", "album_completions"] as const).map((mechanicType) => (
                <button
                  aria-pressed={draft.mechanicType === mechanicType}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    draft.mechanicType === mechanicType
                      ? "border-[hsl(170,60%,40%)]/50 bg-[hsl(170,60%,40%)]/12 text-foreground"
                      : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10"
                  }`}
                  key={mechanicType}
                    onClick={() =>
                      onDraftChange({
                        ...draft,
                        mechanicType,
                        targetKeys: [],
                        goalUnits: String(cell.defaultGoalUnitsByMechanic[mechanicType]),
                        rewardPoints: String(cell.defaultRewardPointsByMechanic[mechanicType])
                      })
                    }
                    type="button"
                >
                  <p className="font-medium text-foreground">{getMechanicLabel(mechanicType)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mechanicType === "track_streams"
                      ? "Use specific BTS songs with per-target stream progress."
                      : "Require listeners to complete full BTS albums from verified track plays."}
                  </p>
                </button>
              ))}
            </div>
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
          mechanicType={draft.mechanicType}
          onChange={(targetKeys) => onDraftChange({ ...draft, targetKeys })}
          selectedKeys={draft.targetKeys}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={disabled} onClick={onSave}>
          Save next {cell.cadence} mission
        </Button>
        <Button
          disabled={disabled || !cell.nextOverride}
          onClick={onClear}
          variant="secondary"
        >
          Clear override
        </Button>
        <p className="text-sm text-muted-foreground">
          Clearing the override keeps the current live mission intact and returns the next reset to its default random songs or albums for that cell.
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
  const [isPending, startTransition] = useTransition()

  function applyState(nextState: MissionAdminState) {
    setState(nextState)
    setDrafts(buildDrafts(nextState))
  }

  function updateDraft(cellKey: string, nextDraft: DraftState[string]) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [cellKey]: nextDraft
    }))
  }

  async function syncCatalog() {
    setPendingKey("catalog")
    setMessage("")

    try {
      const response = await fetch("/api/v1/admin/catalog-sync", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Catalog sync failed.")
      }

      applyState(data.state)
      setMessage(
        `Catalog synced successfully. ${data.summary.importedTracks} songs and ${data.summary.importedAlbums} albums are available for mission planning.`
      )
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Catalog sync failed.")
    } finally {
      setPendingKey(null)
    }
  }

  async function saveOverride(cell: AdminMissionCellView) {
    setPendingKey(cell.missionCellKey)
    setMessage("")

    try {
      const draft = drafts[cell.missionCellKey]
      const response = await fetch("/api/v1/admin/mission-overrides", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          missionCellKey: cell.missionCellKey,
          mechanicType: draft.mechanicType,
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
      setMessage(`${cell.label} queued for ${cell.nextPeriodKey}. The live mission was not changed.`)
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this mission override.")
    } finally {
      setPendingKey(null)
    }
  }

  async function clearOverride(cell: AdminMissionCellView) {
    setPendingKey(`clear:${cell.missionCellKey}`)
    setMessage("")

    try {
      const response = await fetch(
        `/api/v1/admin/mission-overrides?missionCellKey=${cell.missionCellKey}`,
        { method: "DELETE" }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Could not clear this mission override.")
      }

      applyState(data.state)
      setMessage(`${cell.label} for ${cell.nextPeriodKey} is back on random fallback.`)
      startTransition(() => router.refresh())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not clear this mission override.")
    } finally {
      setPendingKey(null)
    }
  }

  const dailyCells = state.cells.filter((cell) => cell.cadence === "daily")
  const weeklyCells = state.cells.filter((cell) => cell.cadence === "weekly")

  return (
    <div className="space-y-8">
      <Card className="border-[hsl(14,78%,68%)]/15 bg-gradient-to-br from-[hsl(14,78%,68%)]/10 via-[hsl(265,25%,14%)] to-[hsl(170,60%,40%)]/8">
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Badge variant="accent">Mission control</Badge>
            <CardTitle className="text-2xl">Plan only the next reset</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-6">
              Daily and weekly live missions are locked once generated. Admin can queue exact songs or albums for only the next daily reset or the next weekly reset. If you leave a mission cell without selected targets, the reset job falls back to the cell’s default mechanic and random BTS-family picks from the local catalog.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled={isPending || pendingKey === "catalog"} onClick={syncCatalog} variant="secondary">
              Sync music catalog
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Live daily" value={state.currentPeriodKeys.daily} />
          <MiniStat label="Next daily" value={state.nextPeriodKeys.daily} />
          <MiniStat label="Live weekly" value={state.currentPeriodKeys.weekly} />
          <MiniStat label="Next weekly" value={state.nextPeriodKeys.weekly} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MiniStat label="Imported songs" value={state.catalogSummary.trackCount} />
        <MiniStat label="Imported albums" value={state.catalogSummary.albumCount} />
        <MiniStat label="Stream points" value={state.streamPointValue} />
        <MiniStat label="Last tracker sync" value={formatDateTime(state.lastTrackerSyncAt)} />
        <MiniStat label="Mission generation" value={formatDateTime(state.lastMissionGenerationAt)} />
        <MiniStat
          label="Leaderboard materialization"
          value={formatDateTime(state.lastLeaderboardMaterializedAt)}
        />
      </div>

      <p aria-live="polite" className="min-h-6 text-sm font-medium text-foreground">
        {message}
      </p>

      {[
        {
          cadence: "daily" as const,
          title: "Daily planning",
          description: `These overrides are saved only for ${state.nextPeriodKeys.daily}.`,
          cells: dailyCells
        },
        {
          cadence: "weekly" as const,
          title: "Weekly planning",
          description: `These overrides are saved only for ${state.nextPeriodKeys.weekly}.`,
          cells: weeklyCells
        }
      ].map((section) => (
        <section className="space-y-4" key={section.cadence}>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-heading text-2xl font-semibold text-foreground">{section.title}</h3>
              <Badge variant="muted">{section.description}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Each mission cell shows the live mission on the left and the queued next-cycle planner on the right.
            </p>
          </div>

          <div className="grid gap-5">
            {section.cells.map((cell) => {
              const draft = drafts[cell.missionCellKey]
              const disabled =
                isPending ||
                pendingKey === cell.missionCellKey ||
                pendingKey === `clear:${cell.missionCellKey}` ||
                pendingKey === "catalog"

              return (
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
                  <CardContent className="grid gap-5 xl:grid-cols-2">
                    <MissionLivePanel cell={cell} />
                    <MissionPlannerPanel
                      cell={cell}
                      disabled={disabled}
                      draft={draft}
                      onClear={() => clearOverride(cell)}
                      onDraftChange={(nextDraft) => updateDraft(cell.missionCellKey, nextDraft)}
                      onSave={() => saveOverride(cell)}
                    />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
