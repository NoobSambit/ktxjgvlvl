"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import {
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Cloud,
  Link2,
  MapPinned,
  Radio,
  RefreshCcw,
  Trash2,
  UserRound
} from "lucide-react"
import { TrackerProviderPicker } from "@/components/trackers/tracker-provider-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { MissionPageState } from "@/modules/missions/types"
import { getTrackerProviderConfig } from "@/modules/trackers/provider-config"
import type { TrackerProvider } from "@/platform/integrations/trackers/base"

type MissionActionsProps = {
  isAuthenticated: boolean
  regionConfirmed: boolean
  state?: string
  trackerConnection: MissionPageState["trackerConnection"]
  streamPointValue: number
  verificationBlockedReason?: string
}

function StatusTile({
  icon: Icon,
  label,
  value,
  tone = "neutral"
}: {
  icon: typeof Radio
  label: string
  value: string
  tone?: "neutral" | "success" | "warning"
}) {
  return (
    <div className="min-w-0 rounded-[1rem] border border-white/10 bg-white/[0.03] p-2.5 sm:p-3">
      <div className="flex items-center gap-1.5 text-white/48 sm:gap-2">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p
        className={cn(
          "mt-1.5 break-words text-[13px] font-medium leading-5 sm:mt-2 sm:text-sm",
          tone === "success"
            ? "text-[hsl(154,80%,72%)]"
            : tone === "warning"
              ? "text-[hsl(35,100%,88%)]"
              : "text-white"
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function MissionActions({
  isAuthenticated,
  regionConfirmed,
  state,
  trackerConnection,
  streamPointValue,
  verificationBlockedReason
}: MissionActionsProps) {
  const router = useRouter()
  const [selectedProvider, setSelectedProvider] = useState<TrackerProvider>(
    trackerConnection?.provider ?? "lastfm"
  )
  const [username, setUsername] = useState(trackerConnection?.username ?? "")
  const [feedback, setFeedback] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (trackerConnection) {
      setSelectedProvider(trackerConnection.provider)
    }

    setUsername(trackerConnection?.username ?? "")
  }, [trackerConnection])

  const activeProviderConfig = trackerConnection
    ? getTrackerProviderConfig(trackerConnection.provider)
    : null
  const selectedProviderConfig = getTrackerProviderConfig(selectedProvider)
  const displayName = activeProviderConfig?.displayName ?? selectedProviderConfig.displayName
  const canConnect =
    isAuthenticated &&
    username.trim().length >= 2 &&
    (!trackerConnection || trackerConnection.provider === selectedProvider)
  const canVerify = Boolean(trackerConnection) && !verificationBlockedReason
  const canDisconnect = Boolean(trackerConnection) && isAuthenticated
  const connectionStatus = trackerConnection?.verificationStatus ?? "missing"
  const connectionStatusLabel =
    connectionStatus === "verified"
      ? "Connected"
      : connectionStatus === "failed"
        ? "Fix needed"
        : connectionStatus === "pending"
          ? "Checking"
          : "Not connected"
  const statusCopy = trackerConnection
    ? connectionStatus === "verified"
      ? `${displayName} is connected as @${trackerConnection.username}.`
      : connectionStatus === "failed"
        ? `We could not read @${trackerConnection.username} on ${displayName}. Please check it.`
        : `${displayName} for @${trackerConnection.username} is still being checked.`
    : "Connect one music app, then update your progress after a listening session."
  const [isMobileSetupOpen, setIsMobileSetupOpen] = useState(connectionStatus !== "verified")

  useEffect(() => {
    if (connectionStatus !== "verified") {
      setIsMobileSetupOpen(true)
    }
  }, [connectionStatus])

  async function connectTracker() {
    setFeedback("")

    try {
      const response = await fetch("/api/v1/tracker-connections", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          provider: selectedProvider,
          username
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? `Could not connect ${selectedProviderConfig.displayName}.`)
      }

      setFeedback(
        trackerConnection
          ? `${displayName} updated.`
          : `${selectedProviderConfig.displayName} connected.`
      )
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : `Could not connect ${selectedProviderConfig.displayName}.`
      )
    }
  }

  async function disconnectTracker() {
    if (!trackerConnection) {
      return
    }

    setFeedback("")

    try {
      const response = await fetch("/api/v1/tracker-connections", {
        method: "DELETE",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          provider: trackerConnection.provider
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? `Could not disconnect ${displayName}.`)
      }

      setFeedback(`${displayName} disconnected.`)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : `Could not disconnect ${displayName}.`)
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
    <section className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,23,46,0.94),rgba(9,14,31,0.96))] shadow-[0_30px_80px_-42px_rgba(0,0,0,0.88)] sm:rounded-[1.5rem]">
      <div className="space-y-3.5 p-3.5 sm:space-y-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-primary/20 bg-primary/10 text-primary shadow-[0_0_30px_-16px_rgba(139,74,255,0.7)]">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">Music connection</p>
              <h2 className="mt-1 font-heading text-xl font-semibold text-white">Connect your music app</h2>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
              connectionStatus === "verified"
                ? "border-[hsl(154,75%,55%)]/25 bg-[hsl(154,75%,55%)]/10 text-[hsl(154,80%,72%)]"
                : connectionStatus === "failed"
                  ? "border-[hsl(25,90%,55%)]/25 bg-[hsl(25,90%,55%)]/10 text-[hsl(35,100%,88%)]"
                  : "border-white/10 bg-white/6 text-white/68"
            )}
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

        <p className="text-sm leading-6 text-white/64">
          Each counted stream is worth +{streamPointValue} {streamPointValue === 1 ? "point" : "points"}. Mission
          bonuses are extra and only arrive after you finish the goal.
        </p>

        <div className="grid grid-cols-3 gap-2 xl:grid-cols-1">
          <StatusTile
            icon={UserRound}
            label="Account"
            tone={isAuthenticated ? "success" : "neutral"}
            value={isAuthenticated ? "Signed in" : "Sign in first"}
          />
          <StatusTile
            icon={MapPinned}
            label="State"
            tone={regionConfirmed ? "success" : "warning"}
            value={regionConfirmed ? state ?? "State confirmed" : "State needed"}
          />
          <StatusTile
            icon={Radio}
            label="App"
            tone={connectionStatus === "verified" ? "success" : connectionStatus === "failed" ? "warning" : "neutral"}
            value={trackerConnection ? displayName : "Connect one"}
          />
        </div>

        <div className="grid gap-2 md:hidden">
          {canVerify ? (
            <Button
              className="h-10 rounded-[0.95rem] bg-gradient-to-r from-[hsl(265,70%,65%)] to-[hsl(265,80%,58%)] px-4 text-sm font-bold text-white shadow-[0_16px_36px_-18px_rgba(139,74,255,0.9)] hover:brightness-110"
              disabled={isPending}
              onClick={verifyMissions}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh progress
            </Button>
          ) : null}

          <button
            aria-expanded={isMobileSetupOpen}
            className="inline-flex items-center justify-between gap-3 rounded-[0.95rem] border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left text-sm font-medium text-white/78 transition hover:border-white/18 hover:bg-white/[0.06] hover:text-white"
            onClick={() => setIsMobileSetupOpen((current) => !current)}
            type="button"
          >
            <span>{trackerConnection ? `Manage ${displayName}` : `Set up ${selectedProviderConfig.displayName}`}</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isMobileSetupOpen && "rotate-180")} />
          </button>
        </div>

        <div className={cn("space-y-3.5 sm:space-y-4", isMobileSetupOpen ? "block" : "hidden md:block")}>
          <TrackerProviderPicker
            activeProvider={trackerConnection?.provider}
            compactMobile
            disabled={!isAuthenticated || isPending}
            onSelect={setSelectedProvider}
            selectedProvider={selectedProvider}
          />

          <div className="relative">
            <label
              className="absolute left-4 top-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/42"
              htmlFor="tracker-username"
            >
              {selectedProviderConfig.usernameLabel}
            </label>
            <Input
              className="h-11 rounded-[1rem] border-white/10 bg-[rgba(8,19,41,0.9)] px-4 pb-2.5 pt-6 text-white placeholder:text-white/34 focus:border-primary/50 focus:ring-primary/15 sm:h-12"
              disabled={!isAuthenticated}
              id="tracker-username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder={selectedProviderConfig.usernamePlaceholder}
              value={username}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className={cn(
                "h-11 rounded-[1rem] border border-white/12 bg-white/5 px-4 text-sm text-white/78 hover:bg-white/10",
                !canVerify && "col-span-2 md:col-span-1"
              )}
              disabled={isPending || !canConnect}
              onClick={connectTracker}
              variant="ghost"
            >
              {trackerConnection ? `Update ${displayName}` : `Connect ${selectedProviderConfig.displayName}`}
            </Button>

            <Button
              className="hidden h-11 rounded-[1rem] bg-gradient-to-r from-[hsl(265,70%,65%)] to-[hsl(265,80%,58%)] px-4 text-sm font-bold text-white shadow-[0_16px_36px_-18px_rgba(139,74,255,0.9)] hover:brightness-110 md:inline-flex"
              disabled={isPending || !canVerify}
              onClick={verifyMissions}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh progress
            </Button>

            {trackerConnection ? (
              <Button
                className="col-span-2 h-11 rounded-[1rem] border border-[hsl(0,80%,70%)]/20 bg-[hsl(0,80%,70%)]/10 px-4 text-sm text-[hsl(0,100%,90%)] hover:bg-[hsl(0,80%,70%)]/16"
                disabled={isPending || !canDisconnect}
                onClick={disconnectTracker}
                variant="ghost"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            ) : null}
          </div>

          <div className="space-y-1.5 rounded-[1rem] border border-white/10 bg-white/[0.03] p-3 text-sm text-white/62 sm:space-y-2 sm:p-3.5">
            <p>{statusCopy}</p>
            {trackerConnection?.lastSuccessfulSyncAt ? (
              <p>Last update: {new Date(trackerConnection.lastSuccessfulSyncAt).toLocaleString("en-IN")}</p>
            ) : null}
            <p>Only one app can stay connected at a time. Disconnect the current one before switching.</p>
            {verificationBlockedReason ? (
              <p className="text-[hsl(35,100%,88%)]">{verificationBlockedReason}</p>
            ) : null}
            {!isAuthenticated ? (
              <p>
                <Link className="font-medium text-white underline-offset-4 hover:underline" href="/signin">
                  Sign in
                </Link>{" "}
                or{" "}
                <Link className="font-medium text-white underline-offset-4 hover:underline" href="/signup">
                  create an account
                </Link>{" "}
                before connecting your music app.
              </p>
            ) : null}
            {feedback ? <p className="font-medium text-white">{feedback}</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
