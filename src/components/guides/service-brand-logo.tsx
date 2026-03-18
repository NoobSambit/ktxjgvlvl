"use client"

import { Apple, Youtube } from "lucide-react"

type ServiceBrand = "apple" | "amazon" | "spotify" | "youtube"

export function ServiceBrandLogo({
  service,
  className = "h-5 w-5"
}: {
  service: ServiceBrand
  className?: string
}) {
  switch (service) {
    case "apple":
      return <Apple className={className} />
    case "youtube":
      return <Youtube className={className} />
    case "spotify":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M5.5 9.15c4.1-1.3 8.2-1.05 12.1.82" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M6.65 12.45c3.26-.92 6.47-.7 9.45.63" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7.9 15.6c2.4-.54 4.7-.37 6.84.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      )
    case "amazon":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <path d="M9.1 5.25v7.55c0 1.65-1.28 2.7-2.9 2.7-1.5 0-2.7-.96-2.7-2.38 0-1.66 1.28-2.56 3.18-2.56.42 0 .82.04 1.18.12V6.35l8.9-1.85v6.9c0 1.66-1.3 2.72-2.9 2.72-1.52 0-2.72-.96-2.72-2.4 0-1.66 1.28-2.56 3.18-2.56.42 0 .82.04 1.18.12V6.25L9.1 7.58" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.2 18.05c4.15 2.65 10.15 2.62 14.58-.18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M16.45 16.55h2.75v2.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}
