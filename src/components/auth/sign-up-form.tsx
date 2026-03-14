"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignUpForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")

    try {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          username,
          email: email.trim() || undefined,
          state,
          city,
          password
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Account creation failed.")
      }

      startTransition(() => {
        router.push("/dashboard")
        router.refresh()
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Account creation failed.")
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="username">
          Username
        </label>
        <Input
          id="username"
          onChange={(event) => setUsername(event.target.value)}
          placeholder="purplecityarmy"
          value={username}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email (optional)
        </label>
        <Input
          id="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="army@email.com"
          type="email"
          value={email}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="state">
          State
        </label>
        <Input
          id="state"
          onChange={(event) => setState(event.target.value)}
          placeholder="Maharashtra"
          value={state}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="city">
          City
        </label>
        <Input id="city" onChange={(event) => setCity(event.target.value)} placeholder="Mumbai" value={city} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
          type="password"
          value={password}
        />
      </div>
      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          disabled={
            isPending ||
            username.trim().length < 3 ||
            state.trim().length < 2 ||
            city.trim().length < 2 ||
            password.length < 6
          }
          type="submit"
        >
          Create account
        </Button>
        <p className="text-sm text-muted-foreground">Tracker setup can be done right after account creation.</p>
      </div>
      {message ? <p className="md:col-span-2 text-sm font-medium text-foreground">{message}</p> : null}
    </form>
  )
}
