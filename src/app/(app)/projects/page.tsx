import { Layers } from "lucide-react"
import { ComingSoonPage } from "@/components/shared/coming-soon-page"

export default function ProjectsPage() {
  return (
    <ComingSoonPage
      bullets={[
        "Real fan-led drives and support campaigns",
        "Organizer and location details that matter",
        "Cleaner submission and discovery flow",
        "No seeded project cards until it is ready"
      ]}
      description="The projects area is being rebuilt so only real fan initiatives show up here."
      eyebrow="Projects"
      icon={Layers}
      sectionDescription="We are replacing the demo layout with a proper fan-project hub for real campaigns, community drives, and support work across India."
      sectionLabel="Fan initiatives"
      sectionTitle="Fan projects coming soon"
      title="The projects hub is being rebuilt"
    />
  )
}
