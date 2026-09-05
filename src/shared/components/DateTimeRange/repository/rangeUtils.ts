import {
  addMonthsTz,
  createInstant,
  endOfDayTz,
  getDate,
  getMonth,
  getYear,
  startOfDayTz,
} from "../../DateTimePicker/repository/timezone";
import type {
  DateTimePickerMode,
  DateTimePickerTimezone,
} from "../../DateTimePicker/types";
import type { DateTimeRangeLimits, DateTimeRangeValue } from "../types";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export function addCalendarDays(
  date: Date,
  days: number,
  timezone: DateTimePickerTimezone,
): Date {
  const next = startOfDayTz(date, timezone);

  if (timezone === "UTC") {
    return createInstant(
      {
        year: getYear(next, timezone),
        month: getMonth(next, timezone),
        date: getDate(next, timezone) + days,
      },
      timezone,
    );
  }

  const result = new Date(next);
  result.setDate(result.getDate() + days);
  return result;
}

export function addCalendarMonths(
  date: Date,
  months: number,
  timezone: DateTimePickerTimezone,
): Date {
  return addMonthsTz(date, months, timezone);
}

export function endOfDay(
  date: Date,
  timezone: DateTimePickerTimezone,
): Date {
  return endOfDayTz(date, timezone);
}

function startOfDay(date: Date, timezone: DateTimePickerTimezone): Date {
  return startOfDayTz(date, timezone);
}

export function hasRangeLimits(limits: DateTimeRangeLimits): boolean {
  return (
    (limits.maxRangeDays != null && limits.maxRangeDays > 0) ||
    (limits.maxRangeHours != null && limits.maxRangeHours > 0) ||
    (limits.maxRangeMinutes != null && limits.maxRangeMinutes > 0) ||
    (limits.maxRangeMonths != null && limits.maxRangeMonths > 0)
  );
}

function getMaxEndFromDays(
  start: Date,
  days: number,
  mode: DateTimePickerMode,
  precision: boolean,
  timezone: DateTimePickerTimezone,
): Date {
  if (precision) {
    return new Date(start.getTime() + days * MS_PER_DAY);
  }

  if (mode === "date") {
    return endOfDay(addCalendarDays(start, days - 1, timezone), timezone);
  }

  return endOfDay(addCalendarDays(start, days - 1, timezone), timezone);
}

function getMinStartFromDays(
  end: Date,
  days: number,
  mode: DateTimePickerMode,
  precision: boolean,
  timezone: DateTimePickerTimezone,
): Date {
  if (precision) {
    return new Date(end.getTime() - days * MS_PER_DAY);
  }

  if (mode === "date") {
    return startOfDay(addCalendarDays(end, -(days - 1), timezone), timezone);
  }

  return startOfDay(addCalendarDays(end, -(days - 1), timezone), timezone);
}

function getMaxEndFromMonths(
  start: Date,
  months: number,
  precision: boolean,
  timezone: DateTimePickerTimezone,
): Date {
  if (precision) {
    return addCalendarMonths(start, months, timezone);
  }

  return endOfDay(
    addCalendarMonths(startOfDay(start, timezone), months - 1, timezone),
    timezone,
  );
}

function getMinStartFromMonths(
  end: Date,
  months: number,
  precision: boolean,
  timezone: DateTimePickerTimezone,
): Date {
  if (precision) {
    return addCalendarMonths(end, -months, timezone);
  }

  return startOfDay(
    addCalendarMonths(startOfDay(end, timezone), -(months - 1), timezone),
    timezone,
  );
}

export function getMaxEndForStart(
  start: Date,
  limits: DateTimeRangeLimits,
  mode: DateTimePickerMode,
  timezone: DateTimePickerTimezone,
): Date | undefined {
  const precision = limits.precision ?? false;
  const candidates: Date[] = [];

  if (limits.maxRangeDays != null && limits.maxRangeDays > 0) {
    candidates.push(
      getMaxEndFromDays(start, limits.maxRangeDays, mode, precision, timezone),
    );
  }

  if (limits.maxRangeHours != null && limits.maxRangeHours > 0) {
    candidates.push(
      new Date(start.getTime() + limits.maxRangeHours * MS_PER_HOUR),
    );
  }

  if (limits.maxRangeMinutes != null && limits.maxRangeMinutes > 0) {
    candidates.push(
      new Date(start.getTime() + limits.maxRangeMinutes * MS_PER_MINUTE),
    );
  }

  if (limits.maxRangeMonths != null && limits.maxRangeMonths > 0) {
    candidates.push(
      getMaxEndFromMonths(start, limits.maxRangeMonths, precision, timezone),
    );
  }

  if (candidates.length === 0) return undefined;

  return candidates.reduce((earliest, candidate) =>
    candidate < earliest ? candidate : earliest,
  );
}

