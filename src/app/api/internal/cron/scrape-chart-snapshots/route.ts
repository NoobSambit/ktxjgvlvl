import { runJob } from "@/platform/jobs/cron"
import { createCronRouteHandler } from "@/platform/http/cron-route"
import { jobKeys } from "@/platform/queues/job-types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

const handler = createCronRouteHandler(async () => runJob(jobKeys.scrapeChartSnapshots))

export const GET = handler
export const POST = handler
