import mongoose from "mongoose"
import fs from "node:fs"
import path from "node:path"

function loadEnvFile(filename) {
  const envPath = path.resolve(process.cwd(), filename)

  if (!fs.existsSync(envPath)) {
    return
  }

  const contents = fs.readFileSync(envPath, "utf8")

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const equalsIndex = trimmed.indexOf("=")

    if (equalsIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, equalsIndex).trim()
    const value = trimmed.slice(equalsIndex + 1)

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env")

function requireEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

function sanitizeTrack(record) {
  if (
    !record?.spotifyId ||
    !record?.name ||
    !record?.artist ||
    !record?.album ||
    typeof record?.duration !== "number"
  ) {
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

function sanitizeAlbum(record) {
  if (!record?.spotifyId || !record?.name || !record?.artist) {
    return null
  }

  const tracks = Array.isArray(record.tracks)
    ? record.tracks
        .filter((track) => track?.name && track?.artist && track?.spotifyId)
        .map((track) => ({
          name: track.name,
          artist: track.artist,
          spotifyId: track.spotifyId
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

async function main() {
  const sourceUri = requireEnv("ARMYVERSE_MONGODB_URI")
  const targetUri = requireEnv("MONGODB_URI")

  const source = await mongoose.createConnection(sourceUri, {
    serverSelectionTimeoutMS: 5000,
    family: 4
  }).asPromise()
  const target = await mongoose.createConnection(targetUri, {
    serverSelectionTimeoutMS: 5000,
    family: 4
  }).asPromise()

  try {
    const sourceDb = source.db
    const targetDb = target.db

    if (!sourceDb || !targetDb) {
      throw new Error("Could not open source or target MongoDB database.")
    }

    const [rawTracks, rawAlbums] = await Promise.all([
      sourceDb.collection("tracks").find({ isBTSFamily: true }).toArray(),
      sourceDb.collection("albums").find({ isBTSFamily: true }).toArray()
    ])

    const tracks = rawTracks.map(sanitizeTrack).filter(Boolean)
    const albums = rawAlbums.map(sanitizeAlbum).filter(Boolean)

    if (tracks.length > 0) {
      await targetDb.collection("tracks").bulkWrite(
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
      await targetDb.collection("albums").bulkWrite(
        albums.map((album) => ({
          updateOne: {
            filter: { spotifyId: album.spotifyId },
            update: { $set: album },
            upsert: true
          }
        }))
      )
    }

    console.log(
      JSON.stringify(
        {
          importedTracks: tracks.length,
          importedAlbums: albums.length,
          syncedAt: new Date().toISOString()
        },
        null,
        2
      )
    )
  } finally {
    await Promise.all([source.close(), target.close()])
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
