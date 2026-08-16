import { describe, expect, test } from "vitest";
import { FillRequired } from "../../../../shared/components/DateTimePicker/types/validation.types";
import {
  buildRangeValidationResult,
  resolveRangeFieldErrors,
  VALID_FIELD,
} from "../../../../shared/components/DateTimeRange/repository/validationUtils";

const utc = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m, d));

const START_FIELD = "Od";
const END_FIELD = "Do";

function buildOptions(
  overrides: Partial<Parameters<typeof buildRangeValidationResult>[0]> = {},
) {
  return {
    start: VALID_FIELD,
    end: VALID_FIELD,
    startValue: utc(2026, 6, 1),
    endValue: utc(2026, 6, 10),
    rangeOrderValid: true,
    startFieldName: START_FIELD,
    endFieldName: END_FIELD,
    fillRequired: FillRequired.None,
    locale: "pl-PL",
    checkRequiredAndRange: true,
    allowPartialRange: false,
    ...overrides,
  };
}

describe("buildRangeValidationResult", () => {
  test("Zwraca valid dla poprawnego zakresu", () => {
    const result = buildRangeValidationResult(buildOptions());

    expect(result).toEqual({
      valid: true,
      fields: { start: VALID_FIELD, end: VALID_FIELD },
    });
  });

  test("fillRequired=All i obie puste daty zgłasza both-dates-required", () => {
    const result = buildRangeValidationResult(
      buildOptions({
        startValue: null,
        endValue: null,
        fillRequired: FillRequired.All,
        validationRules: { "both-dates-required": "Wybierz obie daty" },
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("both-dates-required");
    expect(result.message).toBe("Wybierz obie daty");
    expect(result.fields?.start?.valid).toBe(false);
    expect(result.fields?.end?.valid).toBe(false);
  });

  test("Pola z reason=date-required nie są traktowane jako błąd formatu", () => {
    const requiredField = {
      valid: false,
      reason: "date-required" as const,
      message: "Data początkowa jest wymagana",
    };

    const result = buildRangeValidationResult(
      buildOptions({
        start: requiredField,
        end: requiredField,
        startValue: null,
        endValue: null,
        fillRequired: FillRequired.All,
        validationRules: { "both-dates-required": "Wybierz obie daty" },
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("both-dates-required");
    expect(result.message).toBe("Wybierz obie daty");
  });

  test("fillRequired=StartDate i pusta data początkowa zgłasza start-date-required", () => {
    const result = buildRangeValidationResult(
      buildOptions({
        startValue: null,
        endValue: utc(2026, 6, 10),
        fillRequired: FillRequired.StartDate,
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("start-date-required");
    expect(result.fields?.start?.valid).toBe(false);
    expect(result.fields?.end?.valid).toBe(true);
  });

  test("fillRequired=EndDate i pusta data końcowa zgłasza end-date-required", () => {
    const result = buildRangeValidationResult(
      buildOptions({
        startValue: utc(2026, 6, 1),
        endValue: null,
        fillRequired: FillRequired.EndDate,
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("end-date-required");
    expect(result.fields?.start?.valid).toBe(true);
    expect(result.fields?.end?.valid).toBe(false);
  });

  test("allowPartialRange=true pomija błąd gdy wypełniono tylko jedno pole przy fillRequired=All", () => {
    const result = buildRangeValidationResult(
      buildOptions({
        startValue: utc(2026, 6, 1),
        endValue: null,
        fillRequired: FillRequired.All,
        allowPartialRange: true,
      }),
    );

    expect(result.valid).toBe(true);
  });

  test("allowPartialRange=false wymaga obu dat przy fillRequired=All", () => {
    const result = buildRangeValidationResult(
      buildOptions({
        startValue: utc(2026, 6, 1),
        endValue: null,
        fillRequired: FillRequired.All,
        allowPartialRange: false,
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("end-date-required");
  });

  test("Niepoprawna kolejność dat zgłasza end-date-before-start-date", () => {
    const result = buildRangeValidationResult(
      buildOptions({
        startValue: utc(2026, 6, 20),
        endValue: utc(2026, 6, 10),
        rangeOrderValid: false,
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("end-date-before-start-date");
    expect(result.fields?.start?.valid).toBe(false);
    expect(result.fields?.end?.valid).toBe(false);
  });

  test("Niepoprawny format w polu początkowym zgłasza start-date-format", () => {
    const result = buildRangeValidationResult(
      buildOptions({
        start: { valid: false, reason: "date-format", message: "Zły format" },
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("start-date-format");
    expect(result.fields?.start?.reason).toBe("date-format");
    expect(result.fields?.end?.valid).toBe(true);
  });

  test("Niepoprawny format w polu końcowym zgłasza end-date-format", () => {
    const result = buildRangeValidationResult(
      buildOptions({
        end: { valid: false, reason: "date-format", message: "Zły format" },
      }),
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("end-date-format");
    expect(result.fields?.end?.reason).toBe("date-format");
    expect(result.fields?.start?.valid).toBe(true);
  });

  test("checkRequiredAndRange=false pomija walidację wymagalności i kolejności", () => {
    const result = buildRangeValidationResult(
      buildOptions({
        startValue: null,
        endValue: null,
        fillRequired: FillRequired.All,
        rangeOrderValid: false,
        checkRequiredAndRange: false,
      }),
    );

    expect(result.valid).toBe(true);
  });
});

describe("resolveRangeFieldErrors", () => {
  test("both-dates-required podświetla oba pola", () => {
    expect(
      resolveRangeFieldErrors({
        validationResult: {
          valid: false,
          reason: "both-dates-required",
          fields: {
            start: { valid: false },
            end: { valid: false },
          },
        },
      }),
    ).toEqual({ startHasError: true, endHasError: true });
  });

  test("start-date-required podświetla tylko pole początkowe", () => {
    expect(
      resolveRangeFieldErrors({
        validationResult: {
          valid: false,
          reason: "start-date-required",
          fields: {
            start: { valid: false },
            end: { valid: true },
          },
        },
      }),
    ).toEqual({ startHasError: true, endHasError: false });
  });

  test("end-date-required podświetla tylko pole końcowe", () => {
    expect(
      resolveRangeFieldErrors({
        validationResult: {
          valid: false,
          reason: "end-date-required",
          fields: {
            start: { valid: true },
            end: { valid: false },
          },
        },
      }),
    ).toEqual({ startHasError: false, endHasError: true });
  });

  test("end-date-before-start-date podświetla oba pola z błędem kolejności", () => {
    expect(
      resolveRangeFieldErrors({
        validationResult: {
          valid: false,
          reason: "end-date-before-start-date",
          fields: {
            start: { valid: false },
            end: { valid: false },
          },
        },
      }),
    ).toEqual({ startHasError: true, endHasError: true });
  });

  test("error=true bez szczegółów pola podświetla oba pola", () => {
    expect(
      resolveRangeFieldErrors({
        error: true,
        validationResult: { valid: false },
      }),
    ).toEqual({ startHasError: true, endHasError: true });
  });
});
