import { SiteHeader } from "@/components/shared/site-header-wrapper"
import { SiteFooter } from "@/components/shared/site-footer"
import { AppBgWaves } from "@/components/shared/app-bg-waves"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
      <AppBgWaves />
      <SiteHeader />
      <main className="flex-1 relative pt-16 md:pt-20 z-10">
        <div className="site-shell relative space-y-3 py-2 sm:space-y-8 sm:py-10">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}
