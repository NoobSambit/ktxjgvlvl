import { NextResponse } from "next/server"
import { requireAdminUserRecord } from "@/platform/auth/current-user"
import { getMissionAdminState } from "@/modules/missions/service"
import { syncArmyverseCatalog } from "@/modules/catalog/service"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    await requireAdminUserRecord()

    const summary = await syncArmyverseCatalog()
    const state = await getMissionAdminState()

    return NextResponse.json({ summary, state })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync catalog." },
      { status: 400 }
    )
  }
}
