"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { 
  Sparkles, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  LayoutDashboard,
  Target,
  Trophy,
  BarChart3,
  User,
  BookOpen,
  Info,
  Calendar,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SignOutButton } from "@/components/auth/sign-out-button"

interface NavLink {
  href: string
  label: string
  icon: any
  featured?: boolean
}

const mainLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, featured: true },
  { href: "/missions", label: "Missions", icon: Target, featured: true },
  { href: "/leaderboards", label: "Rankings", icon: Trophy, featured: true },
  { href: "/charts", label: "Charts", icon: BarChart3, featured: true },
]

const moreLinks: NavLink[] = [
  { href: "/guide", label: "Guide", icon: BookOpen },
  { href: "/wiki", label: "Wiki", icon: Info },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/projects", label: "Projects", icon: Layers },
  { href: "/profile", label: "My Profile", icon: User },
]

export function SiteHeader({ session }: { session: any }) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement | null>(null)

  const isAdmin = session?.roles?.includes("super_admin") || session?.roles?.includes("mission_admin")

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMoreOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMoreOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMoreOpen])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] px-2 pt-3 pb-1.5 transition-all duration-300 sm:px-4 sm:pt-4 sm:pb-2",
      isScrolled ? "pt-1.5 sm:pt-2" : "pt-3 sm:pt-4"
    )}>
      <nav className={cn(
        "mx-auto flex h-[3.75rem] max-w-[1800px] items-center justify-between overflow-visible rounded-[1.15rem] px-3 transition-all duration-500 sm:h-16 sm:rounded-2xl sm:px-6",
        "bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 relative",
        isScrolled && "h-[3.25rem] bg-zinc-950/95 border-white/10 sm:h-14"
      )}>
        <div className="absolute inset-0 overflow-hidden rounded-[1.15rem] pointer-events-none opacity-90 mix-blend-screen sm:rounded-2xl">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 64"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="wave-green" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0B5F05" />
                <stop offset="50%" stopColor="#1B9E10" />
                <stop offset="100%" stopColor="#0B5F05" />
              </linearGradient>
              <linearGradient id="wave-white" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C0C0C0" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#C0C0C0" />
              </linearGradient>
              <linearGradient id="wave-saffron" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D96600" />
                <stop offset="50%" stopColor="#FF9933" />
                <stop offset="100%" stopColor="#D96600" />
              </linearGradient>
            </defs>
            <g>
              {/* Green Wave (Background filling down to the bottom) */}
              <path
                d="M0,0 H1000 V64 H0 Z"
                fill="url(#wave-green)"
                fillOpacity="1"
              />
              {/* White Wave (Middle) */}
              <path
                d="M0,0 H1000 V46 C750,60 400,30 200,50 C100,58 50,43 0,48 Z"
                fill="url(#wave-white)"
                fillOpacity="1"
              >
                <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M0,0 H1000 V46 C750,60 400,30 200,50 C100,58 50,43 0,48 Z;M0,0 H1000 V46 C750,30 400,60 200,40 C100,48 50,53 0,48 Z;M0,0 H1000 V46 C750,60 400,30 200,50 C100,58 50,43 0,48 Z" />
              </path>
              {/* Saffron Wave (Front) */}
              <path
                d="M0,0 H1000 V26 C850,45 600,10 350,30 C150,40 75,15 0,26 Z"
                fill="url(#wave-saffron)"
                fillOpacity="0.95"
              >
                <animate attributeName="d" dur="7s" repeatCount="indefinite" values="M0,0 H1000 V26 C850,45 600,10 350,30 C150,40 75,15 0,26 Z;M0,0 H1000 V26 C850,10 600,45 350,20 C150,30 75,40 0,26 Z;M0,0 H1000 V26 C850,45 600,10 350,30 C150,40 75,15 0,26 Z" />
              </path>
            </g>
          </svg>
          <div className="absolute inset-0 backdrop-blur-[1px] bg-black/10" />
        </div>

        {/* Content (relative to stay above waves) */}
        <div className="relative z-10 flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 p-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md border border-white/20 transition-transform group-hover:scale-110 md:h-11 md:w-11">
                <Image
                  src="/bts-india-logo.svg"
                  alt="IndiaForBTS logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="font-heading text-base md:text-lg font-black leading-none tracking-wide">
                <span className="text-[#FF9933] [text-shadow:_0_2px_8px_rgba(0,0,0,0.9)]">India</span><span className="text-white [text-shadow:_0_2px_8px_rgba(0,0,0,0.9)]">For</span><span className="text-[#32CD32] [text-shadow:_0_2px_8px_rgba(0,0,0,0.9)] drop-shadow-md">BTS</span>
              </p>
              <p className="text-[8px] md:text-[10px] tracking-widest text-white/90 uppercase font-black mt-0.5 [text-shadow:_0_1px_4px_rgba(0,0,0,0.9)]">Indian ARMY Hub</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {mainLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-bold transition-all duration-200 rounded-xl",
                  pathname === link.href 
                    ? "text-white bg-black/40 border border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.3)]" 
                    : "text-white/90 hover:text-white hover:bg-black/30 [text-shadow:_0_1px_6px_rgba(0,0,0,0.9)]"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)] rounded-full" />
                )}
              </Link>
            ))}

            {/* More Dropdown */}
            <div ref={moreMenuRef} className="relative ml-2">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                aria-expanded={isMoreOpen}
                aria-haspopup="menu"
                aria-controls="desktop-more-menu"
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-all",
                  isMoreOpen ? "bg-black/50 text-white shadow-inner" : "text-white/90 hover:text-white hover:bg-black/30 [text-shadow:_0_1px_6px_rgba(0,0,0,0.9)]"
                )}
              >
                More
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isMoreOpen && "rotate-180")} />
              </button>

              {isMoreOpen && (
                <div
                  id="desktop-more-menu"
                  role="menu"
                  className="absolute top-full right-0 z-[120] mt-2 w-48 p-2 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-top-2"
                >
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Auth/Admin */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {isAdmin && (
              <Link 
                href="/admin" 
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-black/40 rounded-xl border border-white/20 hover:bg-black/60 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-white/90" />
                Admin
              </Link>
            )}

            {session?.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link 
                  href="/profile" 
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform"
                  title={session.displayName}
                >
                  <span className="text-xs md:text-sm font-bold text-white uppercase drop-shadow-md">
                    {session.displayName.charAt(0)}
                  </span>
                </Link>
                <SignOutButton className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                </SignOutButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/signin" 
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-black/60 hover:bg-black/80 text-white border border-white/20 shadow-lg backdrop-blur-sm text-xs py-2 px-4 h-auto rounded-xl font-bold transition-all"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white bg-black/40 border border-white/20 shadow-md rounded-xl hover:bg-black/60 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-2 top-20 z-[90] animate-in fade-in slide-in-from-top-4 duration-300 lg:hidden sm:inset-x-4 sm:top-24">
          <div className="max-h-[70vh] overflow-y-auto rounded-[1.5rem] border border-white/20 bg-zinc-950/90 p-3 shadow-3xl backdrop-blur-3xl scrollbar-hide sm:rounded-3xl sm:p-4">
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[...mainLinks, ...moreLinks].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all text-center",
                    pathname === link.href 
                      ? "bg-white/20 text-white shadow-lg border border-white/20" 
                      : "bg-white/5 text-white/70 active:bg-white/10"
                  )}
                >
                  <link.icon className={cn("w-5 h-5", pathname === link.href ? "text-white" : "text-white/70")} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{link.label}</span>
                </Link>
              ))}
            </div>

            {isAdmin && (
              <Link 
                href="/admin" 
                className="flex items-center justify-center gap-2 w-full p-4 mb-2 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Admin Console
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
