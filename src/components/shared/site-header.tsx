import Link from "next/link"
import { Music4, Sparkles } from "lucide-react"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { getSessionUser } from "@/platform/auth/session"

const links = [
  { href: "/dashboard", label: "My ARMY Room" },
  { href: "/profile", label: "Profile" },
  { href: "/missions", label: "Missions" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/charts", label: "Charts" },
  { href: "/wiki", label: "Wiki" },
  { href: "/events", label: "Events" },
  { href: "/projects", label: "Projects" }
]

export async function SiteHeader() {
  const session = await getSessionUser()
  const isAdmin = session.roles.includes("super_admin") || session.roles.includes("mission_admin")

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[hsl(265,30%,12%)]/80 backdrop-blur-xl">
      <div className="container">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="rounded-xl bg-gradient-to-br from-[hsl(265,70%,65%)] to-[hsl(320,65%,55%)] p-2.5 text-white shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                <Music4 className="h-5 w-5" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[hsl(25,90%,55%)] rounded-full animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-lg font-semibold">
                <span className="text-[hsl(265,70%,65%)]">India</span><span className="text-[hsl(25,90%,55%)]">For</span><span className="text-[hsl(265,70%,65%)]">BTS</span>
              </p>
              <p className="text-[10px] tracking-wider text-[hsl(265,15%,55%)] uppercase">Indian ARMY Hub</p>
            </div>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link 
                className="nav-link" 
                href={link.href} 
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link 
                href="/admin" 
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[hsl(265,70%,65%)] bg-[hsl(265,70%,65%)]/10 rounded-lg hover:bg-[hsl(265,70%,65%)]/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
            {session.isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[hsl(265,70%,65%)]/10 to-[hsl(25,90%,55%)]/10 rounded-full border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(265,70%,65%)] to-[hsl(320,65%,55%)] flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-white">
                      {session.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{session.displayName}</span>
                </div>
                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/signin" 
                  className="hidden sm:inline-flex h-9 px-4 items-center justify-center text-sm font-medium text-[hsl(265,15%,65%)] hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link 
                  href="/signup" 
                  className="btn-bts-primary text-sm py-2"
                >
                  Join ARMY
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <nav className="lg:hidden flex items-center gap-1 pb-3 overflow-x-auto -mx-4 px-4 scrollbar-hide">
          {links.map((link) => (
            <Link 
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-[hsl(265,15%,55%)] bg-white/5 rounded-full border border-white/10" 
              href={link.href} 
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
