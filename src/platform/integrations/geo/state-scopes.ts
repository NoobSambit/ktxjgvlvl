export function slugifyScope(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
}

export function buildStateKey(stateOrStateKey: string) {
  const normalized = stateOrStateKey.startsWith("state:")
    ? stateOrStateKey.slice("state:".length)
    : stateOrStateKey

  return `state:${slugifyScope(normalized)}`
}

export function buildStateScopeKeyFromRegion(region?: {
  stateKey?: string
  state?: string
}) {
  if (region?.stateKey) {
    return buildStateKey(region.stateKey)
  }

  if (region?.state) {
    return buildStateKey(region.state)
  }

  return undefined
}
