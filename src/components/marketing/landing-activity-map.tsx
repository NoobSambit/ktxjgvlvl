"use client"

import { MapPinned } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { ActivityMapSvg } from "@/components/activity-map/activity-map-svg"
import { formatCompactNumber } from "@/lib/utils"
import type { ActivityMapHotspotEntry, ActivityMapStateEntry, ActivityMapView } from "@/modules/activity-map/types"

type LandingActivityMapProps = {
  mapData: ActivityMapView
}

type MapEntity =
  | ({ kind: "state" } & ActivityMapStateEntry)
  | ({ kind: "hotspot" } & ActivityMapHotspotEntry)

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

export function LandingActivityMap({ mapData }: LandingActivityMapProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(buildDefaultSelection(mapData))
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const stateByKey = useMemo(
    () => new Map(mapData.states.map((state) => [state.stateKey, state] as const)),
    [mapData.states]
  )
  const hotspotByKey = useMemo(
    () => new Map(mapData.hotspots.map((hotspot) => [hotspot.placeKey, hotspot] as const)),
    [mapData.hotspots]
  )

  useEffect(() => {
    setSelectedKey(buildDefaultSelection(mapData))
    setHoveredKey(null)
  }, [mapData])

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

  const activeEntity = resolveEntity(hoveredKey) ?? resolveEntity(selectedKey)

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 p-4 shadow-[0_30px_80px_-60px_rgba(0,0,0,1)] sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,142,255,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(255,153,51,0.12),transparent_26%)]" />
      <div className="relative rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,30,0.92),rgba(10,10,16,0.96))] p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_60%)]" />
        <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 backdrop-blur-sm">
          <MapPinned className="h-3.5 w-3.5 text-[hsl(25,90%,60%)]" />
          Live activity map
        </div>
        <div className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55 backdrop-blur-sm">
          {mapData.periodKey}
        </div>

        <div className="mx-auto max-w-[32rem] pt-8">
          <ActivityMapSvg
            hoveredKey={hoveredKey}
            mapData={mapData}
            onHoverKeyChange={setHoveredKey}
            onSelectKey={setSelectedKey}
            selectedKey={selectedKey}
            variant="landing"
          />
        </div>

        <div className="absolute inset-x-4 bottom-4 z-10 rounded-[1.25rem] border border-white/10 bg-black/55 p-4 backdrop-blur-md">
          {activeEntity ? (
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                  {activeEntity.kind === "hotspot" ? "Selected hotspot" : "Selected state"}
                </p>
                <p className="mt-1 truncate text-lg font-semibold text-white">
                  {activeEntity.kind === "hotspot"
                    ? `${activeEntity.placeLabel}, ${activeEntity.stateLabel}`
                    : activeEntity.stateLabel}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Activity</p>
                <p className="mt-1 text-sm font-semibold text-white">{formatCompactNumber(activeEntity.activityScore)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Users</p>
                <p className="mt-1 text-sm font-semibold text-white">{formatCompactNumber(activeEntity.activeUserCount)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/58">India activity will appear here as verified streams and mission completions arrive.</p>
          )}
        </div>
      </div>
    </div>
  )
}
