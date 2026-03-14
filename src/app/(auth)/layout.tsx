import { SiteHeader } from "@/components/shared/site-header"
import { SiteFooter } from "@/components/shared/site-footer"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="relative py-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-br from-[hsl(265,60%,55%)]/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-br from-[hsl(30,100%,50%)]/15 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="container relative">{children}</div>
      </main>
      <SiteFooter />
    </>
  )
}
