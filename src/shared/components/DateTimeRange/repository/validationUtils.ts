import type { DateTimeValidationResult } from "../../DateTimePicker";
import {
  isEndDateRequired,
  isStartDateRequired,
  resolveValidationMessage,
} from "../../DateTimePicker/repository/validationRules";
import {
  FillRequired,
  type DateTimeRangeValidationCode,
  type ValidationRules,
} from "../../DateTimePicker/types/validation.types";
import type { DateTimeRangeValidationResult } from "../types";

export const VALID_FIELD: DateTimeValidationResult = { valid: true };

function isFieldFormatInvalid(
  field: DateTimeValidationResult,
): boolean {
  return !field.valid && field.reason === "date-format";
}

function mapFieldFormatCode(
  field: "start" | "end",
): "start-date-format" | "end-date-format" {
  return field === "start" ? "start-date-format" : "end-date-format";
}

function fieldVars(startFieldName: string, endFieldName: string) {
  return { startField: startFieldName, endField: endFieldName };
}

function buildFormatValidationMessage(options: {
  start: DateTimeValidationResult;
  end: DateTimeValidationResult;
  startFieldName: string;
  endFieldName: string;
  locale?: string;
  validationRules?: ValidationRules;
}): { message: string; reason: DateTimeRangeValidationCode } {
  const { start, end, startFieldName, endFieldName, locale, validationRules } =
    options;
  const vars = fieldVars(startFieldName, endFieldName);
  const startInvalid = isFieldFormatInvalid(start);
  const endInvalid = isFieldFormatInvalid(end);

  if (startInvalid && endInvalid) {
    return {
      reason: "start-date-format",
      message: resolveValidationMessage(
        "start-date-format",
        locale,
        validationRules,
        vars,
      ),
    };
  }

  if (startInvalid) {
    return {
      reason: "start-date-format",
      message:
        start.message ??
        resolveValidationMessage(
          "start-date-format",
          locale,
          validationRules,
          vars,
        ),
    };
  }

  return {
    reason: "end-date-format",
    message:
      end.message ??
      resolveValidationMessage(
        "end-date-format",
        locale,
        validationRules,
        vars,
      ),
  };
}

function buildRequiredValidationResult(options: {
  startEmpty: boolean;
  endEmpty: boolean;
  fillRequired: FillRequired;
  startFieldName: string;
  endFieldName: string;
  locale?: string;
  validationRules?: ValidationRules;
  allowPartialRange?: boolean;
}): DateTimeRangeValidationResult | null {
  const {
    startEmpty,
    endEmpty,
    fillRequired,
    startFieldName,
    endFieldName,
    locale,
    validationRules,
    allowPartialRange = false,
  } = options;
  const vars = fieldVars(startFieldName, endFieldName);

  if (fillRequired === FillRequired.None) {
    return null;
  }

  if (
    allowPartialRange &&
    fillRequired === FillRequired.All &&
    startEmpty !== endEmpty
  ) {
    return null;
  }

  if (fillRequired === FillRequired.All && startEmpty && endEmpty) {
    return {
      valid: false,
      reason: "both-dates-required",
      message: resolveValidationMessage(
        "both-dates-required",
        locale,
        validationRules,
        vars,
      ),
      fields: {
        start: {
          valid: false,
          reason: "date-required",
          message: resolveValidationMessage(
            "start-date-required",
            locale,
            validationRules,
            vars,
          ),
        },
        end: {
          valid: false,
          reason: "date-required",
          message: resolveValidationMessage(
            "end-date-required",
            locale,
            validationRules,
            vars,
          ),
        },
      },
    };
  }

  if (isStartDateRequired(fillRequired) && startEmpty) {
    return {
      valid: false,
      reason: "start-date-required",
      message: resolveValidationMessage(
        "start-date-required",
        locale,
        validationRules,
        vars,
      ),
      fields: {
        start: {
          valid: false,
          reason: "date-required",
          message: resolveValidationMessage(
            "start-date-required",
            locale,
            validationRules,
            vars,
          ),
        },
        end: VALID_FIELD,
      },
    };
  }

  if (isEndDateRequired(fillRequired) && endEmpty) {
    return {
      valid: false,
      reason: "end-date-required",
      message: resolveValidationMessage(
        "end-date-required",
        locale,
        validationRules,
        vars,
      ),
      fields: {
        start: VALID_FIELD,
        end: {
          valid: false,
          reason: "date-required",
          message: resolveValidationMessage(
            "end-date-required",
            locale,
            validationRules,
            vars,
          ),
        },
      },
    };
  }

  return null;
}

