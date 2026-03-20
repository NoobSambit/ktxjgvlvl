import { PageHero } from "@/components/shared/page-hero"
import { LoadingBlock } from "@/components/shared/premium-loading"

export default function AdminPageLoading() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admin"
        title="Control Room"
        description="Plan the next mission reset, sync the BTS catalog, and keep platform jobs healthy from one admin surface."
      />

      <LoadingBlock className="h-[36rem] rounded-[1.5rem]" />

      <section className="grid gap-4 lg:grid-cols-2">
        <LoadingBlock className="h-72 rounded-[1.5rem]" />
        <LoadingBlock className="h-72 rounded-[1.5rem]" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <LoadingBlock className="h-72 rounded-[1.5rem]" />
        <LoadingBlock className="h-72 rounded-[1.5rem]" />
      </section>
    </div>
  )
}
