import { useCallback, useState } from 'react'
import type { DateTimeValidationResult } from '../types'

export function useFieldValidation(showError: (message: string) => void) {
  const [error, setError] = useState(false)

  const onValidationChange = useCallback(
    (result: DateTimeValidationResult) => {
      setError(!result.valid)
      if (!result.valid) {
        showError(result.message ?? 'Nieprawidłowa wartość')
      }
    },
    [showError],
  )

  return { error, onValidationChange }
}
