"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignInForm() {
  const router = useRouter()
  const [identity, setIdentity] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    try {
      const response = await fetch("/api/v1/auth/signin", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          identity,
          password
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Sign in failed.")
      }

      startTransition(() => {
        router.push("/dashboard")
        router.refresh()
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign in failed.")
    }
  }

  return (
    <form className="space-y-5 text-white" onSubmit={handleSubmit}>
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-white" htmlFor="identity">
          Username or email
        </label>
        <Input
          className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-[hsl(265,70%,65%)]/45 focus:ring-[hsl(265,70%,65%)]/12"
          id="identity"
          onChange={(event) => setIdentity(event.target.value)}
          placeholder="armyname or army@email.com"
          value={identity}
        />
      </div>
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-white" htmlFor="password">
          Password
        </label>
        <Input
          className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-[hsl(265,70%,65%)]/45 focus:ring-[hsl(265,70%,65%)]/12"
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          type="password"
          value={password}
        />
      </div>

      <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-4 text-sm text-white/72">
        Use the username or email you registered with. Once you&apos;re in, your missions, trackers, and state rank
        resume from where you left off.
      </div>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Button
          className="h-12 rounded-2xl bg-gradient-to-r from-[hsl(265,70%,65%)] via-[hsl(320,65%,70%)] to-[hsl(25,90%,55%)] px-6 text-white shadow-[0_18px_40px_-18px_rgba(186,146,255,0.75)] transition hover:scale-[1.01] hover:opacity-95"
          disabled={isPending || identity.trim().length < 2 || password.length < 6}
          type="submit"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-white/72 transition hover:text-white"
          href="/signup"
        >
          Need an account?
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {message ? (
        <p className="rounded-[1.2rem] border border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 px-4 py-3 text-sm font-medium text-white">
          {message}
        </p>
      ) : null}
    </form>
  )
}
