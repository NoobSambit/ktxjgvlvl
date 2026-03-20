"use client"

import { Loader2, LocateFixed, MapPin } from "lucide-react"
import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LocationSearchSelect, type LocationSearchOption } from "@/components/locations/location-search-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type StateResult = {
  stateKey: string
  stateLabel: string
  stateCode: string
}

type PlaceResult = {
  placeKey: string
  placeLabel: string
  secondaryLabel?: string
  stateKey: string
}

type LocationSuggestion = {
  confidence: "low" | "medium" | "high"
  state?: StateResult
  place?: PlaceResult
} | null

function toStateOption(state: StateResult): LocationSearchOption {
  return {
    key: state.stateKey,
    label: state.stateLabel,
    secondaryLabel: state.stateCode
  }
}

function toPlaceOption(place: PlaceResult): LocationSearchOption {
  return {
    key: place.placeKey,
    label: place.placeLabel,
    secondaryLabel: place.secondaryLabel
  }
}

export function SignUpForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [stateOption, setStateOption] = useState<LocationSearchOption | null>(null)
  const [cityOption, setCityOption] = useState<LocationSearchOption | null>(null)
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [suggestion, setSuggestion] = useState<LocationSuggestion>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let ignore = false

    fetch("/api/v1/locations/suggestion", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { suggestion?: LocationSuggestion }) => {
        if (ignore) {
          return
        }

        const nextSuggestion = data.suggestion ?? null
        setSuggestion(nextSuggestion)

        if (nextSuggestion?.state) {
          setStateOption((current) => current ?? toStateOption(nextSuggestion.state!))
        }
      })
      .catch(() => {
        if (!ignore) {
          setSuggestion(null)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const suggestedCityOption = useMemo(() => {
    if (!suggestion?.place || !suggestion.state || !stateOption) {
      return null
    }

    return suggestion.state.stateKey === stateOption.key ? toPlaceOption(suggestion.place) : null
  }, [stateOption, suggestion])

  async function searchStates(query: string) {
    const params = new URLSearchParams()

    if (query) {
      params.set("q", query)
    }

    const response = await fetch(`/api/v1/locations/states?${params.toString()}`, {
      cache: "no-store"
    })
    const data = (await response.json()) as { states?: StateResult[] }

    return (data.states ?? []).map(toStateOption)
  }

  async function searchPlaces(query: string) {
    if (!stateOption) {
      return []
    }

    const params = new URLSearchParams({
      stateKey: stateOption.key,
      q: query
    })
    const response = await fetch(`/api/v1/locations/places?${params.toString()}`, {
      cache: "no-store"
    })
    const data = (await response.json()) as { places?: PlaceResult[] }

    return (data.places ?? []).map(toPlaceOption)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
          stateKey: stateOption?.key,
          cityKey: cityOption?.key,
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
    <form className="grid gap-5 text-white md:grid-cols-2" onSubmit={handleSubmit}>
      <div className="space-y-2.5">
        <label className="text-sm font-medium text-white" htmlFor="username">
          Username
        </label>
        <Input
          className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-[hsl(265,70%,65%)]/45 focus:ring-[hsl(265,70%,65%)]/12"
          id="username"
          onChange={(event) => setUsername(event.target.value)}
          placeholder="purplearmyroom"
          value={username}
        />
      </div>

      <div className="space-y-2.5">
        <label className="text-sm font-medium text-white" htmlFor="email">
          Email (optional)
        </label>
        <Input
          className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-[hsl(265,70%,65%)]/45 focus:ring-[hsl(265,70%,65%)]/12"
          id="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="army@email.com"
          type="email"
          value={email}
        />
      </div>

      <div className="space-y-4 md:col-span-2">
        <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(265,70%,65%)]/15 text-[hsl(265,70%,65%)]">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Set your India location</p>
              <p className="text-sm leading-6 text-white/68">
                Your confirmed state is required for leaderboard scoring. City or town is optional and only improves
                activity-map hotspots.
              </p>
            </div>
          </div>
        </div>

        <LocationSearchSelect
          helperText={
            suggestion?.state
              ? `Detected from your connection: ${suggestion.state.stateLabel}. You can keep it or choose another state.`
              : "Search all states and union territories. This field is required."
          }
          label="State"
          placeholder="Select your state or UT"
          required
          search={searchStates}
          searchPlaceholder="Search states and union territories"
          selectedOption={stateOption}
          tone="dark"
          onClear={() => {
            setStateOption(null)
            setCityOption(null)
          }}
          onSelect={(option) => {
            setStateOption(option)
            setCityOption(null)
          }}
        />

        <LocationSearchSelect
          disabled={!stateOption}
          emptyText={
            stateOption
              ? "No city or town matched that search in the selected state."
              : "Pick a state first."
          }
          helperText={
            stateOption
              ? "Optional. Search only within the state you selected, or skip this for now."
              : "Choose a state before searching for a city or town."
          }
          label="City or Town"
          minQueryLength={2}
          placeholder={stateOption ? "Search within your state" : "Choose state first"}
          search={searchPlaces}
          searchPlaceholder="Type at least 2 characters"
          selectedOption={cityOption}
          tone="dark"
          onClear={() => setCityOption(null)}
          onSelect={(option) => setCityOption(option)}
        />

        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">City is optional in this step.</p>
            <p className="text-xs leading-5 text-white/58">
              If you skip it and we can safely match your IP suggestion to the same state, we&apos;ll save it as an
              unconfirmed hotspot hint only.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedCityOption && !cityOption ? (
              <Button
                className="rounded-full bg-white/10 text-white hover:bg-white/15"
                onClick={() => setCityOption(suggestedCityOption)}
                size="sm"
                type="button"
                variant="secondary"
              >
                <LocateFixed className="mr-1 h-4 w-4" />
                Use {suggestedCityOption.label}
              </Button>
            ) : null}
            <Button
              className="rounded-full border border-white/10 text-white/75 hover:bg-white/10 hover:text-white"
              onClick={() => setCityOption(null)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Skip city for now
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 md:col-span-2">
        <label className="text-sm font-medium text-white" htmlFor="password">
          Password
        </label>
        <Input
          className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/35 focus:border-[hsl(265,70%,65%)]/45 focus:ring-[hsl(265,70%,65%)]/12"
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
          type="password"
          value={password}
        />
      </div>

      <div className="flex flex-col gap-3 pt-1 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          className="h-12 rounded-2xl bg-gradient-to-r from-[hsl(265,70%,65%)] via-[hsl(320,65%,70%)] to-[hsl(25,90%,55%)] px-6 text-white shadow-[0_18px_40px_-18px_rgba(186,146,255,0.75)] transition hover:scale-[1.01] hover:opacity-95"
          disabled={isPending || username.trim().length < 3 || !stateOption || password.length < 6}
          type="submit"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? "Creating account..." : "Create account"}
        </Button>
        <Link className="text-sm font-medium text-white/72 transition hover:text-white" href="/signin">
          Already have an account? Sign in
        </Link>
      </div>

      <p className="text-sm leading-6 text-white/58 md:col-span-2">
        Tracker setup comes next. State leaderboards start counting as soon as your account is ready.
      </p>

      {message ? (
        <p className="rounded-[1.2rem] border border-[hsl(25,90%,55%)]/20 bg-[hsl(25,90%,55%)]/10 px-4 py-3 text-sm font-medium text-white md:col-span-2">
          {message}
        </p>
      ) : null}
    </form>
  )
}
