import { NextResponse } from "next/server"
import { getLeaderboardById, listLeaderboards } from "@/modules/leaderboards/service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period")
  const boardType = searchParams.get("boardType")
  const boardId = searchParams.get("boardId")
  const full = searchParams.get("full")

  if (boardId) {
    const leaderboard = await getLeaderboardById(boardId, {
      fullEntries: full === "true" || full === "1"
    })

    return NextResponse.json({
      leaderboard
    })
  }

  return NextResponse.json({
    leaderboards: await listLeaderboards({
      period: period === "daily" || period === "weekly" ? period : undefined,
      boardType: boardType === "individual" || boardType === "state" ? boardType : undefined
    })
  })
}
