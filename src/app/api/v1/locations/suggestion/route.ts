import { NextResponse } from "next/server"
import { getLocationSuggestionForRequest } from "@/modules/locations/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return NextResponse.json({
    suggestion: await getLocationSuggestionForRequest(request)
  })
}
