import type { ReactNode } from 'react'

import type {
  DateTimeChangeContext,
  DateTimePickerLocaleText,
  DateTimePickerMode,
  DateTimePickerProps,
  DateTimePickerTimezone,
  DateTimeValidationResult,
  TimePickerVariant,
  TimeSteps,
} from '../../DateTimePicker'

export type DateTimeRangeValue = {
  start: Date | null
  end: Date | null
}

export type DateTimeRangeChangeContext = {
  source: 'start' | 'end' | 'preset'
  change: DateTimeChangeContext
}

export type DateTimeRangePresetKey =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'

export type DateTimeRangePresetOption = {
  key: DateTimeRangePresetKey
  label: string
}

export type DateTimeRangeValidationReason = 'invalidFormat' | 'invalidRange'

export type DateTimeRangeValidationResult = {
  valid: boolean
  reason?: DateTimeRangeValidationReason
  message?: string
  /** Wynik walidacji per pole — pozwala rozróżnić błąd Od, Do lub obu. */
  fields?: DateTimeRangeFieldValidation
}

export type DateTimeRangeFieldValidation = {
  start?: DateTimeValidationResult
  end?: DateTimeValidationResult
}

export type DateTimeRangeLimits = {
  maxRangeDays?: number
  maxRangeHours?: number
  maxRangeMinutes?: number
  maxRangeMonths?: number
  /** Domyślnie false — limity dni/miesięcy liczone kalendarzowo. true = dokładny czas od momentu startu. */
  precision?: boolean
}

type SharedPickerProps = Pick<
  DateTimePickerProps,
  | 'disabled'
  | 'readOnly'
  | 'ampm'
  | 'format'
  | 'mode'
  | 'timezone'
  | 'closeOnSelect'
  | 'minutesStep'
  | 'showSeconds'
  | 'secondsStep'
  | 'showMilliseconds'
  | 'millisecondsStep'
  | 'timeSteps'
  | 'shouldDisableDate'
  | 'shouldDisableMonth'
  | 'shouldDisableYear'
  | 'shouldDisableTime'
  | 'showDaysOutsideCurrentMonth'
  | 'disableHighlightToday'
  | 'views'
  | 'openTo'
  | 'onViewChange'
  | 'onMonthChange'
  | 'onYearChange'
  | 'yearsOrder'
  | 'yearsPerRow'
  | 'monthsPerRow'
  | 'timeVariant'
  | 'locale'
  | 'localeText'
  | 'minTime'
  | 'maxTime'
  | 'disablePast'
  | 'disableFuture'
>

export type DateTimeRangeProps = SharedPickerProps & {
  value?: DateTimeRangeValue
  defaultValue?: DateTimeRangeValue
  onChange?: (value: DateTimeRangeValue, context: DateTimeRangeChangeContext) => void
  onAccept?: (value: DateTimeRangeValue, context: DateTimeRangeChangeContext) => void
  startLabel?: ReactNode
  endLabel?: ReactNode
  separator?: ReactNode
  className?: string
  minDate?: Date
  maxDate?: Date
  minDateTime?: Date
  maxDateTime?: Date
  /**
   * Maksymalna liczba dni w zakresie (włącznie z dniem początkowym).
   * Domyślnie wyłączone. Przy precision=false — dni kalendarzowe;
   * przy precision=true — dokładne doby (np. 2 dni = 48 h od startu).
   */
  maxRangeDays?: number
  /** Maksymalna liczba godzin od momentu startu. Domyślnie wyłączone. */
  maxRangeHours?: number
  /** Maksymalna liczba minut od momentu startu. Domyślnie wyłączone. */
  maxRangeMinutes?: number
  /**
   * Maksymalna liczba miesięcy w zakresie (włącznie z miesiącem początkowym).
   * Przy precision=false — miesiące kalendarzowe; przy true — ten sam dzień/godzina N miesięcy później.
   */
  maxRangeMonths?: number
  /**
   * Domyślnie false. Gdy true, maxRangeDays/maxRangeMonths liczone są od dokładnego
   * momentu startu (np. 28.07.2026 14:00 + 2 dni = 30.07.2026 14:00).
   */
  precision?: boolean
  startProps?: Partial<DateTimePickerProps>
  endProps?: Partial<DateTimePickerProps>
  error?: boolean
  helperText?: ReactNode
  showTextUnderFieldWhenError?: boolean
  showBorderFieldWhenError?: boolean
  onValidationChange?: (result: DateTimeRangeValidationResult) => void
  /** Włącza combobox z presetami obok pól zakresu. Domyślnie false. */
  showPresets?: boolean
  /** Wybrany preset (kontrolowany). null = zakres niestandardowy. */
  preset?: DateTimeRangePresetKey | null
  defaultPreset?: DateTimeRangePresetKey | null
  onPresetChange?: (preset: DateTimeRangePresetKey | null) => void
  /** Nadpisanie domyślnej listy presetów */
  presetOptions?: DateTimeRangePresetOption[]
  presetPlaceholder?: string
  presetLabel?: ReactNode
  presetClassName?: string
}

export type DateTimeRangeConstraintMode = DateTimePickerMode

export type DateTimeRangeSharedConfig = {
  mode: DateTimePickerMode
  timezone: DateTimePickerTimezone
  timeVariant: TimePickerVariant
  locale: string
  localeText?: DateTimePickerLocaleText
  timeSteps?: TimeSteps
}
