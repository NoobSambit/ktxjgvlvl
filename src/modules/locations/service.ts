import type { Types } from "mongoose"
import { requireAuthenticatedUserRecord } from "@/platform/auth/current-user"
import { LocationPlaceModel, LocationStateModel } from "@/platform/db/models/locations"
import { UserModel } from "@/platform/db/models/user"
import { connectToDatabase } from "@/platform/db/mongoose"
import { suggestRegionFromIp, type GeoSuggestion } from "@/platform/integrations/geo/ip-geolocation"
import { indiaStateRegistry, indiaStateRegistryMap } from "@/modules/locations/india-registry"
import {
  buildLocationSlug,
  buildPlaceKey,
  buildStateKeyFromLabel,
  normalizeLocationText
} from "@/modules/locations/normalization"
import type {
  LocationPlaceView,
  LocationStateView,
  LocationSuggestionView,
  UserLocationSummaryView
} from "@/modules/locations/types"

type StateDoc = {
  stateKey: string
  stateLabel: string
  stateCode: string
}

type PlaceDoc = {
  placeKey: string
  placeLabel: string
  stateKey: string
  stateLabel: string
  districtLabel?: string
  latitude: number
  longitude: number
}

type MutableUserRegion = {
  stateKey?: string
  state?: string
  cityKey?: string
  city?: string
  cityConfirmedAt?: Date
  citySource?: "user_selected" | "admin_override"
  fallbackCityKey?: string
  fallbackCityLabel?: string
  fallbackStateKey?: string
  fallbackConfidence?: "low" | "medium" | "high"
  fallbackDetectedAt?: Date
  locationNeedsReview?: boolean
}

function toStateView(doc: StateDoc): LocationStateView {
  return {
    stateKey: doc.stateKey,
    stateLabel: doc.stateLabel,
    stateCode: doc.stateCode
  }
}

function toRegistryStateView(entry: (typeof indiaStateRegistry)[number]): LocationStateView {
  return {
    stateKey: entry.stateKey,
    stateLabel: entry.stateLabel,
    stateCode: entry.stateCode
  }
}

function toPlaceView(doc: PlaceDoc): LocationPlaceView {
  return {
    placeKey: doc.placeKey,
    placeLabel: doc.placeLabel,
    stateKey: doc.stateKey,
    stateLabel: doc.stateLabel,
    districtLabel: doc.districtLabel,
    latitude: doc.latitude,
    longitude: doc.longitude,
    secondaryLabel: [doc.districtLabel, doc.stateLabel].filter(Boolean).join(", ")
  }
}

function buildStateAliasSet(stateLabel: string, aliases: string[]) {
  return new Set([stateLabel, ...aliases].map(normalizeLocationText))
}

async function findStateByNormalizedText(normalizedText: string) {
  for (const entry of indiaStateRegistry) {
    if (buildStateAliasSet(entry.stateLabel, entry.aliases).has(normalizedText)) {
      return entry
    }
  }

  const doc = (await LocationStateModel.findOne({
    $or: [{ normalizedLabel: normalizedText }, { aliases: normalizedText }]
  })
    .select({ stateKey: 1, stateLabel: 1, stateCode: 1 })
    .lean()) as StateDoc | null

  return doc
    ? {
        stateKey: doc.stateKey,
        stateLabel: doc.stateLabel,
        stateCode: doc.stateCode,
        geonamesAdmin1Code: "",
        aliases: []
      }
    : null
}

async function findPlaceByNormalizedText(stateKey: string, normalizedText: string) {
  return (await LocationPlaceModel.findOne({
    stateKey,
    $or: [{ normalizedName: normalizedText }, { aliases: normalizedText }]
  })
    .sort({ population: -1 })
    .select({
      placeKey: 1,
      placeLabel: 1,
      stateKey: 1,
      stateLabel: 1,
      districtLabel: 1,
      latitude: 1,
      longitude: 1
    })
    .lean()) as PlaceDoc | null
}

export function getStateScopeSource(region?: {
  stateKey?: string
  state?: string
}) {
  return region?.stateKey ?? (region?.state ? buildStateKeyFromLabel(region.state) : undefined)
}

