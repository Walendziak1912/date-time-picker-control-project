export const FillRequired = {
  None: "None",
  All: "All",
  StartDate: "StartDate",
  EndDate: "EndDate",
} as const;

export type FillRequired = (typeof FillRequired)[keyof typeof FillRequired];

export type DateTimePickerValidationCode = "date-required" | "date-format";

export type DateTimeRangeValidationCode =
  | "both-dates-required"
  | "start-date-required"
  | "end-date-required"
  | "start-date-format"
  | "end-date-format"
  | "start-date-after-end-date"
  | "end-date-before-start-date"
  | "invalid-date-range";

export type ValidationCode =
  | DateTimePickerValidationCode
  | DateTimeRangeValidationCode;

//brak klucza to z automatu domyślny komunikat z wbudowanego słownika
export type ValidationRules = Partial<Record<ValidationCode, string>>;

export type ValidationMessageVars = {
  format?: string;
  startField?: string;
  endField?: string;
};
