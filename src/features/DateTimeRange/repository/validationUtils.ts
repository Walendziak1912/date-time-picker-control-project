import type { DateTimeValidationResult } from '../../DateTimePicker/types'
import type { DateTimeRangeValidationResult } from '../types'

export const VALID_FIELD: DateTimeValidationResult = { valid: true }

export function fieldLabel(label: unknown, fallback: string): string {
  return typeof label === 'string' && label.trim().length > 0 ? label : fallback
}

export function buildFormatValidationMessage(
  start: DateTimeValidationResult,
  end: DateTimeValidationResult,
  startFieldName: string,
  endFieldName: string,
): string {
  const startInvalid = !start.valid
  const endInvalid = !end.valid

  if (startInvalid && endInvalid) {
    return `Nieprawidłowy format daty w polach ${startFieldName} i ${endFieldName}`
  }

  if (startInvalid) {
    return start.message ?? `Nieprawidłowy format daty w polu ${startFieldName}`
  }

  return end.message ?? `Nieprawidłowy format daty w polu ${endFieldName}`
}

export function buildRangeValidationResult(options: {
  start: DateTimeValidationResult
  end: DateTimeValidationResult
  rangeOrderValid: boolean
  startFieldName: string
  endFieldName: string
}): DateTimeRangeValidationResult {
  const { start, end, rangeOrderValid, startFieldName, endFieldName } = options
  const fields = { start, end }

  if (!start.valid || !end.valid) {
    return {
      valid: false,
      reason: 'invalidFormat',
      message: buildFormatValidationMessage(start, end, startFieldName, endFieldName),
      fields,
    }
  }

  if (!rangeOrderValid) {
    return {
      valid: false,
      reason: 'invalidRange',
      message: `Data w polu ${endFieldName} nie może być wcześniejsza niż w polu ${startFieldName}.`,
      fields,
    }
  }

  return { valid: true, fields }
}

export function resolveRangeFieldErrors(options: {
  error?: boolean
  validationResult: DateTimeRangeValidationResult
}): { startHasError: boolean; endHasError: boolean } {
  const { error, validationResult } = options
  const startFieldInvalid = validationResult.fields?.start?.valid === false
  const endFieldInvalid = validationResult.fields?.end?.valid === false
  const rangeOrderInvalid = validationResult.reason === 'invalidRange'
  const hasFieldLevelDetail = startFieldInvalid || endFieldInvalid || rangeOrderInvalid

  return {
    startHasError: startFieldInvalid || (Boolean(error) && !hasFieldLevelDetail),
    endHasError:
      endFieldInvalid ||
      rangeOrderInvalid ||
      (Boolean(error) && !hasFieldLevelDetail),
  }
}
