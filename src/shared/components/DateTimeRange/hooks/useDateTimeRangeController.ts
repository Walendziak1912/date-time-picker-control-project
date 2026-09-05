import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  DateTimeChangeContext,
  DateTimeValidationResult,
} from "../../DateTimePicker/types";
import { FillRequired } from "../../DateTimePicker/types/validation.types";
import { resolveFullBoundsFields } from "../../DateTimePicker/repository";
import { resolveDateTimePickerPrecision } from "../../DateTimePicker/types/precision.types";
import {
  normalizeDateTimePrecisions,
  resolveActiveDateTimePrecision,
  type DateTimePickerPrecisionValue,
} from "../../DateTimePicker/types/precision.types";
import {
  buildEndConstraints,
  buildRangeValidationResult,
  buildStartConstraints,
  isRangeOrderValid,
  normalizeRangeValue,
  notifyValidationIfChanged,
  resolveEndReferenceDate,
  resolveStartReferenceDate,
  resolveFieldLabel,
  resolveRangeLocaleText,
  shouldShowValidationOnBlur,
  VALID_FIELD,
} from "../repository";
import type {
  DateTimeRangeChangeContext,
  DateTimeRangeLimits,
  DateTimeRangeProps,
  DateTimeRangeValidationResult,
  DateTimeRangeValue,
} from "../types";

const EMPTY_RANGE: DateTimeRangeValue = { start: null, end: null };

