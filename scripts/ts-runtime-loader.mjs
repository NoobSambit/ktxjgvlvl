import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const candidateSuffixes = [
  "",
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  "/index.ts",
  "/index.tsx",
  "/index.js",
  "/index.mjs",
  "/index.cjs",
  "/index.json"
]

async function fileExists(filePath) {
  try {
    const stats = await stat(filePath)
    return stats.isFile()
  } catch {
    return false
  }
}

async function resolveAlias(specifier) {
  const relativePath = specifier.slice(2)

  for (const suffix of candidateSuffixes) {
    const candidatePath = path.resolve(projectRoot, "src", `${relativePath}${suffix}`)

    if (await fileExists(candidatePath)) {
      return pathToFileURL(candidatePath).href
    }
  }

  throw new Error(`Unable to resolve alias import "${specifier}" from ${projectRoot}`)
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    return {
      url: await resolveAlias(specifier),
      shortCircuit: true
    }
  }

  if (specifier.startsWith("next/") && !path.extname(specifier)) {
    const nextEntryPath = path.resolve(projectRoot, "node_modules", `${specifier}.js`)

    if (await fileExists(nextEntryPath)) {
      return {
        url: pathToFileURL(nextEntryPath).href,
        shortCircuit: true
      }
    }
  }

  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const source = await readFile(new URL(url), "utf8")

    return {
      format: "module",
      source: `export default ${source.trim()};`,
      shortCircuit: true
    }
  }

  const loaded = await nextLoad(url, context)

  if (
    (url.endsWith(".ts") || url.endsWith(".tsx")) &&
    typeof loaded.source !== "undefined"
  ) {
    const sourceText = Buffer.isBuffer(loaded.source)
      ? loaded.source.toString("utf8")
      : String(loaded.source)
    const rewritten = sourceText.replace(
      /import\s+\{([^}]+)\}\s+from\s+["']mongoose["'];?/g,
      'import mongoosePkg from "mongoose"\nconst {$1} = mongoosePkg'
    )

    if (rewritten !== sourceText) {
      return {
        ...loaded,
        source: rewritten,
        shortCircuit: true
      }
    }
  }

  return loaded
}
