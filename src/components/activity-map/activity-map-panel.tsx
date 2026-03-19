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
import {
  DashboardPanel,
  DashboardPanelHeader,
  DashboardPill
} from "@/components/dashboard/dashboard-shell"
import type { ActivityMapSvgProps } from "@/components/activity-map/activity-map-svg"
import { formatCompactNumber } from "@/lib/utils"
import type { ActivityMapHotspotEntry, ActivityMapStateEntry, ActivityMapView } from "@/modules/activity-map/types"

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
  const insetPanelClass =
    "rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3.5 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
  const metricTileClass = "rounded-[1.2rem] border border-white/10 bg-black/15 p-3 sm:p-4"

  return (
    <DashboardPanel className="overflow-hidden">
      <div className="border-b border-white/10 px-3.5 py-4 sm:px-6 sm:py-5">
        <DashboardPanelHeader
          action={
            <div className="flex flex-wrap items-center gap-3">
              <DashboardPill tone="neutral">{mapData.periodKey}</DashboardPill>
              {variant === "dashboard" ? (
                <div className="inline-flex rounded-full border border-white/10 bg-black/15 p-1">
                  {(["daily", "weekly"] as const).map((period) => (
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        mapData.period === period
                          ? "bg-white text-slate-900 shadow-[0_10px_24px_-14px_rgba(255,255,255,0.7)]"
                          : "text-white/72 hover:text-white"
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
                <DashboardPill tone="teal">Weekly view</DashboardPill>
              )}
            </div>
          }
          badge="India Activity Map"
          badgeIcon={MapPinned}
          badgeTone={variant === "dashboard" ? "purple" : "teal"}
          description={description}
          title={title}
          titleClassName="text-[1.75rem] sm:text-[2rem]"
        />
      </div>

      <div className="grid gap-4 sm:gap-5 p-3.5 sm:p-6 xl:grid-cols-[minmax(0,1.25fr)_340px]">
        <div className="space-y-4">
          <div
            className="rounded-[1.75rem] border border-white/10 bg-[hsl(258,30%,8%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
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
              <div className="flex min-h-[420px] items-center justify-center rounded-[1.25rem] bg-white/[0.03] text-sm text-white/58 sm:min-h-[460px]">
                Preparing India activity map...
              </div>
            )}
          </div>

          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/58">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(265,70%,65%)]" />
                  5 state activity buckets
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[hsl(25,90%,55%)]" />
                  hotspot radius scales with score
                </span>
                {isPending ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    updating
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-white/48 md:text-right">
                Boundaries: geoBoundaries gbOpen. Locality registry: GeoNames.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={insetPanelClass}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-white/44">
                {variant === "landing" ? "Live tooltip" : "Selected activity"}
              </p>
              <DashboardPill tone="neutral">{mapData.periodKey}</DashboardPill>
            </div>

            {activeEntity ? (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-2xl font-semibold text-white">
                      {activeEntity.kind === "state" ? activeEntity.stateLabel : activeEntity.placeLabel}
                    </p>
                    <DashboardPill tone={activeEntity.kind === "state" ? "purple" : "saffron"}>
                      {activeEntity.kind === "state" ? "State layer" : "Hotspot"}
                    </DashboardPill>
                  </div>
                  <p className="text-sm text-white/58">
                    {activeEntity.kind === "state"
                      ? "State activity layer"
                      : `${activeEntity.stateLabel} hotspot`}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={metricTileClass}>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/44">Activity score</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatCompactNumber(activeEntity.activityScore)}
                    </p>
                  </div>
                  <div className={metricTileClass}>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/44">Active users</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatCompactNumber(activeEntity.activeUserCount)}
                    </p>
                  </div>
                </div>

                {variant === "dashboard" ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className={metricTileClass}>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/44">Verified streams</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatCompactNumber(activeEntity.verifiedStreamCount)}
                      </p>
                    </div>
                    <div className={metricTileClass}>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/44">Mission points</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatCompactNumber(activeEntity.missionCompletionPoints)}
                      </p>
                    </div>
                    <div className={metricTileClass}>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/44">Completions</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {formatCompactNumber(activeEntity.missionCompletionCount)}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.25rem] border border-dashed border-white/10 bg-black/10 p-5 text-sm text-white/58">
                India activity will appear here as verified streams and mission completions arrive.
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className={insetPanelClass}>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[hsl(25,90%,55%)]" />
                <p className="text-sm font-semibold text-white">Top hotspots</p>
              </div>
              <div className="mt-4 space-y-2">
                {mapData.hotspots.slice(0, 6).map((hotspot, index) => {
                  const selectionKey = buildHotspotSelectionKey(hotspot.placeKey)
                  const isActive = selectedKey === selectionKey || hoveredKey === selectionKey

                  return (
                    <button
                      className={`flex w-full items-center justify-between gap-3 rounded-[1.2rem] border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-[hsl(25,90%,55%)]/22 bg-[hsl(25,90%,55%)]/12 text-white"
                          : "border-white/10 bg-black/10 text-white hover:bg-white/[0.05]"
                      }`}
                      key={hotspot.placeKey}
                      onClick={() => activateEntity(selectionKey)}
                      type="button"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {index + 1}. {hotspot.placeLabel}
                        </p>
                        <p className="truncate text-xs text-white/48">{hotspot.stateLabel}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatCompactNumber(hotspot.activityScore)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className={insetPanelClass}>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[hsl(170,60%,40%)]" />
                <p className="text-sm font-semibold text-white">Top active states</p>
              </div>
              <div className="mt-4 space-y-2">
                {mapData.topStates.map((state, index) => {
                  const selectionKey = buildStateSelectionKey(state.stateKey)
                  const isActive = selectedKey === selectionKey || hoveredKey === selectionKey

                  return (
                    <button
                      className={`flex w-full items-center justify-between gap-3 rounded-[1.2rem] border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-[hsl(170,60%,40%)]/22 bg-[hsl(170,60%,40%)]/12 text-white"
                          : "border-white/10 bg-black/10 text-white hover:bg-white/[0.05]"
                      }`}
                      key={state.stateKey}
                      onClick={() => activateEntity(selectionKey)}
                      type="button"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {index + 1}. {state.stateLabel}
                        </p>
                        <p className="truncate text-xs text-white/48">{state.stateCode}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatCompactNumber(state.activityScore)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-black/10 px-4 py-3 text-xs text-white/52">
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Last materialized
            </span>
            <span>{formatUpdatedAt(mapData.lastMaterializedAt)}</span>
          </div>
        </div>
      </div>
    </DashboardPanel>
  )
}
