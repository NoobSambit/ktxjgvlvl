import { NextResponse } from "next/server"
import { searchLocationPlaces } from "@/modules/locations/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stateKey = searchParams.get("stateKey")?.trim()
  const query = searchParams.get("q")?.trim()

  if (!stateKey) {
    return NextResponse.json({ error: "stateKey is required." }, { status: 400 })
  }

  if (!query || query.length < 2) {
    return NextResponse.json({ places: [] })
  }

  return NextResponse.json({
    places: await searchLocationPlaces({
      stateKey,
      query,
      limit: 20
    })
  })
}
