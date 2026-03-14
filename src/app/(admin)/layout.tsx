import { SiteHeader } from "@/components/shared/site-header"
import { SiteFooter } from "@/components/shared/site-footer"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-32 w-64 h-64 bg-gradient-to-br from-[hsl(265,60%,55%)]/8 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-40 -right-32 w-64 h-64 bg-gradient-to-br from-[hsl(30,100%,50%)]/8 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="container relative space-y-8 py-10">{children}</div>
      </main>
      <SiteFooter />
    </>
  )
}
