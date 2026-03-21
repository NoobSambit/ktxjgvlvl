import { cacheTags, sharedCacheRevalidateSeconds, unstable_cache } from "@/platform/cache/shared"

export type WikiPageView = {
  slug: string
  title: string
  section: string
  summary: string
}

const seededWiki: WikiPageView[] = [
  {
    slug: "member-profiles",
    title: "BTS Member Profiles",
    section: "members",
    summary: "Quick bios, signature eras, and solo highlights for all seven members."
  },
  {
    slug: "discography-guide",
    title: "BTS Discography",
    section: "discography",
    summary: "Albums, eras, solo releases, and easy entry points for new listeners."
  },
  {
    slug: "fandom-guides",
    title: "Fandom Starter Guides",
    section: "guides",
    summary: "Helpful explainers on streaming etiquette, voting basics, and event culture."
  },
  {
    slug: "era-archive",
    title: "Era Archive",
    section: "timeline",
    summary: "A clean overview of key BTS chapters for fans who want context at a glance."
  }
]

const listWikiPagesCached = unstable_cache(async () => seededWiki, ["wiki:v1"], {
  revalidate: sharedCacheRevalidateSeconds,
  tags: [cacheTags.wiki]
})

export async function listWikiPages() {
  return listWikiPagesCached()
}
