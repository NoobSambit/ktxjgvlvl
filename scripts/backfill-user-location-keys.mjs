import mongoose from "mongoose"
import {
  canonicalStateByKey,
  canonicalStates,
  loadStandardEnv,
  normalizeLocationText,
  requireEnv
} from "./_location-utils.mjs"

function findCanonicalState(stateLabel) {
  if (!stateLabel) {
    return null
  }

  const normalized = normalizeLocationText(stateLabel)

  return (
    canonicalStates.find((state) =>
      [state.stateLabel, ...state.aliases].some(
        (candidate) => normalizeLocationText(candidate) === normalized
      )
    ) ?? null
  )
}

function stripUndefinedEntries(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  )
}

async function main() {
  loadStandardEnv()

  const mongoUri = requireEnv("MONGODB_URI")
  const connection = await mongoose.createConnection(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    family: 4
  }).asPromise()

  try {
    const db = connection.db

    if (!db) {
      throw new Error("Could not open MongoDB database.")
    }

    const userCollection = db.collection("users")
    const placeCollection = db.collection("locationplaces")
    const cursor = userCollection.find(
      { region: { $exists: true } },
      {
        projection: {
          region: 1
        }
      }
    )

    let processedUsers = 0
    let resolvedStates = 0
    let resolvedCities = 0
    let flaggedUsers = 0

    for await (const user of cursor) {
      processedUsers += 1

      const region = user.region ?? {}
      const matchedState =
        (region.stateKey ? canonicalStateByKey.get(region.stateKey) : null) ??
        findCanonicalState(region.state)
      const normalizedCity = region.city ? normalizeLocationText(region.city) : ""
      let matchedPlace = null
      let locationNeedsReview = false

      if (matchedState) {
        resolvedStates += 1
      } else if (region.state || region.city) {
        locationNeedsReview = true
      }

      if (matchedState && normalizedCity) {
        const placeMatches = await placeCollection
          .find({
            stateKey: matchedState.stateKey,
            $or: [{ normalizedName: normalizedCity }, { aliases: normalizedCity }]
          })
          .sort({ population: -1, placeLabel: 1 })
          .limit(2)
          .project({ placeKey: 1, placeLabel: 1 })
          .toArray()

        if (placeMatches.length === 1) {
          matchedPlace = placeMatches[0]
          resolvedCities += 1
        } else {
          locationNeedsReview = true
        }
      }

      if (locationNeedsReview) {
        flaggedUsers += 1
      }

      const nextRegion = stripUndefinedEntries({
        ...region,
        country: "India",
        stateKey: matchedState?.stateKey,
        state: matchedState?.stateLabel ?? region.state,
        cityKey: matchedPlace?.placeKey,
        city: matchedPlace?.placeLabel ?? region.city,
        cityConfirmedAt:
          matchedPlace?.placeKey ? region.cityConfirmedAt ?? region.confirmedAt ?? new Date() : undefined,
        citySource: matchedPlace?.placeKey ? region.citySource ?? "user_selected" : undefined,
        fallbackCityKey: matchedPlace?.placeKey ? undefined : region.fallbackCityKey,
        fallbackCityLabel: matchedPlace?.placeKey ? undefined : region.fallbackCityLabel,
        fallbackStateKey: matchedPlace?.placeKey ? undefined : region.fallbackStateKey,
        fallbackConfidence: matchedPlace?.placeKey ? undefined : region.fallbackConfidence,
        fallbackDetectedAt: matchedPlace?.placeKey ? undefined : region.fallbackDetectedAt,
        locationNeedsReview
      })

      await userCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            region: nextRegion,
            updatedAt: new Date()
          }
        }
      )
    }

    console.log(
      JSON.stringify(
        {
          processedUsers,
          resolvedStates,
          resolvedCities,
          flaggedUsers
        },
        null,
        2
      )
    )
  } finally {
    await connection.close()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
