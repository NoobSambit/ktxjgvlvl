import type { Metadata } from "next"
import { Manrope, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { RouteProgress } from "@/components/shared/route-progress"

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap"
})

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap"
})

export const metadata: Metadata = {
  title: "IndiaForBTS | Indian BTS ARMY Hub",
  description: "Streaming coordination platform for Indian BTS ARMY fans. Join missions, track charts, and connect with the community."
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} min-h-screen bg-[#0a0514] font-body`}>
        <RouteProgress />
        {children}
      </body>
    </html>
  )
}
