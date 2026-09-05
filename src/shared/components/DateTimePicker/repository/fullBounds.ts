import {
  createInstant,
  getDate,
  getHours,
  getMilliseconds,
  getMinutes,
  getMonth,
  getSeconds,
  getYear,
} from "./timezone";
import { resolveDateTimePickerPrecision } from "../types/precision.types";
import type { DateTimePickerPrecisionValue } from "../types/precision.types";

export type DateBoundsRange = {
  start: Date | null;
  end: Date | null;
};

export const EMPTY_DATE_BOUNDS_RANGE: DateBoundsRange = {
  start: null,
  end: null,
};

export type FullBoundsInput = {
  start?: Date | null;
  end?: Date | null;
  precision: DateTimePickerPrecisionValue;
};

const boundOfPrecisionUtc = (
  date: Date,
  precision: DateTimePickerPrecisionValue,
  bound: "start" | "end",
): Date => {
  const resolved = resolveDateTimePickerPrecision(precision);
  const isEnd = bound === "end";

  const instant = {
    year: getYear(date, "UTC"),
    month: getMonth(date, "UTC"),
    date: getDate(date, "UTC"),
    hours: getHours(date, "UTC"),
    minutes: getMinutes(date, "UTC"),
    seconds: getSeconds(date, "UTC"),
    milliseconds: getMilliseconds(date, "UTC"),
  };

  if (resolved.mode === "date") {
    instant.hours = isEnd ? 23 : 0;
    instant.minutes = isEnd ? 59 : 0;
    instant.seconds = isEnd ? 59 : 0;
    instant.milliseconds = isEnd ? 999 : 0;
  } else if (!resolved.showSeconds) {
    instant.seconds = isEnd ? 59 : 0;
    instant.milliseconds = isEnd ? 999 : 0;
  } else if (!resolved.showMilliseconds) {
    instant.milliseconds = isEnd ? 999 : 0;
  }

  return createInstant(instant, "UTC");
};

export function resolveFullBounds({
  start,
  end,
  precision,
}: FullBoundsInput): DateBoundsRange {
  const endRef = end ?? start;
  return {
    start: start ? boundOfPrecisionUtc(start, precision, "start") : null,
    end: endRef ? boundOfPrecisionUtc(endRef, precision, "end") : null,
  };
}

//Normalizuje start i end osobno bez uzupełniania end z start DateTimeRange
export function resolveFullBoundsFields({
  start,
  end,
  precision,
}: FullBoundsInput): DateBoundsRange {
  return {
    start: start ? boundOfPrecisionUtc(start, precision, "start") : null,
    end: end ? boundOfPrecisionUtc(end, precision, "end") : null,
  };
}

export function resolveFullBoundsForSingleDate(
  date: Date | null,
  precision: DateTimePickerPrecisionValue | null,
): DateBoundsRange {
  if (!date || precision == null) {
    return EMPTY_DATE_BOUNDS_RANGE;
  }
  return resolveFullBounds({ start: date, end: date, precision });
}

export function toDisplayDate(
  value: Date | DateBoundsRange | null | undefined,
): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  return value.start;
}
