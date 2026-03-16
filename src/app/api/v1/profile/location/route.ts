import { NextResponse } from "next/server"
import { z } from "zod"
import { updateCurrentUserLocation } from "@/modules/locations/service"

export const dynamic = "force-dynamic"

const updateProfileLocationSchema = z.object({
  stateKey: z.string().min(2),
  cityKey: z.string().min(2).optional()
})

export async function PATCH(request: Request) {
  try {
    const body = updateProfileLocationSchema.parse(await request.json())

    return NextResponse.json(
      await updateCurrentUserLocation({
        stateKey: body.stateKey,
        cityKey: body.cityKey,
        request
      })
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Location update failed." },
      { status: 400 }
    )
  }
}
