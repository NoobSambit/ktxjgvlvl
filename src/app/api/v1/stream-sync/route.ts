import { NextResponse } from "next/server"
import { z } from "zod"
import { syncStreamingActivity } from "@/modules/streaming/service"

const syncSchema = z.object({
  provider: z.enum(["lastfm", "musicat", "statsfm"]),
  username: z.string().min(2)
})

export async function POST(request: Request) {
  const body = syncSchema.parse(await request.json())
  const summary = await syncStreamingActivity(body.provider, body.username)

  return NextResponse.json({ summary })
}
