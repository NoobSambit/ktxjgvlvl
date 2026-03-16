import fs from "node:fs"
import path from "node:path"
import { feature } from "topojson-client"

const sourcePath = path.resolve(process.cwd(), "src/data/geo/india-adm1.topo.json")
const outputPath = path.resolve(process.cwd(), "src/data/geo/india-adm1-render.geo.json")
const tolerance = 0.01

function getSquaredSegmentDistance(point, segmentStart, segmentEnd) {
  let x = segmentStart[0]
  let y = segmentStart[1]
  let dx = segmentEnd[0] - x
  let dy = segmentEnd[1] - y

  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy)

    if (t > 1) {
      x = segmentEnd[0]
      y = segmentEnd[1]
    } else if (t > 0) {
      x += dx * t
      y += dy * t
    }
  }

  dx = point[0] - x
  dy = point[1] - y

  return dx * dx + dy * dy
}

function simplifyDouglasPeuckerStep(points, firstIndex, lastIndex, squaredTolerance, simplified) {
  let maxSquaredDistance = squaredTolerance
  let nextIndex = -1

  for (let index = firstIndex + 1; index < lastIndex; index += 1) {
    const squaredDistance = getSquaredSegmentDistance(
      points[index],
      points[firstIndex],
      points[lastIndex]
    )

    if (squaredDistance > maxSquaredDistance) {
      nextIndex = index
      maxSquaredDistance = squaredDistance
    }
  }

  if (nextIndex === -1) {
    return
  }

  if (nextIndex - firstIndex > 1) {
    simplifyDouglasPeuckerStep(points, firstIndex, nextIndex, squaredTolerance, simplified)
  }

  simplified.push(points[nextIndex])

  if (lastIndex - nextIndex > 1) {
    simplifyDouglasPeuckerStep(points, nextIndex, lastIndex, squaredTolerance, simplified)
  }
}

function simplifyRing(points, toleranceValue) {
  if (points.length <= 4) {
    return points
  }

  const squaredTolerance = toleranceValue * toleranceValue
  const lastIndex = points.length - 1
  const simplified = [points[0]]

  simplifyDouglasPeuckerStep(points, 0, lastIndex, squaredTolerance, simplified)
  simplified.push(points[lastIndex])

  const rounded = simplified.map(([lng, lat]) => [Number(lng.toFixed(4)), Number(lat.toFixed(4))])

  return rounded.length >= 4 ? rounded : points
}

function simplifyPolygonCoordinates(rings, toleranceValue) {
  return rings.map((ring) => simplifyRing(ring, toleranceValue))
}

function simplifyGeometry(geometry, toleranceValue) {
  if (geometry.type === "Polygon") {
    return {
      ...geometry,
      coordinates: simplifyPolygonCoordinates(geometry.coordinates, toleranceValue)
    }
  }

  if (geometry.type === "MultiPolygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) =>
        simplifyPolygonCoordinates(polygon, toleranceValue)
      )
    }
  }

  return geometry
}

function main() {
  const topology = JSON.parse(fs.readFileSync(sourcePath, "utf8"))
  const objectKey = Object.keys(topology.objects ?? {})[0]

  if (!objectKey) {
    throw new Error("No TopoJSON objects found in the India ADM1 asset.")
  }

  const collection = feature(topology, topology.objects[objectKey])
  const simplified = {
    ...collection,
    features: collection.features.map((entry) => ({
      ...entry,
      geometry: simplifyGeometry(entry.geometry, tolerance)
    }))
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(simplified)}\n`)

  console.log(
    JSON.stringify(
      {
        sourcePath,
        outputPath,
        tolerance,
        sourceBytes: fs.statSync(sourcePath).size,
        outputBytes: fs.statSync(outputPath).size
      },
      null,
      2
    )
  )
}

main()
