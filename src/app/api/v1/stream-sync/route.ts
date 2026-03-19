import { NextResponse } from "next/server"
import { z } from "zod"
import { syncStreamingActivity } from "@/modules/streaming/service"
import { TRACKER_PROVIDERS } from "@/platform/integrations/trackers/base"

const syncSchema = z.object({
  provider: z.enum(TRACKER_PROVIDERS),
  username: z.string().min(2)
})

export async function POST(request: Request) {
  try {
    const body = syncSchema.parse(await request.json())
    const summary = await syncStreamingActivity(body.provider, body.username)

    return NextResponse.json({ summary })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync streaming activity." },
      { status: 400 }
    )
  }
}
