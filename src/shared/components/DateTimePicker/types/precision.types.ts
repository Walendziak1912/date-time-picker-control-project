import type { DateTimePickerMode } from './DateTimePicker.types'

export const DateTimePickerPrecision = {
  /** Tylko data (kalendarz), format np. dd.MM.yyyy */
  Date: 'date',
  /** Data + godzina i minuta, format np. dd.MM.yyyy HH:mm */
  DateTime: 'datetime',
  /** Data + godzina, minuta i sekunda, format np. dd.MM.yyyy HH:mm:ss */
  DateTimeSeconds: 'datetimeSeconds',
  /** Data + godzina, minuta, sekunda i milisekunda, format np. dd.MM.yyyy HH:mm:ss:SSS */
  DateTimeMilliseconds: 'datetimeMilliseconds',
  /** Tylko czas (godzina i minuta) */
  Time: 'time',
  /** Tylko czas z sekundami */
  TimeSeconds: 'timeSeconds',
  /** Tylko czas z milisekundami */
  TimeMilliseconds: 'timeMilliseconds',
} as const

export type DateTimePickerPrecisionValue =
  (typeof DateTimePickerPrecision)[keyof typeof DateTimePickerPrecision]

export type ResolvedDateTimePickerPrecision = {
  mode: DateTimePickerMode
  showSeconds: boolean
  showMilliseconds: boolean
}

export function resolveDateTimePickerPrecision(
  precision: DateTimePickerPrecisionValue,
): ResolvedDateTimePickerPrecision {
  switch (precision) {
    case DateTimePickerPrecision.Date:
      return { mode: 'date', showSeconds: false, showMilliseconds: false }
    case DateTimePickerPrecision.DateTime:
      return { mode: 'datetime', showSeconds: false, showMilliseconds: false }
    case DateTimePickerPrecision.DateTimeSeconds:
      return { mode: 'datetime', showSeconds: true, showMilliseconds: false }
    case DateTimePickerPrecision.DateTimeMilliseconds:
      return { mode: 'datetime', showSeconds: true, showMilliseconds: true }
    case DateTimePickerPrecision.Time:
      return { mode: 'time', showSeconds: false, showMilliseconds: false }
    case DateTimePickerPrecision.TimeSeconds:
      return { mode: 'time', showSeconds: true, showMilliseconds: false }
    case DateTimePickerPrecision.TimeMilliseconds:
      return { mode: 'time', showSeconds: true, showMilliseconds: true }
  }
}
