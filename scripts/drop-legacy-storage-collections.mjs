import fs from "node:fs"
import path from "node:path"
import mongoose from "mongoose"

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

const startedAt = Date.now()
const { dropLegacyStorageCollections } = await import("../src/modules/streaming/free-tier-storage.ts")

try {
  const result = await dropLegacyStorageCollections()

  console.log(
    JSON.stringify(
      {
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        result
      },
      null,
      2
    )
  )
} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
