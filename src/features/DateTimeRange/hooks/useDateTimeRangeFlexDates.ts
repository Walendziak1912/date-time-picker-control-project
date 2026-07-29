import { useCallback, useMemo, useState } from 'react'

import { DEFAULT_FLEX_DATES_OPTIONS } from '../repository'
import type { DateTimeRangeFlexibility, DateTimeRangeFlexOption } from '../types'

type UseDateTimeRangeFlexDatesOptions = {
  enabled: boolean
  flexibility?: DateTimeRangeFlexibility
  defaultFlexibility?: DateTimeRangeFlexibility
  onFlexibilityChange?: (flexibility: DateTimeRangeFlexibility) => void
  flexDatesOptions?: DateTimeRangeFlexOption[]
}

export function useDateTimeRangeFlexDates({
  enabled,
  flexibility: flexibilityProp,
  defaultFlexibility = 0,
  onFlexibilityChange,
  flexDatesOptions = DEFAULT_FLEX_DATES_OPTIONS,
}: UseDateTimeRangeFlexDatesOptions) {
  const isControlled = flexibilityProp !== undefined
  const [internalFlexibility, setInternalFlexibility] =
    useState<DateTimeRangeFlexibility>(defaultFlexibility)

  const flexibility = enabled
    ? isControlled
      ? flexibilityProp
      : internalFlexibility
    : defaultFlexibility

  const setFlexibility = useCallback(
    (next: DateTimeRangeFlexibility) => {
      if (!isControlled) {
        setInternalFlexibility(next)
      }
      onFlexibilityChange?.(next)
    },
    [isControlled, onFlexibilityChange],
  )

  const options = useMemo(() => flexDatesOptions, [flexDatesOptions])

  return {
    flexibility,
    options,
    setFlexibility,
  }
}
