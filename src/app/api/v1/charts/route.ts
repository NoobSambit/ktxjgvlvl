import { NextResponse } from "next/server"
import { listChartCards } from "@/modules/charts/service"

export async function GET() {
  return NextResponse.json({ charts: await listChartCards() })
}
