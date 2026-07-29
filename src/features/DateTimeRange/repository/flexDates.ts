import {
  getDate,
  getMonth,
  getYear,
  type DateTimePickerTimezone,
} from '../../DateTimePicker'
import type {
  DateTimeRangeFlexibility,
  DateTimeRangeFlexOption,
  DateTimeRangeFlexPayload,
  DateTimeRangeValue,
} from '../types'

export const DEFAULT_FLEX_DATES_OPTIONS: DateTimeRangeFlexOption[] = [
  { value: 0, label: 'Dokładny termin' },
  { value: 1, label: '± 1 dzień' },
  { value: 2, label: '± 2 dni' },
  { value: 3, label: '± 3 dni' },
  { value: 7, label: '± 7 dni' },
]

function formatBackendDate(date: Date, timezone: DateTimePickerTimezone): string {
  const year = getYear(date, timezone)
  const month = String(getMonth(date, timezone) + 1).padStart(2, '0')
  const day = String(getDate(date, timezone)).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function serializeFlexRange(
  value: DateTimeRangeValue,
  timezone: DateTimePickerTimezone = 'UTC',
): DateTimeRangeFlexPayload | null {
  if (value.start == null || value.end == null) return null

  return {
    from: formatBackendDate(value.start, timezone),
    to: formatBackendDate(value.end, timezone),
    flexibility: value.flexibility ?? 0,
  }
}

export function isFlexibilityValue(value: unknown): value is DateTimeRangeFlexibility {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 7
}
