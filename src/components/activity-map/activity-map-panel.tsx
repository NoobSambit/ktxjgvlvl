"use client"

import { Flame, Loader2, MapPinned, RefreshCw, Users } from "lucide-react"
import dynamic from "next/dynamic"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ComponentType
} from "react"
import { formatCompactNumber } from "@/lib/utils"
import type { ActivityMapHotspotEntry, ActivityMapStateEntry, ActivityMapView } from "@/modules/activity-map/types"
import type { ActivityMapSvgProps } from "@/components/activity-map/activity-map-svg"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const LazyActivityMapSvg = dynamic<ActivityMapSvgProps>(
  () =>
    import("@/components/activity-map/activity-map-svg").then(
      (module) => module.ActivityMapSvg as ComponentType<ActivityMapSvgProps>
    ),
  {
    ssr: false
  }
)

type ActivityMapPanelProps = {
  initialMap: ActivityMapView
  title: string
  description: string
  variant: "landing" | "dashboard"
}

type MapEntity =
  | ({ kind: "state" } & ActivityMapStateEntry)
  | ({ kind: "hotspot" } & ActivityMapHotspotEntry)

function formatUpdatedAt(value?: string) {
  if (!value) {
    return "Waiting for activity"
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata"
  }).format(new Date(value))
}

function buildStateSelectionKey(stateKey: string) {
  return `state:${stateKey}`
}

function buildHotspotSelectionKey(placeKey: string) {
  return `hotspot:${placeKey}`
}

function buildDefaultSelection(map: ActivityMapView) {
  if (map.hotspots[0]) {
    return buildHotspotSelectionKey(map.hotspots[0].placeKey)
  }

  if (map.topStates[0]) {
    return buildStateSelectionKey(map.topStates[0].stateKey)
  }

  if (map.states[0]) {
    return buildStateSelectionKey(map.states[0].stateKey)
  }

  return null
}

