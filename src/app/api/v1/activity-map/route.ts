import { NextResponse } from "next/server"
import { getActivityMapView } from "@/modules/activity-map/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period")

  return NextResponse.json({
    map: await getActivityMapView(period === "daily" ? "daily" : "weekly")
  })
}