export function getEffectivePlaceFromRegion(region?: {
  cityKey?: string
  city?: string
  fallbackCityKey?: string
  fallbackCityLabel?: string
}) {
  if (region?.cityKey && region.city) {
    return {
      placeKey: region.cityKey,
      placeLabel: region.city,
      cityMode: "confirmed" as const
    }
  }

  if (region?.fallbackCityKey && region.fallbackCityLabel) {
    return {
      placeKey: region.fallbackCityKey,
      placeLabel: region.fallbackCityLabel,
      cityMode: "ip_fallback" as const
    }
  }

  return null
}

export function summarizeUserLocation(region?: MutableUserRegion): UserLocationSummaryView {
  const effectivePlace = getEffectivePlaceFromRegion(region)

  return {
    stateKey: region?.stateKey,
    stateLabel: region?.state,
    cityKey: effectivePlace?.placeKey,
    cityLabel: effectivePlace?.placeLabel,
    cityMode: effectivePlace?.cityMode ?? "missing",
    locationNeedsReview: Boolean(region?.locationNeedsReview),
    suggestedCityKey: !region?.cityKey ? region?.fallbackCityKey : undefined,
    suggestedCityLabel:
      !region?.cityKey && region?.fallbackCityLabel ? region.fallbackCityLabel : undefined
  }
}

export async function listLocationStates(query?: string) {
  await connectToDatabase()

  const normalizedQuery = query ? normalizeLocationText(query) : ""
  const filter =
    normalizedQuery.length > 0
      ? {
          $or: [
            { normalizedLabel: { $regex: normalizedQuery, $options: "i" } },
            { aliases: { $regex: normalizedQuery, $options: "i" } }
          ]
        }
      : {}

  const docs = (await LocationStateModel.find(filter)
    .sort({ stateLabel: 1 })
    .select({ stateKey: 1, stateLabel: 1, stateCode: 1 })
    .lean()) as unknown as StateDoc[]

  if (docs.length > 0) {
    return docs.map(toStateView)
  }

  return indiaStateRegistry
    .map(toRegistryStateView)
    .filter((entry) => {
      if (!normalizedQuery) {
        return true
      }

      const registryEntry = indiaStateRegistryMap.get(entry.stateKey)
      return registryEntry
        ? buildStateAliasSet(registryEntry.stateLabel, registryEntry.aliases).has(normalizedQuery) ||
            normalizeLocationText(entry.stateLabel).includes(normalizedQuery)
        : false
    })
    .sort((left, right) => left.stateLabel.localeCompare(right.stateLabel))
}

export async function searchLocationPlaces(input: {
  stateKey: string
  query?: string
  limit?: number
}) {
  await connectToDatabase()

  const limit = Math.min(Math.max(input.limit ?? 20, 1), 20)
  const normalizedQuery = input.query ? normalizeLocationText(input.query) : ""
  const filter: Record<string, unknown> = {
    stateKey: input.stateKey
  }

  if (normalizedQuery.length > 0) {
    filter.$or = [
      { normalizedName: { $regex: normalizedQuery, $options: "i" } },
      { aliases: { $regex: normalizedQuery, $options: "i" } }
    ]
  }

  const docs = (await LocationPlaceModel.find(filter)
    .sort(normalizedQuery.length > 0 ? { population: -1, placeLabel: 1 } : { population: -1, placeLabel: 1 })
    .limit(limit)
    .select({
      placeKey: 1,
      placeLabel: 1,
      stateKey: 1,
      stateLabel: 1,
      districtLabel: 1,
      latitude: 1,
      longitude: 1
    })
    .lean()) as unknown as PlaceDoc[]

  return docs.map(toPlaceView)
}

export async function getLocationStateByKey(stateKey: string) {
  await connectToDatabase()

  const state = (await LocationStateModel.findOne({ stateKey })
    .select({ stateKey: 1, stateLabel: 1, stateCode: 1 })
    .lean()) as StateDoc | null

  if (state) {
    return toStateView(state)
  }

  const registryEntry = indiaStateRegistryMap.get(stateKey)
  return registryEntry ? toRegistryStateView(registryEntry) : null
}

export async function getLocationPlaceByKey(placeKey: string) {
  await connectToDatabase()

  const place = (await LocationPlaceModel.findOne({ placeKey })
    .select({
      placeKey: 1,
      placeLabel: 1,
      stateKey: 1,
      stateLabel: 1,
      districtLabel: 1,
      latitude: 1,
      longitude: 1
    })
    .lean()) as PlaceDoc | null

  return place ? toPlaceView(place) : null
}

