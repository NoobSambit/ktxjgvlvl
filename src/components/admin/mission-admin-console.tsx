"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { AdminMissionSlotView, MissionAdminState } from "@/modules/missions/types"

type DraftState = Record<
  string,
  {
    itemKeys: string[]
    rewardPoints: string
  }
>

function buildDrafts(state: MissionAdminState): DraftState {
  return Object.fromEntries(
    state.slots.map((slot) => [
      slot.slotKey,
      {
        itemKeys: slot.currentOverride?.itemKeys ?? [],
        rewardPoints:
          slot.currentOverride?.rewardPoints?.toString() ??
          slot.currentMission?.rewardPoints?.toString() ??
          slot.defaultRewardPoints.toString()
      }
    ])
  )
}

function CatalogPicker({
  slot,
  selectedKeys,
  onChange
}: {
  slot: AdminMissionSlotView
  selectedKeys: string[]
  onChange: (nextKeys: string[]) => void
}) {
  const [query, setQuery] = useState("")
  const selectedSet = new Set(selectedKeys)
  const filteredOptions = slot.options
    .filter((option) =>
      `${option.label} ${option.secondaryLabel}`.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 24)

  function addItem(key: string) {
    if (selectedSet.has(key) || selectedKeys.length >= slot.maxSelections) {
      return
    }

    onChange([...selectedKeys, key])
  }

  function removeItem(key: string) {
    onChange(selectedKeys.filter((itemKey) => itemKey !== key))
  }

  return (
    <div className="space-y-3 rounded-[1.25rem] border border-border/70 p-4">
      <Input
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`Search ${slot.targetKind}s`}
        value={query}
      />
      <div className="grid gap-2 md:grid-cols-2">
        {filteredOptions.map((option) => (
          <button
            className="rounded-2xl border border-border/70 px-3 py-3 text-left text-sm transition-colors hover:bg-muted/55 disabled:opacity-50"
            disabled={selectedSet.has(option.key) || selectedKeys.length >= slot.maxSelections}
            key={option.key}
            onClick={() => addItem(option.key)}
            type="button"
          >
            <p className="font-medium">{option.label}</p>
            <p className="text-muted-foreground">{option.secondaryLabel}</p>
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Selected {selectedKeys.length}/{slot.maxSelections}
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedKeys.map((key) => {
            const option = slot.options.find((entry) => entry.key === key)

            return (
              <button
                className="rounded-full bg-muted px-3 py-2 text-sm"
                key={key}
                onClick={() => removeItem(key)}
                type="button"
              >
                {option?.label ?? key} ×
              </button>
            )
          })}
        </div>
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

  async function syncCatalog() {
    setPendingKey("catalog")
    setMessage("")

    try {
      const response = await fetch("/api/v1/admin/catalog-sync", {
        method: "POST"
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Catalog sync failed.")
      }

      applyState(data.state)
      setMessage(
        `Catalog synced: ${data.summary.importedTracks} tracks and ${data.summary.importedAlbums} albums imported.`
      )
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Catalog sync failed.")
    } finally {
      setPendingKey(null)
    }
  }

  async function saveOverride(slot: AdminMissionSlotView) {
    setPendingKey(slot.slotKey)
    setMessage("")

    try {
      const rewardPoints = Number.parseInt(drafts[slot.slotKey]?.rewardPoints ?? "", 10)
      const response = await fetch("/api/v1/admin/mission-overrides", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          slotKey: slot.slotKey,
          itemKeys: drafts[slot.slotKey]?.itemKeys ?? [],
          rewardPoints: Number.isFinite(rewardPoints) ? rewardPoints : undefined
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save this mission override.")
      }

      applyState(data.state)
      setMessage(`${slot.label} updated.`)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this mission override.")
    } finally {
      setPendingKey(null)
    }
  }

  async function clearOverride(slot: AdminMissionSlotView) {
    setPendingKey(`clear:${slot.slotKey}`)
    setMessage("")

    try {
      const response = await fetch(`/api/v1/admin/mission-overrides?slotKey=${slot.slotKey}`, {
        method: "DELETE"
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Could not clear this mission override.")
      }

      applyState(data.state)
      setMessage(`${slot.label} reverted to random fallback.`)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not clear this mission override.")
    } finally {
      setPendingKey(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Mission catalog and overrides</CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily period: {state.currentPeriodKeys.daily} · Weekly period: {state.currentPeriodKeys.weekly}
            </p>
          </div>
          <Button disabled={isPending || pendingKey === "catalog"} onClick={syncCatalog} variant="secondary">
            Sync music catalog
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-[1.2rem] bg-muted/55 p-4">
            <p className="font-medium text-foreground">{state.catalogSummary.trackCount}</p>
            <p>Imported BTS-family songs</p>
          </div>
          <div className="rounded-[1.2rem] bg-muted/55 p-4">
            <p className="font-medium text-foreground">{state.catalogSummary.albumCount}</p>
            <p>Imported BTS-family albums</p>
          </div>
          <div className="rounded-[1.2rem] bg-muted/55 p-4">
            <p className="font-medium text-foreground">{state.slots.length}</p>
            <p>Mission slots available for admin override</p>
          </div>
        </CardContent>
      </Card>

      {message ? <p className="text-sm font-medium text-foreground">{message}</p> : null}

      <div className="grid gap-4">
        {state.slots.map((slot) => (
          <Card key={slot.slotKey}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>{slot.label}</CardTitle>
                  <p className="text-sm text-muted-foreground">{slot.description}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {slot.currentMission
                    ? `${slot.currentMission.selectionSource} · ${slot.currentMission.rewardPoints} points`
                    : "No live mission yet"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {slot.currentMission ? (
                <div className="rounded-[1.25rem] bg-muted/55 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{slot.currentMission.focus}</p>
                  <p className="mt-1">
                    Goal: {slot.currentMission.goal} · Progress: {slot.currentMission.progress}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
                <CatalogPicker
                  onChange={(nextKeys) =>
                    setDrafts((current) => ({
                      ...current,
                      [slot.slotKey]: {
                        ...current[slot.slotKey],
                        itemKeys: nextKeys
                      }
                    }))
                  }
                  selectedKeys={drafts[slot.slotKey]?.itemKeys ?? []}
                  slot={slot}
                />
                <div className="space-y-3 rounded-[1.25rem] border border-border/70 p-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Reward points
                    </p>
                    <Input
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [slot.slotKey]: {
                            ...current[slot.slotKey],
                            rewardPoints: event.target.value
                          }
                        }))
                      }
                      value={drafts[slot.slotKey]?.rewardPoints ?? ""}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requires {slot.minSelections}
                    {slot.minSelections !== slot.maxSelections ? `-${slot.maxSelections}` : ""} {slot.targetKind}
                    {slot.maxSelections > 1 ? "s" : ""}.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      disabled={isPending || pendingKey === slot.slotKey}
                      onClick={() => saveOverride(slot)}
                    >
                      Save override
                    </Button>
                    <Button
                      disabled={isPending || pendingKey === `clear:${slot.slotKey}`}
                      onClick={() => clearOverride(slot)}
                      variant="ghost"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
