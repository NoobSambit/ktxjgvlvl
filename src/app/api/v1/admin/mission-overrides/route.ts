import { NextResponse } from "next/server"
import { z } from "zod"
import { missionCellOrder, missionMechanicOrder } from "@/modules/missions/config"
import {
  clearMissionOverrideForNextPeriod,
  upsertMissionOverrideForNextPeriod
} from "@/modules/missions/service"

export const dynamic = "force-dynamic"

const overrideSchema = z.object({
  missionCellKey: z.enum(missionCellOrder),
  mechanicType: z.enum(missionMechanicOrder),
  targetKeys: z.array(z.string().min(1)),
  goalUnits: z.number().int().positive(),
  rewardPoints: z.number().int().positive()
})

export async function POST(request: Request) {
  try {
    const body = overrideSchema.parse(await request.json())
    const state = await upsertMissionOverrideForNextPeriod(body)

    return NextResponse.json({ state })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save mission override." },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const missionCellKey = searchParams.get("missionCellKey")
    const mechanicType = searchParams.get("mechanicType")

    if (!missionCellKey || !missionCellOrder.includes(missionCellKey as (typeof missionCellOrder)[number])) {
      return NextResponse.json({ error: "Valid missionCellKey is required." }, { status: 400 })
    }

    if (!mechanicType || !missionMechanicOrder.includes(mechanicType as (typeof missionMechanicOrder)[number])) {
      return NextResponse.json({ error: "Valid mechanicType is required." }, { status: 400 })
    }

    const state = await clearMissionOverrideForNextPeriod(
      missionCellKey as (typeof missionCellOrder)[number],
      mechanicType as (typeof missionMechanicOrder)[number]
    )

    return NextResponse.json({ state })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clear mission override." },
      { status: 400 }
    )
  }
}
