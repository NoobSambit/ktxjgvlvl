"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type MissionActionsProps = {
  isAuthenticated: boolean
  lastfmConnection: {
    username: string
    verificationStatus: "pending" | "verified" | "failed"
  } | null
  verificationBlockedReason?: string
}

export function MissionActions({
  isAuthenticated,
  lastfmConnection,
  verificationBlockedReason
}: MissionActionsProps) {
  const router = useRouter()
  const [username, setUsername] = useState(lastfmConnection?.username ?? "")
  const [feedback, setFeedback] = useState("")
  const [isPending, startTransition] = useTransition()

  const canConnect = isAuthenticated && username.trim().length >= 2
  const canVerify = Boolean(lastfmConnection) && !verificationBlockedReason

  async function connectLastFm() {
    setFeedback("")

    try {
      const response = await fetch("/api/v1/tracker-connections", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          provider: "lastfm",
          username
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Could not connect Last.fm.")
      }

      setFeedback("Last.fm connected.")
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not connect Last.fm.")
    }
  }

  async function verifyMissions() {
    setFeedback("")

    try {
      const response = await fetch("/api/v1/missions/verify", {
        method: "POST"
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Mission verification failed.")
      }

      setFeedback("Mission progress refreshed.")
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Mission verification failed.")
    }
  }

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-border/80 bg-white/82 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold">Mission verification</p>
        <p className="text-sm text-muted-foreground">
          Connect Last.fm once, then refresh progress whenever you finish a listening block.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <Input
          disabled={!isAuthenticated}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Last.fm username"
          value={username}
        />
        <Button disabled={isPending || !canConnect} onClick={connectLastFm} variant="secondary">
          {lastfmConnection ? "Update Last.fm" : "Connect Last.fm"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isPending || !canVerify} onClick={verifyMissions}>
          Refresh mission progress
        </Button>
        {lastfmConnection ? (
          <p className="text-sm text-muted-foreground">
            Connected as <span className="font-medium text-foreground">@{lastfmConnection.username}</span>
          </p>
        ) : null}
      </div>

      {!isAuthenticated ? (
        <p className="text-sm text-muted-foreground">
          <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/signin">
            Sign in
          </Link>{" "}
          or{" "}
          <Link className="font-medium text-foreground underline-offset-4 hover:underline" href="/signup">
            join now
          </Link>{" "}
          before connecting Last.fm or verifying mission progress.
        </p>
      ) : null}

      {verificationBlockedReason ? (
        <p className="text-sm text-muted-foreground">{verificationBlockedReason}</p>
      ) : null}

      {feedback ? <p className="text-sm font-medium text-foreground">{feedback}</p> : null}
    </div>
  )
}
