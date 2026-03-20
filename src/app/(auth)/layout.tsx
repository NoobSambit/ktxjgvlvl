import { SiteHeader } from "@/components/shared/site-header-wrapper"
import { SiteFooter } from "@/components/shared/site-footer"
import { AppBgWaves } from "@/components/shared/app-bg-waves"

export const dynamic = "force-dynamic"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col relative isolate">
      <AppBgWaves />
      <SiteHeader />
      <main className="relative z-10 flex-1 py-12 sm:py-20">
        <div className="site-shell relative">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}
