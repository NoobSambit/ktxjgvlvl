import { NextResponse } from "next/server"
import { assertCronAuthorized } from "@/platform/auth/cron"
import { runJob } from "@/platform/jobs/cron"
import { jobKeys } from "@/platform/queues/job-types"

export async function POST(request: Request) {
  try {
    assertCronAuthorized(request)
    return NextResponse.json(await runJob(jobKeys.generateDailyMissions))
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 })
  }
}