export async function getLocationRegistrySummary() {
  await connectToDatabase()

  const [stateCount, placeCount, latestState, latestPlace] = await Promise.all([
    LocationStateModel.countDocuments(),
    LocationPlaceModel.countDocuments(),
    LocationStateModel.findOne().sort({ updatedAt: -1 }).select({ updatedAt: 1 }).lean() as Promise<
      { updatedAt?: Date } | null
    >,
    LocationPlaceModel.findOne().sort({ updatedAt: -1 }).select({ updatedAt: 1 }).lean() as Promise<
      { updatedAt?: Date } | null
    >
  ])

  return {
    stateCount,
    placeCount,
    lastImportedAt:
      latestPlace?.updatedAt?.toISOString?.() ??
      latestState?.updatedAt?.toISOString?.()
  }
}

function getHostingSuggestion(headersLike: Headers) {
  const countryCode = headersLike.get("x-vercel-ip-country")
  const stateName = headersLike.get("x-vercel-ip-country-region")
  const cityName = headersLike.get("x-vercel-ip-city")

  if (!countryCode || countryCode.toUpperCase() !== "IN" || !stateName) {
    return null
  }

  return {
    source: "hosting_header" as const,
    country: "India",
    state: stateName,
    city: cityName ?? "",
    confidence: cityName ? "high" as const : "medium" as const
  }
}

function readIpAddress(headersLike: Headers) {
  const forwardedFor = headersLike.get("x-forwarded-for")

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim()
  }

  return headersLike.get("x-real-ip")?.trim() ?? undefined
}

async function resolveCanonicalSuggestion(rawSuggestion: GeoSuggestion & { source: "hosting_header" | "ipapi" }) {
  const normalizedState = normalizeLocationText(rawSuggestion.state)
  const matchedState = await findStateByNormalizedText(normalizedState)

  if (!matchedState) {
    return null
  }

  const suggestion: LocationSuggestionView = {
    source: rawSuggestion.source,
    confidence: rawSuggestion.confidence,
    state: {
      stateKey: matchedState.stateKey,
      stateLabel: matchedState.stateLabel,
      stateCode: matchedState.stateCode
    }
  }

  if (rawSuggestion.city) {
    const normalizedCity = normalizeLocationText(rawSuggestion.city)
    const matchedPlace = await findPlaceByNormalizedText(matchedState.stateKey, normalizedCity)

    if (matchedPlace) {
      suggestion.place = toPlaceView(matchedPlace)
    }
  }

  return suggestion
}

export async function getLocationSuggestionForRequest(request: Request | { headers: Headers }) {
  await connectToDatabase()

  const headersLike = request.headers
  const hostingSuggestion = getHostingSuggestion(headersLike)

  if (hostingSuggestion) {
    return resolveCanonicalSuggestion(hostingSuggestion)
  }

  const ipAddress = readIpAddress(headersLike)
  const rawSuggestion = await suggestRegionFromIp(ipAddress)

  if (!rawSuggestion) {
    return null
  }

  return resolveCanonicalSuggestion(rawSuggestion)
}

async function buildPersistedRegion(input: {
  state: LocationStateView
  place?: LocationPlaceView | null
  suggestion?: LocationSuggestionView | null
}) {
  if (input.place) {
    return {
      country: "India",
      stateKey: input.state.stateKey,
      state: input.state.stateLabel,
      cityKey: input.place.placeKey,
      city: input.place.placeLabel,
      cityConfirmedAt: new Date(),
      citySource: "user_selected" as const,
      fallbackCityKey: undefined,
      fallbackCityLabel: undefined,
      fallbackStateKey: undefined,
      fallbackConfidence: undefined,
      fallbackDetectedAt: undefined,
      confirmedAt: new Date(),
      source: "user_confirmed" as const,
      locationNeedsReview: false
    }
  }

  const matchedFallback =
    input.suggestion?.state?.stateKey === input.state.stateKey && input.suggestion.place
      ? input.suggestion.place
      : null

  return {
    country: "India",
    stateKey: input.state.stateKey,
    state: input.state.stateLabel,
    cityKey: undefined,
    city: undefined,
    cityConfirmedAt: undefined,
    citySource: undefined,
    fallbackCityKey: matchedFallback?.placeKey,
    fallbackCityLabel: matchedFallback?.placeLabel,
    fallbackStateKey: matchedFallback?.stateKey,
    fallbackConfidence: matchedFallback ? input.suggestion?.confidence : undefined,
    fallbackDetectedAt: matchedFallback ? new Date() : undefined,
    confirmedAt: new Date(),
    source: "user_confirmed" as const,
    locationNeedsReview: false
  }
}

