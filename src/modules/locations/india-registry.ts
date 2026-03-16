import { buildStateKeyFromLabel } from "@/modules/locations/normalization"

export type IndiaStateRegistryEntry = {
  stateKey: string
  stateLabel: string
  stateCode: string
  geonamesAdmin1Code: string
  aliases: string[]
}

function createStateEntry(
  stateLabel: string,
  stateCode: string,
  geonamesAdmin1Code: string,
  aliases: string[] = []
): IndiaStateRegistryEntry {
  return {
    stateKey: buildStateKeyFromLabel(stateLabel),
    stateLabel,
    stateCode,
    geonamesAdmin1Code,
    aliases
  }
}

export const indiaStateRegistry = [
  createStateEntry("Andaman and Nicobar Islands", "IN-AN", "01", ["andaman and nicobar"]),
  createStateEntry("Andhra Pradesh", "IN-AP", "02"),
  createStateEntry("Arunachal Pradesh", "IN-AR", "30"),
  createStateEntry("Assam", "IN-AS", "03"),
  createStateEntry("Bihar", "IN-BR", "34"),
  createStateEntry("Chandigarh", "IN-CH", "05"),
  createStateEntry("Chhattisgarh", "IN-CT", "37", ["chattisgarh"]),
  createStateEntry(
    "Dadra and Nagar Haveli and Daman and Diu",
    "IN-DH",
    "52",
    ["dadra and nagar haveli", "daman and diu", "dadra nagar haveli daman diu"]
  ),
  createStateEntry("Delhi", "IN-DL", "07", ["nct of delhi", "new delhi"]),
  createStateEntry("Goa", "IN-GA", "33"),
  createStateEntry("Gujarat", "IN-GJ", "09"),
  createStateEntry("Haryana", "IN-HR", "10"),
  createStateEntry("Himachal Pradesh", "IN-HP", "11"),
  createStateEntry("Jammu and Kashmir", "IN-JK", "12", ["jammu & kashmir"]),
  createStateEntry("Jharkhand", "IN-JH", "38"),
  createStateEntry("Karnataka", "IN-KA", "19"),
  createStateEntry("Kerala", "IN-KL", "13"),
  createStateEntry("Ladakh", "IN-LA", "41"),
  createStateEntry("Lakshadweep", "IN-LD", "14"),
  createStateEntry("Madhya Pradesh", "IN-MP", "35"),
  createStateEntry("Maharashtra", "IN-MH", "16"),
  createStateEntry("Manipur", "IN-MN", "17"),
  createStateEntry("Meghalaya", "IN-ML", "18"),
  createStateEntry("Mizoram", "IN-MZ", "31"),
  createStateEntry("Nagaland", "IN-NL", "20"),
  createStateEntry("Odisha", "IN-OR", "21", ["orissa"]),
  createStateEntry("Puducherry", "IN-PY", "22", ["pondicherry"]),
  createStateEntry("Punjab", "IN-PB", "23"),
  createStateEntry("Rajasthan", "IN-RJ", "24"),
  createStateEntry("Sikkim", "IN-SK", "29"),
  createStateEntry("Tamil Nadu", "IN-TN", "25"),
  createStateEntry("Telangana", "IN-TG", "40"),
  createStateEntry("Tripura", "IN-TR", "26"),
  createStateEntry("Uttar Pradesh", "IN-UP", "36"),
  createStateEntry("Uttarakhand", "IN-UT", "39", ["uttaranchal"]),
  createStateEntry("West Bengal", "IN-WB", "28")
] as const satisfies IndiaStateRegistryEntry[]

export const indiaStateRegistryMap = new Map(
  indiaStateRegistry.map((entry) => [entry.stateKey, entry] as const)
)

export const indiaStateRegistryByAdmin1Code = new Map(
  indiaStateRegistry.map((entry) => [entry.geonamesAdmin1Code, entry] as const)
)
