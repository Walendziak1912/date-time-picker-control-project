import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  DateTimeChangeContext,
  DateTimeValidationResult,
} from "../../DateTimePicker";
import {
  buildEndConstraints,
  buildRangeValidationResult,
  buildStartConstraints,
  fieldLabel,
  isRangeOrderValid,
  normalizeRangeValue,
  resolveRangeLocaleText,
  VALID_FIELD,
} from "../repository";
import type {
  DateTimeRangeChangeContext,
  DateTimeRangeLimits,
  DateTimeRangeProps,
  DateTimeRangeValue,
} from "../types";

const EMPTY_RANGE: DateTimeRangeValue = { start: null, end: null };

export function useDateTimeRangeController(props: DateTimeRangeProps) {
  const {
    value: valueProp,
    defaultValue = EMPTY_RANGE,
    onChange,
    onAccept,
    mode = "datetime",
    timezone = "UTC",
    timeVariant = "analog",
    locale = "pl-PL",
    localeText,
    rangeLocaleText,
    minDate,
    maxDate,
    minDateTime,
    maxDateTime,
    maxRangeDays,
    maxRangeHours,
    maxRangeMinutes,
    maxRangeMonths,
    precision = false,
    startLabel: startLabelProp,
    endLabel: endLabelProp,
    startProps,
    endProps,
    error: errorProp = false,
    helperText,
    onValidationChange,
    showFlexDates = false,
    flexibility: flexibilityProp,
    defaultFlexibility = 0,
  } = props;

  const rangeText = useMemo(
    () => resolveRangeLocaleText(locale, rangeLocaleText),
    [locale, rangeLocaleText],
  );

  const startLabel = startLabelProp;
  const endLabel = endLabelProp;
  const startFieldName = fieldLabel(startLabelProp, rangeText.startLabel);
  const endFieldName = fieldLabel(endLabelProp, rangeText.endLabel);

  const rangeLimits = useMemo<DateTimeRangeLimits>(
    () => ({
      maxRangeDays,
      maxRangeHours,
      maxRangeMinutes,
      maxRangeMonths,
      precision,
    }),
    [maxRangeDays, maxRangeHours, maxRangeMinutes, maxRangeMonths, precision],
  );

  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [startFieldValidation, setStartFieldValidation] =
    useState<DateTimeValidationResult>(VALID_FIELD);
  const [endFieldValidation, setEndFieldValidation] =
    useState<DateTimeValidationResult>(VALID_FIELD);

  const value = isControlled ? (valueProp ?? EMPTY_RANGE) : internalValue;
  const rangeOrderValid = isRangeOrderValid(value.start, value.end);

  const validationResult = useMemo(
    () =>
      buildRangeValidationResult({
        start: startFieldValidation,
        end: endFieldValidation,
        rangeOrderValid,
        startFieldName,
        endFieldName,
        messages: rangeText,
      }),
    [
      endFieldValidation,
      endFieldName,
      rangeOrderValid,
      rangeText,
      startFieldName,
      startFieldValidation,
    ],
  );

  const hasError = errorProp || !validationResult.valid;

  const resolveFlexRange = useCallback(
    (nextValue: typeof value) => {
      const normalized = normalizeRangeValue(nextValue, rangeLimits, mode);
      if (!showFlexDates) return normalized;
      return {
        ...normalized,
        flexibility:
          normalized.flexibility ?? flexibilityProp ?? defaultFlexibility,
      };
    },
    [defaultFlexibility, flexibilityProp, mode, rangeLimits, showFlexDates],
  );

  const commitValue = useCallback(
    (nextValue: typeof value, context: DateTimeRangeChangeContext) => {
      const resolved = resolveFlexRange(nextValue);

      if (!isControlled) {
        setInternalValue(resolved);
      }

      onChange?.(resolved, context);
    },
    [isControlled, onChange, resolveFlexRange],
  );

  const handleStartChange = useCallback(
    (nextStart: Date | null, change: DateTimeChangeContext) => {
      commitValue({ ...value, start: nextStart }, { source: "start", change });
    },
    [commitValue, value],
  );

  const handleEndChange = useCallback(
    (nextEnd: Date | null, change: DateTimeChangeContext) => {
      commitValue({ ...value, end: nextEnd }, { source: "end", change });
    },
    [commitValue, value],
  );

  const handleStartAccept = useCallback(
    (nextStart: Date | null, change: DateTimeChangeContext) => {
      onAccept?.(resolveFlexRange({ ...value, start: nextStart }), {
        source: "start",
        change,
      });
    },
    [onAccept, resolveFlexRange, value],
  );

  const handleEndAccept = useCallback(
    (nextEnd: Date | null, change: DateTimeChangeContext) => {
      onAccept?.(resolveFlexRange({ ...value, end: nextEnd }), {
        source: "end",
        change,
      });
    },
    [onAccept, resolveFlexRange, value],
  );

  const handleStartValidationChange = useCallback(
    (result: DateTimeValidationResult) => {
      setStartFieldValidation(result);
    },
    [],
  );

  const handleEndValidationChange = useCallback(
    (result: DateTimeValidationResult) => {
      setEndFieldValidation(result);
    },
    [],
  );

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
  );

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
    [
      mode,
      minDate,
      maxDate,
      minDateTime,
      maxDateTime,
      value.start,
      rangeLimits,
    ],
  );

  useEffect(() => {
    onValidationChange?.(validationResult);
  }, [onValidationChange, validationResult]);

  return {
    value,
    hasError,
    helperText,
    validationResult,
    startConstraints,
    endConstraints,
    applyRangeValue: commitValue,
    handleStartChange,
    handleEndChange,
    handleStartAccept,
    handleEndAccept,
    handleStartValidationChange,
    handleEndValidationChange,
    startLabel,
    endLabel,
    rangeText,
    sharedPickerConfig: {
      mode,
      timezone,
      timeVariant,
      locale,
      localeText,
    },
    startProps,
    endProps,
  };
}