export async function buildSignupRegion(input: {
  stateKey: string
  cityKey?: string
  request: Request
}) {
  const [state, place, suggestion] = await Promise.all([
    getLocationStateByKey(input.stateKey),
    input.cityKey ? getLocationPlaceByKey(input.cityKey) : Promise.resolve(null),
    getLocationSuggestionForRequest(input.request)
  ])

  if (!state) {
    throw new Error("Select a valid state.")
  }

  if (place && place.stateKey !== state.stateKey) {
    throw new Error("Select a city or town that belongs to the chosen state.")
  }

  return buildPersistedRegion({ state, place, suggestion })
}

export async function updateCurrentUserLocation(input: {
  stateKey: string
  cityKey?: string
  request: Request
}) {
  await connectToDatabase()

  const user = await requireAuthenticatedUserRecord()
  const [state, place, suggestion] = await Promise.all([
    getLocationStateByKey(input.stateKey),
    input.cityKey ? getLocationPlaceByKey(input.cityKey) : Promise.resolve(null),
    getLocationSuggestionForRequest(input.request)
  ])

  if (!state) {
    throw new Error("Select a valid state.")
  }

  if (place && place.stateKey !== state.stateKey) {
    throw new Error("Select a city or town that belongs to the chosen state.")
  }

  const region = await buildPersistedRegion({ state, place, suggestion })

  await UserModel.updateOne(
    { _id: user._id },
    {
      $set: {
        region
      }
    }
  )

  return {
    userId: String(user._id),
    region,
    location: summarizeUserLocation(region)
  }
}

export async function matchLegacyStateKey(stateLabel?: string) {
  if (!stateLabel) {
    return null
  }

  const direct = indiaStateRegistryMap.get(buildStateKeyFromLabel(stateLabel))

  if (direct) {
    return direct.stateKey
  }

  const normalized = normalizeLocationText(stateLabel)
  const matched = await findStateByNormalizedText(normalized)
  return matched?.stateKey ?? null
}

export async function matchLegacyPlaceKey(stateKey: string, cityLabel?: string) {
  if (!cityLabel) {
    return null
  }

  const normalized = normalizeLocationText(cityLabel)
  const exact = await LocationPlaceModel.find({
    stateKey,
    $or: [{ normalizedName: normalized }, { aliases: normalized }]
  })
    .sort({ population: -1, placeLabel: 1 })
    .limit(2)
    .select({ placeKey: 1 })
    .lean()

  return exact.length === 1 ? exact[0]?.placeKey ?? null : null
}

export function buildLegacyPlaceAlias(placeName: string) {
  return buildLocationSlug(placeName).replace(/-/g, " ")
}

export function buildImportedPlaceDocument(input: {
  geonameId: number
  placeLabel: string
  stateKey: string
  stateLabel: string
  districtLabel?: string
  latitude: number
  longitude: number
  population?: number
  featureClass: string
  featureCode: string
  aliases?: string[]
}) {
  return {
    placeKey: buildPlaceKey(input.stateKey, input.geonameId),
    geonameId: input.geonameId,
    placeLabel: input.placeLabel,
    normalizedName: normalizeLocationText(input.placeLabel),
    aliases: Array.from(
      new Set(
        [buildLegacyPlaceAlias(input.placeLabel), ...(input.aliases ?? []).map(normalizeLocationText)].filter(
          Boolean
        )
      )
    ),
    stateKey: input.stateKey,
    stateLabel: input.stateLabel,
    districtLabel: input.districtLabel,
    latitude: input.latitude,
    longitude: input.longitude,
    population: input.population,
    featureClass: input.featureClass,
    featureCode: input.featureCode
  }
}

export function buildImportedStateDocument(input: {
  stateLabel: string
  stateKey: string
  stateCode: string
  aliases?: string[]
  centroidLat?: number
  centroidLng?: number
  mapFeatureId?: string
}) {
  return {
    stateKey: input.stateKey,
    stateLabel: input.stateLabel,
    normalizedLabel: normalizeLocationText(input.stateLabel),
    stateCode: input.stateCode,
    aliases: Array.from(new Set((input.aliases ?? []).map(normalizeLocationText))),
    centroidLat: input.centroidLat,
    centroidLng: input.centroidLng,
    mapFeatureId: input.mapFeatureId
  }
}
