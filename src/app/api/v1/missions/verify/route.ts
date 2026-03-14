import { NextResponse } from "next/server"
import { verifyCurrentUserMissions } from "@/modules/missions/service"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    return NextResponse.json(await verifyCurrentUserMissions())
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify missions." },
      { status: 400 }
    )
  }
}
