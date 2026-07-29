import { useCallback, useState } from 'react'

import type { SupportedLocale } from '../types'
import type { DateTimeRangeValidationResult } from '../types'

const FALLBACK_MESSAGE = {
  'pl-PL': 'Nieprawidłowy zakres dat',
  'en-US': 'Invalid date range',
} as const

export function useRangeFieldValidation(
  showError: (message: string) => void,
  locale: SupportedLocale = 'pl-PL',
) {
  const [error, setError] = useState(false)

  const onValidationChange = useCallback(
    (result: DateTimeRangeValidationResult) => {
      setError(!result.valid)
      if (!result.valid) {
        showError(result.message ?? FALLBACK_MESSAGE[locale])
      }
    },
    [locale, showError],
  )

  return { error, onValidationChange }
}