export function useDateTimeRangeController(props: DateTimeRangeProps) {
  const {
    value: valueProp,
    defaultValue = EMPTY_RANGE,
    onChange,
    onAccept,
    mode: modeProp,
    dateTimePrecisions,
    selectedDateTimePrecision: selectedDateTimePrecisionProp,
    onDateTimePrecisionChange,
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
    onValidationChange,
    showFlexDates = false,
    flexibility: flexibilityProp,
    defaultFlexibility = 0,
    fillRequired = FillRequired.None,
    validationRules,
    validationMode = "submit",
  } = props;

  const validateOnBlur = validationMode === "blur";

  const availablePrecisions = useMemo(
    () => normalizeDateTimePrecisions(dateTimePrecisions),
    [dateTimePrecisions],
  );
  const defaultPrecision = availablePrecisions[0] ?? null;
  const isPrecisionControlled = selectedDateTimePrecisionProp !== undefined;
  const [internalPrecision, setInternalPrecision] =
    useState<DateTimePickerPrecisionValue | null>(defaultPrecision);

  const activePrecision = resolveActiveDateTimePrecision(availablePrecisions, {
    isControlled: isPrecisionControlled,
    selected: selectedDateTimePrecisionProp,
    internal: internalPrecision,
  });

  const precisionResolved =
    activePrecision != null
      ? resolveDateTimePickerPrecision(activePrecision)
      : null;
  const mode = modeProp ?? precisionResolved?.mode ?? "datetime";

  useEffect(() => {
    if (isPrecisionControlled) return;
    if (availablePrecisions.length === 0) {
      if (internalPrecision != null) setInternalPrecision(null);
      return;
    }
    if (
      internalPrecision != null &&
      availablePrecisions.includes(internalPrecision)
    ) {
      return;
    }
    setInternalPrecision(availablePrecisions[0]);
  }, [
    availablePrecisions,
    internalPrecision,
    isPrecisionControlled,
  ]);

  const rangeText = useMemo(
    () => resolveRangeLocaleText(locale, rangeLocaleText),
    [locale, rangeLocaleText],
  );

  const startLabel = startLabelProp;
  const endLabel = endLabelProp;
  const startFieldName = resolveFieldLabel(startLabelProp, rangeText.startLabel);
  const endFieldName = resolveFieldLabel(endLabelProp, rangeText.endLabel);

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
  const [showValidation, setShowValidation] = useState(false);
  const lastNotifiedValidationKeyRef = useRef<string | null>(null);
  const rangeContainerRef = useRef<HTMLDivElement>(null);
  const pickerInteractionGraceUntilRef = useRef(0);

  const notifyValidation = useCallback(
    (
      result: DateTimeRangeValidationResult,
      options?: { force?: boolean },
    ) => {
      notifyValidationIfChanged(
        result,
        lastNotifiedValidationKeyRef,
        onValidationChange,
        options,
      );
    },
    [onValidationChange],
  );

  const value = isControlled ? (valueProp ?? EMPTY_RANGE) : internalValue;
  const rangeOrderValid = isRangeOrderValid(value.start, value.end);

  const validationResult = useMemo(
    () =>
      buildRangeValidationResult({
        start: startFieldValidation,
        end: endFieldValidation,
        startValue: value.start,
        endValue: value.end,
        rangeOrderValid,
        startFieldName,
        endFieldName,
        fillRequired,
        locale,
        validationRules,
        checkRequiredAndRange: showValidation,
        allowPartialRange: false,
      }),
    [
      endFieldName,
      endFieldValidation,
      fillRequired,
      locale,
      rangeOrderValid,
      showValidation,
      startFieldName,
      startFieldValidation,
      validationRules,
      value.end,
      value.start,
    ],
  );

  const hasError = errorProp || !validationResult.valid;

  const resolveFlexRange = useCallback(
    (nextValue: typeof value) => {
      const normalized = normalizeRangeValue(
        nextValue,
        rangeLimits,
        mode,
        timezone,
      );
      if (!showFlexDates) return normalized;
      return {
        ...normalized,
        flexibility:
          normalized.flexibility ?? flexibilityProp ?? defaultFlexibility,
      };
    },
    [
      defaultFlexibility,
      flexibilityProp,
      mode,
      rangeLimits,
      showFlexDates,
      timezone,
    ],
  );

  const applyBoundsToRange = useCallback(
    (nextValue: DateTimeRangeValue): DateTimeRangeValue => {
      if (activePrecision == null) {
        return nextValue;
      }

      const { start, end, flexibility } = nextValue;
      const bounded = resolveFullBoundsFields({
        start,
        end,
        precision: activePrecision,
      });

      return {
        ...bounded,
        ...(flexibility !== undefined ? { flexibility } : {}),
      };
    },
    [activePrecision],
  );

  const commitValue = useCallback(
    (nextValue: typeof value, context: DateTimeRangeChangeContext) => {
      const resolved = applyBoundsToRange(resolveFlexRange(nextValue));

      if (!isControlled) {
        setInternalValue(resolved);
      }

      onChange?.(resolved, context);
    },
    [applyBoundsToRange, isControlled, onChange, resolveFlexRange],
  );

  const handleDateTimePrecisionChange = useCallback(
    (nextPrecision: DateTimePickerPrecisionValue) => {
      const previousPrecision = activePrecision;

      if (!isPrecisionControlled) {
        setInternalPrecision(nextPrecision);
      }
      onDateTimePrecisionChange?.(nextPrecision);

      if (previousPrecision == null || previousPrecision === nextPrecision) {
        return;
      }

      const fromMode = resolveDateTimePickerPrecision(previousPrecision).mode;
      const toMode = resolveDateTimePickerPrecision(nextPrecision).mode;
      if (fromMode !== "date" || toMode === "date") {
        return;
      }

      const resolved = resolveFlexRange(value);
      const bounded = resolveFullBoundsFields({
        start: resolved.start,
        end: resolved.end,
        precision: nextPrecision,
      });
      const nextRange = {
        ...bounded,
        ...(resolved.flexibility !== undefined
          ? { flexibility: resolved.flexibility }
          : {}),
      };

      queueMicrotask(() => {
        if (!isControlled) {
          setInternalValue(nextRange);
        }
        onChange?.(nextRange, {
          source: "start",
          change: { source: "view", precision: nextPrecision },
        });
      });
    },
    [
      activePrecision,
      isControlled,
      isPrecisionControlled,
      onChange,
      onDateTimePrecisionChange,
      resolveFlexRange,
      value,
    ],
  );

  const handleStartChange = useCallback(
    (nextStart: Date | null, _change: DateTimeChangeContext) => {
      const nextRange = { ...value, start: nextStart };
      if (!isControlled) {
        setInternalValue(nextRange);
      }
    },
    [isControlled, value],
  );

  const handleEndChange = useCallback(
    (nextEnd: Date | null, _change: DateTimeChangeContext) => {
      const nextRange = { ...value, end: nextEnd };
      if (!isControlled) {
        setInternalValue(nextRange);
      }
    },
    [isControlled, value],
  );

  const handleStartAccept = useCallback(
    (nextStart: Date | null, change: DateTimeChangeContext) => {
      const resolved = applyBoundsToRange(
        resolveFlexRange({ ...value, start: nextStart }),
      );

      if (!isControlled) {
        setInternalValue(resolved);
      }
      onChange?.(resolved, { source: "start", change });
      onAccept?.(resolved, { source: "start", change });
    },
    [applyBoundsToRange, isControlled, onAccept, onChange, resolveFlexRange, value],
  );

  const handleEndAccept = useCallback(
    (nextEnd: Date | null, change: DateTimeChangeContext) => {
      const resolved = applyBoundsToRange(
        resolveFlexRange({ ...value, end: nextEnd }),
      );

      if (!isControlled) {
        setInternalValue(resolved);
      }
      onChange?.(resolved, { source: "end", change });
      onAccept?.(resolved, { source: "end", change });
    },
    [applyBoundsToRange, isControlled, onAccept, onChange, resolveFlexRange, value],
  );

  const handleStartValidationChange = useCallback(
    (result: DateTimeValidationResult) => {
      if (!validateOnBlur) return;
      setStartFieldValidation(result);
    },
    [validateOnBlur],
  );

  const handleEndValidationChange = useCallback(
    (result: DateTimeValidationResult) => {
      if (!validateOnBlur) return;
      setEndFieldValidation(result);
    },
    [validateOnBlur],
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
        timezone,
      }),
    [
      mode,
      minDate,
      maxDate,
      minDateTime,
      maxDateTime,
      timezone,
      value.end,
      rangeLimits,
    ],
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
        timezone,
      }),
    [
      mode,
      minDate,
      maxDate,
      minDateTime,
      maxDateTime,
      timezone,
      value.start,
      rangeLimits,
    ],
  );

  const endReferenceDate = useMemo(
    () => resolveEndReferenceDate(value.start, rangeLimits, mode, timezone),
    [mode, rangeLimits, timezone, value.start],
  );

  const startReferenceDate = useMemo(
    () => resolveStartReferenceDate(value.end, rangeLimits, mode, timezone),
    [mode, rangeLimits, timezone, value.end],
  );

  useEffect(() => {
    if (!showValidation) {
      return;
    }

    notifyValidation(validationResult);
  }, [notifyValidation, showValidation, validationResult]);

  useEffect(() => {
    if (!showValidation || !validationResult.fields) {
      return;
    }

    const { start, end } = validationResult.fields;

    if (start) {
      setStartFieldValidation((prev) =>
        prev.valid === start.valid && prev.reason === start.reason ? prev : start,
      );
    }

    if (end) {
      setEndFieldValidation((prev) =>
        prev.valid === end.valid && prev.reason === end.reason ? prev : end,
      );
    }
  }, [showValidation, validationResult]);

  const handlePickerClose = useCallback(() => {
    pickerInteractionGraceUntilRef.current = Date.now() + 300;
  }, []);

  const handlePickerOpen = useCallback(() => {
    pickerInteractionGraceUntilRef.current = Date.now() + 300;
  }, []);

  useEffect(() => {
    if (!validateOnBlur) {
      return;
    }

    const container = rangeContainerRef.current;
    if (!container) {
      return;
    }

    const handleFocusOut = (event: FocusEvent) => {
      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && container.contains(relatedTarget)) {
        return;
      }

      window.setTimeout(() => {
        if (
          !shouldShowValidationOnBlur(
            container,
            pickerInteractionGraceUntilRef.current,
          )
        ) {
          return;
        }
        setShowValidation(true);
      }, 0);
    };

    container.addEventListener("focusout", handleFocusOut);
    return () => container.removeEventListener("focusout", handleFocusOut);
  }, [validateOnBlur]);

  const validateFields = useCallback(
    (
      start: DateTimeValidationResult,
      end: DateTimeValidationResult,
    ): DateTimeRangeValidationResult => {
      setShowValidation(true);
      const result = buildRangeValidationResult({
        start,
        end,
        startValue: value.start,
        endValue: value.end,
        rangeOrderValid,
        startFieldName,
        endFieldName,
        fillRequired,
        locale,
        validationRules,
        checkRequiredAndRange: true,
        allowPartialRange: false,
      });

      setStartFieldValidation(result.fields?.start ?? start);
      setEndFieldValidation(result.fields?.end ?? end);
      notifyValidation(result, { force: true });

      return result;
    },
    [
      endFieldName,
      fillRequired,
      locale,
      notifyValidation,
      rangeOrderValid,
      startFieldName,
      validationRules,
      value.end,
      value.start,
    ],
  );

  const resetValidation = useCallback(() => {
    setShowValidation(false);
    setStartFieldValidation(VALID_FIELD);
    setEndFieldValidation(VALID_FIELD);
    lastNotifiedValidationKeyRef.current = null;
    onValidationChange?.({ valid: true });
  }, [onValidationChange]);


  return {
    value,
    hasError,
    validationResult,
    startConstraints,
    endConstraints,
    startReferenceDate,
    endReferenceDate,
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
      dateTimePrecisions: availablePrecisions.length > 0 ? availablePrecisions : undefined,
      selectedDateTimePrecision: activePrecision ?? undefined,
      onDateTimePrecisionChange: handleDateTimePrecisionChange,
      validationMode,
    },
    startProps,
    endProps,
    validateFields,
    resetValidation,
    rangeContainerRef,
    handlePickerClose,
    handlePickerOpen,
  };
}


