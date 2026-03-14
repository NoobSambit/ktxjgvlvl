"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export function SignOutButton() {
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
        className="inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-foreground/5"
        disabled={isPending}
        onClick={signOut}
        type="button"
      >
        Sign out
      </button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  )
}
