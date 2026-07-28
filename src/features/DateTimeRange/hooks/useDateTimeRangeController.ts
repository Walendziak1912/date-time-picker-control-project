import { useCallback, useEffect, useMemo, useState } from 'react'

import type { DateTimeChangeContext, DateTimeValidationResult } from '../../DateTimePicker/types'
import {
  buildEndConstraints,
  buildRangeValidationResult,
  buildStartConstraints,
  fieldLabel,
  isRangeOrderValid,
  normalizeRangeValue,
  VALID_FIELD,
} from '../repository'
import type {
  DateTimeRangeChangeContext,
  DateTimeRangeLimits,
  DateTimeRangeProps,
} from '../types'

const EMPTY_RANGE = { start: null, end: null } as const

export function useDateTimeRangeController(props: DateTimeRangeProps) {
  const {
    value: valueProp,
    defaultValue = EMPTY_RANGE,
    onChange,
    onAccept,
    mode = 'datetime',
    timezone = 'UTC',
    timeVariant = 'analog',
    locale = 'pl-PL',
    localeText,
    minDate,
    maxDate,
    minDateTime,
    maxDateTime,
    maxRangeDays,
    maxRangeHours,
    maxRangeMinutes,
    maxRangeMonths,
    precision = false,
    startLabel = 'Od',
    endLabel = 'Do',
    startProps,
    endProps,
    error: errorProp = false,
    helperText,
    onValidationChange,
  } = props

  const startFieldName = fieldLabel(startLabel, 'Od')
  const endFieldName = fieldLabel(endLabel, 'Do')

  const rangeLimits = useMemo<DateTimeRangeLimits>(
    () => ({
      maxRangeDays,
      maxRangeHours,
      maxRangeMinutes,
      maxRangeMonths,
      precision,
    }),
    [maxRangeDays, maxRangeHours, maxRangeMinutes, maxRangeMonths, precision],
  )

  const isControlled = valueProp !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [startFieldValidation, setStartFieldValidation] =
    useState<DateTimeValidationResult>(VALID_FIELD)
  const [endFieldValidation, setEndFieldValidation] =
    useState<DateTimeValidationResult>(VALID_FIELD)

  const value = isControlled ? (valueProp ?? EMPTY_RANGE) : internalValue
  const rangeOrderValid = isRangeOrderValid(value.start, value.end)

  const validationResult = useMemo(
    () =>
      buildRangeValidationResult({
        start: startFieldValidation,
        end: endFieldValidation,
        rangeOrderValid,
        startFieldName,
        endFieldName,
      }),
    [endFieldValidation, endFieldName, rangeOrderValid, startFieldName, startFieldValidation],
  )

  const hasError = errorProp || !validationResult.valid

  const commitValue = useCallback(
    (nextValue: typeof value, context: DateTimeRangeChangeContext) => {
      const normalized = normalizeRangeValue(nextValue, rangeLimits, mode)

      if (!isControlled) {
        setInternalValue(normalized)
      }

      onChange?.(normalized, context)
    },
    [isControlled, mode, onChange, rangeLimits],
  )

  const handleStartChange = useCallback(
    (nextStart: Date | null, change: DateTimeChangeContext) => {
      commitValue({ start: nextStart, end: value.end }, { source: 'start', change })
    },
    [commitValue, value.end],
  )

  const handleEndChange = useCallback(
    (nextEnd: Date | null, change: DateTimeChangeContext) => {
      commitValue({ start: value.start, end: nextEnd }, { source: 'end', change })
    },
    [commitValue, value.start],
  )

  const handleStartAccept = useCallback(
    (nextStart: Date | null, change: DateTimeChangeContext) => {
      const normalized = normalizeRangeValue(
        { start: nextStart, end: value.end },
        rangeLimits,
        mode,
      )
      onAccept?.(normalized, { source: 'start', change })
    },
    [mode, onAccept, rangeLimits, value.end],
  )

  const handleEndAccept = useCallback(
    (nextEnd: Date | null, change: DateTimeChangeContext) => {
      const normalized = normalizeRangeValue(
        { start: value.start, end: nextEnd },
        rangeLimits,
        mode,
      )
      onAccept?.(normalized, { source: 'end', change })
    },
    [mode, onAccept, rangeLimits, value.start],
  )

  const handleStartValidationChange = useCallback((result: DateTimeValidationResult) => {
    setStartFieldValidation(result)
  }, [])

  const handleEndValidationChange = useCallback((result: DateTimeValidationResult) => {
    setEndFieldValidation(result)
  }, [])

  const startConstraints = useMemo(
    () =>
      buildStartConstraints({
        mode,
        minDate,
        maxDate,
        minDateTime,
        maxDateTime,
        end: value.end,
        limits: rangeLimits,
      }),
    [mode, minDate, maxDate, minDateTime, maxDateTime, value.end, rangeLimits],
  )

  const endConstraints = useMemo(
    () =>
      buildEndConstraints({
        mode,
        minDate,
        maxDate,
        minDateTime,
        maxDateTime,
        start: value.start,
        limits: rangeLimits,
      }),
    [mode, minDate, maxDate, minDateTime, maxDateTime, value.start, rangeLimits],
  )

  useEffect(() => {
    onValidationChange?.(validationResult)
  }, [onValidationChange, validationResult])

  return {
    value,
    hasError,
    helperText,
    validationResult,
    startConstraints,
    endConstraints,
    handleStartChange,
    handleEndChange,
    handleStartAccept,
    handleEndAccept,
    handleStartValidationChange,
    handleEndValidationChange,
    sharedPickerConfig: {
      mode,
      timezone,
      timeVariant,
      locale,
      localeText,
    },
    startProps,
    endProps,
  }
}
