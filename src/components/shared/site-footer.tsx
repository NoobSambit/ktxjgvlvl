"use client"

import Image from "next/image"
import Link from "next/link"
import { ExternalLink, ShieldAlert, Twitter, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

const footerLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/missions", label: "Missions" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/charts", label: "Charts" },
  { href: "/guide", label: "Guide" },
  { href: "/events", label: "Events" },
]

export function SiteFooter() {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isDisclaimerOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDisclaimerOpen(false)
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isDisclaimerOpen])

  return (
    <>
      <footer className="relative mt-10 border-t border-white/10 bg-[rgba(10,8,20,0.78)] backdrop-blur-xl sm:mt-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />

        <div className="site-shell py-5 sm:py-6">
          <div className="flex flex-col gap-5 rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] px-4 py-4 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.95)] sm:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-black/25">
                  <Image
                    src="/bts-india-logo.svg"
                    alt="IndiaForBTS logo"
                    width={34}
                    height={34}
                    className="h-8.5 w-8.5 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-heading text-sm font-bold tracking-[0.22em] text-white sm:text-base">
                    INDIAFORBTS
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/56">
                    Indian ARMY hub for missions, charts, and community coordination.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/68 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-3 text-xs text-white/46 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <p>© {new Date().getFullYear()} IndiaForBTS</p>
                <button
                  type="button"
                  onClick={() => setIsDisclaimerOpen(true)}
                  className="inline-flex items-center gap-1.5 text-white/56 transition hover:text-white"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Disclaimer
                </button>
                <a
                  href="https://x.com/BoyWithLuvBytes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white/56 transition hover:text-white"
                >
                  <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
                  Creator
                  <ExternalLink className="h-3 w-3 text-white/35" />
                </a>
              </div>

              <p className="text-white/38">Unofficial fan project. Not affiliated with HYBE or BIGHIT MUSIC.</p>
            </div>
          </div>
        </div>
      </footer>

      {mounted && isDisclaimerOpen
        ? createPortal(
            <div className="fixed inset-0 z-[100] bg-[rgba(4,4,12,0.84)] backdrop-blur-md">
              <div className="flex h-full items-end justify-center p-3 sm:items-center sm:p-6">
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Site disclaimer"
                  className="w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,14,31,0.98),rgba(8,8,18,1))] shadow-[0_40px_120px_-45px_rgba(0,0,0,0.96)]"
                >
                  <div className="border-b border-white/10 px-4 py-4 sm:px-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Legal</p>
                        <h2 className="mt-2 text-xl font-semibold text-white">Disclaimer</h2>
                        <p className="mt-2 text-sm leading-6 text-white/60">
                          This project follows the same fan-project disclaimer standard used across your related BTS community products.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDisclaimerOpen(false)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white transition hover:bg-white/[0.1]"
                        aria-label="Close disclaimer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-sm font-semibold text-white">Unofficial fan project</p>
                      <p className="mt-2 text-sm leading-7 text-white/64">
                        IndiaForBTS is an independent, fan-made platform built by ARMY for ARMY. It is not affiliated with, endorsed by, sponsored by, or officially connected to HYBE, BIGHIT MUSIC, BTS, or their official representatives.
                      </p>
                    </div>

                    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-sm font-semibold text-white">Trademarks and data usage</p>
                      <p className="mt-2 text-sm leading-7 text-white/64">
                        All BTS names, logos, music, images, and related trademarks remain the property of their respective owners. This platform organizes public information and user-connected tracker activity for community participation only. It does not stream music on users&apos; behalf, alter official numbers, or represent official charting organizations.
                      </p>
                    </div>

                    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-sm font-semibold text-white">Credits</p>
                      <p className="mt-2 text-sm leading-7 text-white/64">
                        India activity map boundaries are derived from geoBoundaries gbOpen. Locality registry and hotspot place names are derived from GeoNames.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
