import type { Metadata } from "next"
import { GuideHub } from "@/components/guides/guide-hub"

export const metadata: Metadata = {
  title: "Guides | IndiaForBTS",
  description: "Core all-platform streaming guides plus YouTube, Spotify, Apple Music, and Amazon Music platform-specific walkthroughs."
}

export default function GuidePage() {
  return <GuideHub />
}
