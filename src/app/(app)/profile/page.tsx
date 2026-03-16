import { redirect } from "next/navigation"
import { PageHero } from "@/components/shared/page-hero"
import { ProfileLocationForm } from "@/components/profile/profile-location-form"
import { getSessionUser } from "@/platform/auth/session"
import { getCurrentUserProfile } from "@/modules/users/service"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await getSessionUser()

  if (!session.isAuthenticated) {
    redirect("/signin")
  }

  const profile = await getCurrentUserProfile()

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Profile"
        title="Manage your India location"
        description="Keep your confirmed state accurate for scoring, and optionally add a city or town for activity-map hotspots."
      />

      <ProfileLocationForm profile={profile} />
    </div>
  )
}
