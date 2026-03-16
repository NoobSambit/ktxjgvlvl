import { randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"
import { buildSignupRegion } from "@/modules/locations/service"
import { hashPassword } from "@/platform/auth/password"
import { SESSION_COOKIE_NAME } from "@/platform/auth/session"
import { UserModel } from "@/platform/db/models/user"
import { connectToDatabase } from "@/platform/db/mongoose"

const signUpSchema = z.object({
  username: z.string().min(3).max(24),
  email: z.string().email().optional(),
  stateKey: z.string().min(2),
  cityKey: z.string().min(2).optional(),
  password: z.string().min(6)
})

export async function POST(request: Request) {
  try {
    const body = signUpSchema.parse(await request.json())
    const username = body.username.trim().toLowerCase()
    const email = body.email?.trim().toLowerCase()

    await connectToDatabase()

    const existingUser = await UserModel.findOne({
      $or: [{ username }, ...(email ? [{ email }] : [])]
    })

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.username === username ? "That username is already taken." : "That email is already registered." },
        { status: 409 }
      )
    }

    const sessionKey = randomBytes(24).toString("hex")
    const passwordHash = await hashPassword(body.password)
    const region = await buildSignupRegion({
      stateKey: body.stateKey,
      cityKey: body.cityKey,
      request
    })

    const user = await UserModel.create({
      sessionKey,
      displayName: body.username.trim(),
      username,
      email,
      status: "active",
      roles: ["user"],
      region,
      authAccounts: [
        {
          provider: "credentials",
          providerAccountId: email ?? username,
          passwordHash
        }
      ]
    })

    const response = NextResponse.json({
      success: true,
      user: {
        displayName: user.displayName,
        username: user.username
      }
    })

    response.cookies.set(SESSION_COOKIE_NAME, sessionKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Account creation failed." },
      { status: 400 }
    )
  }
}
