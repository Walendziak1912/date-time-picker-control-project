import { useCallback, useState } from 'react'

import type { DateTimeRangeValidationResult } from '../types'

export function useRangeFieldValidation(showError: (message: string) => void) {
  const [error, setError] = useState(false)

  const onValidationChange = useCallback(
    (result: DateTimeRangeValidationResult) => {
      setError(!result.valid)
      if (!result.valid) {
        showError(result.message ?? 'Nieprawidłowy zakres dat')
      }
    },
    [showError],
  )

  return { error, onValidationChange }
}
