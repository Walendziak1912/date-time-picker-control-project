import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import {
  defaultFormat,
  formatDateTime,
  isDateDisabled,
  parseDateTime,
  resolveLocaleText,
  resolvePickerSections,
  setDatePartTz,
  startOfDayTz,
  withoutSecondsTz,
  withoutMillisecondsTz,
  nowInTimezone,
} from '../repository'
import type {
  DateDisableConstraints,
  DateTimePickerProps,
  DateTimePickerView,
  TimeDisableConstraints,
} from '../types'
import { resolveDateTimePickerPrecision } from '../types/precision.types'
import {
  adjustValueForPrecisionChange,
  normalizeDateTimePrecisions,
  resolveActiveDateTimePrecision,
  type DateTimePickerPrecisionValue,
} from '../types/precision.types'

export function useDateTimePickerController({
  value: valueProp,
  defaultValue = null,
  onChange,
  onAccept,
  open: openProp,
  onOpen,
  onClose,
  disabled = false,
  readOnly = false,
  ampm = false,
  format: formatProp,
  mode: modeProp,
  dateTimePrecisions,
  dateTimePrecision,
  selectedDateTimePrecision: selectedDateTimePrecisionProp,
  onDateTimePrecisionChange,
  timezone = 'UTC',
  closeOnSelect = false,
  minDate,
  maxDate,
  minTime,
  maxTime,
  minDateTime,
  maxDateTime,
  disablePast = false,
  disableFuture = false,
  minutesStep = 1,
  showSeconds: showSecondsProp,
  secondsStep = 1,
  showMilliseconds: showMillisecondsProp,
  millisecondsStep = 1,
  timeSteps,
  shouldDisableDate,
  shouldDisableMonth,
  shouldDisableYear,
  shouldDisableTime,
  views = ['year', 'month', 'day', 'hours', 'minutes'],
  openTo,
  onMonthChange,
  locale = 'pl-PL',
  localeText: localeTextProp,
  error: errorProp = false,
  helperText,
  onValidationChange,
}: DateTimePickerProps) {
  const availablePrecisions = useMemo(
    () => normalizeDateTimePrecisions(dateTimePrecisions ?? dateTimePrecision),
    [dateTimePrecisions, dateTimePrecision],
  )
  const defaultPrecision = availablePrecisions[0] ?? null
  const isPrecisionControlled = selectedDateTimePrecisionProp !== undefined
  const [internalPrecision, setInternalPrecision] =
    useState<DateTimePickerPrecisionValue | null>(defaultPrecision)

  const activePrecision = resolveActiveDateTimePrecision(availablePrecisions, {
    isControlled: isPrecisionControlled,
    selected: selectedDateTimePrecisionProp,
    internal: internalPrecision,
  })

  const precisionResolved =
    activePrecision != null
      ? resolveDateTimePickerPrecision(activePrecision)
      : null
  const mode = modeProp ?? precisionResolved?.mode ?? 'date'

  const isControlled = valueProp !== undefined
  const isOpenControlled = openProp !== undefined
  const [internalValue, setInternalValue] = useState<Date | null>(defaultValue)
  const [internalOpen, setInternalOpen] = useState(false)
  const [draft, setDraft] = useState<Date | null>(valueProp ?? defaultValue)
  const [month, setMonth] = useState<Date>(() => valueProp ?? defaultValue ?? new Date())
  const [inputText, setInputText] = useState('')
  const [focused, setFocused] = useState(false)
  const [fieldError, setFieldError] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const valueOnOpenRef = useRef<Date | null>(null)
  const labelId = useId()

  const value = isControlled ? (valueProp ?? null) : internalValue
  const open = isOpenControlled ? Boolean(openProp) : internalOpen
  const resolvedShowMilliseconds =
    showMillisecondsProp ??
    precisionResolved?.showMilliseconds ??
    views.includes('milliseconds')
  const resolvedShowSeconds =
    showSecondsProp ??
    precisionResolved?.showSeconds ??
    (views.includes('seconds') || resolvedShowMilliseconds)
  const { calendarViews, showCalendar, showTime } = resolvePickerSections(
    mode,
    views,
    resolvedShowSeconds,
    resolvedShowMilliseconds,
  )
  const format =
    formatProp ??
    defaultFormat(mode, ampm, resolvedShowSeconds, resolvedShowMilliseconds)

  const hourStep = timeSteps?.hours ?? 1
  const minuteStep = timeSteps?.minutes ?? minutesStep
  const secondStep = timeSteps?.seconds ?? secondsStep
  const millisecondStep = timeSteps?.milliseconds ?? millisecondsStep

  const text = resolveLocaleText(locale, localeTextProp)
  const formattedValue = formatDateTime(value, format, ampm, locale, timezone)
  const invalidFormatMessage = text.invalidFormat.replace('{format}', format)
  const hasError = errorProp || fieldError

  const dateConstraints = useMemo<DateDisableConstraints>(
    () => ({
      minDate,
      maxDate,
      minDateTime,
      maxDateTime,
      disablePast,
      disableFuture,
      shouldDisableDate,
      shouldDisableMonth,
      shouldDisableYear,
    }),
    [
      minDate,
      maxDate,
      minDateTime,
      maxDateTime,
      disablePast,
      disableFuture,
      shouldDisableDate,
      shouldDisableMonth,
      shouldDisableYear,
    ],
  )

  const timeConstraints = useMemo<TimeDisableConstraints>(
    () => ({
      minTime,
      maxTime,
      minDateTime,
      maxDateTime,
      disablePast,
      disableFuture,
      shouldDisableTime,
    }),
    [
      minTime,
      maxTime,
      minDateTime,
      maxDateTime,
      disablePast,
      disableFuture,
      shouldDisableTime,
    ],
  )

  const reportValidation = useCallback(
    (valid: boolean, reason?: 'invalidFormat') => {
      if (valid) {
        onValidationChange?.({ valid: true })
        return
      }
      onValidationChange?.({
        valid: false,
        reason,
        message: invalidFormatMessage,
      })
    },
    [invalidFormatMessage, onValidationChange],
  )

  const normalizeValue = useCallback(
    (next: Date | null): Date | null => {
      if (!next) return next
      let result = next
      if (mode === 'date') {
        result = startOfDayTz(result, timezone)
      }
      if (!resolvedShowSeconds) result = withoutSecondsTz(result, timezone)
      if (!resolvedShowMilliseconds) result = withoutMillisecondsTz(result, timezone)
      return result
    },
    [mode, resolvedShowSeconds, resolvedShowMilliseconds, timezone],
  )

  const applyValidValue = useCallback(
    (next: Date | null): Date | null => {
      const normalized = normalizeValue(next)
      setFieldError(false)
      setInputText(
        normalized ? formatDateTime(normalized, format, ampm, locale, timezone) : '',
      )
      reportValidation(true)
      return normalized
    },
    [ampm, format, locale, normalizeValue, reportValidation, timezone],
  )

  const prevControlledValueRef = useRef<number | null | undefined>(undefined)

  useEffect(() => {
    if (isPrecisionControlled) return
    if (availablePrecisions.length === 0) {
      if (internalPrecision != null) setInternalPrecision(null)
      return
    }
    if (
      internalPrecision != null &&
      availablePrecisions.includes(internalPrecision)
    ) {
      return
    }
    setInternalPrecision(availablePrecisions[0])
  }, [availablePrecisions, internalPrecision, isPrecisionControlled])

  useEffect(() => {
    if (!focused && !fieldError) {
      setInputText(formattedValue)
    }
  }, [formattedValue, focused, fieldError])

  const prevOpenRef = useRef(false)

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      valueOnOpenRef.current = value ? new Date(value.getTime()) : null
      setDraft(value)
      setMonth(value ?? new Date())
    }
    prevOpenRef.current = open
  }, [open, value])

  useEffect(() => {
    if (!isControlled) return

    const nextTime = value?.getTime() ?? null

    if (prevControlledValueRef.current === undefined) {
      prevControlledValueRef.current = nextTime
      setDraft(value)
      return
    }

    if (nextTime === prevControlledValueRef.current) return

    prevControlledValueRef.current = nextTime
    setDraft(value)
    setFieldError(false)
    setInputText(formattedValue)
    reportValidation(true)
  }, [isControlled, value, formattedValue, reportValidation])

  const emitChange = useCallback(
    (next: Date | null, source: 'field' | 'view' | 'unknown') => {
      const normalized = normalizeValue(next)
      if (!isControlled) setInternalValue(normalized)
      onChange?.(normalized, { source })
    },
    [isControlled, normalizeValue, onChange],
  )

  const setOpenState = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next)
      if (next) onOpen?.()
      else onClose?.()
    },
    [isOpenControlled, onClose, onOpen],
  )

  const closePopover = useCallback(() => {
    setOpenState(false)
  }, [setOpenState])

  const handleDismiss = useCallback(() => {
    closePopover()
  }, [closePopover])

  const handleCancel = useCallback(() => {
    const previous = valueOnOpenRef.current
    setDraft(previous)
    setInputText(
      previous ? formatDateTime(previous, format, ampm, locale, timezone) : '',
    )
    setFieldError(false)
    emitChange(previous, 'view')
    closePopover()
  }, [ampm, closePopover, emitChange, format, locale, timezone])

  const blurInput = useCallback(() => {
    inputRef.current?.blur()
    setFocused(false)
  }, [])

  const accept = useCallback(
    (next: Date | null, shouldClose: boolean) => {
      const normalized = applyValidValue(next)
      emitChange(normalized, 'view')
      onAccept?.(normalized, { source: 'view' })
      if (shouldClose) closePopover()
    },
    [applyValidValue, closePopover, emitChange, onAccept],
  )

  const handleOpen = useCallback(() => {
    if (disabled || readOnly) return
    blurInput()
    setOpenState(true)
  }, [blurInput, disabled, readOnly, setOpenState])

  const handleSelectDay = useCallback(
    (day: Date) => {
      blurInput()
      const next = normalizeValue(setDatePartTz(draft, day, timezone))
      setDraft(next)
      if (!showTime && closeOnSelect) {
        accept(next, true)
        return
      }
      const normalized = applyValidValue(next)
      emitChange(normalized, 'view')
    },
    [
      accept,
      applyValidValue,
      blurInput,
      closeOnSelect,
      draft,
      emitChange,
      normalizeValue,
      showTime,
      timezone,
    ],
  )

  const todayDate = nowInTimezone(timezone)
  const isTodayDisabled = isDateDisabled(todayDate, dateConstraints)

  const handleToday = useCallback(() => {
    blurInput()
    const now = nowInTimezone(timezone)
    const next = showTime
      ? normalizeValue(now)
      : normalizeValue(setDatePartTz(draft, now, timezone))
    setMonth(now)
    setDraft(next)
    if (!showTime && closeOnSelect) {
      accept(next, true)
      return
    }
    const normalized = applyValidValue(next)
    emitChange(normalized, 'view')
  }, [
    accept,
    applyValidValue,
    blurInput,
    closeOnSelect,
    draft,
    emitChange,
    normalizeValue,
    showTime,
    timezone,
  ])

  const handleTimeChange = useCallback(
    (next: Date) => {
      blurInput()
      const normalized = normalizeValue(next)
      setDraft(normalized)
      if (closeOnSelect) {
        accept(normalized, true)
        return
      }
      applyValidValue(normalized)
      emitChange(normalized, 'view')
    },
    [accept, applyValidValue, blurInput, closeOnSelect, emitChange, normalizeValue],
  )

  const handleOk = useCallback(() => {
    accept(draft, true)
  }, [accept, draft])

  const handleClear = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      setDraft(null)
      setInputText('')
      setFieldError(false)
      emitChange(null, 'view')
      onAccept?.(null, { source: 'view' })
    },
    [emitChange, onAccept],
  )

  const commitField = useCallback(
    (fieldText: string) => {
      if (readOnly || disabled) return
      const parsed = parseDateTime(fieldText, format, ampm, timezone)
      if (fieldText.trim() === '') {
        setFieldError(false)
        setDraft(null)
        emitChange(null, 'field')
        onAccept?.(null, { source: 'field' })
        setInputText('')
        reportValidation(true)
        return
      }
      if (!parsed) {
        setFieldError(true)
        reportValidation(false, 'invalidFormat')
        return
      }
      const normalized = applyValidValue(parsed)
      setDraft(normalized)
      if (normalized) setMonth(normalized)
      emitChange(normalized, 'field')
      onAccept?.(normalized, { source: 'field' })
    },
    [
      ampm,
      applyValidValue,
      disabled,
      emitChange,
      format,
      onAccept,
      readOnly,
      reportValidation,
      timezone,
    ],
  )

  const onFieldChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value)
    setFieldError(false)
  }, [])

  const onFieldBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      commitField(event.target.value)
    },
    [commitField],
  )

  const onFieldKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        ;(event.target as HTMLInputElement).blur()
      } else if (event.key === 'ArrowDown' && (event.altKey || event.ctrlKey)) {
        event.preventDefault()
        handleOpen()
      } else if (event.key === 'Escape') {
        setInputText(formattedValue)
        setFieldError(false)
        ;(event.target as HTMLInputElement).blur()
      }
    },
    [formattedValue, handleOpen],
  )

  const onFieldFocus = useCallback(() => {
    setFocused(true)
    if (!fieldError) setInputText(formattedValue)
  }, [fieldError, formattedValue])

  const handleMonthChange = useCallback(
    (next: Date) => {
      setMonth(next)
      onMonthChange?.(next)
    },
    [onMonthChange],
  )

  const onPopoverMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      blurInput()
      if ((event.target as HTMLElement).closest('button')) {
        event.preventDefault()
      }
    },
    [blurInput],
  )

  const handlePrecisionChange = useCallback(
    (nextPrecision: DateTimePickerPrecisionValue) => {
      if (activePrecision == null || nextPrecision === activePrecision) return

      const nextResolved = resolveDateTimePickerPrecision(nextPrecision)
      const nextMode = modeProp ?? nextResolved.mode ?? 'datetime'
      const nextShowMilliseconds =
        showMillisecondsProp ??
        nextResolved.showMilliseconds ??
        views.includes('milliseconds')
      const nextShowSeconds =
        showSecondsProp ??
        nextResolved.showSeconds ??
        (views.includes('seconds') || nextShowMilliseconds)
      const nextFormat =
        formatProp ??
        defaultFormat(nextMode, ampm, nextShowSeconds, nextShowMilliseconds)

      const adjustedDraft = adjustValueForPrecisionChange(
        draft,
        activePrecision,
        nextPrecision,
        timezone,
      )
      let normalizedDraft = adjustedDraft
      if (normalizedDraft) {
        if (nextMode === 'date') {
          normalizedDraft = startOfDayTz(normalizedDraft, timezone)
        }
        if (!nextShowSeconds) {
          normalizedDraft = withoutSecondsTz(normalizedDraft, timezone)
        }
        if (!nextShowMilliseconds) {
          normalizedDraft = withoutMillisecondsTz(normalizedDraft, timezone)
        }
      }

      if (!isPrecisionControlled) {
        setInternalPrecision(nextPrecision)
      }
      onDateTimePrecisionChange?.(nextPrecision)

      setDraft(normalizedDraft)
      setInputText(
        normalizedDraft
          ? formatDateTime(normalizedDraft, nextFormat, ampm, locale, timezone)
          : '',
      )
      setFieldError(false)
      reportValidation(true)

      const adjustedValue = adjustValueForPrecisionChange(
        value,
        activePrecision,
        nextPrecision,
        timezone,
      )
      let normalizedValue = adjustedValue
      if (normalizedValue) {
        if (nextMode === 'date') {
          normalizedValue = startOfDayTz(normalizedValue, timezone)
        }
        if (!nextShowSeconds) {
          normalizedValue = withoutSecondsTz(normalizedValue, timezone)
        }
        if (!nextShowMilliseconds) {
          normalizedValue = withoutMillisecondsTz(normalizedValue, timezone)
        }
      }
      emitChange(normalizedValue, 'view')
    },
    [
      activePrecision,
      ampm,
      draft,
      emitChange,
      formatProp,
      isPrecisionControlled,
      locale,
      modeProp,
      onDateTimePrecisionChange,
      reportValidation,
      showMillisecondsProp,
      showSecondsProp,
      timezone,
      value,
      views,
    ],
  )

  const showPrecisionSwitcher = availablePrecisions.length > 1

  const calendarOpenTo =
    openTo === 'year' || openTo === 'month' || openTo === 'day' ? openTo : undefined

  const fieldErrorMessage =
    helperText ?? (fieldError ? invalidFormatMessage : null)

  const inputValue = focused || fieldError ? inputText : formattedValue
  const inputSize = Math.max(inputValue.length, format.length, 1)

  return {
    rootRef,
    inputRef,
    labelId,
    value,
    open,
    draft,
    month,
    inputText,
    inputValue,
    inputSize,
    hasError,
    fieldError,
    fieldErrorMessage,
    text,
    format,
    mode,
    timezone,
    ampm,
    disabled,
    readOnly,
    resolvedShowSeconds,
    resolvedShowMilliseconds,
    calendarViews,
    showCalendar,
    showTime,
    hourStep,
    minuteStep,
    secondStep,
    millisecondStep,
    calendarOpenTo,
    dateConstraints,
    timeConstraints,
    isTodayDisabled,
    handleDismiss,
    handleCancel,
    handleOpen,
    handleSelectDay,
    handleToday,
    handleTimeChange,
    handleOk,
    handleClear,
    handleMonthChange,
    onFieldChange,
    onFieldBlur,
    onFieldKeyDown,
    onFieldFocus,
    onPopoverMouseDown,
    availablePrecisions,
    activePrecision,
    showPrecisionSwitcher,
    handlePrecisionChange,
  }
}

export type DateTimePickerController = ReturnType<typeof useDateTimePickerController>

export type DateTimePickerViewHandler = (view: DateTimePickerView) => void
