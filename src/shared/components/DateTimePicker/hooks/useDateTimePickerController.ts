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
  endOfDayTz,
  withoutSecondsTz,
  withoutMillisecondsTz,
  nowInTimezone,
  EMPTY_DATE_BOUNDS_RANGE,
  resolveFullBoundsForSingleDate,
  toDisplayDate,
  type DateBoundsRange,
} from '../repository'
import { resolveValidationMessage } from '../repository/validationRules'
import { FillRequired } from '../types/validation.types'
import type {
  DateDisableConstraints,
  DateTimeChangeContext,
  DateTimePickerFieldProps,
  DateTimePickerProps,
  DateTimeValidationResult,
  TimeDisableConstraints,
} from '../types'
import { resolveDateTimePickerPrecision } from '../types/precision.types'
import {
  adjustValueForPrecisionChange,
  normalizeDateTimePrecisions,
  resolveActiveDateTimePrecision,
  type DateTimePickerPrecisionValue,
} from '../types/precision.types'

export type PickerControllerOutput = 'bounds' | 'instant'

export function useDateTimePickerController(
  props: DateTimePickerProps | DateTimePickerFieldProps,
  output: PickerControllerOutput = 'bounds',
) {
  const {
    value: valueProp,
    defaultValue,
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
    selectedDateTimePrecision: selectedDateTimePrecisionProp,
    onDateTimePrecisionChange,
    timezone = 'UTC',
    daySelectBound,
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
    fillRequired = FillRequired.None,
    validationRules,
    validationMode = 'submit',
  } = props

  const validateOnBlur = validationMode === 'blur'
  const boundsOutput = output === 'bounds'
  const availablePrecisions = useMemo(
    () => normalizeDateTimePrecisions(dateTimePrecisions),
    [dateTimePrecisions],
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

  const resolvedDefaultBounds: DateBoundsRange = boundsOutput
    ? ((defaultValue as DateBoundsRange | null | undefined) ?? EMPTY_DATE_BOUNDS_RANGE)
    : EMPTY_DATE_BOUNDS_RANGE

  const resolvedDefaultInstant: Date | null = boundsOutput
    ? null
    : ((defaultValue as Date | null | undefined) ?? null)

  const [internalBounds, setInternalBounds] =
    useState<DateBoundsRange>(resolvedDefaultBounds)
  const [internalValue, setInternalValue] = useState<Date | null>(
    resolvedDefaultInstant,
  )
  const [internalOpen, setInternalOpen] = useState(false)

  const value: Date | null = boundsOutput
    ? toDisplayDate(isControlled ? valueProp : internalBounds)
    : isControlled
      ? ((valueProp as Date | null | undefined) ?? null)
      : internalValue

  const [draft, setDraft] = useState<Date | null>(value)
  const [month, setMonth] = useState<Date>(
    () => value ?? props.referenceDate ?? new Date(),
  )
  const [inputText, setInputText] = useState('')
  const [focused, setFocused] = useState(false)
  const [fieldError, setFieldError] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const valueOnOpenRef = useRef<Date | null>(null)
  const lastValidationRef = useRef<DateTimeValidationResult>({ valid: true })
  const labelId = useId()

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
  const dateRequired = fillRequired === FillRequired.All
  const invalidFormatMessage = resolveValidationMessage(
    'date-format',
    locale,
    validationRules,
    { format },
  )
  const dateRequiredMessage = resolveValidationMessage(
    'date-required',
    locale,
    validationRules,
  )
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
    (valid: boolean, reason?: 'date-required' | 'date-format') => {
      const result: DateTimeValidationResult = valid
        ? { valid: true }
        : {
            valid: false,
            reason,
            message:
              reason === 'date-required'
                ? dateRequiredMessage
                : invalidFormatMessage,
          }
      lastValidationRef.current = result
      onValidationChange?.(result)
    },
    [dateRequiredMessage, invalidFormatMessage, onValidationChange],
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
      setMonth(value ?? props.referenceDate ?? new Date())
    }
    prevOpenRef.current = open
  }, [open, props.referenceDate, value])

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

  const emitInstantChange = useCallback(
    (
      next: Date | null,
      source: 'field' | 'view' | 'unknown',
      precision: DateTimePickerPrecisionValue | null = activePrecision,
    ) => {
      const normalized = normalizeValue(next)
      if (!isControlled) setInternalValue(normalized)
      ;(onChange as ((value: Date | null, context: DateTimeChangeContext) => void) | undefined)?.(
        normalized,
        { source, precision },
      )
    },
    [activePrecision, isControlled, normalizeValue, onChange],
  )

  const emitBoundsAccept = useCallback(
    (
      next: Date | null,
      source: 'field' | 'view' | 'unknown',
      precision: DateTimePickerPrecisionValue | null = activePrecision,
    ) => {
      const bounds =
        next == null || precision == null
          ? EMPTY_DATE_BOUNDS_RANGE
          : resolveFullBoundsForSingleDate(next, precision)

      if (!isControlled) {
        setInternalBounds(bounds)
      }

      ;(onChange as ((value: DateBoundsRange, context: DateTimeChangeContext) => void) | undefined)?.(
        bounds,
        { source, precision },
      )
      ;(onAccept as ((value: DateBoundsRange, context: DateTimeChangeContext) => void) | undefined)?.(
        bounds,
        { source, precision },
      )
    },
    [activePrecision, isControlled, onAccept, onChange],
  )

  const emitChange = useCallback(
    (
      next: Date | null,
      source: 'field' | 'view' | 'unknown',
      precision: DateTimePickerPrecisionValue | null = activePrecision,
    ) => {
      if (boundsOutput) {
        return
      }
      emitInstantChange(next, source, precision)
    },
    [activePrecision, boundsOutput, emitInstantChange],
  )

  const emitAccept = useCallback(
    (
      next: Date | null,
      source: 'field' | 'view' | 'unknown',
      precision: DateTimePickerPrecisionValue | null = activePrecision,
    ) => {
      if (boundsOutput) {
        emitBoundsAccept(next, source, precision)
        return
      }
      const normalized = normalizeValue(next)
      if (!isControlled) setInternalValue(normalized)
      ;(onChange as ((value: Date | null, context: DateTimeChangeContext) => void) | undefined)?.(
        normalized,
        { source, precision },
      )
      ;(onAccept as ((value: Date | null, context: DateTimeChangeContext) => void) | undefined)?.(
        normalized,
        { source, precision },
      )
    },
    [
      activePrecision,
      boundsOutput,
      emitBoundsAccept,
      isControlled,
      normalizeValue,
      onAccept,
      onChange,
    ],
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

  const handleCancel = useCallback(() => {
    const previous = valueOnOpenRef.current
    setDraft(previous)
    setInputText(
      previous ? formatDateTime(previous, format, ampm, locale, timezone) : '',
    )
    setFieldError(false)
    if (!boundsOutput) {
      emitChange(previous, 'view')
    }
    closePopover()
  }, [ampm, boundsOutput, closePopover, emitChange, format, locale, timezone])

  const blurInput = useCallback(() => {
    inputRef.current?.blur()
    setFocused(false)
  }, [])

  const accept = useCallback(
    (next: Date | null, shouldClose: boolean) => {
      const normalized = applyValidValue(next)
      emitAccept(normalized, 'view')
      if (shouldClose) closePopover()
    },
    [applyValidValue, closePopover, emitAccept],
  )

  const handleDismiss = useCallback(() => {
    accept(draft, true)
  }, [accept, draft])

  const handleOpen = useCallback(() => {
    if (disabled || readOnly) return
    blurInput()
    setOpenState(true)
  }, [blurInput, disabled, readOnly, setOpenState])

  const applyDaySelectTimeDefault = useCallback(
    (date: Date): Date => {
      if (!showTime || daySelectBound == null) return date
      return daySelectBound === 'end'
        ? endOfDayTz(date, timezone)
        : startOfDayTz(date, timezone)
    },
    [daySelectBound, showTime, timezone],
  )

  const handleSelectDay = useCallback(
    (day: Date) => {
      blurInput()
      const next = normalizeValue(
        applyDaySelectTimeDefault(setDatePartTz(draft, day, timezone)),
      )
      setDraft(next)
      if (!showTime && closeOnSelect) {
        accept(next, true)
        return
      }
      applyValidValue(next)
    },
    [
      accept,
      applyDaySelectTimeDefault,
      applyValidValue,
      blurInput,
      closeOnSelect,
      draft,
      normalizeValue,
      showTime,
      timezone,
    ],
  )

  const todayDate = nowInTimezone(timezone)
  const isTodayDisabled = isDateDisabled(todayDate, dateConstraints, timezone)

  const handleToday = useCallback(() => {
    blurInput()
    const now = nowInTimezone(timezone)
    const next = showTime
      ? normalizeValue(
          daySelectBound === 'end' ? endOfDayTz(now, timezone) : now,
        )
      : normalizeValue(setDatePartTz(draft, now, timezone))
    setMonth(now)
    setDraft(next)
    if (!showTime && closeOnSelect) {
      accept(next, true)
      return
    }
    applyValidValue(next)
  }, [
    accept,
    applyValidValue,
    blurInput,
    closeOnSelect,
    daySelectBound,
    draft,
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
    },
    [accept, applyValidValue, blurInput, closeOnSelect, normalizeValue],
  )

  const handleOk = useCallback(() => {
    accept(draft, true)
  }, [accept, draft])

  const handleClear = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      setDraft(null)
      setInputText('')
      emitAccept(null, 'view')
      if (dateRequired && validateOnBlur) {
        setFieldError(true)
        reportValidation(false, 'date-required')
        return
      }
      setFieldError(false)
      if (validateOnBlur) {
        reportValidation(true)
      }
    },
    [dateRequired, emitAccept, reportValidation, validateOnBlur],
  )

  const commitField = useCallback(
    (fieldText: string, options?: { forceValidation?: boolean }) => {
      if (readOnly || disabled) return
      const shouldValidate = validateOnBlur || options?.forceValidation === true
      const parsed = parseDateTime(fieldText, format, ampm, timezone)
      if (fieldText.trim() === '') {
        if (dateRequired && shouldValidate) {
          setFieldError(true)
          reportValidation(false, 'date-required')
          return
        }
        setFieldError(false)
        setDraft(null)
        emitAccept(null, 'field')
        setInputText('')
        if (shouldValidate) {
          reportValidation(true)
        }
        return
      }
      if (!parsed) {
        if (!shouldValidate) {
          setFieldError(false)
          setInputText(formattedValue)
          return
        }
        setFieldError(true)
        reportValidation(false, 'date-format')
        return
      }
      const normalized = applyValidValue(parsed)
      setDraft(normalized)
      if (normalized) setMonth(normalized)
      emitAccept(normalized, 'field')
    },
    [
      ampm,
      applyValidValue,
      dateRequired,
      disabled,
      emitAccept,
      format,
      formattedValue,
      readOnly,
      reportValidation,
      timezone,
      validateOnBlur,
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

      if (boundsOutput) {
        if (normalizedValue) {
          emitBoundsAccept(normalizedValue, 'view', nextPrecision)
        }
        return
      }

      emitInstantChange(normalizedValue, 'view', nextPrecision)
    },
    [
      activePrecision,
      ampm,
      boundsOutput,
      draft,
      emitBoundsAccept,
      emitInstantChange,
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

  const inputValue = focused || fieldError || open ? inputText : formattedValue
  const inputSize = Math.max(inputValue.length, format.length, 1)

  const validate = useCallback((): DateTimeValidationResult => {
    commitField(focused || fieldError ? inputText : formattedValue, {
      forceValidation: true,
    })
    return lastValidationRef.current
  }, [commitField, fieldError, focused, formattedValue, inputText])

  //resetuje wewnętrzny stan walidacji pola (np. po udanym zapisie formularza),
  //aby wyczyszczona kontrolka nie pozostawała oznaczona jako błędna
  const reset = useCallback(() => {
    setFieldError(false)
    setFocused(false)
    setInputText('')
    lastValidationRef.current = { valid: true }
    onValidationChange?.({ valid: true })
  }, [onValidationChange])


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
    validate,
    reset,
  }
}


export type DateTimePickerController = ReturnType<typeof useDateTimePickerController>
