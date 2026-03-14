import { NextResponse } from "next/server"
import { listWikiPages } from "@/modules/wiki/service"

export async function GET() {
  return NextResponse.json({ pages: await listWikiPages() })
}
