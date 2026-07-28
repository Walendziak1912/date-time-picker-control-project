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
  mode = 'datetime',
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
  const labelId = useId()

  const value = isControlled ? (valueProp ?? null) : internalValue
  const open = isOpenControlled ? Boolean(openProp) : internalOpen
  const resolvedShowMilliseconds =
    showMillisecondsProp ?? views.includes('milliseconds')
  const resolvedShowSeconds =
    showSecondsProp ?? (views.includes('seconds') || resolvedShowMilliseconds)
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
      if (!resolvedShowSeconds) result = withoutSecondsTz(result, timezone)
      if (!resolvedShowMilliseconds) result = withoutMillisecondsTz(result, timezone)
      return result
    },
    [resolvedShowSeconds, resolvedShowMilliseconds, timezone],
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

  useEffect(() => {
    if (!focused && !fieldError) setInputText(formattedValue)
  }, [formattedValue, focused, fieldError])

  useEffect(() => {
    if (open) {
      setDraft(value)
      setMonth(value ?? new Date())
    }
  }, [open, value])

  useEffect(() => {
    if (!isControlled) return
    setDraft(value)
  }, [isControlled, value])

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

  const handleClose = useCallback(() => {
    setOpenState(false)
  }, [setOpenState])

  const blurInput = useCallback(() => {
    inputRef.current?.blur()
    setFocused(false)
  }, [])

  const accept = useCallback(
    (next: Date | null, shouldClose: boolean) => {
      const normalized = applyValidValue(next)
      emitChange(normalized, 'view')
      onAccept?.(normalized, { source: 'view' })
      if (shouldClose) handleClose()
    },
    [applyValidValue, emitChange, handleClose, onAccept],
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
    handleClose,
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
  }
}

export type DateTimePickerController = ReturnType<typeof useDateTimePickerController>

export type DateTimePickerViewHandler = (view: DateTimePickerView) => void
