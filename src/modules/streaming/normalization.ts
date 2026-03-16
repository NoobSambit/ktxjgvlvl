const FEATURE_CREDIT_PATTERN =
  /\s*[\[(](?:feat\.|ft\.|featuring)\s+.*?[\])](?=\s|$)/gi
const FEATURE_SUFFIX_PATTERN = /\s*(?:-|:)?\s*(?:feat\.|ft\.|featuring)\s+.*$/gi

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\w\s]/g, " ").trim().replace(/\s+/g, " ")
}

export function normalizeTrackName(name: string) {
  return normalizeText(
    name
      .replace(FEATURE_CREDIT_PATTERN, " ")
      .replace(FEATURE_SUFFIX_PATTERN, " ")
  )
}

export function normalizeArtistName(name: string) {
  return normalizeText(
    name
      .replace(/\s*\(.*?\)\s*/g, " ")
      .replace(/\s*\[.*?\]\s*/g, " ")
      .replace(/\s*(feat\.|ft\.|featuring|with)\s+/gi, " ")
  )
}

export function normalizeAlbumName(name: string) {
  return normalizeText(name)
}

export function areTrackDurationsEquivalent(
  leftDuration: number | undefined,
  rightDuration: number | undefined,
  toleranceMs = 2_000
) {
  if (typeof leftDuration !== "number" || typeof rightDuration !== "number") {
    return false
  }

  return Math.abs(leftDuration - rightDuration) <= toleranceMs
}

export function namesRoughlyMatch(left: string, right: string) {
  const normalizedLeft = normalizeArtistName(left)
  const normalizedRight = normalizeArtistName(right)

  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  )
}
