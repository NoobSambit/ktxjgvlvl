import fs from "node:fs"
import path from "node:path"
import { geoCentroid } from "d3-geo"
import { feature } from "topojson-client"
import {
  buildStateKeyFromLabel,
  canonicalStateByCode,
  canonicalStates,
  normalizeLocationText
} from "./_location-utils.mjs"

const sourcePath = path.resolve(process.cwd(), "src/data/geo/india-adm1.topo.json")
const outputPath = path.resolve(process.cwd(), "src/data/geo/india-adm1-state-metadata.json")

function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing vendored TopoJSON at ${sourcePath}`)
  }

  const topology = JSON.parse(fs.readFileSync(sourcePath, "utf8"))
  const objectKey = Object.keys(topology.objects ?? {})[0]

  if (!objectKey) {
    throw new Error("No TopoJSON objects found in the India ADM1 asset.")
  }

  const collection = feature(topology, topology.objects[objectKey])
  const metadata = collection.features
    .map((item) => {
      const properties = item.properties ?? {}
      const byCode = canonicalStateByCode.get(properties.shapeISO)
      const byName = canonicalStates.find(
        (state) =>
          normalizeLocationText(state.stateLabel) === normalizeLocationText(properties.shapeName) ||
          state.stateKey === buildStateKeyFromLabel(properties.shapeName ?? "")
      )
      const matched = byCode ?? byName

      if (!matched) {
        return null
      }

      const [centroidLng, centroidLat] = geoCentroid(item)

      return {
        stateKey: matched.stateKey,
        stateLabel: matched.stateLabel,
        stateCode: matched.stateCode,
        mapFeatureId: properties.shapeID,
        centroidLat: Number(centroidLat.toFixed(6)),
        centroidLng: Number(centroidLng.toFixed(6))
      }
    })
    .filter(Boolean)
    .sort((left, right) => left.stateLabel.localeCompare(right.stateLabel))

  fs.writeFileSync(outputPath, `${JSON.stringify(metadata, null, 2)}\n`)

  const missingStates = canonicalStates
    .filter((state) => !metadata.find((item) => item.stateKey === state.stateKey))
    .map((state) => state.stateLabel)

  console.log(
    JSON.stringify(
      {
        topologyObjectKey: objectKey,
        metadataPath: outputPath,
        statesMapped: metadata.length,
        missingStates
      },
      null,
      2
    )
  )
}

main()
