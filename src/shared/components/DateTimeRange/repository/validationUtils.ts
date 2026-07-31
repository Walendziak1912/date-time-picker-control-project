import type { DateTimeValidationResult } from "../../DateTimePicker";
import { formatRangeMessage } from "./rangeLocaleText";
import type { DateTimeRangeValidationResult } from "../types";
import type { ResolvedRangeLocaleText } from "../types/rangeLocaleText.types";

export const VALID_FIELD: DateTimeValidationResult = { valid: true };

export function fieldLabel(label: unknown, fallback: string): string {
  return typeof label === "string" && label.trim().length > 0
    ? label
    : fallback;
}

export function buildFormatValidationMessage(
  start: DateTimeValidationResult,
  end: DateTimeValidationResult,
  startFieldName: string,
  endFieldName: string,
  messages: Pick<
    ResolvedRangeLocaleText,
    "invalidFormatBoth" | "invalidFormatStart" | "invalidFormatEnd"
  >,
): string {
  const startInvalid = !start.valid;
  const endInvalid = !end.valid;
  const fieldVars = { startField: startFieldName, endField: endFieldName };

  if (startInvalid && endInvalid) {
    return formatRangeMessage(messages.invalidFormatBoth, fieldVars);
  }

  if (startInvalid) {
    return (
      start.message ??
      formatRangeMessage(messages.invalidFormatStart, fieldVars)
    );
  }

  return (
    end.message ?? formatRangeMessage(messages.invalidFormatEnd, fieldVars)
  );
}

export function buildRangeValidationResult(options: {
  start: DateTimeValidationResult;
  end: DateTimeValidationResult;
  rangeOrderValid: boolean;
  startFieldName: string;
  endFieldName: string;
  messages: Pick<
    ResolvedRangeLocaleText,
    | "invalidFormatBoth"
    | "invalidFormatStart"
    | "invalidFormatEnd"
    | "invalidRange"
  >;
}): DateTimeRangeValidationResult {
  const {
    start,
    end,
    rangeOrderValid,
    startFieldName,
    endFieldName,
    messages,
  } = options;
  const fields = { start, end };
  const fieldVars = { startField: startFieldName, endField: endFieldName };

  if (!start.valid || !end.valid) {
    return {
      valid: false,
      reason: "invalidFormat",
      message: buildFormatValidationMessage(
        start,
        end,
        startFieldName,
        endFieldName,
        messages,
      ),
      fields,
    };
  }

  if (!rangeOrderValid) {
    return {
      valid: false,
      reason: "invalidRange",
      message: formatRangeMessage(messages.invalidRange, fieldVars),
      fields,
    };
  }

  return { valid: true, fields };
}

export function resolveRangeFieldErrors(options: {
  error?: boolean;
  validationResult: DateTimeRangeValidationResult;
}): { startHasError: boolean; endHasError: boolean } {
  const { error, validationResult } = options;
  const startFieldInvalid = validationResult.fields?.start?.valid === false;
  const endFieldInvalid = validationResult.fields?.end?.valid === false;
  const rangeOrderInvalid = validationResult.reason === "invalidRange";
  const hasFieldLevelDetail =
    startFieldInvalid || endFieldInvalid || rangeOrderInvalid;

  return {
    startHasError:
      startFieldInvalid || (Boolean(error) && !hasFieldLevelDetail),
    endHasError:
      endFieldInvalid ||
      rangeOrderInvalid ||
      (Boolean(error) && !hasFieldLevelDetail),
  };
}
