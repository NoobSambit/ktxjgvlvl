"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { AlertTriangle, ArrowRight, CheckCircle2, Link2, RefreshCcw, Trash2, X } from "lucide-react"
import { TrackerProviderPicker } from "@/components/trackers/tracker-provider-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardPill } from "@/components/dashboard/dashboard-shell"
import type { TrackerProvider } from "@/platform/integrations/trackers/base"
import { getTrackerProviderConfig } from "@/modules/trackers/provider-config"
import type { MissionPageState } from "@/modules/missions/types"

type TrackerConnectionManagerProps = {
  isAuthenticated: boolean
  trackerConnection: MissionPageState["trackerConnection"]
  streamPointValue: number
  triggerVariant?: "button" | "status-card"
  verificationBlockedReason?: string
}

export function TrackerConnectionManager({
  isAuthenticated,
  trackerConnection,
  streamPointValue,
  triggerVariant = "button",
  verificationBlockedReason
}: TrackerConnectionManagerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
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

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  const activeProvider = trackerConnection?.provider
  const selectedProviderConfig = getTrackerProviderConfig(selectedProvider)
  const activeProviderConfig = activeProvider ? getTrackerProviderConfig(activeProvider) : null
  const displayName = activeProviderConfig?.displayName ?? selectedProviderConfig.displayName
  const connectionStatus = trackerConnection?.verificationStatus ?? "pending"
  const canConnect =
    isAuthenticated &&
    username.trim().length >= 2 &&
    (!trackerConnection || trackerConnection.provider === selectedProvider)
  const canDisconnect = Boolean(trackerConnection) && isAuthenticated
  const canRefresh = Boolean(trackerConnection) && !verificationBlockedReason
  const statusTone =
    connectionStatus === "verified" ? "teal" : connectionStatus === "failed" ? "rose" : "saffron"
  const statusIcon =
    connectionStatus === "verified" ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : connectionStatus === "failed" ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <Link2 className="h-4 w-4" />
    )
  const statusIconClassName =
    connectionStatus === "verified"
      ? "text-[hsl(170,60%,55%)]"
      : connectionStatus === "failed"
        ? "text-[hsl(320,65%,72%)]"
        : "text-[hsl(35,100%,78%)]"
  const trackerStatusValue = trackerConnection ? displayName : "Needs setup"
  const trackerStatusDescription = trackerConnection
    ? `Active tracker: ${displayName}. Open controls, sync progress, or update this username.`
    : "Connect Last.fm, stats.fm, or Musicat to start counting verified listening."

  async function handleConnect() {
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

  async function handleDisconnect() {
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
      setOpen(false)
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : `Could not disconnect ${displayName}.`)
    }
  }

  async function handleRefresh() {
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
    <>
      {triggerVariant === "status-card" ? (
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          className="group relative block h-full w-full cursor-pointer overflow-hidden rounded-[1.15rem] border border-[hsl(265,70%,65%)]/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.03))] p-3.5 sm:p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_34px_-24px_rgba(154,102,255,0.45)] transition duration-200 hover:-translate-y-0.5 hover:border-[hsl(265,70%,65%)]/34 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_46px_-24px_rgba(154,102,255,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(265,70%,72%)]/50 focus-visible:ring-offset-0"
          onClick={() => setOpen(true)}
          type="button"
        >
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white/72">
              <span className={statusIconClassName}>{statusIcon}</span>
              <span>Tracker status</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[11px] font-medium text-white/68 transition group-hover:border-[hsl(265,70%,65%)]/28 group-hover:text-white/88">
              Manage
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-lg font-semibold text-white">{trackerStatusValue}</p>
            <p className="text-sm leading-relaxed text-white/58">{trackerStatusDescription}</p>
          </div>
        </button>
      ) : (
        <Button
          className="h-10 rounded-full border border-white/12 bg-white/5 px-4 text-sm text-white/84 hover:bg-white/10"
          onClick={() => setOpen(true)}
          variant="ghost"
        >
          <Link2 className="mr-2 h-4 w-4" />
          {trackerConnection ? `Manage ${displayName}` : "Connect tracker"}
        </Button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-[100] bg-[rgba(4,4,12,0.78)] backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-full items-end justify-center p-2 sm:items-center sm:p-6">
            <div
              aria-label="Manage tracker"
              aria-modal="true"
              className="w-full max-w-xl overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(26,18,46,0.99),rgba(13,10,26,1))] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95)]"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
            >
              <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-3">
                    <DashboardPill tone={statusTone}>{trackerConnection ? connectionStatus : "not connected"}</DashboardPill>
                    <div>
                      <h3 className="font-heading text-2xl font-semibold text-white">Manage tracker</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/66">
                        Connect one tracker at a time. Disconnect the current tracker before switching providers.
                        Verified BTS-family streams are worth {streamPointValue}{" "}
                        {streamPointValue === 1 ? "point" : "points"} each.
                      </p>
                    </div>
                  </div>

                  <button
                    aria-label="Close tracker manager"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white transition hover:bg-white/10"
                    onClick={() => setOpen(false)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5 px-5 py-5 sm:px-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-white/78">Choose tracker</p>
                  <TrackerProviderPicker
                    activeProvider={trackerConnection?.provider}
                    disabled={!isAuthenticated || isPending}
                    onSelect={setSelectedProvider}
                    selectedProvider={selectedProvider}
                  />
                  {trackerConnection ? (
                    <p className="text-sm text-white/56">
                      Disconnect {displayName} before switching to another tracker.
                    </p>
                  ) : null}
                </div>

                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-white">
                    {statusIcon}
                    <p className="font-medium">
                      {trackerConnection
                        ? `${displayName} connected as @${trackerConnection.username}`
                        : "No tracker connected"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {trackerConnection
                      ? trackerConnection.lastSuccessfulSyncAt
                        ? `Last successful sync: ${new Date(trackerConnection.lastSuccessfulSyncAt).toLocaleString("en-IN")}`
                        : "Connection exists, but no successful sync has been recorded yet."
                      : "Connect a tracker username to start verifying mission progress."}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/78" htmlFor="dashboard-tracker-username">
                    {selectedProviderConfig.usernameLabel}
                  </label>
                  <Input
                    className="h-12 rounded-[1rem] border-white/10 bg-[rgba(8,19,41,0.9)] text-white placeholder:text-[hsl(265,15%,52%)] focus:border-primary/50 focus:ring-primary/15"
                    disabled={!isAuthenticated || isPending}
                    id="dashboard-tracker-username"
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder={selectedProviderConfig.usernamePlaceholder}
                    value={username}
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className="h-11 rounded-full px-5"
                    disabled={isPending || !canConnect}
                    onClick={handleConnect}
                  >
                    {trackerConnection ? `Update ${displayName}` : `Connect ${selectedProviderConfig.displayName}`}
                  </Button>

                  <Button
                    className="h-11 rounded-full border border-white/12 bg-white/5 px-5 text-white/84 hover:bg-white/10"
                    disabled={isPending || !canRefresh}
                    onClick={handleRefresh}
                    variant="ghost"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Sync progress
                  </Button>

                  <Button
                    className="h-11 rounded-full border border-[hsl(0,80%,70%)]/20 bg-[hsl(0,80%,70%)]/10 px-5 text-[hsl(0,100%,90%)] hover:bg-[hsl(0,80%,70%)]/16"
                    disabled={isPending || !canDisconnect}
                    onClick={handleDisconnect}
                    variant="ghost"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove connection
                  </Button>
                </div>

                <div className="space-y-2 text-sm text-white/62">
                  {!isAuthenticated ? (
                    <p>
                      <Link className="font-medium text-white hover:underline" href="/signin">
                        Sign in
                      </Link>{" "}
                      or{" "}
                      <Link className="font-medium text-white hover:underline" href="/signup">
                        join now
                      </Link>{" "}
                      before connecting or removing a tracker.
                    </p>
                  ) : null}

                  {verificationBlockedReason ? <p>{verificationBlockedReason}</p> : null}
                  {feedback ? <p className="font-medium text-white">{feedback}</p> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
