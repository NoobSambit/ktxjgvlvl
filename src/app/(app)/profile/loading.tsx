import { PageHero } from "@/components/shared/page-hero"
import { LoadingBlock } from "@/components/shared/premium-loading"

export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Profile"
        title="Manage your India location"
        description="Keep your confirmed state accurate for scoring, and optionally add a city or town for activity-map hotspots."
      />

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <LoadingBlock className="h-[32rem] rounded-[1.5rem]" />
        <LoadingBlock className="h-[32rem] rounded-[1.5rem]" />
      </div>
    </div>
  )
}
