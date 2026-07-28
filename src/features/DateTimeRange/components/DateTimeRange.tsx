import { DateTimePicker } from '../../DateTimePicker'
import { resolveRangeFieldErrors } from '../repository'
import { useDateTimeRangeController, useDateTimeRangePresets } from '../hooks'
import type { DateTimeRangePresetKey, DateTimeRangeProps } from '../types'
import { DateTimeRangePresets } from './DateTimeRangePresets'
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
    showPresets = false,
    preset,
    defaultPreset,
    onPresetChange,
    presetOptions,
    presetPlaceholder,
    presetLabel,
    presetClassName,
    timezone = 'UTC',
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
    timezone,
    ...pickerProps,
  })

  const {
    value: rangeValue,
    hasError,
    validationResult,
    startConstraints,
    endConstraints,
    applyRangeValue,
    handleStartChange,
    handleEndChange,
    handleStartAccept,
    handleEndAccept,
    handleStartValidationChange,
    handleEndValidationChange,
    sharedPickerConfig,
  } = controller

  const presets = useDateTimeRangePresets({
    enabled: showPresets,
    preset,
    defaultPreset,
    onPresetChange,
    presetOptions,
    timezone: sharedPickerConfig.timezone ?? timezone,
    value: rangeValue,
  })

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

  const handlePresetSelect = (key: DateTimeRangePresetKey) => {
    const nextRange = presets.resolvePresetRange(key)
    presets.setPreset(key)
    applyRangeValue(nextRange, { source: 'preset', change: { source: 'unknown' } })
    onAccept?.(nextRange, { source: 'preset', change: { source: 'unknown' } })
  }

  return (
    <div
      className={['dtr', showPresets ? 'dtr--with-presets' : '', className].filter(Boolean).join(' ')}
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

        {showPresets && (
          <DateTimeRangePresets
            label={presetLabel}
            value={presets.preset}
            options={presets.options}
            placeholder={presetPlaceholder}
            disabled={disabled || readOnly}
            className={presetClassName}
            onChange={handlePresetSelect}
          />
        )}
      </div>

      {showTextUnderFieldWhenError && rangeHelperText != null && (
        <div className="dtr-field-error" role="alert">
          {rangeHelperText}
        </div>
      )}
    </div>
  )
}
