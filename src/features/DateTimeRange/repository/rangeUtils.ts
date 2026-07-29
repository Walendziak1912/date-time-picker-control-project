import { startOfDay, type DateTimePickerMode } from '../../DateTimePicker'
import type { DateTimeRangeLimits, DateTimeRangeValue } from '../types'

const MS_PER_MINUTE = 60 * 1000
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR

export function addCalendarDays(date: Date, days: number): Date {
  const next = startOfDay(date)
  next.setDate(next.getDate() + days)
  return next
}

export function addCalendarMonths(date: Date, months: number): Date {
  const next = new Date(date)
  const day = next.getDate()
  next.setMonth(next.getMonth() + months)
  if (next.getDate() < day) {
    next.setDate(0)
  }
  return next
}

export function endOfDay(date: Date): Date {
  const end = startOfDay(date)
  end.setHours(23, 59, 59, 999)
  return end
}

export function hasRangeLimits(limits: DateTimeRangeLimits): boolean {
  return (
    (limits.maxRangeDays != null && limits.maxRangeDays > 0) ||
    (limits.maxRangeHours != null && limits.maxRangeHours > 0) ||
    (limits.maxRangeMinutes != null && limits.maxRangeMinutes > 0) ||
    (limits.maxRangeMonths != null && limits.maxRangeMonths > 0)
  )
}

function getMaxEndFromDays(
  start: Date,
  days: number,
  mode: DateTimePickerMode,
  precision: boolean,
): Date {
  if (precision) {
    return new Date(start.getTime() + days * MS_PER_DAY)
  }

  if (mode === 'date') {
    return endOfDay(addCalendarDays(start, days - 1))
  }

  return endOfDay(addCalendarDays(start, days - 1))
}

function getMinStartFromDays(
  end: Date,
  days: number,
  mode: DateTimePickerMode,
  precision: boolean,
): Date {
  if (precision) {
    return new Date(end.getTime() - days * MS_PER_DAY)
  }

  if (mode === 'date') {
    return startOfDay(addCalendarDays(end, -(days - 1)))
  }

  return startOfDay(addCalendarDays(end, -(days - 1)))
}

function getMaxEndFromMonths(start: Date, months: number, precision: boolean): Date {
  if (precision) {
    return addCalendarMonths(start, months)
  }

  return endOfDay(addCalendarMonths(startOfDay(start), months - 1))
}

function getMinStartFromMonths(end: Date, months: number, precision: boolean): Date {
  if (precision) {
    return addCalendarMonths(end, -months)
  }

  return startOfDay(addCalendarMonths(startOfDay(end), -(months - 1)))
}

export function getMaxEndForStart(
  start: Date,
  limits: DateTimeRangeLimits,
  mode: DateTimePickerMode,
): Date | undefined {
  const precision = limits.precision ?? false
  const candidates: Date[] = []

  if (limits.maxRangeDays != null && limits.maxRangeDays > 0) {
    candidates.push(getMaxEndFromDays(start, limits.maxRangeDays, mode, precision))
  }

  if (limits.maxRangeHours != null && limits.maxRangeHours > 0) {
    candidates.push(new Date(start.getTime() + limits.maxRangeHours * MS_PER_HOUR))
  }

  if (limits.maxRangeMinutes != null && limits.maxRangeMinutes > 0) {
    candidates.push(new Date(start.getTime() + limits.maxRangeMinutes * MS_PER_MINUTE))
  }

  if (limits.maxRangeMonths != null && limits.maxRangeMonths > 0) {
    candidates.push(getMaxEndFromMonths(start, limits.maxRangeMonths, precision))
  }

  if (candidates.length === 0) return undefined

  return candidates.reduce((earliest, candidate) =>
    candidate < earliest ? candidate : earliest,
  )
}

