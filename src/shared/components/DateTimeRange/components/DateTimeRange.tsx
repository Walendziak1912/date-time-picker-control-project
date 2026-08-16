import { DateTimePicker, type DateTimePickerHandle } from "../../DateTimePicker";
import { resolveRangeFieldErrors } from "../repository";
import {
  useDateTimeRangeController,
  useDateTimeRangeFlexDates,
  useDateTimeRangePresets,
} from "../hooks";
import type {
  DateTimeRangeFlexibility,
  DateTimeRangeHandle,
  DateTimeRangePresetKey,
  DateTimeRangeProps,
} from "../types";
import { DateTimeRangeFlexDates } from "./DateTimeRangeFlexDates";
import { DateTimeRangePresets } from "./DateTimeRangePresets";
import "./DateTimeRange.css";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export const DateTimeRange = forwardRef<
  DateTimeRangeHandle,
  DateTimeRangeProps
>(function DateTimeRange(props, ref) {
  const {
    startLabel: startLabelProp,
    endLabel: endLabelProp,
    separator = "–",
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
    showFlexDates = false,
    flexibility,
    defaultFlexibility,
    onFlexibilityChange,
    flexDatesOptions,
    flexDatesPlaceholder,
    flexDatesLabel,
    flexDatesClassName,
    timezone = "UTC",
    rangeLocaleText,
    useEndOfDayAsRangeEnd,
    fillRequired,
    validationRules,
    ...pickerProps
  } = props;

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
    startLabel: startLabelProp,
    endLabel: endLabelProp,
    rangeLocaleText,
    startProps,
    endProps,
    minDate,
    maxDate,
    minDateTime,
    maxDateTime,
    onValidationChange,
    showFlexDates,
    flexibility,
    defaultFlexibility,
    timezone,
    useEndOfDayAsRangeEnd,
    fillRequired,
    validationRules,
    ...pickerProps,
  });

  const {
    value: rangeValue,
    hasError,
    validationResult,
    startConstraints,
    endConstraints,
    startReferenceDate,
    endReferenceDate,
    applyRangeValue,
    handleStartChange,
    handleEndChange,
    handleStartAccept,
    handleEndAccept,
    handleStartValidationChange,
    handleEndValidationChange,
    startLabel,
    endLabel,
    rangeText,
    sharedPickerConfig,
    validateFields,
    rangeContainerRef,
    handlePickerClose,
    handlePickerOpen,
  } = controller;

  const startPickerRef = useRef<DateTimePickerHandle>(null);
  const endPickerRef = useRef<DateTimePickerHandle>(null);

  const handleStartPickerClose = useCallback(() => {
    handlePickerClose();
    startProps?.onClose?.();
  }, [handlePickerClose, startProps]);

  const handleEndPickerClose = useCallback(() => {
    handlePickerClose();
    endProps?.onClose?.();
  }, [endProps, handlePickerClose]);

  const handleStartPickerOpen = useCallback(() => {
    handlePickerOpen();
    startProps?.onOpen?.();
  }, [handlePickerOpen, startProps]);

  const handleEndPickerOpen = useCallback(() => {
    handlePickerOpen();
    endProps?.onOpen?.();
  }, [endProps, handlePickerOpen]);

  useImperativeHandle(
    ref,
    () => ({
      validate: () => {
        const startResult = startPickerRef.current?.validate() ?? { valid: true };
        const endResult = endPickerRef.current?.validate() ?? { valid: true };
        return validateFields(startResult, endResult);
      },
    }),
    [validateFields],
  );

  const presets = useDateTimeRangePresets({
    enabled: showPresets,
    preset,
    defaultPreset,
    onPresetChange,
    presetOptions: presetOptions ?? rangeText.presetOptions,
    timezone: sharedPickerConfig.timezone ?? timezone,
    value: rangeValue,
  });

  const flexDates = useDateTimeRangeFlexDates({
    enabled: showFlexDates,
    flexibility: flexibility ?? rangeValue.flexibility,
    defaultFlexibility,
    onFlexibilityChange,
    flexDatesOptions: flexDatesOptions ?? rangeText.flexDatesOptions,
  });

  const rangeHelperText =
    helperText ??
    (showTextUnderFieldWhenError && hasError && !validationResult.valid
      ? validationResult.message
      : undefined);

  const sharedProps = {
    disabled,
    readOnly,
    showTextUnderFieldWhenError,
    validationRules,
    ...sharedPickerConfig,
    ...pickerProps,
  };

  const { startHasError, endHasError } = resolveRangeFieldErrors({
    error,
    validationResult,
  });

  //aktywna precyzja propagowana także w kontekście presetów czy elastycznych dat
  //aby użytkownik miał spójną informację o precyzji niezależnie od źródła zmiany
  const activePrecision = sharedPickerConfig.selectedDateTimePrecision ?? null;

  const handlePresetSelect = (key: DateTimeRangePresetKey) => {
    const nextRange = presets.resolvePresetRange(key);
    presets.setPreset(key);
    applyRangeValue(nextRange, {
      source: "preset",
      change: { source: "unknown", precision: activePrecision },
    });
    onAccept?.(nextRange, {
      source: "preset",
      change: { source: "unknown", precision: activePrecision },
    });
  };

  const handleFlexDatesSelect = (nextFlexibility: DateTimeRangeFlexibility) => {
    flexDates.setFlexibility(nextFlexibility);
    const nextRange = { ...rangeValue, flexibility: nextFlexibility };
    applyRangeValue(nextRange, {
      source: "flexDates",
      change: { source: "unknown", precision: activePrecision },
    });
    onAccept?.(nextRange, {
      source: "flexDates",
      change: { source: "unknown", precision: activePrecision },
    });
  };

  const layoutModifiers = [
    showPresets ? "dtr--with-presets" : "",
    showFlexDates ? "dtr--with-flex-dates" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rangeContainerRef}
      className={["dtr", layoutModifiers, className].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
      data-error={hasError || undefined}
      data-mode={sharedPickerConfig.mode}
    >
      <div className="dtr-fields">
        <DateTimePicker
          ref={startPickerRef}
          {...sharedProps}
          {...startProps}
          onOpen={handleStartPickerOpen}
          onClose={handleStartPickerClose}
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
          referenceDate={startReferenceDate}
        />

        {separator != null && (
          <span className="dtr-separator" aria-hidden="true">
            {separator}
          </span>
        )}

        <DateTimePicker
          ref={endPickerRef}
          {...sharedProps}
          {...endProps}
          onOpen={handleEndPickerOpen}
          onClose={handleEndPickerClose}
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
          referenceDate={endReferenceDate}
        />

        {showPresets && (
          <DateTimeRangePresets
            label={presetLabel}
            value={presets.preset}
            options={presets.options}
            placeholder={presetPlaceholder ?? rangeText.presetPlaceholder}
            disabled={disabled || readOnly}
            className={presetClassName}
            onChange={handlePresetSelect}
          />
        )}

        {showFlexDates && (
          <DateTimeRangeFlexDates
            label={flexDatesLabel}
            value={flexDates.flexibility}
            options={flexDates.options}
            placeholder={flexDatesPlaceholder ?? rangeText.flexDatesPlaceholder}
            disabled={disabled || readOnly}
            className={flexDatesClassName}
            onChange={handleFlexDatesSelect}
          />
        )}
      </div>

      {showTextUnderFieldWhenError && rangeHelperText != null && (
        <div className="dtr-field-error" role="alert">
          {rangeHelperText}
        </div>
      )}
    </div>
  );
});
