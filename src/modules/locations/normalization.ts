export function normalizeLocationText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

export function buildLocationSlug(value: string) {
  return normalizeLocationText(value).replace(/\s+/g, "-")
}

export function buildStateKeyFromLabel(value: string) {
  return buildLocationSlug(value)
}

export function buildPlaceKey(stateKey: string, geonameId: number | string) {
  return `${stateKey}::${String(geonameId)}`
}
