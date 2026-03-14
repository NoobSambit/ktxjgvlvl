import { cookies } from "next/headers"
import { UserModel } from "@/platform/db/models/user"
import { connectToDatabase } from "@/platform/db/mongoose"

export const SESSION_COOKIE_NAME = "indiaforbts_session"

export type SessionUser = {
  id: string
  sessionKey?: string
  username: string
  displayName: string
  roles: string[]
  state?: string
  city?: string
  isAuthenticated: boolean
}

const guestSession: SessionUser = {
  id: "guest-user",
  sessionKey: undefined,
  username: "guest",
  displayName: "Guest ARMY",
  roles: ["guest"],
  state: undefined,
  city: undefined,
  isAuthenticated: false
}

export async function getSessionUser(): Promise<SessionUser> {
  const sessionKey = cookies().get(SESSION_COOKIE_NAME)?.value?.trim()

  if (!sessionKey) {
    return guestSession
  }

  await connectToDatabase()

  const user = (await UserModel.findOne({ sessionKey }).lean()) as
    | {
        _id: string
        username: string
        displayName: string
        roles?: string[]
        region?: {
          state?: string
          city?: string
        }
      }
    | null

  if (!user) {
    return guestSession
  }

  return {
    id: String(user._id),
    sessionKey,
    username: user.username,
    displayName: user.displayName,
    roles: user.roles ?? ["user"],
    state: user.region?.state,
    city: user.region?.city,
    isAuthenticated: true
  }
}
