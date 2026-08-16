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
} from "../../DateTimePicker";
import { FillRequired } from "../../DateTimePicker/types/validation.types";
import {
  endOfDayTz,
  nowInTimezone,
  startOfDayTz,
} from "../../DateTimePicker/repository";
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
    dateTimePrecision,
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
    helperText,
    onValidationChange,
    showFlexDates = false,
    flexibility: flexibilityProp,
    defaultFlexibility = 0,
    useEndOfDayAsRangeEnd = true,
    fillRequired = FillRequired.None,
    validationRules,
  } = props;

  const availablePrecisions = useMemo(
    () => normalizeDateTimePrecisions(dateTimePrecisions ?? dateTimePrecision),
    [dateTimePrecisions, dateTimePrecision],
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
        allowPartialRange: true,
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

  const handleDateTimePrecisionChange = useCallback(
    (nextPrecision: DateTimePickerPrecisionValue) => {
      const previousPrecision = activePrecision;

      if (!isPrecisionControlled) {
        setInternalPrecision(nextPrecision);
      }
      onDateTimePrecisionChange?.(nextPrecision);

      if (
        !useEndOfDayAsRangeEnd ||
        previousPrecision == null ||
        previousPrecision === nextPrecision
      ) {
        return;
      }

      const fromMode = resolveDateTimePickerPrecision(previousPrecision).mode;
      const toMode = resolveDateTimePickerPrecision(nextPrecision).mode;
      if (fromMode !== "date" || toMode === "date") {
        return;
      }

      const fallback = nowInTimezone(timezone);
      const startRef = value.start ?? value.end ?? fallback;
      const endRef = value.end ?? value.start ?? fallback;
      const nextRange = {
        ...value,
        start: startOfDayTz(startRef, timezone),
        end: endOfDayTz(endRef, timezone),
      };

      queueMicrotask(() => {
        commitValue(nextRange, {
          source: "start",
          change: { source: "view", precision: nextPrecision },
        });
      });
    },
    [
      activePrecision,
      commitValue,
      useEndOfDayAsRangeEnd,
      isPrecisionControlled,
      onDateTimePrecisionChange,
      timezone,
      value,
    ],
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

  const endReferenceDate = useMemo(
    () => resolveEndReferenceDate(value.start, rangeLimits, mode),
    [mode, rangeLimits, value.start],
  );

  const startReferenceDate = useMemo(
    () => resolveStartReferenceDate(value.end, rangeLimits, mode),
    [mode, rangeLimits, value.end],
  );

  useEffect(() => {
    if (!showValidation) {
      return;
    }

    notifyValidation(validationResult);
  }, [notifyValidation, showValidation, validationResult]);

  const handlePickerClose = useCallback(() => {
    pickerInteractionGraceUntilRef.current = Date.now() + 300;
  }, []);

  const handlePickerOpen = useCallback(() => {
    pickerInteractionGraceUntilRef.current = Date.now() + 300;
  }, []);

  useEffect(() => {
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
  }, []);

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

  return {
    value,
    hasError,
    helperText,
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
    },
    startProps,
    endProps,
    validateFields,
    rangeContainerRef,
    handlePickerClose,
    handlePickerOpen,
  };
}
