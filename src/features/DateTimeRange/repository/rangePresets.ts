import {
  createInstant,
  getDate,
  getHours,
  getMilliseconds,
  getMinutes,
  getMonth,
  getSeconds,
  getYear,
  startOfDayTz,
  type DateTimePickerTimezone,
} from '../../DateTimePicker'
import type { DateTimeRangePresetKey, DateTimeRangePresetOption, DateTimeRangeValue } from '../types'

export const DEFAULT_PRESET_OPTIONS: DateTimeRangePresetOption[] = [
  { key: 'today', label: 'Dzisiaj' },
  { key: 'yesterday', label: 'Wczoraj' },
  { key: 'thisWeek', label: 'Ten tydzień' },
  { key: 'lastWeek', label: 'Zeszły tydzień' },
  { key: 'thisMonth', label: 'Ten miesiąc' },
  { key: 'lastMonth', label: 'Zeszły miesiąc' },
]

function endOfDayTz(date: Date, timezone: DateTimePickerTimezone): Date {
  return createInstant(
    {
      year: getYear(date, timezone),
      month: getMonth(date, timezone),
      date: getDate(date, timezone),
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    },
    timezone,
  )
}

function addDaysTz(date: Date, days: number, timezone: DateTimePickerTimezone): Date {
  if (timezone === 'UTC') {
    return createInstant(
      {
        year: getYear(date, timezone),
        month: getMonth(date, timezone),
        date: getDate(date, timezone) + days,
        hours: getHours(date, timezone),
        minutes: getMinutes(date, timezone),
        seconds: getSeconds(date, timezone),
        milliseconds: getMilliseconds(date, timezone),
      },
      timezone,
    )
  }

  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function startOfMonthTz(date: Date, timezone: DateTimePickerTimezone): Date {
  return createInstant(
    {
      year: getYear(date, timezone),
      month: getMonth(date, timezone),
      date: 1,
    },
    timezone,
  )
}

function endOfMonthTz(date: Date, timezone: DateTimePickerTimezone): Date {
  const year = getYear(date, timezone)
  const month = getMonth(date, timezone)

  return createInstant(
    {
      year,
      month: month + 1,
      date: 0,
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    },
    timezone,
  )
}

function startOfWeekTz(date: Date, timezone: DateTimePickerTimezone): Date {
  const day = startOfDayTz(date, timezone)
  const weekday = timezone === 'UTC' ? day.getUTCDay() : day.getDay()
  const mondayOffset = (weekday + 6) % 7
  return addDaysTz(day, -mondayOffset, timezone)
}

function endOfWeekTz(date: Date, timezone: DateTimePickerTimezone): Date {
  return endOfDayTz(addDaysTz(startOfWeekTz(date, timezone), 6, timezone), timezone)
}

export function getPresetRange(
  preset: DateTimeRangePresetKey,
  timezone: DateTimePickerTimezone,
  now = new Date(),
): DateTimeRangeValue {
  const todayStart = startOfDayTz(now, timezone)

  switch (preset) {
    case 'today':
      return { start: todayStart, end: endOfDayTz(now, timezone) }
    case 'yesterday': {
      const yesterday = addDaysTz(todayStart, -1, timezone)
      return { start: yesterday, end: endOfDayTz(yesterday, timezone) }
    }
    case 'thisWeek':
      return { start: startOfWeekTz(now, timezone), end: endOfWeekTz(now, timezone) }
    case 'lastWeek': {
      const lastWeek = addDaysTz(startOfWeekTz(now, timezone), -7, timezone)
      return { start: lastWeek, end: endOfWeekTz(lastWeek, timezone) }
    }
    case 'thisMonth':
      return { start: startOfMonthTz(now, timezone), end: endOfMonthTz(now, timezone) }
    case 'lastMonth': {
      const prevMonth = createInstant(
        {
          year: getYear(now, timezone),
          month: getMonth(now, timezone) - 1,
          date: 1,
        },
        timezone,
      )
      return { start: startOfMonthTz(prevMonth, timezone), end: endOfMonthTz(prevMonth, timezone) }
    }
    default:
      return { start: null, end: null }
  }
}

export function matchPreset(
  value: DateTimeRangeValue,
  timezone: DateTimePickerTimezone,
  options: DateTimeRangePresetOption[] = DEFAULT_PRESET_OPTIONS,
  now = new Date(),
): DateTimeRangePresetKey | null {
  if (value.start == null || value.end == null) return null

  for (const option of options) {
    const range = getPresetRange(option.key, timezone, now)
    if (
      range.start != null &&
      range.end != null &&
      value.start.getTime() === range.start.getTime() &&
      value.end.getTime() === range.end.getTime()
    ) {
      return option.key
    }
  }

  return null
}
