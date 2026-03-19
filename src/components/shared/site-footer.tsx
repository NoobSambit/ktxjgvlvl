import Link from "next/link"
import { Music4, Heart } from "lucide-react"

const footerLinks = [
  { href: "/profile", label: "Profile" },
  { href: "/missions", label: "Missions" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/wiki", label: "Wiki" },
  { href: "/events", label: "Events" },
  { href: "/projects", label: "Fan Projects" },
  { href: "/voting-guides", label: "Voting Guides" }
]

export function SiteFooter() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-[hsl(265,25%,8%)]/50 backdrop-blur-sm">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-[hsl(265,70%,65%)]/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-[hsl(25,90%,55%)]/15 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="site-shell relative py-7 sm:py-10">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-[hsl(265,70%,65%)] to-[hsl(320,65%,55%)] p-2 text-white">
                <Music4 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-heading text-xl font-semibold">
                  <span className="text-[hsl(265,70%,65%)]">India</span><span className="text-[hsl(25,90%,55%)]">For</span><span className="text-[hsl(265,70%,65%)]">BTS</span>
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[hsl(265,15%,65%)]">
              A unified hub for Indian ARMY to stream together, track chart movements, and organize fan initiatives. 
              Every stream counts, every fan matters.
            </p>
            <div className="flex items-center gap-2 text-xs text-[hsl(265,15%,55%)]">
              <Heart className="w-3.5 h-3.5 text-[hsl(265,70%,65%)] fill-current" />
              <span>Made with love by Indian ARMY</span>
            </div>
            <p className="max-w-md text-xs text-[hsl(265,15%,55%)]">
              India activity map boundaries by geoBoundaries gbOpen. Locality registry and hotspot place names from
              GeoNames.
            </p>
          </div>
          
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(265,15%,55%)] mb-4">Quick Links</p>
            <div className="flex flex-wrap gap-2">
              {footerLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-sm text-[hsl(265,15%,65%)] bg-white/5 rounded-full border border-white/10 hover:bg-[hsl(265,70%,65%)]/20 hover:text-[hsl(265,70%,65%)] hover:border-[hsl(265,70%,65%)]/30 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-[hsl(265,15%,50%)] sm:mt-8 sm:flex-row sm:pt-6">
          <p>© 2024 IndiaForBTS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[hsl(265,70%,65%)] rounded-full animate-pulse" />
              Streaming Live
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
