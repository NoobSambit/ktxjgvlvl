type LogLevel = "info" | "warn" | "error"

export function log(level: LogLevel, message: string, payload?: unknown) {
  const prefix = `[IndiaForBTS:${level}]`

  if (payload === undefined) {
    console[level](prefix, message)
    return
  }

  console[level](prefix, message, payload)
}
