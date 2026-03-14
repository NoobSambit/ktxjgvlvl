import { NextResponse } from "next/server"
import { listFanProjects } from "@/modules/fan-projects/service"

export async function GET() {
  return NextResponse.json({ projects: await listFanProjects() })
}