export function buildRangeValidationResult(options: {
  start: DateTimeValidationResult;
  end: DateTimeValidationResult;
  startValue: Date | null;
  endValue: Date | null;
  rangeOrderValid: boolean;
  startFieldName: string;
  endFieldName: string;
  fillRequired?: FillRequired;
  locale?: string;
  validationRules?: ValidationRules;
  checkRequiredAndRange?: boolean;
  allowPartialRange?: boolean;
}): DateTimeRangeValidationResult {
  const {
    start,
    end,
    startValue,
    endValue,
    rangeOrderValid,
    startFieldName,
    endFieldName,
    fillRequired = FillRequired.None,
    locale,
    validationRules,
    checkRequiredAndRange = true,
    allowPartialRange = false,
  } = options;

  const vars = fieldVars(startFieldName, endFieldName);
  const startEmpty = startValue == null;
  const endEmpty = endValue == null;

  const startFormatInvalid = isFieldFormatInvalid(start);
  const endFormatInvalid = isFieldFormatInvalid(end);

  if (startFormatInvalid || endFormatInvalid) {
    const { message, reason } = buildFormatValidationMessage({
      start,
      end,
      startFieldName,
      endFieldName,
      locale,
      validationRules,
    });

    return {
      valid: false,
      reason,
      message,
      fields: {
        start: startFormatInvalid
          ? {
              valid: false,
              reason: "date-format",
              message: resolveValidationMessage(
                mapFieldFormatCode("start"),
                locale,
                validationRules,
                vars,
              ),
            }
          : start,
        end: endFormatInvalid
          ? {
              valid: false,
              reason: "date-format",
              message: resolveValidationMessage(
                mapFieldFormatCode("end"),
                locale,
                validationRules,
                vars,
              ),
            }
          : end,
      },
    };
  }

  if (checkRequiredAndRange) {
    const requiredResult = buildRequiredValidationResult({
      startEmpty,
      endEmpty,
      fillRequired,
      startFieldName,
      endFieldName,
      locale,
      validationRules,
      allowPartialRange,
    });
    if (requiredResult) {
      return requiredResult;
    }

    if (!rangeOrderValid && startValue != null && endValue != null) {
      const reason: DateTimeRangeValidationCode = "end-date-before-start-date";

      return {
        valid: false,
        reason,
        message: resolveValidationMessage(
          reason,
          locale,
          validationRules,
          vars,
        ),
        fields: {
          start: {
            valid: false,
            message: resolveValidationMessage(
              "start-date-after-end-date",
              locale,
              validationRules,
              vars,
            ),
          },
          end: {
            valid: false,
            message: resolveValidationMessage(
              "end-date-before-start-date",
              locale,
              validationRules,
              vars,
            ),
          },
        },
      };
    }
  }

  return { valid: true, fields: { start, end } };
}

export function resolveRangeFieldErrors(options: {
  error?: boolean;
  validationResult: DateTimeRangeValidationResult;
}): { startHasError: boolean; endHasError: boolean } {
  const { error, validationResult } = options;
  const startFieldInvalid = validationResult.fields?.start?.valid === false;
  const endFieldInvalid = validationResult.fields?.end?.valid === false;
  const reason = validationResult.reason;
  const rangeOrderInvalid = reason === "end-date-before-start-date";
  const bothRequiredInvalid = reason === "both-dates-required";
  const startRequiredInvalid = reason === "start-date-required";
  const endRequiredInvalid = reason === "end-date-required";
  const hasFieldLevelDetail =
    startFieldInvalid ||
    endFieldInvalid ||
    rangeOrderInvalid ||
    bothRequiredInvalid ||
    startRequiredInvalid ||
    endRequiredInvalid;

  return {
    startHasError:
      startFieldInvalid ||
      bothRequiredInvalid ||
      startRequiredInvalid ||
      (Boolean(error) && !hasFieldLevelDetail),
    endHasError:
      endFieldInvalid ||
      rangeOrderInvalid ||
      bothRequiredInvalid ||
      endRequiredInvalid ||
      (Boolean(error) && !hasFieldLevelDetail),
  };
}
