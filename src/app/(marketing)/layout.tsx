import { SiteHeader } from "@/components/shared/site-header-wrapper"
import { SiteFooter } from "@/components/shared/site-footer"
import { AppBgWaves } from "@/components/shared/app-bg-waves"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-x-clip">
      <AppBgWaves />
      <SiteHeader />
      <div className="site-shell relative z-10 flex-1 pt-16 sm:pt-20">{children}</div>
      <SiteFooter />
    </div>
  )
}
