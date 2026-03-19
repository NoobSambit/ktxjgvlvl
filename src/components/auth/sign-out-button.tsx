"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"

export function SignOutButton({ className, children }: { className?: string, children?: React.ReactNode }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  async function signOut() {
    setMessage("")

    try {
      const response = await fetch("/api/v1/auth/signout", {
        method: "POST"
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Could not sign out.")
      }

      setMessage("")
      startTransition(() => {
        router.refresh()
        router.push("/")
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign out.")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        className={cn(
          "inline-flex items-center justify-center transition-colors hover:bg-foreground/5",
          !children && "h-9 rounded-full px-4 text-sm font-semibold",
          className
        )}
        disabled={isPending}
        onClick={signOut}
        type="button"
        title="Sign Out"
      >
        {children || "Sign out"}
        {!children && <LogOut className="ml-2 w-4 h-4" />}
      </button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  )
}
