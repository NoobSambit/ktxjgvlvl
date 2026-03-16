import fs from "node:fs"
import path from "node:path"

export const canonicalStates = [
  ["Andaman and Nicobar Islands", "IN-AN", "01", ["andaman and nicobar"]],
  ["Andhra Pradesh", "IN-AP", "02", []],
  ["Arunachal Pradesh", "IN-AR", "30", []],
  ["Assam", "IN-AS", "03", []],
  ["Bihar", "IN-BR", "34", []],
  ["Chandigarh", "IN-CH", "05", []],
  ["Chhattisgarh", "IN-CT", "37", ["chattisgarh"]],
  [
    "Dadra and Nagar Haveli and Daman and Diu",
    "IN-DH",
    "52",
    ["dadra and nagar haveli", "daman and diu", "dadra nagar haveli daman diu"]
  ],
  ["Delhi", "IN-DL", "07", ["nct of delhi", "new delhi"]],
  ["Goa", "IN-GA", "33", []],
  ["Gujarat", "IN-GJ", "09", []],
  ["Haryana", "IN-HR", "10", []],
  ["Himachal Pradesh", "IN-HP", "11", []],
  ["Jammu and Kashmir", "IN-JK", "12", ["jammu & kashmir"]],
  ["Jharkhand", "IN-JH", "38", []],
  ["Karnataka", "IN-KA", "19", []],
  ["Kerala", "IN-KL", "13", []],
  ["Ladakh", "IN-LA", "41", []],
  ["Lakshadweep", "IN-LD", "14", []],
  ["Madhya Pradesh", "IN-MP", "35", []],
  ["Maharashtra", "IN-MH", "16", []],
  ["Manipur", "IN-MN", "17", []],
  ["Meghalaya", "IN-ML", "18", []],
  ["Mizoram", "IN-MZ", "31", []],
  ["Nagaland", "IN-NL", "20", []],
  ["Odisha", "IN-OR", "21", ["orissa"]],
  ["Puducherry", "IN-PY", "22", ["pondicherry"]],
  ["Punjab", "IN-PB", "23", []],
  ["Rajasthan", "IN-RJ", "24", []],
  ["Sikkim", "IN-SK", "29", []],
  ["Tamil Nadu", "IN-TN", "25", []],
  ["Telangana", "IN-TG", "40", []],
  ["Tripura", "IN-TR", "26", []],
  ["Uttar Pradesh", "IN-UP", "36", []],
  ["Uttarakhand", "IN-UT", "39", ["uttaranchal"]],
  ["West Bengal", "IN-WB", "28", []]
].map(([stateLabel, stateCode, geonamesAdmin1Code, aliases]) => ({
  stateLabel,
  stateCode,
  geonamesAdmin1Code,
  aliases,
  stateKey: buildStateKeyFromLabel(stateLabel)
}))

export const canonicalStateByKey = new Map(
  canonicalStates.map((state) => [state.stateKey, state])
)

export const canonicalStateByCode = new Map(
  canonicalStates.map((state) => [state.stateCode, state])
)

export const canonicalStateByAdmin1Code = new Map(
  canonicalStates.map((state) => [state.geonamesAdmin1Code, state])
)

export function normalizeLocationText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
}

export function buildLocationSlug(value) {
  return normalizeLocationText(value).replace(/\s+/g, "-")
}

export function buildStateKeyFromLabel(value) {
  return buildLocationSlug(value)
}

export function buildPlaceKey(stateKey, geonameId) {
  return `${stateKey}::${String(geonameId)}`
}

export function buildLegacyPlaceAlias(placeLabel) {
  return buildLocationSlug(placeLabel).replace(/-/g, " ")
}

export function loadEnvFile(filename) {
  const envPath = path.resolve(process.cwd(), filename)

  if (!fs.existsSync(envPath)) {
    return
  }

  const contents = fs.readFileSync(envPath, "utf8")

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const equalsIndex = trimmed.indexOf("=")

    if (equalsIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, equalsIndex).trim()
    const value = trimmed.slice(equalsIndex + 1)

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

export function loadStandardEnv() {
  loadEnvFile(".env.local")
  loadEnvFile(".env")
}

export function requireEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}
