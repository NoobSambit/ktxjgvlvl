import { NextResponse } from "next/server"
import { getMissionPageState } from "@/modules/missions/service"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(await getMissionPageState())
}
