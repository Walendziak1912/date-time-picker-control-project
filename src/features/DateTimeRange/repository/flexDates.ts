import {
  getDate,
  getMonth,
  getYear,
  type DateTimePickerTimezone,
} from "../../DateTimePicker";
import {
  normalizeLocale,
  type SupportedLocale,
} from "../../DateTimePicker/types/locale.types";
import type {
  DateTimeRangeFlexibility,
  DateTimeRangeFlexOption,
  DateTimeRangeFlexPayload,
  DateTimeRangeValue,
} from "../types";

const FLEX_LABELS: Record<
  SupportedLocale,
  Record<DateTimeRangeFlexibility, string>
> = {
  "pl-PL": {
    0: "Dokładny termin",
    1: "± 1 dzień",
    2: "± 2 dni",
    3: "± 3 dni",
    7: "± 7 dni",
  },
  "en-US": {
    0: "Exact dates",
    1: "± 1 day",
    2: "± 2 days",
    3: "± 3 days",
    7: "± 7 days",
  },
};

export function buildDefaultFlexDatesOptions(
  locale?: string,
): DateTimeRangeFlexOption[] {
  const resolvedLocale = normalizeLocale(locale);
  const labels = FLEX_LABELS[resolvedLocale];

  return (Object.keys(labels) as unknown as DateTimeRangeFlexibility[]).map(
    (value) => ({
      value,
      label: labels[value],
    }),
  );
}

//Domyślne opcje elastyczności dla locale pl-PL
export const DEFAULT_FLEX_DATES_OPTIONS = buildDefaultFlexDatesOptions("pl-PL");

function formatBackendDate(
  date: Date,
  timezone: DateTimePickerTimezone,
): string {
  const year = getYear(date, timezone);
  const month = String(getMonth(date, timezone) + 1).padStart(2, "0");
  const day = String(getDate(date, timezone)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function serializeFlexRange(
  value: DateTimeRangeValue,
  timezone: DateTimePickerTimezone = "UTC",
): DateTimeRangeFlexPayload | null {
  if (value.start == null || value.end == null) return null;

  return {
    from: formatBackendDate(value.start, timezone),
    to: formatBackendDate(value.end, timezone),
    flexibility: value.flexibility ?? 0,
  };
}

export function isFlexibilityValue(
  value: unknown,
): value is DateTimeRangeFlexibility {
  return (
    value === 0 || value === 1 || value === 2 || value === 3 || value === 7
  );
}
