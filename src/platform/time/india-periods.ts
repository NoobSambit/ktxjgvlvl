const INDIA_OFFSET_MINUTES = 330
const INDIA_OFFSET_MS = INDIA_OFFSET_MINUTES * 60 * 1000

export type MissionCadence = "daily" | "weekly"

export type IndiaPeriod = {
  cadence: MissionCadence
  periodKey: string
  startsAt: Date
  endsAt: Date
  timezone: "Asia/Kolkata"
}

type IndiaLocalParts = {
  year: number
  month: number
  day: number
}

function toIndiaShifted(date: Date) {
  return new Date(date.getTime() + INDIA_OFFSET_MS)
}

function getIndiaLocalParts(date: Date): IndiaLocalParts {
  const shifted = toIndiaShifted(date)

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate()
  }
}

function fromIndiaLocal(year: number, month: number, day: number, hour = 0, minute = 0) {
  return new Date(Date.UTC(year, month, day, hour, minute) - INDIA_OFFSET_MS)
}

function getIndiaIsoWeek(date: Date) {
  const shifted = toIndiaShifted(date)
  const utcDate = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()))
  const dayNum = utcDate.getUTCDay() || 7
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)

  return {
    year: utcDate.getUTCFullYear(),
    week
  }
}

export function getIndiaPeriod(cadence: MissionCadence, now = new Date()): IndiaPeriod {
  const local = getIndiaLocalParts(now)

  if (cadence === "daily") {
    const startsAt = fromIndiaLocal(local.year, local.month, local.day)
    const endsAt = fromIndiaLocal(local.year, local.month, local.day + 1)
    const periodKey = `daily-${local.year}-${String(local.month + 1).padStart(2, "0")}-${String(
      local.day
    ).padStart(2, "0")}`

    return {
      cadence,
      periodKey,
      startsAt,
      endsAt,
      timezone: "Asia/Kolkata"
    }
  }

  const shifted = toIndiaShifted(now)
  const dayNum = shifted.getUTCDay() || 7
  const weekStart = new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()))
  weekStart.setUTCDate(weekStart.getUTCDate() - dayNum + 1)

  const startsAt = fromIndiaLocal(
    weekStart.getUTCFullYear(),
    weekStart.getUTCMonth(),
    weekStart.getUTCDate()
  )
  const endsAt = fromIndiaLocal(
    weekStart.getUTCFullYear(),
    weekStart.getUTCMonth(),
    weekStart.getUTCDate() + 7
  )
  const isoWeek = getIndiaIsoWeek(now)

  return {
    cadence,
    periodKey: `weekly-${isoWeek.year}-${String(isoWeek.week).padStart(2, "0")}`,
    startsAt,
    endsAt,
    timezone: "Asia/Kolkata"
  }
}

export function getCurrentIndiaPeriods(now = new Date()) {
  return {
    daily: getIndiaPeriod("daily", now),
    weekly: getIndiaPeriod("weekly", now)
  }
}

export function isWithinPeriod(date: Date, period: IndiaPeriod) {
  return date >= period.startsAt && date < period.endsAt
}

export function getIndiaNow() {
  return new Date()
}
