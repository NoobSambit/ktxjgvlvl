import { NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/platform/auth/session"
import { UserModel } from "@/platform/db/models/user"
import { connectToDatabase } from "@/platform/db/mongoose"

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? ""
  const sessionKey = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.slice(`${SESSION_COOKIE_NAME}=`.length)

  if (sessionKey) {
    await connectToDatabase()
    await UserModel.updateOne({ sessionKey }, { $unset: { sessionKey: "" } })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  })

  return response
}
