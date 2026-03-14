import { randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyPassword } from "@/platform/auth/password"
import { SESSION_COOKIE_NAME } from "@/platform/auth/session"
import { UserModel } from "@/platform/db/models/user"
import { connectToDatabase } from "@/platform/db/mongoose"

const signInSchema = z.object({
  identity: z.string().min(2),
  password: z.string().min(6)
})

export async function POST(request: Request) {
  try {
    const body = signInSchema.parse(await request.json())
    const identity = body.identity.trim().toLowerCase()

    await connectToDatabase()

    const user = await UserModel.findOne({
      $or: [{ username: identity }, { email: identity }]
    })

    if (!user) {
      return NextResponse.json({ error: "No account matches that username or email." }, { status: 404 })
    }

    const credentialsAccount = user.authAccounts.find(
      (account: { provider: string; passwordHash?: string }) => account.provider === "credentials"
    )

    if (!credentialsAccount?.passwordHash) {
      return NextResponse.json({ error: "This account does not have password sign-in enabled." }, { status: 400 })
    }

    const isValid = await verifyPassword(body.password, credentialsAccount.passwordHash)

    if (!isValid) {
      return NextResponse.json({ error: "Password is incorrect." }, { status: 400 })
    }

    user.sessionKey = randomBytes(24).toString("hex")
    await user.save()

    const response = NextResponse.json({
      success: true,
      user: {
        displayName: user.displayName,
        username: user.username
      }
    })

    response.cookies.set(SESSION_COOKIE_NAME, user.sessionKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sign in failed." },
      { status: 400 }
    )
  }
}
