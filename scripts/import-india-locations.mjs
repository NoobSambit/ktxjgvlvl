import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import readline from "node:readline"
import { spawn } from "node:child_process"
import mongoose from "mongoose"
import {
  buildLegacyPlaceAlias,
  buildPlaceKey,
  canonicalStateByAdmin1Code,
  canonicalStates,
  loadStandardEnv,
  normalizeLocationText,
  requireEnv
} from "./_location-utils.mjs"

const metadataPath = path.resolve(process.cwd(), "src/data/geo/india-adm1-state-metadata.json")
const geonamesZipUrl = "https://download.geonames.org/export/dump/IN.zip"
const geonamesAdmin2Url = "https://download.geonames.org/export/dump/admin2Codes.txt"

function createAliases(placeLabel, asciiName, alternateNames) {
  return Array.from(
    new Set(
      [placeLabel, asciiName, buildLegacyPlaceAlias(placeLabel), ...alternateNames]
        .map(normalizeLocationText)
        .filter(Boolean)
    )
  ).slice(0, 30)
}

async function downloadToFile(url, destinationPath) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "IndiaForBTS/1.0"
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(destinationPath, buffer)
}

async function loadAdmin2Lookup() {
  const response = await fetch(geonamesAdmin2Url, {
    headers: {
      "user-agent": "IndiaForBTS/1.0"
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to download ${geonamesAdmin2Url}: ${response.status}`)
  }

  const text = await response.text()
  const admin2Lookup = new Map()

  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("IN.")) {
      continue
    }

    const [code, districtLabel] = line.split("\t")

    if (code && districtLabel) {
      admin2Lookup.set(code, districtLabel)
    }
  }

  return admin2Lookup
}

async function bulkWriteInChunks(collection, operations, chunkSize = 500) {
  let modifiedCount = 0

  for (let index = 0; index < operations.length; index += chunkSize) {
    const chunk = operations.slice(index, index + chunkSize)

    if (chunk.length === 0) {
      continue
    }

    const result = await collection.bulkWrite(chunk, { ordered: false })
    modifiedCount +=
      result.upsertedCount +
      result.modifiedCount +
      result.matchedCount
  }

  return modifiedCount
}

async function main() {
  loadStandardEnv()

  if (!fs.existsSync(metadataPath)) {
    throw new Error(
      `Missing ${metadataPath}. Run "node scripts/normalize-india-topojson.mjs" first.`
    )
  }

  const mongoUri = requireEnv("MONGODB_URI")
  const mapMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"))
  const metadataByStateKey = new Map(mapMetadata.map((entry) => [entry.stateKey, entry]))
  const admin2Lookup = await loadAdmin2Lookup()
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "indiaforbts-locations-"))
  const geonamesZipPath = path.join(tempDir, "IN.zip")
  const now = new Date()

  await downloadToFile(geonamesZipUrl, geonamesZipPath)

  const connection = await mongoose.createConnection(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    family: 4
  }).asPromise()

  try {
    const db = connection.db

    if (!db) {
      throw new Error("Could not open MongoDB database.")
    }

    const stateCollection = db.collection("locationstates")
    const placeCollection = db.collection("locationplaces")
    const stateOperations = canonicalStates.map((state) => {
      const metadata = metadataByStateKey.get(state.stateKey)

      return {
        updateOne: {
          filter: { stateKey: state.stateKey },
          update: {
            $set: {
              stateKey: state.stateKey,
              stateLabel: state.stateLabel,
              normalizedLabel: normalizeLocationText(state.stateLabel),
              stateCode: state.stateCode,
              aliases: state.aliases.map(normalizeLocationText),
              centroidLat: metadata?.centroidLat,
              centroidLng: metadata?.centroidLng,
              mapFeatureId: metadata?.mapFeatureId,
              updatedAt: now
            },
            $setOnInsert: {
              createdAt: now
            }
          },
          upsert: true
        }
      }
    })

    await bulkWriteInChunks(stateCollection, stateOperations, 100)

    const unzip = spawn("unzip", ["-p", geonamesZipPath, "IN.txt"], {
      stdio: ["ignore", "pipe", "inherit"]
    })

    const lineReader = readline.createInterface({
      input: unzip.stdout,
      crlfDelay: Infinity
    })

    const placeOperations = []
    let importedPlaces = 0
    let skippedNoState = 0
    let skippedNonPopulated = 0

    for await (const line of lineReader) {
      const columns = line.split("\t")

      if (columns.length < 19) {
        continue
      }

      const [
        geonameId,
        placeLabel,
        asciiName,
        alternateNames,
        latitude,
        longitude,
        featureClass,
        featureCode,
        countryCode,
        ,
        admin1Code,
        admin2Code,
        ,
        ,
        population
      ] = columns

      if (countryCode !== "IN" || featureClass !== "P") {
        skippedNonPopulated += 1
        continue
      }

      const state = canonicalStateByAdmin1Code.get(admin1Code)

      if (!state) {
        skippedNoState += 1
        continue
      }

      const numericGeonameId = Number.parseInt(geonameId, 10)
      const numericLatitude = Number.parseFloat(latitude)
      const numericLongitude = Number.parseFloat(longitude)
      const numericPopulation = Number.parseInt(population, 10)
      const districtLabel = admin2Code
        ? admin2Lookup.get(`IN.${admin1Code}.${admin2Code}`) ?? undefined
        : undefined

      placeOperations.push({
        updateOne: {
          filter: { geonameId: numericGeonameId },
          update: {
            $set: {
              placeKey: buildPlaceKey(state.stateKey, numericGeonameId),
              geonameId: numericGeonameId,
              placeLabel,
              normalizedName: normalizeLocationText(placeLabel),
              aliases: createAliases(
                placeLabel,
                asciiName,
                alternateNames ? alternateNames.split(",") : []
              ),
              stateKey: state.stateKey,
              stateLabel: state.stateLabel,
              districtLabel,
              latitude: numericLatitude,
              longitude: numericLongitude,
              population: Number.isFinite(numericPopulation) ? numericPopulation : undefined,
              featureClass,
              featureCode,
              updatedAt: now
            },
            $setOnInsert: {
              createdAt: now
            }
          },
          upsert: true
        }
      })

      importedPlaces += 1

      if (placeOperations.length >= 1000) {
        await bulkWriteInChunks(placeCollection, placeOperations, 500)
        placeOperations.length = 0
      }
    }

    if (placeOperations.length > 0) {
      await bulkWriteInChunks(placeCollection, placeOperations, 500)
    }

    await new Promise((resolve, reject) => {
      unzip.on("close", (code) => {
        if (code === 0) {
          resolve()
          return
        }

        reject(new Error(`unzip exited with code ${code}`))
      })
    })

    console.log(
      JSON.stringify(
        {
          importedStates: canonicalStates.length,
          importedPlaces,
          skippedNoState,
          skippedNonPopulated,
          source: {
            boundariesMetadata: metadataPath,
            geonamesZipUrl,
            geonamesAdmin2Url
          }
        },
        null,
        2
      )
    )
  } finally {
    await connection.close()
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
