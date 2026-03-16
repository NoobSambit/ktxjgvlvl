import { NextResponse } from "next/server"
import { listLocationStates } from "@/modules/locations/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  return NextResponse.json({
    states: await listLocationStates(query || undefined)
  })
}
