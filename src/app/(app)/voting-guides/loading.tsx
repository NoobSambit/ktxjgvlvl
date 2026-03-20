import { PageHero } from "@/components/shared/page-hero"
import { LoadingBlock } from "@/components/shared/premium-loading"

export default function VotingGuidesLoading() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Voting Guides"
        title="Vote for BTS with confidence"
        description="Step-by-step guides for every award show. Easy to follow, share with new ARMY, and complete voting campaigns."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingBlock className="h-72 rounded-[1.5rem]" key={index} />
        ))}
      </section>
    </div>
  )
}
