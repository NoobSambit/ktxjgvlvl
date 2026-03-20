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

function printUsage(jobValues) {
  console.log(
    [
      "Usage:",
      "  npm run job:run -- <job-key> [--force]",
      "  npm run job:run -- --list",
      "",
      "Available job keys:",
      ...jobValues.map((jobKey) => `  - ${jobKey}`)
    ].join("\n")
  )
}

loadEnvFile(".env.local")
loadEnvFile(".env")

const args = process.argv.slice(2)
const { jobKeys } = await import("../src/platform/queues/job-types.ts")
const { runJob } = await import("../src/platform/jobs/cron.ts")
const jobValues = Object.values(jobKeys)

if (args.includes("--help") || args.includes("-h")) {
  printUsage(jobValues)
  process.exit(0)
}

if (args.includes("--list")) {
  printUsage(jobValues)
  process.exit(0)
}

const jobKey = args.find((arg) => !arg.startsWith("--"))

if (!jobKey || !jobValues.includes(jobKey)) {
  printUsage(jobValues)
  process.exit(1)
}

const force = args.includes("--force")
const startedAt = new Date()

console.log(
  JSON.stringify(
    {
      startedAt: startedAt.toISOString(),
      jobKey,
      force
    },
    null,
    2
  )
)

try {
  const result = await runJob(jobKey, { force })

  console.log(
    JSON.stringify(
      {
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt.getTime(),
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
