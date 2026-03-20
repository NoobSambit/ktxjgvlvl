import { NextResponse } from "next/server"
import { assertCronAuthorized } from "@/platform/auth/cron"

export function createCronRouteHandler<T>(handler: (request: Request) => Promise<T>) {
  return async function cronRouteHandler(request: Request) {
    try {
      assertCronAuthorized(request)
      return NextResponse.json(await handler(request))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cron job failed."
      const status = message === "Unauthorized cron request." ? 401 : 400
      return NextResponse.json({ error: message }, { status })
    }
  }
}
