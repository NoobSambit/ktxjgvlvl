import { TRACKER_PROVIDERS, type TrackerProvider } from "@/platform/integrations/trackers/base"

export type TrackerProviderConfig = {
  provider: TrackerProvider
  displayName: string
  usernameLabel: string
  usernamePlaceholder: string
  verificationLabel: string
  helperText: string
}

const trackerProviderConfigMap: Record<TrackerProvider, TrackerProviderConfig> = {
  lastfm: {
    provider: "lastfm",
    displayName: "Last.fm",
    usernameLabel: "Last.fm username",
    usernamePlaceholder: "Last.fm username",
    verificationLabel: "Last.fm scrobble verification",
    helperText: "Use your Last.fm username so the site can count your listening."
  },
  musicat: {
    provider: "musicat",
    displayName: "Musicat",
    usernameLabel: "Musicat username",
    usernamePlaceholder: "Musicat username",
    verificationLabel: "Musicat listening verification",
    helperText: "Use your Musicat username so the site can count your listening."
  },
  statsfm: {
    provider: "statsfm",
    displayName: "stats.fm",
    usernameLabel: "stats.fm username",
    usernamePlaceholder: "stats.fm username",
    verificationLabel: "stats.fm listening verification",
    helperText: "Use your stats.fm username so the site can count your listening."
  }
}

export const trackerProviderOptions = TRACKER_PROVIDERS.map((provider) => trackerProviderConfigMap[provider])

export function getTrackerProviderConfig(provider: TrackerProvider) {
  return trackerProviderConfigMap[provider]
}
