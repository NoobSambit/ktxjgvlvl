"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
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
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="identity">
          Username or email
        </label>
        <Input
          id="identity"
          onChange={(event) => setIdentity(event.target.value)}
          placeholder="armyname or army@email.com"
          value={identity}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          type="password"
          value={password}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button disabled={isPending || identity.trim().length < 2 || password.length < 6} type="submit">
          Sign in
        </Button>
        <p className="text-sm text-muted-foreground">Use the username or email you registered with.</p>
      </div>
      {message ? <p className="text-sm font-medium text-foreground">{message}</p> : null}
    </form>
  )
}
