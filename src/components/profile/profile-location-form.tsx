"use client"

import Link from "next/link"
import { LocateFixed, MapPin, ShieldCheck, TriangleAlert } from "lucide-react"
import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LocationSearchSelect, type LocationSearchOption } from "@/components/locations/location-search-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserProfileView } from "@/modules/users/types"

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

type ProfileLocationFormProps = {
  profile: UserProfileView
}

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

function getCityModeLabel(cityMode: UserProfileView["cityMode"]) {
  if (cityMode === "confirmed") {
    return "Confirmed city"
  }

  if (cityMode === "ip_fallback") {
    return "IP fallback city"
  }

  return "City missing"
}

export function ProfileLocationForm({ profile }: ProfileLocationFormProps) {
  const router = useRouter()
  const [stateOption, setStateOption] = useState<LocationSearchOption | null>(
    profile.stateKey && profile.stateLabel
      ? {
          key: profile.stateKey,
          label: profile.stateLabel
        }
      : null
  )
  const [cityOption, setCityOption] = useState<LocationSearchOption | null>(
    profile.cityMode === "confirmed" && profile.cityKey && profile.cityLabel
      ? {
          key: profile.cityKey,
          label: profile.cityLabel
        }
      : null
  )
  const [suggestion, setSuggestion] = useState<LocationSuggestion>(
    profile.suggestedCityKey && profile.suggestedCityLabel && profile.stateKey
      ? {
          confidence: "medium",
          state: profile.stateKey
            ? {
                stateKey: profile.stateKey,
                stateLabel: profile.stateLabel,
                stateCode: ""
              }
            : undefined,
          place: {
            placeKey: profile.suggestedCityKey,
            placeLabel: profile.suggestedCityLabel,
            stateKey: profile.stateKey
          }
        }
      : null
  )
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (suggestion || cityOption) {
      return
    }

    let ignore = false

    fetch("/api/v1/locations/suggestion", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { suggestion?: LocationSuggestion }) => {
        if (!ignore) {
          setSuggestion(data.suggestion ?? null)
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
  }, [cityOption, suggestion])

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

  async function handleSave() {
    if (!stateOption) {
      setMessage("Select a valid state before saving.")
      return
    }

    setMessage("")

    try {
      const response = await fetch("/api/v1/profile/location", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          stateKey: stateOption.key,
          cityKey: cityOption?.key
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Location update failed.")
      }

      setMessage("Location updated.")
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Location update failed.")
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
            <MapPin className="h-5 w-5 text-[hsl(265,70%,55%)]" />
            Current Location
          </CardTitle>
          <CardDescription className="text-slate-600">
            Leaderboards trust only your confirmed state. City or town only improves hotspot placement on the India
            activity map.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.locationNeedsReview ? (
            <div className="rounded-[1.5rem] border border-[hsl(25,90%,55%)]/25 bg-[hsl(25,90%,55%)]/10 p-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(25,90%,55%)]" />
                <div>
                  <p className="font-semibold text-slate-900">Location review needed</p>
                  <p className="mt-1">
                    We kept your existing location labels, but they need to be matched to the new canonical India
                    registry.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">State</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{profile.stateLabel}</p>
              <p className="mt-1 text-sm text-slate-600">Required for signup and all leaderboard scoring.</p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">City status</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{getCityModeLabel(profile.cityMode)}</p>
              <p className="mt-1 text-sm text-slate-600">
                {profile.cityLabel ?? profile.suggestedCityLabel ?? "No city selected yet"}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[hsl(170,60%,40%)]/20 bg-[hsl(170,60%,40%)]/10 p-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(170,60%,40%)]" />
              <div>
                <p className="font-semibold text-slate-900">Scoring is state-only in this pass.</p>
                <p className="mt-1">
                  Changing or skipping your city won&apos;t block missions or stream verification. It only affects how
                  your activity is grouped into map hotspots.
                </p>
              </div>
            </div>
          </div>

          {profile.cityMode === "ip_fallback" && profile.suggestedCityLabel ? (
            <div className="rounded-[1.5rem] border border-[hsl(265,70%,55%)]/20 bg-[hsl(265,70%,55%)]/10 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Unconfirmed fallback city</p>
              <p className="mt-1">
                We matched <span className="font-semibold">{profile.suggestedCityLabel}</span> to your confirmed state.
                Confirm it below if it looks right.
              </p>
            </div>
          ) : null}

          <Link className="inline-flex text-sm font-medium text-[hsl(265,70%,55%)] hover:underline" href="/dashboard">
            Return to dashboard
          </Link>
        </CardContent>
      </Card>

      <Card className="bg-white/90">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Edit Location</CardTitle>
          <CardDescription className="text-slate-600">
            Update your confirmed state and optionally add a city or town from the canonical India registry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LocationSearchSelect
            helperText="State is mandatory and remains the only competitive location field."
            label="State"
            placeholder="Select your state or UT"
            required
            search={searchStates}
            searchPlaceholder="Search states and union territories"
            selectedOption={stateOption}
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
                ? "Optional. Search within the selected state only."
                : "Choose a state before searching for a city or town."
            }
            label="City or Town"
            minQueryLength={2}
            placeholder={stateOption ? "Search within your state" : "Choose state first"}
            search={searchPlaces}
            searchPlaceholder="Type at least 2 characters"
            selectedOption={cityOption}
            onClear={() => setCityOption(null)}
            onSelect={(option) => setCityOption(option)}
          />

          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-black/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">Need help filling your city?</p>
              <p className="text-xs text-slate-600">
                You can keep state-only scoring, or confirm a suggested city when the detected state matches.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedCityOption && !cityOption ? (
                <Button onClick={() => setCityOption(suggestedCityOption)} size="sm" type="button" variant="secondary">
                  <LocateFixed className="mr-1 h-4 w-4" />
                  Use {suggestedCityOption.label}
                </Button>
              ) : null}
              <Button onClick={() => setCityOption(null)} size="sm" type="button" variant="ghost">
                Keep state only
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">Saving without a city keeps state scoring intact and stores no confirmed city.</p>
            <Button disabled={isPending || !stateOption} onClick={handleSave} type="button">
              Save location
            </Button>
          </div>

          {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
