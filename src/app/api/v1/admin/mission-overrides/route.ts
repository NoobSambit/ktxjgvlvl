import { NextResponse } from "next/server"
import { z } from "zod"
import {
  clearMissionOverrideForNextPeriod,
  upsertMissionOverrideForNextPeriod
} from "@/modules/missions/service"

export const dynamic = "force-dynamic"

const overrideSchema = z.object({
  missionCellKey: z.enum([
    "daily_india",
    "daily_individual",
    "daily_state",
    "weekly_india",
    "weekly_individual",
    "weekly_state"
  ]),
  mechanicType: z.enum(["track_streams", "album_completions"]),
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

    if (
      missionCellKey !== "daily_india" &&
      missionCellKey !== "daily_individual" &&
      missionCellKey !== "daily_state" &&
      missionCellKey !== "weekly_india" &&
      missionCellKey !== "weekly_individual" &&
      missionCellKey !== "weekly_state"
    ) {
      return NextResponse.json({ error: "Valid missionCellKey is required." }, { status: 400 })
    }

    const state = await clearMissionOverrideForNextPeriod(missionCellKey)

    return NextResponse.json({ state })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clear mission override." },
      { status: 400 }
    )
  }
}
