import { NextResponse } from "next/server"
import { listEvents } from "@/modules/events/service"

export async function GET() {
  return NextResponse.json({ events: await listEvents() })
}