export function getMinStartForEnd(
  end: Date,
  limits: DateTimeRangeLimits,
  mode: DateTimePickerMode,
  timezone: DateTimePickerTimezone,
): Date | undefined {
  const precision = limits.precision ?? false;
  const candidates: Date[] = [];

  if (limits.maxRangeDays != null && limits.maxRangeDays > 0) {
    candidates.push(
      getMinStartFromDays(end, limits.maxRangeDays, mode, precision, timezone),
    );
  }

  if (limits.maxRangeHours != null && limits.maxRangeHours > 0) {
    candidates.push(
      new Date(end.getTime() - limits.maxRangeHours * MS_PER_HOUR),
    );
  }

  if (limits.maxRangeMinutes != null && limits.maxRangeMinutes > 0) {
    candidates.push(
      new Date(end.getTime() - limits.maxRangeMinutes * MS_PER_MINUTE),
    );
  }

  if (limits.maxRangeMonths != null && limits.maxRangeMonths > 0) {
    candidates.push(
      getMinStartFromMonths(end, limits.maxRangeMonths, precision, timezone),
    );
  }

  if (candidates.length === 0) return undefined;

  return candidates.reduce((latest, candidate) =>
    candidate > latest ? candidate : latest,
  );
}

export function pickLaterDate(a?: Date, b?: Date): Date | undefined {
  if (a == null) return b;
  if (b == null) return a;
  return a > b ? a : b;
}

export function pickEarlierDate(a?: Date, b?: Date): Date | undefined {
  if (a == null) return b;
  if (b == null) return a;
  return a < b ? a : b;
}

export function isRangeOrderValid(
  start: Date | null,
  end: Date | null,
): boolean {
  if (start == null || end == null) return true;
  return start <= end;
}

export function normalizeRangeValue(
  value: DateTimeRangeValue,
  limits: DateTimeRangeLimits,
  mode: DateTimePickerMode,
  timezone: DateTimePickerTimezone,
): DateTimeRangeValue {
  let { start, end } = value;

  if (start != null && end != null && start > end) {
    end = start;
  }

  if (hasRangeLimits(limits) && start != null && end != null) {
    const maxEnd = getMaxEndForStart(start, limits, mode, timezone);
    if (maxEnd != null && end > maxEnd) {
      end = maxEnd;
    }
  }

  return {
    start,
    end,
    ...(value.flexibility !== undefined
      ? { flexibility: value.flexibility }
      : {}),
  };
}

export function buildStartConstraints(options: {
  mode: DateTimePickerMode;
  minDate?: Date;
  maxDate?: Date;
  minDateTime?: Date;
  maxDateTime?: Date;
  end: Date | null;
  limits: DateTimeRangeLimits;
  timezone: DateTimePickerTimezone;
}) {
  const {
    mode,
    minDate,
    maxDate,
    minDateTime,
    maxDateTime,
    end,
    limits,
    timezone,
  } = options;

  const rangeMin =
    end != null && hasRangeLimits(limits)
      ? getMinStartForEnd(end, limits, mode, timezone)
      : undefined;

  const rangeMax = end ?? undefined;

  if (mode === "date") {
    return {
      minDate: pickLaterDate(minDate, rangeMin),
      maxDate: pickEarlierDate(maxDate, rangeMax),
      minDateTime,
      maxDateTime,
    };
  }

  return {
    minDate,
    maxDate,
    minDateTime: pickLaterDate(minDateTime, rangeMin),
    maxDateTime: pickEarlierDate(maxDateTime, rangeMax),
  };
}

export function resolveEndReferenceDate(
  start: Date | null,
  limits: DateTimeRangeLimits,
  mode: DateTimePickerMode,
  timezone: DateTimePickerTimezone,
): Date | undefined {
  if (start == null) return undefined;

  if (hasRangeLimits(limits)) {
    return getMaxEndForStart(start, limits, mode, timezone) ?? start;
  }

  return start;
}

export function resolveStartReferenceDate(
  end: Date | null,
  limits: DateTimeRangeLimits,
  mode: DateTimePickerMode,
  timezone: DateTimePickerTimezone,
): Date | undefined {
  if (end == null) return undefined;

  if (hasRangeLimits(limits)) {
    return getMinStartForEnd(end, limits, mode, timezone) ?? end;
  }

  return end;
}

export function buildEndConstraints(options: {
  mode: DateTimePickerMode;
  minDate?: Date;
  maxDate?: Date;
  minDateTime?: Date;
  maxDateTime?: Date;
  start: Date | null;
  limits: DateTimeRangeLimits;
  timezone: DateTimePickerTimezone;
}) {
  const {
    mode,
    minDate,
    maxDate,
    minDateTime,
    maxDateTime,
    start,
    limits,
    timezone,
  } = options;

  const rangeMin = start ?? undefined;
  const rangeMax =
    start != null && hasRangeLimits(limits)
      ? getMaxEndForStart(start, limits, mode, timezone)
      : undefined;

  if (mode === "date") {
    return {
      minDate: pickLaterDate(minDate, rangeMin),
      maxDate: pickEarlierDate(maxDate, rangeMax),
      minDateTime,
      maxDateTime,
    };
  }

  return {
    minDate,
    maxDate,
    minDateTime: pickLaterDate(minDateTime, rangeMin),
    maxDateTime: pickEarlierDate(maxDateTime, rangeMax),
  };
}
