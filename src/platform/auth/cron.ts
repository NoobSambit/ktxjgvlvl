import { env } from "@/platform/validation/env"

export function assertCronAuthorized(request: Request) {
  if (env.DISABLE_CRON_AUTH) {
    return
  }

  if (!env.CRON_SECRET) {
    return
  }

  const authHeader = request.headers.get("authorization") ?? ""
  const xCronSecret = request.headers.get("x-cron-secret") ?? ""
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : ""
  const provided = (bearerToken || xCronSecret).trim()

  if (provided !== env.CRON_SECRET) {
    throw new Error("Unauthorized cron request.")
  }
}
