import { runJob } from "@/platform/jobs/cron"
import { createCronRouteHandler } from "@/platform/http/cron-route"
import { jobKeys } from "@/platform/queues/job-types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

function parseForceValue(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true"
}

async function readForceFlag(request: Request) {
  const { searchParams } = new URL(request.url)
  const queryForce = searchParams.get("force")

  if (queryForce !== null) {
    return parseForceValue(queryForce)
  }

  try {
    const body = (await request.json()) as { force?: unknown }
    return parseForceValue(body.force)
  } catch {
    return false
  }
}

const handler = createCronRouteHandler(async (request: Request) => {
  const force = await readForceFlag(request)
  return runJob(jobKeys.generateDailyMissions, { force })
})

export const GET = handler
export const POST = handler
