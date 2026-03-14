import { NextResponse } from "next/server"
import { listLeaderboards } from "@/modules/leaderboards/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period")
  const scopeType = searchParams.get("scopeType")
  const scopeKey = searchParams.get("scopeKey")

  return NextResponse.json({
    leaderboards: await listLeaderboards({
      period: period === "daily" || period === "weekly" ? period : undefined,
      scopeType: scopeType === "state" || scopeType === "city" ? scopeType : undefined,
      scopeKey: scopeKey ?? undefined
    })
  })
}
