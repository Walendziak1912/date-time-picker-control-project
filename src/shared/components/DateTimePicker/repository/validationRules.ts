import { normalizeLocale, type SupportedLocale } from "../types/locale.types";
import {
  FillRequired,
  type ValidationCode,
  type ValidationMessageVars,
  type ValidationRules,
} from "../types/validation.types";

function defaultMessages(locale: SupportedLocale): Record<ValidationCode, string> {
  const pl = locale === "pl-PL";

  return {
    "date-required": pl ? "Data jest wymagana" : "Date is required",
    "date-format": pl
      ? "Niepoprawny format daty ({format})"
      : "Invalid date format ({format})",
    "both-dates-required": pl
      ? "Data startowa i końcowa są wymagane"
      : "Start and end dates are required",
    "start-date-required": pl
      ? "Data początkowa jest wymagana"
      : "Start date is required",
    "end-date-required": pl
      ? "Data końcowa jest wymagana"
      : "End date is required",
    "start-date-after-end-date": pl
      ? "Data początkowa nie może być późniejsza niż data końcowa"
      : "Start date cannot be later than end date",
    "end-date-before-start-date": pl
      ? "Data w polu {endField} nie może być wcześniejsza niż w polu {startField}"
      : "The date in {endField} cannot be earlier than in {startField}",
    "start-date-format": pl
      ? "Niepoprawny format daty w polu {startField}"
      : "Invalid date format in field {startField}",
    "end-date-format": pl
      ? "Niepoprawny format daty w polu {endField}"
      : "Invalid date format in field {endField}",
    "invalid-date-range": pl ? "Niepoprawny zakres dat" : "Invalid date range",
  };
}

export function getDefaultValidationRules(
  locale?: string,
): Record<ValidationCode, string> {
  return defaultMessages(normalizeLocale(locale));
}

export function resolveValidationMessage(
  code: ValidationCode,
  locale?: string,
  rules?: ValidationRules,
  vars?: ValidationMessageVars,
): string {
  const resolvedLocale = normalizeLocale(locale);
  const defaults = defaultMessages(resolvedLocale);
  let message = rules?.[code] ?? defaults[code];

  if (vars?.format) {
    message = message.replace(/\{format\}/g, vars.format);
  }
  if (vars?.startField) {
    message = message.replace(/\{startField\}/g, vars.startField);
  }
  if (vars?.endField) {
    message = message.replace(/\{endField\}/g, vars.endField);
  }

  return message;
}

export function isStartDateRequired(fillRequired: FillRequired): boolean {
  return (
    fillRequired === FillRequired.All ||
    fillRequired === FillRequired.StartDate
  );
}

export function isEndDateRequired(fillRequired: FillRequired): boolean {
  return (
    fillRequired === FillRequired.All || fillRequired === FillRequired.EndDate
  );
}
