import { getSessionUser } from "@/platform/auth/session"
import { SiteHeader as HeaderContent } from "./site-header"

export async function SiteHeader() {
  const session = await getSessionUser()
  
  return <HeaderContent session={session} />
}
