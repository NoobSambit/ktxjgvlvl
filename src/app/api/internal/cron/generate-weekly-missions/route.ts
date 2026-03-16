import { NextResponse } from "next/server"
import { assertCronAuthorized } from "@/platform/auth/cron"
import { runJob } from "@/platform/jobs/cron"
import { jobKeys } from "@/platform/queues/job-types"

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

export async function POST(request: Request) {
  try {
    assertCronAuthorized(request)
    const force = await readForceFlag(request)
    return NextResponse.json(await runJob(jobKeys.generateWeeklyMissions, { force }))
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 })
  }
}
