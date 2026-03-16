"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useTransition } from "react"
import { AlertTriangle, CheckCircle2, Cloud, Link2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type MissionActionsProps = {
  isAuthenticated: boolean
  lastfmConnection: {
    username: string
    verificationStatus: "pending" | "verified" | "failed"
    lastSuccessfulSyncAt?: string
  } | null
  streamPointValue: number
  verificationBlockedReason?: string
}

export function MissionActions({
  isAuthenticated,
  lastfmConnection,
  streamPointValue,
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

  const connectionStatus = lastfmConnection?.verificationStatus ?? "pending"
  const connectionStatusLabel = lastfmConnection ? connectionStatus : "not connected"
  const statusCopy = lastfmConnection
    ? connectionStatus === "verified"
      ? `Connected as @${lastfmConnection.username}`
      : connectionStatus === "failed"
        ? `Connection for @${lastfmConnection.username} needs attention`
        : `Connection for @${lastfmConnection.username} is pending verification`
    : "Connect Last.fm to start verifying BTS-family streams."
  const statusTextClassName = lastfmConnection
    ? connectionStatus === "verified"
      ? "text-[hsl(160,80%,72%)]"
      : connectionStatus === "failed"
        ? "text-[hsl(0,80%,80%)]"
        : "text-[hsl(265,15%,72%)]"
    : "text-[hsl(265,15%,72%)]"

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,30,62,0.92),rgba(11,18,38,0.95))] shadow-[0_28px_60px_-32px_rgba(0,0,0,0.85)] sm:rounded-[1.75rem]">
      <div className="grid gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8">
        <div className="flex flex-col gap-4 sm:gap-5 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.15rem] border border-primary/15 bg-primary/10 text-primary shadow-[0_0_40px_-16px_rgba(139,74,255,0.7)] sm:h-16 sm:w-16 sm:rounded-[1.35rem]">
            <Cloud className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-heading text-xl font-semibold text-foreground">Last.fm Verification</h2>
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                  connectionStatus === "verified"
                    ? "border-[hsl(160,80%,72%)]/25 bg-[hsl(160,80%,72%)]/10 text-[hsl(160,80%,72%)]"
                    : connectionStatus === "failed"
                      ? "border-[hsl(0,80%,70%)]/25 bg-[hsl(0,80%,70%)]/10 text-[hsl(0,80%,80%)]"
                      : "border-white/10 bg-white/6 text-[hsl(265,15%,68%)]"
                ].join(" ")}
              >
                {connectionStatus === "verified" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : connectionStatus === "failed" ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <Link2 className="h-3.5 w-3.5" />
                )}
                {connectionStatusLabel}
              </span>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-[hsl(265,15%,66%)]">
              Connect Last.fm once, then refresh whenever you finish a listening block. Every verified BTS-family
              stream is worth {streamPointValue} {streamPointValue === 1 ? "point" : "points"}. Album completion
              missions are computed from those same verified track events from the assigned album, not from a
              separate ingestion system.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={["inline-flex items-center gap-2", statusTextClassName].join(" ")}>{statusCopy}</span>
              {lastfmConnection?.lastSuccessfulSyncAt ? (
                <span className="text-[hsl(265,15%,62%)]">
                  Last successful sync: {new Date(lastfmConnection.lastSuccessfulSyncAt).toLocaleString("en-IN")}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="w-full space-y-3 lg:w-auto">
          <div className="grid gap-3 md:grid-cols-[minmax(15rem,1fr)_auto_auto]">
            <div className="relative">
              <label
                className="absolute left-4 top-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(265,15%,55%)]"
                htmlFor="lastfm-username"
              >
                Username
              </label>
              <Input
                className="h-12 rounded-[1rem] border-white/10 bg-[rgba(8,19,41,0.9)] px-4 pb-2.5 pt-6 text-white placeholder:text-[hsl(265,15%,52%)] focus:border-primary/50 focus:ring-primary/15 sm:h-14 sm:rounded-2xl sm:pb-3 sm:pt-7"
                disabled={!isAuthenticated}
                id="lastfm-username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Last.fm username"
                value={username}
              />
            </div>

            <Button
              className="h-12 w-full rounded-[1rem] border border-white/12 bg-white/5 px-5 text-sm text-[hsl(265,15%,78%)] hover:bg-white/10 md:w-auto md:rounded-2xl sm:h-14"
              disabled={isPending || !canConnect}
              onClick={connectLastFm}
              variant="ghost"
            >
              {lastfmConnection ? "Update Last.fm" : "Connect Last.fm"}
            </Button>

            <Button
              className="h-12 w-full rounded-[1rem] bg-gradient-to-r from-[hsl(265,70%,65%)] to-[hsl(265,80%,58%)] px-6 text-sm font-bold text-white shadow-[0_16px_40px_-18px_rgba(139,74,255,0.9)] hover:brightness-110 md:w-auto md:rounded-2xl sm:h-14"
              disabled={isPending || !canVerify}
              onClick={verifyMissions}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh mission progress
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(265,15%,66%)]">
            {!isAuthenticated ? (
              <p>
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

            <p>
              Verified streams still score as normal. Album missions only add their mission-completion reward points
              after the assigned album objective is fully completed.
            </p>
            {verificationBlockedReason ? <p>{verificationBlockedReason}</p> : null}
            {feedback ? <p className="font-medium text-foreground">{feedback}</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
