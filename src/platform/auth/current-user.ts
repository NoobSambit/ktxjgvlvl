import { getSessionUser } from "@/platform/auth/session"
import { UserModel } from "@/platform/db/models/user"
import { connectToDatabase } from "@/platform/db/mongoose"

export async function getCurrentUserRecord() {
  const session = await getSessionUser()

  await connectToDatabase()

  if (!session.isAuthenticated || !session.sessionKey) {
    return new UserModel({
      displayName: session.displayName,
      username: session.username,
      status: "pending",
      roles: session.roles,
      region: {
        country: "India",
        state: session.state,
        city: session.city
      }
    })
  }

  const regionUpdate = session.state && session.city
    ? {
        "region.country": "India",
        "region.state": session.state,
        "region.city": session.city,
        "region.confirmedAt": new Date(),
        "region.source": "user_confirmed"
      }
    : {}

  const user = await UserModel.findOneAndUpdate(
    { _id: session.id, sessionKey: session.sessionKey },
    {
      $set: {
        displayName: session.displayName,
        username: session.username,
        roles: session.roles,
        status: "active",
        ...regionUpdate
      }
    },
    {
      new: true
    }
  )

  if (!user) {
    throw new Error("Signed-in user session could not be resolved.")
  }

  return user
}

export async function requireAuthenticatedUserRecord() {
  const session = await getSessionUser()

  if (!session.isAuthenticated) {
    throw new Error("Sign in or join now before using this action.")
  }

  return getCurrentUserRecord()
}

export async function requireAdminUserRecord() {
  const user = await requireAuthenticatedUserRecord()

  if (!user.roles.includes("super_admin") && !user.roles.includes("mission_admin")) {
    throw new Error("Admin access is required.")
  }

  return user
}
