import mongoose from "mongoose"
import { CatalogAlbumModel, CatalogTrackModel } from "@/platform/db/models/catalog"
import { connectToDatabase } from "@/platform/db/mongoose"
import { env } from "@/platform/validation/env"

export type CatalogOption = {
  key: string
  label: string
  secondaryLabel: string
}

export type CatalogSummary = {
  trackCount: number
  albumCount: number
}

type ArmyverseTrackRecord = {
  spotifyId?: string
  youtubeId?: string
  name?: string
  artist?: string
  album?: string
  duration?: number
  popularity?: number
  isBTSFamily?: boolean
  releaseDate?: Date | string
  genres?: string[]
  audioFeatures?: Record<string, number | undefined>
  thumbnails?: Record<string, string | undefined>
  previewUrl?: string
  isExplicit?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

type ArmyverseAlbumRecord = {
  spotifyId?: string
  name?: string
  artist?: string
  isBTSFamily?: boolean
  tracks?: Array<{
    name?: string
    artist?: string
    spotifyId?: string
  }>
  trackCount?: number
  releaseDate?: Date | string
  coverImage?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

function sanitizeTrack(record: ArmyverseTrackRecord) {
  if (!record.spotifyId || !record.name || !record.artist || !record.album || typeof record.duration !== "number") {
    return null
  }

  return {
    spotifyId: record.spotifyId,
    name: record.name,
    artist: record.artist,
    album: record.album,
    duration: record.duration,
    popularity: record.popularity,
    isBTSFamily: record.isBTSFamily === true,
    releaseDate: record.releaseDate ? new Date(record.releaseDate) : undefined,
    genres: Array.isArray(record.genres) ? record.genres : [],
    audioFeatures: record.audioFeatures ?? {},
    thumbnails: record.thumbnails ?? {},
    previewUrl: record.previewUrl,
    isExplicit: record.isExplicit === true,
    createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
    updatedAt: new Date()
  }
}

function sanitizeAlbum(record: ArmyverseAlbumRecord) {
  if (!record.spotifyId || !record.name || !record.artist) {
    return null
  }

  const tracks = Array.isArray(record.tracks)
    ? record.tracks
        .filter((track) => track?.name && track?.artist && track?.spotifyId)
        .map((track) => ({
          name: track.name!,
          artist: track.artist!,
          spotifyId: track.spotifyId!
        }))
    : []

  return {
    spotifyId: record.spotifyId,
    name: record.name,
    artist: record.artist,
    isBTSFamily: record.isBTSFamily === true,
    tracks,
    trackCount: record.trackCount ?? tracks.length,
    releaseDate: record.releaseDate ? new Date(record.releaseDate) : undefined,
    coverImage: record.coverImage,
    createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
    updatedAt: new Date()
  }
}

export async function getCatalogSummary(): Promise<CatalogSummary> {
  await connectToDatabase()

  const [trackCount, albumCount] = await Promise.all([
    CatalogTrackModel.countDocuments({ isBTSFamily: true }),
    CatalogAlbumModel.countDocuments({ isBTSFamily: true })
  ])

  return { trackCount, albumCount }
}

export async function listTrackOptions(): Promise<CatalogOption[]> {
  await connectToDatabase()

  const tracks = await CatalogTrackModel.find({ isBTSFamily: true })
    .sort({ artist: 1, name: 1 })
    .select({ spotifyId: 1, name: 1, artist: 1, album: 1 })
    .lean()

  return tracks.map((track) => ({
    key: track.spotifyId,
    label: track.name,
    secondaryLabel: `${track.artist} · ${track.album}`
  }))
}

export async function listAlbumOptions(): Promise<CatalogOption[]> {
  await connectToDatabase()

  const albums = await CatalogAlbumModel.find({ isBTSFamily: true })
    .sort({ artist: 1, releaseDate: 1, name: 1 })
    .select({ spotifyId: 1, name: 1, artist: 1, trackCount: 1 })
    .lean()

  return albums.map((album) => ({
    key: album.spotifyId,
    label: album.name,
    secondaryLabel: `${album.artist} · ${album.trackCount} tracks`
  }))
}

export async function syncArmyverseCatalog() {
  if (!env.ARMYVERSE_MONGODB_URI) {
    throw new Error("Source catalog connection is not configured.")
  }

  await connectToDatabase()

  const sourceConnection = await mongoose.createConnection(env.ARMYVERSE_MONGODB_URI).asPromise()
  const sourceDb = sourceConnection.db

  if (!sourceDb) {
    throw new Error("Could not open the source music database.")
  }

  try {
    const [trackDocs, albumDocs] = await Promise.all([
      sourceDb
        .collection<ArmyverseTrackRecord>("tracks")
        .find({ isBTSFamily: true })
        .toArray(),
      sourceDb
        .collection<ArmyverseAlbumRecord>("albums")
        .find({ isBTSFamily: true })
        .toArray()
    ])

    const tracks = trackDocs.map(sanitizeTrack).filter((record): record is NonNullable<typeof record> => Boolean(record))
    const albums = albumDocs.map(sanitizeAlbum).filter((record): record is NonNullable<typeof record> => Boolean(record))

    if (tracks.length > 0) {
      await CatalogTrackModel.bulkWrite(
        tracks.map((track) => ({
          updateOne: {
            filter: { spotifyId: track.spotifyId },
            update: { $set: track },
            upsert: true
          }
        }))
      )
    }

    if (albums.length > 0) {
      await CatalogAlbumModel.bulkWrite(
        albums.map((album) => ({
          updateOne: {
            filter: { spotifyId: album.spotifyId },
            update: { $set: album },
            upsert: true
          }
        }))
      )
    }

    return {
      importedTracks: tracks.length,
      importedAlbums: albums.length,
      syncedAt: new Date().toISOString()
    }
  } finally {
    await sourceConnection.close()
  }
}
