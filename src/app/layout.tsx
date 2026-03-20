import type { Metadata } from "next"
import { Suspense } from "react"
import localFont from "next/font/local"
import "./globals.css"
import { RouteProgress } from "@/components/shared/route-progress"

const bodyFont = localFont({
  src: [
    { path: "./fonts/manrope-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/manrope-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/manrope-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/manrope-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/manrope-800.ttf", weight: "800", style: "normal" }
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"]
})

const headingFont = localFont({
  src: [
    { path: "./fonts/plus-jakarta-sans-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-600.ttf", weight: "600", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-800.ttf", weight: "800", style: "normal" }
  ],
  variable: "--font-heading",
  display: "swap",
  fallback: ["Trebuchet MS", "Segoe UI", "Arial", "sans-serif"]
})

export const metadata: Metadata = {
  title: "IndiaForBTS | Indian BTS ARMY Hub",
  description: "Streaming coordination platform for Indian BTS ARMY fans. Join missions, track charts, and connect with the community."
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} min-h-screen bg-[#0a0514] font-body`}>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
