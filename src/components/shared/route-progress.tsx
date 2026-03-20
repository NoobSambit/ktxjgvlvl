"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const initialProgress = 0.14
const progressCeiling = 0.84

export function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeKey = useMemo(() => {
    const params = searchParams?.toString() ?? ""
    return params ? `${pathname}?${params}` : pathname
  }, [pathname, searchParams])

  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const activeRef = useRef(false)
  const incrementTimerRef = useRef<number | null>(null)
  const safetyTimerRef = useRef<number | null>(null)

  function clearTimers() {
    if (incrementTimerRef.current) {
      window.clearInterval(incrementTimerRef.current)
      incrementTimerRef.current = null
    }

    if (safetyTimerRef.current) {
      window.clearTimeout(safetyTimerRef.current)
      safetyTimerRef.current = null
    }
  }

  function finishProgress() {
    if (!activeRef.current) {
      return
    }

    clearTimers()
    activeRef.current = false
    setProgress(1)

    window.setTimeout(() => {
      setIsVisible(false)
      setProgress(0)
    }, 260)
  }

  function startProgress() {
    if (activeRef.current) {
      return
    }

    activeRef.current = true
    setIsVisible(true)
    setProgress(initialProgress)

    incrementTimerRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= progressCeiling) {
          return current
        }

        const remaining = progressCeiling - current
        return current + Math.max(0.015, remaining * 0.18)
      })
    }, 140)

    safetyTimerRef.current = window.setTimeout(() => {
      finishProgress()
    }, 12000)
  }

  useEffect(() => {
    finishProgress()
  }, [routeKey])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest("a[href]")

      if (!(anchor instanceof HTMLAnchorElement)) {
        return
      }

      if (anchor.dataset.routeProgress === "false" || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return
      }

      const rawHref = anchor.getAttribute("href")

      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
        return
      }

      const nextUrl = new URL(anchor.href, window.location.href)

      if (nextUrl.origin !== window.location.origin) {
        return
      }

      const currentUrl = new URL(window.location.href)

      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
        return
      }

      startProgress()
    }

    document.addEventListener("click", handleClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
      clearTimers()
    }
  }, [])

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[160] transition-opacity duration-200",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div
        className="loading-shimmer relative h-1 origin-left rounded-r-full bg-[linear-gradient(90deg,rgba(255,153,51,0.98)_0%,rgba(255,255,255,0.95)_52%,rgba(19,136,8,0.95)_100%)] shadow-[0_0_24px_-6px_rgba(255,153,51,0.85)] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${Math.max(progress * 100, 0)}%` }}
      >
        <div className="absolute inset-y-[-10px] right-0 w-20 -translate-x-1/4 rounded-full bg-[linear-gradient(90deg,rgba(255,153,51,0.12),rgba(255,255,255,0.32),rgba(19,136,8,0.14))] blur-xl" />
      </div>
    </div>
  )
}
