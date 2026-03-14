import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "IndiaForBTS | Indian BTS ARMY Hub",
  description: "Streaming coordination platform for Indian BTS ARMY fans. Join missions, track charts, and connect with the community."
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-body">
        {children}
      </body>
    </html>
  )
}
