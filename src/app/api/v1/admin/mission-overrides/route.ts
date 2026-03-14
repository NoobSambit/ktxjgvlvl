import { NextResponse } from "next/server"
import { z } from "zod"
import {
  clearMissionOverrideForCurrentPeriod,
  upsertMissionOverrideForCurrentPeriod
} from "@/modules/missions/service"

export const dynamic = "force-dynamic"

const overrideSchema = z.object({
  slotKey: z.enum(["daily_songs", "daily_albums", "weekly_songs", "weekly_albums"]),
  itemKeys: z.array(z.string().min(1)),
  rewardPoints: z.number().int().positive().optional()
})

export async function POST(request: Request) {
  try {
    const body = overrideSchema.parse(await request.json())
    const state = await upsertMissionOverrideForCurrentPeriod(body)

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
    const slotKey = searchParams.get("slotKey")

    if (
      slotKey !== "daily_songs" &&
      slotKey !== "daily_albums" &&
      slotKey !== "weekly_songs" &&
      slotKey !== "weekly_albums"
    ) {
      return NextResponse.json({ error: "Valid slotKey is required." }, { status: 400 })
    }

    const state = await clearMissionOverrideForCurrentPeriod(slotKey)

    return NextResponse.json({ state })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clear mission override." },
      { status: 400 }
    )
  }
}
