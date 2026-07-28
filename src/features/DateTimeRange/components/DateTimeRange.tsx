import { DateTimePicker } from '../../DateTimePicker'
import { resolveRangeFieldErrors } from '../repository'
import { useDateTimeRangeController } from '../hooks'
import type { DateTimeRangeProps } from '../types'
import './DateTimeRange.css'

export function DateTimeRange(props: DateTimeRangeProps) {
  const {
    startLabel = 'Od',
    endLabel = 'Do',
    separator = '–',
    className,
    disabled = false,
    readOnly = false,
    showTextUnderFieldWhenError = false,
    showBorderFieldWhenError = false,
    error,
    helperText,
    value,
    defaultValue,
    onChange,
    onAccept,
    maxRangeDays,
    maxRangeHours,
    maxRangeMinutes,
    maxRangeMonths,
    precision,
    startProps,
    endProps,
    minDate,
    maxDate,
    minDateTime,
    maxDateTime,
    onValidationChange,
    ...pickerProps
  } = props

  const controller = useDateTimeRangeController({
    disabled,
    readOnly,
    showTextUnderFieldWhenError,
    showBorderFieldWhenError,
    error,
    helperText,
    value,
    defaultValue,
    onChange,
    onAccept,
    maxRangeDays,
    maxRangeHours,
    maxRangeMinutes,
    maxRangeMonths,
    precision,
    startLabel,
    endLabel,
    startProps,
    endProps,
    minDate,
    maxDate,
    minDateTime,
    maxDateTime,
    onValidationChange,
    ...pickerProps,
  })

  const {
    value: rangeValue,
    hasError,
    validationResult,
    startConstraints,
    endConstraints,
    handleStartChange,
    handleEndChange,
    handleStartAccept,
    handleEndAccept,
    handleStartValidationChange,
    handleEndValidationChange,
    sharedPickerConfig,
  } = controller

  const rangeHelperText =
    helperText ??
    (showTextUnderFieldWhenError && hasError && !validationResult.valid
      ? validationResult.message
      : undefined)

  const sharedProps = {
    disabled,
    readOnly,
    showTextUnderFieldWhenError,
    ...sharedPickerConfig,
    ...pickerProps,
  }

  const { startHasError, endHasError } = resolveRangeFieldErrors({
    error,
    validationResult,
  })

  return (
    <div
      className={['dtr', className].filter(Boolean).join(' ')}
      data-disabled={disabled || undefined}
      data-error={hasError || undefined}
      data-mode={sharedPickerConfig.mode}
    >
      <div className="dtr-fields">
        <DateTimePicker
          {...sharedProps}
          {...startProps}
          label={startLabel}
          error={startHasError}
          showBorderFieldWhenError={showBorderFieldWhenError && startHasError}
          value={rangeValue.start}
          onChange={handleStartChange}
          onAccept={handleStartAccept}
          onValidationChange={handleStartValidationChange}
          minDate={startConstraints.minDate}
          maxDate={startConstraints.maxDate}
          minDateTime={startConstraints.minDateTime}
          maxDateTime={startConstraints.maxDateTime}
        />

        {separator != null && (
          <span className="dtr-separator" aria-hidden="true">
            {separator}
          </span>
        )}

        <DateTimePicker
          {...sharedProps}
          {...endProps}
          label={endLabel}
          error={endHasError}
          showBorderFieldWhenError={showBorderFieldWhenError && endHasError}
          value={rangeValue.end}
          onChange={handleEndChange}
          onAccept={handleEndAccept}
          onValidationChange={handleEndValidationChange}
          minDate={endConstraints.minDate}
          maxDate={endConstraints.maxDate}
          minDateTime={endConstraints.minDateTime}
          maxDateTime={endConstraints.maxDateTime}
        />
      </div>

      {showTextUnderFieldWhenError && rangeHelperText != null && (
        <div className="dtr-field-error" role="alert">
          {rangeHelperText}
        </div>
      )}
    </div>
  )
}
