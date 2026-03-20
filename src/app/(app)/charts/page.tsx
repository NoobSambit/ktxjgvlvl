import { BarChart3 } from "lucide-react"
import { ComingSoonPage } from "@/components/shared/coming-soon-page"

export default async function ChartsPage() {
  return (
    <ComingSoonPage
        eyebrow="Chart Watch"
        title="Track BTS chart positions"
        description="Monitor real-time chart movements in India. Know which songs need a push and when to stream together."
        sectionLabel="Charts"
        sectionTitle="Chart tracking is being rebuilt"
        sectionDescription="The charts surface will return once the data pipeline, ranking rules, and spotlight cards are ready to ship as a reliable product instead of a half-finished preview."
        icon={BarChart3}
        bullets={[
          "Platform-wise chart snapshots with cleaner source labeling",
          "Song watchlists for comeback and push windows",
          "Real signals only, no filler leader cards or placeholder metrics",
          "Consistent chart UX across app pages and admin surfaces",
        ]}
      />
  )
}