export function ActivityMapPanel({ initialMap, title, description, variant }: ActivityMapPanelProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [mapData, setMapData] = useState<ActivityMapView>(initialMap)
  const [cache, setCache] = useState<Record<string, ActivityMapView>>({
    [initialMap.period]: initialMap
  })
  const [selectedKey, setSelectedKey] = useState<string | null>(buildDefaultSelection(initialMap))
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [shouldRenderMap, setShouldRenderMap] = useState(false)
  const [isPending, startTransition] = useTransition()
  const stateByKey = useMemo(
    () => new Map(mapData.states.map((state) => [state.stateKey, state] as const)),
    [mapData.states]
  )
  const hotspotByKey = useMemo(
    () => new Map(mapData.hotspots.map((hotspot) => [hotspot.placeKey, hotspot] as const)),
    [mapData.hotspots]
  )

  useEffect(() => {
    setMapData(initialMap)
    setCache((current) => ({
      ...current,
      [initialMap.period]: initialMap
    }))
    setSelectedKey(buildDefaultSelection(initialMap))
  }, [initialMap])

  useEffect(() => {
    if (shouldRenderMap) {
      return
    }

    const node = viewportRef.current

    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRenderMap(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "240px 0px"
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [shouldRenderMap])

  useEffect(() => {
    if (!selectedKey) {
      setSelectedKey(buildDefaultSelection(mapData))
      return
    }

    const exists =
      (selectedKey.startsWith("state:") &&
        stateByKey.has(selectedKey.slice("state:".length))) ||
      (selectedKey.startsWith("hotspot:") &&
        hotspotByKey.has(selectedKey.slice("hotspot:".length)))

    if (!exists) {
      setSelectedKey(buildDefaultSelection(mapData))
    }
  }, [hotspotByKey, mapData, selectedKey, stateByKey])

  function resolveEntity(selectionKey: string | null): MapEntity | null {
    if (!selectionKey) {
      return null
    }

    if (selectionKey.startsWith("state:")) {
      const state = stateByKey.get(selectionKey.slice("state:".length))
      return state ? { ...state, kind: "state" } : null
    }

    if (selectionKey.startsWith("hotspot:")) {
      const hotspot = hotspotByKey.get(selectionKey.slice("hotspot:".length))
      return hotspot ? { ...hotspot, kind: "hotspot" } : null
    }

    return null
  }

  function activateEntity(selectionKey: string) {
    setSelectedKey(selectionKey)
    setHoveredKey(null)
  }

  async function changePeriod(nextPeriod: ActivityMapView["period"]) {
    if (nextPeriod === mapData.period) {
      return
    }

    const cachedMap = cache[nextPeriod]

    if (cachedMap !== undefined) {
      setMapData(cachedMap)
      setSelectedKey(buildDefaultSelection(cachedMap))
      return
    }

    try {
      const response = await fetch(`/api/v1/activity-map?period=${nextPeriod}`, {
        cache: "no-store"
      })
      const data = (await response.json()) as { map?: ActivityMapView }

      if (!data.map) {
        return
      }

      const nextMap = data.map

      startTransition(() => {
        setCache((current) => ({
          ...current,
          [nextPeriod]: nextMap
        }))
        setMapData(nextMap)
        setSelectedKey(buildDefaultSelection(nextMap))
      })
    } catch {
      // keep the current period visible on fetch failure
    }
  }

  const activeEntity = resolveEntity(hoveredKey) ?? resolveEntity(selectedKey)

  return (
    <Card className="overflow-hidden bg-[hsl(260,28%,10%)]">
      <CardHeader className="border-b border-white/10 bg-gradient-to-r from-[hsl(265,55%,16%)] via-[hsl(265,45%,12%)] to-[hsl(24,70%,16%)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge className="w-fit border-0 bg-white/10 text-white">
              <MapPinned className="mr-1 h-3 w-3" />
              India Activity Map
            </Badge>
            <CardTitle className="text-2xl text-white">{title}</CardTitle>
            <CardDescription className="max-w-2xl text-white/70">{description}</CardDescription>
          </div>

          {variant === "dashboard" ? (
            <div className="inline-flex rounded-full border border-white/10 bg-black/15 p-1">
              {(["daily", "weekly"] as const).map((period) => (
                <button
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mapData.period === period ? "bg-white text-slate-900" : "text-white/75 hover:text-white"
                  }`}
                  disabled={isPending}
                  key={period}
                  onClick={() => changePeriod(period)}
                  type="button"
                >
                  {period === "daily" ? "Daily" : "Weekly"}
                </button>
              ))}
            </div>
          ) : (
            <Badge className="border-0 bg-[hsl(170,60%,40%)]/15 text-[hsl(170,95%,82%)]">Weekly view</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.3fr)_340px]">
        <div className="space-y-4">
          <div
            className="rounded-[1.75rem] border border-white/10 bg-[hsl(258,30%,8%)] p-3"
            ref={viewportRef}
          >
            {shouldRenderMap ? (
              <LazyActivityMapSvg
                hoveredKey={hoveredKey}
                mapData={mapData}
                onHoverKeyChange={setHoveredKey}
                onSelectKey={activateEntity}
                selectedKey={selectedKey}
                variant={variant}
              />
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-[1.25rem] bg-white/[0.03] text-sm text-muted-foreground">
                Preparing India activity map...
              </div>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(265,70%,65%)]" />
                5 state activity buckets
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(25,90%,55%)]" />
                hotspot radius scales with score
              </span>
              {isPending ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  updating
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground md:text-right">
              Boundaries: geoBoundaries gbOpen. Locality registry: GeoNames.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {variant === "landing" ? "Live tooltip" : "Selected activity"}
              </p>
              <Badge variant="muted">{mapData.periodKey}</Badge>
            </div>

            {activeEntity ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {activeEntity.kind === "state" ? activeEntity.stateLabel : activeEntity.placeLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeEntity.kind === "state"
                      ? "State activity layer"
                      : `${activeEntity.stateLabel} hotspot`}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Activity score</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {formatCompactNumber(activeEntity.activityScore)}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Active users</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {formatCompactNumber(activeEntity.activeUserCount)}
                    </p>
                  </div>
                </div>

                {variant === "dashboard" ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Verified streams</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {formatCompactNumber(activeEntity.verifiedStreamCount)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Mission points</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {formatCompactNumber(activeEntity.missionCompletionPoints)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Completions</p>
                      <p className="mt-2 text-lg font-semibold text-foreground">
                        {formatCompactNumber(activeEntity.missionCompletionCount)}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.25rem] border border-dashed border-white/10 bg-black/10 p-5 text-sm text-muted-foreground">
                India activity will appear here as verified streams and mission completions arrive.
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[hsl(25,90%,55%)]" />
                <p className="text-sm font-semibold text-foreground">Top hotspots</p>
              </div>
              <div className="mt-4 space-y-2">
                {mapData.hotspots.slice(0, 6).map((hotspot, index) => {
                  const selectionKey = buildHotspotSelectionKey(hotspot.placeKey)
                  const isActive = selectedKey === selectionKey || hoveredKey === selectionKey

                  return (
                    <button
                      className={`flex w-full items-center justify-between gap-3 rounded-[1.25rem] px-3 py-3 text-left transition ${
                        isActive
                          ? "bg-[hsl(25,90%,55%)]/14 text-white"
                          : "bg-black/10 text-foreground hover:bg-white/5"
                      }`}
                      key={hotspot.placeKey}
                      onClick={() => activateEntity(selectionKey)}
                      type="button"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {index + 1}. {hotspot.placeLabel}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{hotspot.stateLabel}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatCompactNumber(hotspot.activityScore)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[hsl(170,60%,40%)]" />
                <p className="text-sm font-semibold text-foreground">Top active states</p>
              </div>
              <div className="mt-4 space-y-2">
                {mapData.topStates.map((state, index) => {
                  const selectionKey = buildStateSelectionKey(state.stateKey)
                  const isActive = selectedKey === selectionKey || hoveredKey === selectionKey

                  return (
                    <button
                      className={`flex w-full items-center justify-between gap-3 rounded-[1.25rem] px-3 py-3 text-left transition ${
                        isActive
                          ? "bg-[hsl(170,60%,40%)]/15 text-white"
                          : "bg-black/10 text-foreground hover:bg-white/5"
                      }`}
                      key={state.stateKey}
                      onClick={() => activateEntity(selectionKey)}
                      type="button"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {index + 1}. {state.stateLabel}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{state.stateCode}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatCompactNumber(state.activityScore)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-black/10 px-4 py-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Last materialized
            </span>
            <span>{formatUpdatedAt(mapData.lastMaterializedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
