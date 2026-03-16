"use client"

import { geoMercator } from "d3-geo"
import { scaleQuantize, scaleSqrt } from "d3-scale"
import { useMemo, type KeyboardEvent } from "react"
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps"
import indiaAdm1RenderGeoJson from "@/data/geo/india-adm1-render.geo.json"
import type { ActivityMapView } from "@/modules/activity-map/types"

const MAP_WIDTH = 960
const MAP_HEIGHT = 780
const STATE_FILL_BUCKETS = ["#1d2134", "#46395d", "#6b4f93", "#9d6ed7", "#f1b94d"]
const INDIA_GEOGRAPHIES = indiaAdm1RenderGeoJson as {
  features: Array<{ properties?: Record<string, string> }>
}
const INDIA_PROJECTION = geoMercator().fitExtent(
  [
    [24, 24],
    [MAP_WIDTH - 24, MAP_HEIGHT - 24]
  ],
  INDIA_GEOGRAPHIES as never
)

export type ActivityMapSvgProps = {
  mapData: ActivityMapView
  selectedKey: string | null
  hoveredKey: string | null
  variant: "landing" | "dashboard"
  onHoverKeyChange: (selectionKey: string | null) => void
  onSelectKey: (selectionKey: string) => void
}

function buildStateSelectionKey(stateKey: string) {
  return `state:${stateKey}`
}

function buildHotspotSelectionKey(placeKey: string) {
  return `hotspot:${placeKey}`
}

export function ActivityMapSvg({
  mapData,
  selectedKey,
  hoveredKey,
  variant,
  onHoverKeyChange,
  onSelectKey
}: ActivityMapSvgProps) {
  const stateByCode = useMemo(
    () => new Map(mapData.states.map((state) => [state.stateCode, state] as const)),
    [mapData.states]
  )
  const stateFillScale = useMemo(
    () =>
      scaleQuantize()
        .domain([0, Math.max(mapData.maxStateActivityScore, 1)])
        .range(STATE_FILL_BUCKETS),
    [mapData.maxStateActivityScore]
  )
  const hotspotRadiusScale = useMemo(
    () =>
      scaleSqrt()
        .domain([0, Math.max(mapData.maxHotspotActivityScore, 1)])
        .range([4, variant === "dashboard" ? 18 : 14]),
    [mapData.maxHotspotActivityScore, variant]
  )

  function handleMapKeyDown(event: KeyboardEvent<SVGElement>, selectionKey: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelectKey(selectionKey)
    }
  }

  return (
    <ComposableMap
      className="h-auto w-full"
      height={MAP_HEIGHT}
      projection={INDIA_PROJECTION as never}
      width={MAP_WIDTH}
    >
      <Geographies geography={INDIA_GEOGRAPHIES as never}>
        {({ geographies }: { geographies: any[] }) =>
          geographies.map((geography: any) => {
            const shapeISO = geography.properties?.shapeISO ?? ""
            const state = stateByCode.get(shapeISO)
            const selectionKey = state ? buildStateSelectionKey(state.stateKey) : undefined
            const isSelected = selectionKey ? selectedKey === selectionKey : false
            const isHovered = selectionKey ? hoveredKey === selectionKey : false
            const fillColor =
              state && state.activityScore > 0
                ? stateFillScale(state.activityScore)
                : "rgba(210, 215, 255, 0.12)"

            return (
              <Geography
                aria-label={`${geography.properties?.shapeName ?? "State"} activity`}
                geography={geography}
                key={geography.rsmKey}
                onBlur={() => onHoverKeyChange(null)}
                onFocus={() => {
                  if (selectionKey) {
                    onHoverKeyChange(selectionKey)
                  }
                }}
                onKeyDown={(event: KeyboardEvent<SVGElement>) => {
                  if (selectionKey) {
                    handleMapKeyDown(event, selectionKey)
                  }
                }}
                onMouseEnter={() => {
                  if (selectionKey) {
                    onHoverKeyChange(selectionKey)
                  }
                }}
                onMouseLeave={() => onHoverKeyChange(null)}
                onMouseUp={() => {
                  if (selectionKey) {
                    onSelectKey(selectionKey)
                  }
                }}
                role="button"
                style={{
                  default: {
                    fill: fillColor,
                    stroke: isSelected || isHovered ? "#f9fafb" : "rgba(255,255,255,0.14)",
                    strokeWidth: isSelected || isHovered ? 1.3 : 0.8,
                    outline: "none",
                    transition: "fill 180ms ease, stroke 180ms ease"
                  },
                  hover: {
                    fill: fillColor,
                    stroke: "#f9fafb",
                    strokeWidth: 1.3,
                    outline: "none"
                  },
                  pressed: {
                    fill: fillColor,
                    stroke: "#f9fafb",
                    strokeWidth: 1.3,
                    outline: "none"
                  }
                }}
                tabIndex={0}
              />
            )
          })
        }
      </Geographies>

      {mapData.hotspots.map((hotspot, index) => {
        const selectionKey = buildHotspotSelectionKey(hotspot.placeKey)
        const radius = hotspotRadiusScale(hotspot.activityScore)
        const isSelected = selectedKey === selectionKey
        const isHovered = hoveredKey === selectionKey

        return (
          <Marker coordinates={[hotspot.longitude, hotspot.latitude]} key={hotspot.placeKey}>
            <g
              aria-label={`${hotspot.placeLabel}, ${hotspot.stateLabel}`}
              onBlur={() => onHoverKeyChange(null)}
              onFocus={() => onHoverKeyChange(selectionKey)}
              onKeyDown={(event: KeyboardEvent<SVGElement>) => handleMapKeyDown(event, selectionKey)}
              onMouseEnter={() => onHoverKeyChange(selectionKey)}
              onMouseLeave={() => onHoverKeyChange(null)}
              onMouseUp={() => onSelectKey(selectionKey)}
              role="button"
              tabIndex={0}
            >
              {index < 3 ? (
                <circle
                  className="activity-map-pulse"
                  cx={0}
                  cy={0}
                  fill="rgba(241, 185, 77, 0.12)"
                  r={radius + 6}
                />
              ) : null}
              <circle
                cx={0}
                cy={0}
                fill={isSelected || isHovered ? "#fff4d6" : "#f1b94d"}
                r={radius}
                stroke={isSelected || isHovered ? "#ffffff" : "rgba(255,255,255,0.8)"}
                strokeWidth={isSelected || isHovered ? 1.6 : 0.9}
              />
              <circle cx={0} cy={0} fill="#1f2338" r={Math.max(radius - 3.2, 1.8)} />
            </g>
          </Marker>
        )
      })}
    </ComposableMap>
  )
}
