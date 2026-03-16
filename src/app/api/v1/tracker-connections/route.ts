import { NextResponse } from "next/server"
import { z } from "zod"
import { connectTracker, listTrackerConnections } from "@/modules/trackers/service"

export const dynamic = "force-dynamic"

const trackerSchema = z.object({
  provider: z.enum(["lastfm"]),
  username: z.string().min(2)
})

export async function GET() {
  return NextResponse.json({ connections: await listTrackerConnections() })
}

export async function POST(request: Request) {
  try {
    const body = trackerSchema.parse(await request.json())
    const connection = await connectTracker(body.provider, body.username)

    return NextResponse.json({ connection }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect tracker." },
      { status: 400 }
    )
  }
}
