import { useCallback, useState } from 'react'
import type { SupportedLocale } from '../types'
import type { DateTimeValidationResult } from '../types'

const FALLBACK_MESSAGE = {
  'pl-PL': 'Nieprawidłowa wartość daty',
  'en-US': 'Invalid date value',
} as const

export function useFieldValidation(
  showError: (message: string) => void,
  locale: SupportedLocale = 'pl-PL',
) {
  const [error, setError] = useState(false)

  const onValidationChange = useCallback(
    (result: DateTimeValidationResult) => {
      setError(!result.valid)
      if (!result.valid) {
        showError(result.message ?? FALLBACK_MESSAGE[locale])
      }
    },
    [locale, showError],
  )

  return { error, onValidationChange }
}
