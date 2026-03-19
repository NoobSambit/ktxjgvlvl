import { BookOpen } from "lucide-react"
import { ComingSoonPage } from "@/components/shared/coming-soon-page"

export default function WikiPage() {
  return (
    <ComingSoonPage
      bullets={[
        "Member pages and discography breakdowns",
        "Era explainers and beginner-friendly references",
        "Cleaner search and browse structure",
        "Real BTS-focused content only"
      ]}
      description="The wiki is being rebuilt from scratch so it is actually useful when it goes live."
      eyebrow="Wiki"
      icon={BookOpen}
      sectionDescription="We are replacing the old filler layout with a cleaner BTS knowledge hub that is easier to browse, easier to search, and worth opening."
      sectionLabel="Knowledge hub"
      sectionTitle="BTS wiki coming soon"
      title="A proper BTS reference section is on the way"
    />
  )
}