export function getMinStartForEnd(
  end: Date,
  limits: DateTimeRangeLimits,
  mode: DateTimePickerMode,
): Date | undefined {
  const precision = limits.precision ?? false
  const candidates: Date[] = []

  if (limits.maxRangeDays != null && limits.maxRangeDays > 0) {
    candidates.push(getMinStartFromDays(end, limits.maxRangeDays, mode, precision))
  }

  if (limits.maxRangeHours != null && limits.maxRangeHours > 0) {
    candidates.push(new Date(end.getTime() - limits.maxRangeHours * MS_PER_HOUR))
  }

  if (limits.maxRangeMinutes != null && limits.maxRangeMinutes > 0) {
    candidates.push(new Date(end.getTime() - limits.maxRangeMinutes * MS_PER_MINUTE))
  }

  if (limits.maxRangeMonths != null && limits.maxRangeMonths > 0) {
    candidates.push(getMinStartFromMonths(end, limits.maxRangeMonths, precision))
  }

  if (candidates.length === 0) return undefined

  return candidates.reduce((latest, candidate) => (candidate > latest ? candidate : latest))
}

export function pickLaterDate(a?: Date, b?: Date): Date | undefined {
  if (a == null) return b
  if (b == null) return a
  return a > b ? a : b
}

export function pickEarlierDate(a?: Date, b?: Date): Date | undefined {
  if (a == null) return b
  if (b == null) return a
  return a < b ? a : b
}

export function isRangeOrderValid(start: Date | null, end: Date | null): boolean {
  if (start == null || end == null) return true
  return start <= end
}

export function normalizeRangeValue(
  value: DateTimeRangeValue,
  limits: DateTimeRangeLimits,
  mode: DateTimePickerMode,
): DateTimeRangeValue {
  let { start, end } = value

  if (start != null && end != null && start > end) {
    end = start
  }

  if (hasRangeLimits(limits) && start != null && end != null) {
    const maxEnd = getMaxEndForStart(start, limits, mode)
    if (maxEnd != null && end > maxEnd) {
      end = maxEnd
    }
  }

  return { start, end }
}

export function buildStartConstraints(options: {
  mode: DateTimePickerMode
  minDate?: Date
  maxDate?: Date
  minDateTime?: Date
  maxDateTime?: Date
  end: Date | null
  limits: DateTimeRangeLimits
}) {
  const { mode, minDate, maxDate, minDateTime, maxDateTime, end, limits } = options

  const rangeMin =
    end != null && hasRangeLimits(limits) ? getMinStartForEnd(end, limits, mode) : undefined

  const rangeMax = end ?? undefined

  if (mode === 'date') {
    return {
      minDate: pickLaterDate(minDate, rangeMin),
      maxDate: pickEarlierDate(maxDate, rangeMax),
      minDateTime,
      maxDateTime,
    }
  }

  return {
    minDate,
    maxDate,
    minDateTime: pickLaterDate(minDateTime, rangeMin),
    maxDateTime: pickEarlierDate(maxDateTime, rangeMax),
  }
}

export function buildEndConstraints(options: {
  mode: DateTimePickerMode
  minDate?: Date
  maxDate?: Date
  minDateTime?: Date
  maxDateTime?: Date
  start: Date | null
  limits: DateTimeRangeLimits
}) {
  const { mode, minDate, maxDate, minDateTime, maxDateTime, start, limits } = options

  const rangeMin = start ?? undefined
  const rangeMax =
    start != null && hasRangeLimits(limits)
      ? getMaxEndForStart(start, limits, mode)
      : undefined

  if (mode === 'date') {
    return {
      minDate: pickLaterDate(minDate, rangeMin),
      maxDate: pickEarlierDate(maxDate, rangeMax),
      minDateTime,
      maxDateTime,
    }
  }

  return {
    minDate,
    maxDate,
    minDateTime: pickLaterDate(minDateTime, rangeMin),
    maxDateTime: pickEarlierDate(maxDateTime, rangeMax),
  }
}
